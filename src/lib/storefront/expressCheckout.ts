import type { Locale } from '../../i18n/config'
import { INTERIM_PAYMENT_METHODS, type InterimPaymentMethod, type InterimPaymentMethodId } from '../../config/interimCheckout'
import type { CartItem } from '../cart'
import { calculateSubtotal, formatCartCurrency } from '../cart'
import { promotionDiscountCents, promotionDiscountRate, qualifiesForExpressUpgrade, qualifiesForFreeShipping } from '../promotions'
import { CASH_ON_DELIVERY_PROCESSING_RATE, calculateMexicoImportFeeCents } from '../shipping'
import { buildWhatsAppHandoffUrl } from './interimCheckout'

/**
 * Express WhatsApp ordering.
 *
 * The full checkout collects a verified address, a live carrier rate, and five
 * separate acknowledgments before it writes a `storefront_orders` row through
 * the `shipping-checkout` Edge Function. That is the right path when the order
 * needs a server-authoritative total, and it is deliberately kept.
 *
 * This path is the short one, and it exists to produce two things the operator
 * can act on the second the chat opens: a **shipping label** and a **payment
 * rail**. Everything collected here is either printed on the label or decides
 * where the money lands — nothing else is asked for. It touches no Supabase
 * table and no Edge Function, so it keeps working when order creation is down.
 *
 * Because no server recomputes anything here, this message must never state a
 * final total. Subtotal, earned promotions, and the cash-on-delivery surcharge
 * are quoted; shipping, the Mexico import fee, and the total are explicitly
 * left as "confirmed on WhatsApp".
 */

export type ExpressDestination = 'us' | 'mexico' | 'local'

/** The three cities Encore serves directly, from the El Paso–Juárez corridor. */
export type ExpressLocalCity = 'el_paso' | 'juarez' | 'chihuahua'

export type ExpressFulfillment = 'ship' | 'pickup'

export type ExpressPaymentMethodId =
  | 'zelle'
  | 'cashapp'
  | 'paypal'
  | 'apple_pay'
  | 'mx_bank_transfer'
  | 'cod'

export type ExpressAddress = {
  /** Street plus outdoor number, as the shopper writes it on an envelope. */
  street: string
  /** Apartment, suite, or número interior. */
  line2: string
  /** Colonia. Mexican carriers route on this; US labels have no equivalent. */
  neighborhood: string
  city: string
  state: string
  postalCode: string
  /** Cross streets or a landmark. Mexican last-mile drivers rely on it. */
  references: string
}

export type ExpressContact = {
  name: string
  phone: string
  email: string
}

export type ExpressOrderInput = {
  reference: string
  items: CartItem[]
  locale: Locale
  contact: ExpressContact
  destination: ExpressDestination
  localCity: ExpressLocalCity | null
  fulfillment: ExpressFulfillment
  address: ExpressAddress
  paymentMethod: ExpressPaymentMethodId | null
  notes?: string
  referralCode?: string | null
  /**
   * Localizes the stored purchase type ("Encore Complete Kit", "Vial Only").
   * Cart items keep those values in English because they are canonical data,
   * not copy, so a Spanish message has to translate them on the way out.
   */
  translatePurchaseType?: (purchaseType: string) => string
}

export function emptyExpressAddress(): ExpressAddress {
  return { street: '', line2: '', neighborhood: '', city: '', state: '', postalCode: '', references: '' }
}

export function emptyExpressContact(): ExpressContact {
  return { name: '', phone: '', email: '' }
}

// ---------- destination ----------

/**
 * Each local city fixes its own country, state, and city, so a local order
 * never asks the shopper to retype what picking the city already said.
 */
export const EXPRESS_LOCAL_CITIES: Record<ExpressLocalCity, { country: 'US' | 'MX'; city: string; state: string; stateEs: string }> = {
  el_paso: { country: 'US', city: 'El Paso', state: 'TX', stateEs: 'TX' },
  juarez: { country: 'MX', city: 'Ciudad Juárez', state: 'Chihuahua', stateEs: 'Chihuahua' },
  chihuahua: { country: 'MX', city: 'Chihuahua', state: 'Chihuahua', stateEs: 'Chihuahua' },
}

