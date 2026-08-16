import type { Locale } from '../../i18n/config'
import type { CheckoutAcknowledgmentAudit } from '../../data/acknowledgmentContent'
import { BUSINESS_INSTAGRAM_USERNAME, BUSINESS_WHATSAPP_PHONE, type InterimPaymentMethodId } from '../../config/interimCheckout'
import type { CartItem } from '../cart'
import { calculateSubtotal, formatCartCurrency } from '../cart'
import type { AddressVerificationResult, ShippingRate, ShippingSelection } from '../shipping'
import { calculateShippingCharges, selectedShippingAddress } from '../shipping'
import { isSupabaseConfigured, supabase } from '../supabaseClient'
import { fetchPublicInventoryStatuses } from '../inventory'
import type { ReferralAttribution } from '../referralAttribution'
import type { DiscountSource } from '../distributorIncentive'

export type HandoffChannel = 'checkout' | 'whatsapp' | 'instagram'
export type PendingPaymentMethod = InterimPaymentMethodId

export type OrderContact = {
  name?: string
  phone?: string
  email?: string
  address?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  preferredContact?: string
  notes?: string
}

export type PendingOrderInput = {
  items: CartItem[]
  channel: HandoffChannel
  paymentMethod: PendingPaymentMethod
  locale: Locale
  contact?: OrderContact
  shipping?: ShippingSelection
  acknowledgment: CheckoutAcknowledgmentAudit
  referralAttribution?: ReferralAttribution | null
}

export type PendingOrder = {
  reference: string
  paymentMethod: InterimPaymentMethodId
  subtotalCents: number
  /** The handoff is blocked unless the server returns a recorded order. */
  recorded: boolean
  reviewRequired: boolean
  importFeeCents: number
  shippingCents: number | null
  discountCents: number
  discountSource: DiscountSource
  volumeDiscountCents: number
  distributorDiscountCents: number
  otherPromotionWon: boolean
  distributorEligibility: string
  distributorNoBenefitReason: string | null
  referralCode: string | null
  processingFeeCents: number
  shippingWaived: boolean
  totalCents: number | null
}

