import type { Locale } from '../../i18n/config'
import type { CartItem } from '../cart'
import { calculateSubtotal, formatCartCurrency } from '../cart'
import { promotionDiscountCents, qualifiesForExpressUpgrade, qualifiesForFreeShipping } from '../promotions'
import { buildWhatsAppHandoffUrl } from './interimCheckout'

/**
 * Express WhatsApp ordering.
 *
 * The full checkout collects a verified address, a carrier rate, a payment
 * method, and five separate acknowledgments before it writes a
 * `storefront_orders` row through the `shipping-checkout` Edge Function. That
 * is the right path when the order needs a server-authoritative total, and it
 * is deliberately kept.
 *
 * This path is the short one: the shopper gives a name, confirms the research
 * boundary once, and lands in WhatsApp with the cart already written out. It
 * touches no Supabase table and no Edge Function, so it keeps working when the
 * order-creation path is down, and the address, shipping cost, and payment are
 * settled by a human in the conversation that follows.
 *
 * Because no server recomputes anything here, this message must never state a
 * final total. Subtotal and earned promotions are quoted; shipping, the Mexico
 * import fee, and the total are explicitly left as "confirmed on WhatsApp".
 */

export type ExpressDestination = 'us' | 'mexico' | 'local' | 'unspecified'

export type ExpressOrderInput = {
  reference: string
  items: CartItem[]
  locale: Locale
  name: string
  destination: ExpressDestination
  notes?: string
  referralCode?: string | null
  /**
   * Localizes the stored purchase type ("Encore Complete Kit", "Vial Only").
   * Cart items keep those values in English because they are canonical data,
   * not copy, so a Spanish message has to translate them on the way out.
   */
  translatePurchaseType?: (purchaseType: string) => string
}

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * Builds a human-readable reference for an express order.
 *
 * The `EXP-` prefix matters operationally: these orders have no
 * `storefront_orders` row behind them, so whoever answers WhatsApp needs to see
 * at a glance that there is nothing to look up in the admin portal yet.
 * Ambiguous glyphs (0/O, 1/I) are excluded because this code gets read aloud
 * and retyped.
 */
export function createExpressOrderReference(now: Date = new Date(), random: () => number = Math.random) {
  const stamp = [
    String(now.getFullYear() % 100).padStart(2, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  let suffix = ''
  for (let index = 0; index < 4; index += 1) {
    suffix += REFERENCE_ALPHABET[Math.floor(random() * REFERENCE_ALPHABET.length)]
  }
  return `EXP-${stamp}-${suffix}`
}

const destinationLabels: Record<Locale, Record<ExpressDestination, string>> = {
  en: {
    us: 'United States',
    mexico: 'Mexico',
    local: 'Local delivery or pickup (El Paso · Ciudad Juárez · Chihuahua)',
    unspecified: '',
  },
  es: {
    us: 'Estados Unidos',
    mexico: 'México',
    local: 'Entrega o recolección local (El Paso · Ciudad Juárez · Chihuahua)',
    unspecified: '',
  },
}

/**
 * The single acknowledgment this path asks for.
 *
 * It is one checkbox instead of the checkout's five, but it is not a weaker
 * promise: it restates every one of the four checkout statements — age,
 * research-only sale, no human or animal consumption, and no medical or dosing
 * guidance — in one sentence, and it is repeated inside the WhatsApp message so
 * the confirmation travels with the order instead of living only in the browser.
 */
export const expressAcknowledgment: Record<Locale, string> = {
  en: 'I am at least 18 years old. I understand these products are sold exclusively for laboratory research, will not be used for human or animal consumption, and that Encore Bio Labs does not provide medical advice, dosing, or administration guidance.',
  es: 'Tengo al menos 18 años. Entiendo que estos productos se venden exclusivamente para investigación de laboratorio, que no se utilizarán para consumo humano o animal, y que Encore Bio Labs no proporciona consejos médicos, dosis ni instrucciones de administración.',
}

export function buildExpressOrderMessage({ reference, items, locale, name, destination, notes, referralCode, translatePurchaseType }: ExpressOrderInput) {
  const subtotal = calculateSubtotal(items)
  const subtotalCents = Math.round(subtotal * 100)
  const discountCents = promotionDiscountCents(subtotalCents)
  const purchaseTypeOf = translatePurchaseType ?? ((value: string) => value)
  const lines = items.map((item) => `- ${item.quantity}x ${item.productName} ${item.variantLabel} · ${purchaseTypeOf(item.purchaseType)} (${formatCartCurrency(item.linePrice * item.quantity, locale)})`)
  const destinationLabel = destinationLabels[locale][destination]
  const trimmedNotes = notes?.trim()

  // Each section is filtered on its own and the sections are joined with blank
  // lines, so an absent optional line never collapses the spacing that keeps
  // the acknowledgment readable in a chat bubble.
  const section = (entries: string[]) => entries.filter(Boolean).join('\n')

  if (locale === 'es') {
    return [
      section([
        `Pedido exprés [${reference}]`,
        ...lines,
        `Subtotal: ${formatCartCurrency(subtotal, locale)}`,
        discountCents ? `Promoción por volumen: -${formatCartCurrency(discountCents / 100, locale)}` : '',
        qualifiesForFreeShipping(subtotalCents)
          ? qualifiesForExpressUpgrade(subtotalCents) ? 'Incluye express de 2 días gratis' : 'Incluye envío gratis'
          : '',
        'Envío y total: se confirman por WhatsApp',
        `Nombre: ${name.trim()}`,
        destinationLabel ? `Destino: ${destinationLabel}` : '',
        trimmedNotes ? `Notas: ${trimmedNotes}` : '',
        referralCode ? `Código de distribuidor: ${referralCode}` : '',
      ]),
      expressAcknowledgment.es,
      'Quiero confirmar disponibilidad, dirección de envío y forma de pago.',
    ].join('\n\n')
  }

  return [
    section([
      `Express order [${reference}]`,
      ...lines,
      `Subtotal: ${formatCartCurrency(subtotal, locale)}`,
      discountCents ? `Volume promotion: -${formatCartCurrency(discountCents / 100, locale)}` : '',
      qualifiesForFreeShipping(subtotalCents)
        ? qualifiesForExpressUpgrade(subtotalCents) ? 'Includes free 2-day express' : 'Includes free shipping'
        : '',
      'Shipping and total: confirmed on WhatsApp',
      `Name: ${name.trim()}`,
      destinationLabel ? `Destination: ${destinationLabel}` : '',
      trimmedNotes ? `Notes: ${trimmedNotes}` : '',
      referralCode ? `Distributor code: ${referralCode}` : '',
    ]),
    expressAcknowledgment.en,
    "I'd like to confirm availability, shipping address, and payment method.",
  ].join('\n\n')
}

export function buildExpressOrderUrl(input: ExpressOrderInput) {
  return buildWhatsAppHandoffUrl(buildExpressOrderMessage(input))
}