/** The country the label will carry, which drives address shape and rails. */
export function expressCountry(destination: ExpressDestination, localCity: ExpressLocalCity | null): 'US' | 'MX' {
  if (destination === 'us') return 'US'
  if (destination === 'mexico') return 'MX'
  return localCity ? EXPRESS_LOCAL_CITIES[localCity].country : 'US'
}

/** Mexican destinations carry the published import fee and can pay on delivery. */
export function expressShipsToMexico(destination: ExpressDestination, localCity: ExpressLocalCity | null) {
  return expressCountry(destination, localCity) === 'MX'
}

// ---------- payment ----------

export type ExpressPaymentMethod = {
  id: ExpressPaymentMethodId
  /** Fraction added to merchandise when this rail is chosen. */
  surchargeRate: number
  /** Mexican destinations only — the courier collects the cash. */
  mexicoOnly: boolean
  /**
   * Where the destination account details come from. The express rails reuse
   * the interim checkout config so an operator changes a handle in exactly one
   * place. Cash on delivery has no destination to show.
   */
  detailsId: InterimPaymentMethodId | null
}

export const EXPRESS_PAYMENT_METHODS: readonly ExpressPaymentMethod[] = [
  { id: 'zelle', surchargeRate: 0, mexicoOnly: false, detailsId: 'zelle' },
  { id: 'cashapp', surchargeRate: 0, mexicoOnly: false, detailsId: 'cashapp' },
  { id: 'paypal', surchargeRate: 0, mexicoOnly: false, detailsId: 'paypal' },
  { id: 'apple_pay', surchargeRate: 0, mexicoOnly: false, detailsId: 'apple_pay' },
  { id: 'mx_bank_transfer', surchargeRate: 0, mexicoOnly: false, detailsId: 'bank_transfer' },
  { id: 'cod', surchargeRate: CASH_ON_DELIVERY_PROCESSING_RATE, mexicoOnly: true, detailsId: null },
]

export function expressPaymentMethod(id: ExpressPaymentMethodId | null) {
  return EXPRESS_PAYMENT_METHODS.find((method) => method.id === id) ?? null
}

/**
 * The rails on offer for a destination, ordered so the one a shopper there is
 * most likely to reach for sits first. Cash on delivery is the only rail that
 * is withheld: the courier has to be able to collect the cash, which only the
 * Mexican delivery network does.
 */
export function expressPaymentMethodsFor(destination: ExpressDestination, localCity: ExpressLocalCity | null): ExpressPaymentMethod[] {
  const mexico = expressShipsToMexico(destination, localCity)
  const available = EXPRESS_PAYMENT_METHODS.filter((method) => !method.mexicoOnly || mexico)
  const order: ExpressPaymentMethodId[] = mexico
    ? ['mx_bank_transfer', 'cod', 'paypal', 'zelle', 'cashapp', 'apple_pay']
    : ['zelle', 'cashapp', 'paypal', 'apple_pay', 'mx_bank_transfer']
  return [...available].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
}

/**
 * The cash-on-delivery surcharge, charged on merchandise after promotions and
 * never on shipping or the import fee. This mirrors
 * `calculatePaymentProcessingFeeCents` in `lib/shipping` so the number quoted
 * in the chat matches the one the server computes if the order is later moved
 * onto the full checkout.
 */
export function expressSurchargeCents(subtotalCents: number, methodId: ExpressPaymentMethodId | null) {
  const rate = expressPaymentMethod(methodId)?.surchargeRate ?? 0
  if (!rate) return 0
  return Math.round(Math.max(0, subtotalCents - promotionDiscountCents(subtotalCents)) * rate)
}

/** The account details to display for a rail, or null when there is nothing to show. */
export function expressPaymentDetails(
  methodId: ExpressPaymentMethodId | null,
  methods: InterimPaymentMethod[] = INTERIM_PAYMENT_METHODS,
): InterimPaymentMethod | null {
  const detailsId = expressPaymentMethod(methodId)?.detailsId
  if (!detailsId) return null
  const configured = methods.find((method) => method.id === detailsId)
  return configured?.enabled && configured.details.length ? configured : null
}