export function generateOrderReference() {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${digits}`
}

export function toOrderItemsPayload(items: CartItem[]) {
  return items.map((item) => ({
    sku: item.sku,
    product_slug: item.productSlug,
    category_slug: item.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || null,
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
  zelle: { en: 'Zelle', es: 'Zelle' },
  apple_pay: { en: 'Apple Pay', es: 'Apple Pay' },
  cash_on_delivery: { en: 'Cash on delivery / pickup', es: 'Pago contra entrega / recolección' },
  manual_review: { en: 'Manual shipping review', es: 'Revisión manual de envío' },
}

export function paymentMethodMessageLabel(method: InterimPaymentMethodId, locale: Locale) {
  return paymentMethodMessageLabels[method][locale === 'es' ? 'es' : 'en']
}

/** The order summary sent through WhatsApp or pasted into the Instagram DM. */
export function buildHandoffMessage({ reference, items, paymentMethod, locale, contact, shipping, processingFeeCents = 0, totalCents, discountCents, discountSource, otherPromotionWon = false, referralCode }: { reference: string; items: CartItem[]; paymentMethod: InterimPaymentMethodId; locale: Locale; contact?: OrderContact; shipping?: ShippingSelection; processingFeeCents?: number; totalCents?: number | null; discountCents?: number; discountSource?: DiscountSource; otherPromotionWon?: boolean; referralCode?: string | null }) {
  const lines = items.map((item) => `- ${item.quantity}x ${item.productName} ${item.variantLabel} (${formatCartCurrency(item.linePrice * item.quantity)})`)
  const subtotal = calculateSubtotal(items)
  const selectedRate = shipping?.verification.rates.find((rate) => rate.id === shipping.selectedRateId) ?? null
  const charges = shipping ? calculateShippingCharges({ destination: shipping.destination, kitCount: shipping.kitCount, subtotalCents: Math.round(subtotal * 100), selectedRate, localDeliveryFeeCents: shipping.verification.localDeliveryFeeCents }) : null
  const total = totalCents === null ? null : formatCartCurrency((totalCents ?? charges?.totalCents ?? Math.round(subtotal * 100)) / 100)
  const finalDiscountCents = discountCents ?? charges?.discountCents ?? 0
  const acceptedAddress = shipping ? selectedShippingAddress(shipping) : null
  const destinationLine = shipping ? `${shipping.destination} · ${[acceptedAddress?.street, acceptedAddress?.streetNumber, acceptedAddress?.neighborhood, acceptedAddress?.city, acceptedAddress?.state, acceptedAddress?.postalCode, acceptedAddress?.country].filter(Boolean).join(', ')}` : ''
  const fulfillmentLine = shipping?.localFulfillment === 'pickup'
    ? (locale === 'es' ? 'Recepción local: recoger en punto de distribución' : 'Local fulfillment: distribution-point pickup')
    : shipping?.localFulfillment === 'home_delivery'
      ? (locale === 'es' ? 'Recepción local: entrega a domicilio dentro de 10 millas' : 'Local fulfillment: home delivery within 10 miles')
      : ''
  const pickupPointLine = shipping?.localFulfillment === 'pickup' && (shipping.verification.pickupPointName || shipping.verification.pickupPointAddress)
    ? `${locale === 'es' ? 'Punto de distribución' : 'Distribution point'}: ${[shipping.verification.pickupPointName, shipping.verification.pickupPointAddress, shipping.verification.localDeliveryTime].filter(Boolean).join(' · ')}`
    : ''
  const coverageCenterLine = shipping?.verification.coverageCenterPostalCode
    ? `${locale === 'es' ? 'Centro de cobertura' : 'Coverage center'}: ${shipping.verification.coverageCenterPostalCode}`
    : ''
  const shippingLine = selectedRate ? `${selectedRate.carrier} ${selectedRate.service}` : ''
  const shippingAddress = [contact?.address, contact?.address2, contact?.city, contact?.state, contact?.zip, contact?.country]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(', ')
  const contactLines = locale === 'es'
    ? [
        contact?.name ? `Nombre: ${contact.name}` : '',
        contact?.phone ? `Teléfono: ${contact.phone}` : '',
        contact?.email ? `Correo: ${contact.email}` : '',
        shippingAddress ? `Envío: ${shippingAddress}` : '',
        contact?.notes?.trim() ? `Notas: ${contact.notes.trim()}` : '',
      ].filter(Boolean)
    : [
        contact?.name ? `Name: ${contact.name}` : '',
        contact?.phone ? `Phone: ${contact.phone}` : '',
        contact?.email ? `Email: ${contact.email}` : '',
        shippingAddress ? `Shipping: ${shippingAddress}` : '',
        contact?.notes?.trim() ? `Notes: ${contact.notes.trim()}` : '',
      ].filter(Boolean)
  if (locale === 'es') {
    return [
      `Pedido [${reference}]`,
      ...lines,
      `Subtotal: ${formatCartCurrency(subtotal)}`,
      charges?.importFeeCents ? `Importación: ${formatCartCurrency(charges.importFeeCents / 100)}` : '',
      charges?.shippingCents !== null && charges?.shippingCents !== undefined
        ? `Envío: ${formatCartCurrency(charges.shippingCents / 100)}${charges.shippingWaived ? (charges.discountCents ? ' (express 2 días gratis, pedido de $300+)' : ' (gratis, pedido de $200+)') : ''}`
        : 'Envío: pendiente de revisión',
      finalDiscountCents ? `${discountSource === 'distributor_incentive' ? 'Descuento de primera compra del distribuidor' : 'Promoción por volumen'}: -${formatCartCurrency(finalDiscountCents / 100)}` : '',
      otherPromotionWon ? 'Se aplicó la promoción por volumen más alta; se conservó la atribución del distribuidor.' : '',
      processingFeeCents ? `Procesamiento por pago al recibir (5%): ${formatCartCurrency(processingFeeCents / 100)}` : '',
      total ? `Total: ${total}` : 'Total: pendiente de revisión',
      destinationLine ? `Destino validado: ${destinationLine}` : '',
      fulfillmentLine,
      coverageCenterLine,
      pickupPointLine,
      shippingLine ? `Servicio: ${shippingLine}` : '',
      ...contactLines,
      referralCode ? `Código de distribuidor: ${referralCode}` : '',
      '',
      `Quiero pagar con: ${paymentMethodMessageLabel(paymentMethod, locale)}`,
    ].filter((line) => line !== '').join('\n')
  }
  return [
    `Order [${reference}]`,
    ...lines,
    `Subtotal: ${formatCartCurrency(subtotal)}`,
    charges?.importFeeCents ? `Import fee: ${formatCartCurrency(charges.importFeeCents / 100)}` : '',
    charges?.shippingCents !== null && charges?.shippingCents !== undefined
      ? `Shipping: ${formatCartCurrency(charges.shippingCents / 100)}${charges.shippingWaived ? (charges.discountCents ? ' (free 2-day express, $300+ order)' : ' (free, $200+ order)') : ''}`
      : 'Shipping: pending review',
    finalDiscountCents ? `${discountSource === 'distributor_incentive' ? 'Distributor first-purchase discount' : 'Volume promotion'}: -${formatCartCurrency(finalDiscountCents / 100)}` : '',
    otherPromotionWon ? 'The higher volume promotion applied; distributor attribution was preserved.' : '',
    processingFeeCents ? `Pay-on-delivery processing (5%): ${formatCartCurrency(processingFeeCents / 100)}` : '',
    total ? `Total: ${total}` : 'Total: pending review',
    destinationLine ? `Validated destination: ${destinationLine}` : '',
    fulfillmentLine,
    coverageCenterLine,
    pickupPointLine,
    shippingLine ? `Service: ${shippingLine}` : '',
    ...contactLines,
    referralCode ? `Distributor code: ${referralCode}` : '',
    '',
    `I'd like to pay by: ${paymentMethodMessageLabel(paymentMethod, locale)}`,
  ].filter((line) => line !== '').join('\n')
}

