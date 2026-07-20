import type { Locale } from '../../i18n/config'
import { BUSINESS_INSTAGRAM_USERNAME, BUSINESS_WHATSAPP_PHONE, type InterimPaymentMethodId } from '../../config/interimCheckout'
import type { CartItem } from '../cart'
import { calculateSubtotal, formatCartCurrency } from '../cart'
import { isSupabaseConfigured, supabase } from '../supabaseClient'

export type HandoffChannel = 'whatsapp' | 'instagram'

export type PendingOrderInput = {
  items: CartItem[]
  channel: HandoffChannel
  paymentMethod: InterimPaymentMethodId
  locale: Locale
  contact?: { name?: string; phone?: string; email?: string }
}

export type PendingOrder = {
  reference: string
  subtotalCents: number
  /** False when Supabase is unreachable — the handoff message is the only record. */
  recorded: boolean
}

export function generateOrderReference() {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${digits}`
}

export function toOrderItemsPayload(items: CartItem[]) {
  return items.map((item) => ({
    sku: item.sku,
    product: item.productName,
    variant: item.variantLabel,
    purchase_type: item.purchaseType,
    pack_size: item.packSize,
    kit_included: item.kitIncluded,
    quantity: item.quantity,
    unit_price_cents: Math.round(item.unitPrice * 100),
    line_total_cents: Math.round(item.linePrice * item.quantity * 100),
  }))
}

const paymentMethodMessageLabels: Record<InterimPaymentMethodId, { en: string; es: string }> = {
  bank_transfer: { en: 'Bank transfer', es: 'Transferencia bancaria' },
  paypal: { en: 'PayPal', es: 'PayPal' },
  venmo: { en: 'Venmo', es: 'Venmo' },
  cashapp: { en: 'Cash App', es: 'Cash App' },
  cash_on_delivery: { en: 'Cash on delivery / pickup', es: 'Pago contra entrega / recolección' },
}

export function paymentMethodMessageLabel(method: InterimPaymentMethodId, locale: Locale) {
  return paymentMethodMessageLabels[method][locale === 'es' ? 'es' : 'en']
}

/** The order summary sent through WhatsApp or pasted into the Instagram DM. */
export function buildHandoffMessage({ reference, items, paymentMethod, locale }: { reference: string; items: CartItem[]; paymentMethod: InterimPaymentMethodId; locale: Locale }) {
  const lines = items.map((item) => `- ${item.quantity}x ${item.productName} ${item.variantLabel} (${formatCartCurrency(item.linePrice * item.quantity)})`)
  const total = formatCartCurrency(calculateSubtotal(items))
  if (locale === 'es') {
    return [
      `Pedido [${reference}]`,
      ...lines,
      `Total: ${total}`,
      '',
      `Quiero pagar con: ${paymentMethodMessageLabel(paymentMethod, locale)}`,
    ].join('\n')
  }
  return [
    `Order [${reference}]`,
    ...lines,
    `Total: ${total}`,
    '',
    `I'd like to pay by: ${paymentMethodMessageLabel(paymentMethod, locale)}`,
  ].join('\n')
}

export function buildWhatsAppHandoffUrl(message: string) {
  return `https://wa.me/${BUSINESS_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

export function buildInstagramDmUrl() {
  return `https://ig.me/m/${BUSINESS_INSTAGRAM_USERNAME}`
}

/**
 * Creates the pending_payment order record before either handoff. Retries the
 * short human-readable reference on a uniqueness collision. When Supabase is
 * not configured/reachable, returns recorded:false so the caller can still
 * hand off — the reference in the message becomes the reconciliation record.
 */
export async function createPendingOrder(input: PendingOrderInput): Promise<PendingOrder> {
  const subtotalCents = Math.round(calculateSubtotal(input.items) * 100)
  let reference = generateOrderReference()

  if (!isSupabaseConfigured || !supabase) return { reference, subtotalCents, recorded: false }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await supabase.from('storefront_orders').insert({
      order_reference: reference,
      channel: input.channel,
      payment_method: input.paymentMethod,
      items: toOrderItemsPayload(input.items),
      subtotal_cents: subtotalCents,
      locale: input.locale,
      contact: {
        name: input.contact?.name ?? '',
        phone: input.contact?.phone ?? '',
        email: input.contact?.email ?? '',
      },
    })
    if (!error) return { reference, subtotalCents, recorded: true }
    if (error.code !== '23505') return { reference, subtotalCents, recorded: false }
    reference = generateOrderReference()
  }
  return { reference, subtotalCents, recorded: false }
}

// ---------- Admin reconciliation ----------
export type StorefrontOrderRow = {
  id: string
  created_at: string
  order_reference: string
  status: 'pending_payment' | 'paid' | 'cancelled'
  channel: HandoffChannel
  payment_method: string
  items: Array<{ product: string; variant: string; quantity: number; line_total_cents: number }>
  subtotal_cents: number
  contact: { name?: string; phone?: string; email?: string }
  paid_at: string | null
}

export async function adminFetchStorefrontOrders(): Promise<StorefrontOrderRow[]> {
  if (!supabase) throw new Error('not configured')
  const { data, error } = await supabase.from('storefront_orders')
    .select('id,created_at,order_reference,status,channel,payment_method,items,subtotal_cents,contact,paid_at')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) throw error
  return (data ?? []) as StorefrontOrderRow[]
}

/** Paid transitions are always an explicit manual admin action. */
export async function adminMarkStorefrontOrder(orderId: string, adminId: string, status: 'paid' | 'cancelled' | 'pending_payment') {
  if (!supabase) throw new Error('not configured')
  const { error } = await supabase.from('storefront_orders').update({
    status,
    updated_at: new Date().toISOString(),
    ...(status === 'paid' ? { paid_at: new Date().toISOString(), marked_paid_by: adminId } : { paid_at: null, marked_paid_by: null }),
  }).eq('id', orderId)
  if (error) throw error
}