// ---------- validation ----------

export type ExpressFieldId = 'name' | 'phone' | 'street' | 'neighborhood' | 'city' | 'state' | 'postalCode' | 'paymentMethod'
export type ExpressFieldIssue = 'missing' | 'invalid'
export type ExpressIssues = Partial<Record<ExpressFieldId, ExpressFieldIssue>>

const POSTAL_CODE_PATTERNS: Record<'US' | 'MX', RegExp> = {
  US: /^\d{5}(?:-\d{4})?$/,
  MX: /^\d{5}$/,
}

/**
 * What still blocks the handoff, keyed by field so the form can mark each one.
 *
 * A pickup order stops at name and phone: there is no label to print, so an
 * address would be collected for nothing. Everything a printed label needs is
 * required, including the phone number every carrier demands and the colonia a
 * Mexican label routes on.
 */
export function expressOrderIssues({
  contact,
  destination,
  localCity,
  fulfillment,
  address,
  paymentMethod,
}: Pick<ExpressOrderInput, 'contact' | 'destination' | 'localCity' | 'fulfillment' | 'address' | 'paymentMethod'>): ExpressIssues {
  const issues: ExpressIssues = {}
  if (!contact.name.trim()) issues.name = 'missing'
  if (!contact.phone.trim()) issues.phone = 'missing'
  else if (contact.phone.replaceAll(/\D/g, '').length < 10) issues.phone = 'invalid'
  if (!paymentMethod) issues.paymentMethod = 'missing'

  if (fulfillment === 'pickup') return issues

  const country = expressCountry(destination, localCity)
  if (!address.street.trim()) issues.street = 'missing'
  if (country === 'MX' && !address.neighborhood.trim()) issues.neighborhood = 'missing'
  if (!address.city.trim()) issues.city = 'missing'
  if (!address.state.trim()) issues.state = 'missing'
  if (!address.postalCode.trim()) issues.postalCode = 'missing'
  else if (!POSTAL_CODE_PATTERNS[country].test(address.postalCode.trim())) issues.postalCode = 'invalid'

  return issues
}

export function expressOrderReady(input: Parameters<typeof expressOrderIssues>[0]) {
  return Object.keys(expressOrderIssues(input)).length === 0
}

// ---------- reference ----------

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

// ---------- labels ----------

const destinationLabels: Record<Locale, Record<ExpressDestination, string>> = {
  en: { us: 'United States', mexico: 'Mexico', local: 'Local (El Paso · Ciudad Juárez · Chihuahua)' },
  es: { us: 'Estados Unidos', mexico: 'México', local: 'Local (El Paso · Ciudad Juárez · Chihuahua)' },
}

const localCityLabels: Record<ExpressLocalCity, string> = {
  el_paso: 'El Paso, TX',
  juarez: 'Ciudad Juárez, Chih.',
  chihuahua: 'Chihuahua, Chih.',
}

const paymentLabels: Record<Locale, Record<ExpressPaymentMethodId, string>> = {
  en: {
    zelle: 'Zelle',
    cashapp: 'Cash App',
    paypal: 'PayPal',
    apple_pay: 'Apple Pay (Apple Cash)',
    mx_bank_transfer: 'Mexican bank transfer (SPEI)',
    cod: 'Cash on delivery (+5%)',
  },
  es: {
    zelle: 'Zelle',
    cashapp: 'Cash App',
    paypal: 'PayPal',
    apple_pay: 'Apple Pay (Apple Cash)',
    mx_bank_transfer: 'Transferencia bancaria en México (SPEI)',
    cod: 'Pago contra entrega (+5%)',
  },
}

export function expressPaymentLabel(methodId: ExpressPaymentMethodId, locale: Locale) {
  return paymentLabels[locale === 'es' ? 'es' : 'en'][methodId]
}