export function buildWhatsAppHandoffUrl(message: string) {
  return `https://wa.me/${BUSINESS_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

export function buildInstagramDmUrl() {
  return `https://ig.me/m/${BUSINESS_INSTAGRAM_USERNAME}`
}

/**
 * Creates the pending_payment order record before either handoff. The handoff
 * remains blocked unless the server safely stores the per-order acknowledgment.
 */
export async function createPendingOrder(input: PendingOrderInput): Promise<PendingOrder> {
  if (!isSupabaseConfigured || !supabase || !input.shipping) {
    throw new Error('acknowledgment_store_unavailable')
  }
  const selectedRate = input.shipping.verification.rates.find((rate) => rate.id === input.shipping?.selectedRateId) ?? null

  const baseSkus = input.items.map((item) => item.sku.split(/-(?:VIAL-ONLY|COMPLETE-KIT|MULTIPACK)-/)[0])
  const inventoryStatuses = await fetchPublicInventoryStatuses(baseSkus)
  if (baseSkus.some((sku) => inventoryStatuses[sku] === 'out_of_stock' || inventoryStatuses[sku] === 'inactive')) throw new Error('inventory_unavailable')

  const { data, error } = await supabase.functions.invoke<{
    reference: string
    paymentMethod: InterimPaymentMethodId
    subtotalCents: number
    importFeeCents: number
    shippingCents: number | null
    discountCents: number
    discountSource: DiscountSource
    volumeDiscountCents: number
    distributorDiscountCents: number
    otherPromotionWon: boolean
    distributorEligibility: string
    distributorNoBenefitReason: string | null
    referralCode: string | null
    processingFeeCents: number
    shippingWaived: boolean
    totalCents: number | null
    recorded: boolean
    reviewRequired: boolean
  }>('shipping-checkout', {
    body: {
      action: 'create_order',
      destination: input.shipping.destination,
      localFulfillment: input.shipping.localFulfillment,
      address: input.shipping.address,
      addressChoice: input.shipping.addressChoice,
      selectedRate,
      manualReviewRequested: input.shipping.manualReviewRequested,
      destinationAcknowledged: input.shipping.destinationAcknowledged,
      kitCount: input.shipping.kitCount,
      items: toOrderItemsPayload(input.items),
      channel: input.channel,
      paymentMethod: input.paymentMethod,
      locale: input.locale,
      checkoutAcknowledgment: input.acknowledgment,
      referralCode: input.referralAttribution?.code ?? null,
      attributionSource: input.referralAttribution?.source ?? null,
      partnerLinkSlug: input.referralAttribution?.partnerLinkSlug ?? null,
      distributorSubId: input.referralAttribution?.subId ?? null,
      distributorVisitorId: document.cookie.match(/(?:^|; )encore_visitor_v1=([^;]+)/)?.[1] ?? null,
      distributorSessionId: sessionStorage.getItem('encore_attribution_session_v1'),
      distributorUtmSource: input.referralAttribution?.utmSource ?? null,
      distributorUtmMedium: input.referralAttribution?.utmMedium ?? null,
      distributorUtmCampaign: input.referralAttribution?.utmCampaign ?? null,
      distributorUtmTerm: input.referralAttribution?.utmTerm ?? null,
      distributorUtmContent: input.referralAttribution?.utmContent ?? null,
      contact: {
        name: input.contact?.name ?? '',
        phone: input.contact?.phone ?? '',
        email: input.contact?.email ?? '',
        address: input.contact?.address ?? '',
        address2: input.contact?.address2 ?? '',
        city: input.contact?.city ?? '',
        state: input.contact?.state ?? '',
        zip: input.contact?.zip ?? '',
        country: input.contact?.country ?? '',
        preferredContact: input.contact?.preferredContact ?? '',
        notes: input.contact?.notes ?? '',
      },
    },
  })
  if (error || !data) throw new Error('shipping_checkout_unavailable')
  return data
}

// ---------- Admin reconciliation ----------
export type StorefrontOrderRow = {
  id: string
  created_at: string
  order_reference: string
  status: 'pending_shipping_review' | 'quote_pending' | 'pending_payment' | 'paid' | 'cancelled'
  channel: HandoffChannel
  payment_method: string
  items: Array<{ product: string; variant: string; quantity: number; line_total_cents: number }>
  subtotal_cents: number
  import_fee_cents: number
  shipping_cents: number | null
  discount_cents: number
  discount_source: DiscountSource
  volume_discount_cents: number
  distributor_discount_cents: number
  other_promotion_won: boolean
  distributor_discount_eligibility: string
  distributor_discount_no_benefit_reason: string | null
  referral_code: string | null
  processing_fee_cents: number
  total_cents: number | null
  destination_type: string
  local_fulfillment_method: 'pickup' | 'home_delivery' | null
  delivery_distance_miles: number | null
  original_address: Record<string, string>
  validated_address: Record<string, string>
  selected_address: Record<string, string>
  address_verification: AddressVerificationResult
  shipping_service: ShippingRate | null
  shipping_review_required: boolean
  checkout_acknowledgment_version: string | null
  checkout_acknowledged_at: string | null
  checkout_acknowledgment_language: string[] | null
  checkout_acknowledgment_locale: Locale | null
  checkout_policy_versions: Record<string, string> | null
  contact: OrderContact
  paid_at: string | null
}

export async function adminFetchStorefrontOrders(): Promise<StorefrontOrderRow[]> {
  if (!supabase) throw new Error('not configured')
  const { data, error } = await supabase.from('storefront_orders')
    .select('id,created_at,order_reference,status,channel,payment_method,items,subtotal_cents,import_fee_cents,shipping_cents,discount_cents,discount_source,volume_discount_cents,distributor_discount_cents,other_promotion_won,distributor_discount_eligibility,distributor_discount_no_benefit_reason,referral_code,processing_fee_cents,total_cents,destination_type,local_fulfillment_method,delivery_distance_miles,original_address,validated_address,selected_address,address_verification,shipping_service,shipping_review_required,checkout_acknowledgment_version,checkout_acknowledged_at,checkout_acknowledgment_language,checkout_acknowledgment_locale,checkout_policy_versions,contact,paid_at')
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