/**
 * The block that becomes the shipping label.
 *
 * Two rules shape it. First, it is formatted the way the **destination**
 * country writes an address — a US label leads with the street line and closes
 * `City, ST ZIP`; a Mexican one carries the colonia on its own line and puts
 * the postal code ahead of the city. Second, it is written in the destination's
 * language rather than the shopper's: the person who reads this label is a
 * courier in Ciudad Juárez, not the shopper who happened to browse in English,
 * so a Mexican label says `México` and `Referencias` either way.
 *
 * The email is deliberately absent — it is a tracking address, not something a
 * carrier prints — and rides outside the block as a contact line instead.
 */
export function buildExpressLabelLines({
  locale,
  contact,
  destination,
  localCity,
  fulfillment,
  address,
}: Pick<ExpressOrderInput, 'locale' | 'contact' | 'destination' | 'localCity' | 'fulfillment' | 'address'>): string[] {
  const name = contact.name.trim()
  const phone = contact.phone.trim()

  if (fulfillment === 'pickup') {
    return [
      locale === 'es' ? 'RECOLECCIÓN EN PUNTO DE DISTRIBUCIÓN' : 'PICKUP AT DISTRIBUTION POINT',
      localCity ? localCityLabels[localCity] : destinationLabels[locale][destination],
      name,
      phone,
    ].filter(Boolean)
  }

  const country = expressCountry(destination, localCity)
  const street = address.street.trim()
  const line2 = address.line2.trim()
  const city = address.city.trim()
  const state = address.state.trim()
  const postalCode = address.postalCode.trim()
  const references = address.references.trim()

  if (country === 'MX') {
    return [
      name,
      phone,
      street,
      line2,
      address.neighborhood.trim() ? `Col. ${address.neighborhood.trim()}` : '',
      [postalCode ? `C.P. ${postalCode}` : '', [city, state].filter(Boolean).join(', ')].filter(Boolean).join(', '),
      'México',
      references ? `Referencias: ${references}` : '',
    ].filter(Boolean)
  }

  return [
    name,
    phone,
    street,
    line2,
    [city, [state, postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', '),
    'United States',
    references ? `Landmark: ${references}` : '',
  ].filter(Boolean)
}

/** Same block, ready to drop into a clipboard or a WhatsApp monospace fence. */
export function buildExpressLabelBlock(input: Parameters<typeof buildExpressLabelLines>[0]) {
  return buildExpressLabelLines(input).join('\n')
}

// ---------- message ----------

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

/** Counts the Complete Kits in the cart, which is what the import fee scales on. */
export function expressKitCount(items: CartItem[]) {
  return items.reduce((total, item) => (item.kitIncluded ? total + item.packSize * item.quantity : total), 0)
}

export function buildExpressOrderMessage({
  reference,
  items,
  locale,
  contact,
  destination,
  localCity,
  fulfillment,
  address,
  paymentMethod,
  notes,
  referralCode,
  translatePurchaseType,
}: ExpressOrderInput) {
  const spanish = locale === 'es'
  const subtotal = calculateSubtotal(items)
  const subtotalCents = Math.round(subtotal * 100)
  const discountCents = promotionDiscountCents(subtotalCents)
  const discountRate = promotionDiscountRate(subtotalCents)
  const surchargeCents = expressSurchargeCents(subtotalCents, paymentMethod)
  const importFeeCents = expressShipsToMexico(destination, localCity) && fulfillment === 'ship'
    ? calculateMexicoImportFeeCents(expressKitCount(items))
    : 0
  const purchaseTypeOf = translatePurchaseType ?? ((value: string) => value)
  const money = (cents: number) => formatCartCurrency(cents / 100, locale)

  const lines = items.map((item) => `• ${item.quantity}× ${item.productName} ${item.variantLabel} — ${purchaseTypeOf(item.purchaseType)} — ${formatCartCurrency(item.linePrice * item.quantity, locale)}`)
  const labelBlock = buildExpressLabelBlock({ locale, contact, destination, localCity, fulfillment, address })
  const trimmedNotes = notes?.trim()

  // Each section is filtered on its own and the sections are joined with blank
  // lines, so an absent optional line never collapses the spacing that keeps
  // the label block and the acknowledgment readable in a chat bubble.
  const section = (entries: string[]) => entries.filter(Boolean).join('\n')
  const fence = (body: string) => ['```', body, '```'].join('\n')

  const destinationLine = fulfillment === 'pickup'
    ? (spanish ? 'Recolección local' : 'Local pickup')
    : localCity
      ? `${destinationLabels[locale].local} — ${localCityLabels[localCity]}`
      : destinationLabels[locale][destination]

  if (spanish) {
    return [
      section([
        `*ENCORE BIO LABS — PEDIDO EXPRÉS*`,
        `Folio ${reference}`,
      ]),
      section([
        '*PEDIDO*',
        ...lines,
        `Subtotal: ${money(subtotalCents)}`,
        discountCents ? `Promoción por volumen (${Math.round(discountRate * 100)}%): -${money(discountCents)}` : '',
        qualifiesForFreeShipping(subtotalCents)
          ? qualifiesForExpressUpgrade(subtotalCents) ? 'Incluye express de 2 días gratis' : 'Incluye envío gratis'
          : '',
        importFeeCents ? `Cuota de importación a México: ${money(importFeeCents)}` : '',
        surchargeCents ? `Manejo de pago contra entrega (5%): ${money(surchargeCents)}` : '',
        'Envío y total final: se confirman en este chat',
      ]),
      section([
        '*PAGO*',
        paymentMethod ? `Quiero pagar con: ${expressPaymentLabel(paymentMethod, locale)}` : 'Forma de pago: por definir',
      ]),
      section([
        fulfillment === 'pickup' ? '*RECOLECCIÓN*' : '*DATOS PARA LA ETIQUETA*',
        `Destino: ${destinationLine}`,
        contact.email.trim() ? `Rastreo a: ${contact.email.trim()}` : '',
      ]),
      fence(labelBlock),
      section([
        trimmedNotes ? `*NOTAS*\n${trimmedNotes}` : '',
        referralCode ? `Código de distribuidor: ${referralCode}` : '',
      ]),
      section(['*CONFIRMACIÓN*', expressAcknowledgment.es]),
      'Confírmenme disponibilidad y los datos de pago, por favor.',
    ].filter(Boolean).join('\n\n')
  }

  return [
    section([
      `*ENCORE BIO LABS — EXPRESS ORDER*`,
      `Ref ${reference}`,
    ]),
    section([
      '*ORDER*',
      ...lines,
      `Subtotal: ${money(subtotalCents)}`,
      discountCents ? `Volume promotion (${Math.round(discountRate * 100)}%): -${money(discountCents)}` : '',
      qualifiesForFreeShipping(subtotalCents)
        ? qualifiesForExpressUpgrade(subtotalCents) ? 'Includes free 2-day express' : 'Includes free shipping'
        : '',
      importFeeCents ? `Mexico import fee: ${money(importFeeCents)}` : '',
      surchargeCents ? `Cash-on-delivery handling (5%): ${money(surchargeCents)}` : '',
      'Shipping and final total: confirmed in this chat',
    ]),
    section([
      '*PAYMENT*',
      paymentMethod ? `I'd like to pay by: ${expressPaymentLabel(paymentMethod, locale)}` : 'Payment method: to be decided',
    ]),
    section([
      fulfillment === 'pickup' ? '*PICKUP*' : '*SHIP TO — label details*',
      `Destination: ${destinationLine}`,
      contact.email.trim() ? `Tracking to: ${contact.email.trim()}` : '',
    ]),
    fence(labelBlock),
    section([
      trimmedNotes ? `*NOTES*\n${trimmedNotes}` : '',
      referralCode ? `Distributor code: ${referralCode}` : '',
    ]),
    section(['*CONFIRMATION*', expressAcknowledgment.en]),
    "Please confirm availability and the payment details.",
  ].filter(Boolean).join('\n\n')
}

export function buildExpressOrderUrl(input: ExpressOrderInput) {
  return buildWhatsAppHandoffUrl(buildExpressOrderMessage(input))
}
