import type { Locale } from '../../i18n/config'
import { INTERIM_PAYMENT_METHODS, type InterimPaymentMethod, type InterimPaymentMethodId } from '../../config/interimCheckout'
import type { CartItem } from '../cart'
import { calculateSubtotal, formatCartCurrency } from '../cart'
import { promotionDiscountCents, promotionDiscountRate, qualifiesForFreeShipping } from '../promotions'
import { CASH_ON_DELIVERY_PROCESSING_RATE, shippingServiceFor } from '../shipping'
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
 * are quoted; shipping and the total are explicitly left as "confirmed on
 * WhatsApp" unless every component is known.
 */

export type ExpressDestination = 'us' | 'mexico' | 'local'

/**
 * The cities Encore distributes in directly, both sides of the El Paso–Juárez
 * border. Chihuahua city was dropped from local distribution — those orders go
 * out as Mexico express shipping like anywhere else in the country.
 */
export type ExpressLocalCity = 'el_paso' | 'juarez'

export type ExpressFulfillment = 'ship' | 'pickup'

export type ExpressPaymentMethodId =
  | 'zelle'
  | 'cashapp'
  | 'paypal'
  | 'apple_pay'
  | 'mx_bank_transfer'
  | 'cod'
  | 'cash_pickup'

/** When the shopper plans to collect a local order. */
export type ExpressPickupDay = 'today' | 'tomorrow' | 'later'
export type ExpressPickupWindow = 'morning' | 'afternoon' | 'evening'

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
  pickupDay?: ExpressPickupDay | null
  pickupWindow?: ExpressPickupWindow | null
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
}

/** The country the label will carry, which drives address shape and rails. */
export function expressCountry(destination: ExpressDestination, localCity: ExpressLocalCity | null): 'US' | 'MX' {
  if (destination === 'us') return 'US'
  if (destination === 'mexico') return 'MX'
  return localCity ? EXPRESS_LOCAL_CITIES[localCity].country : 'US'
}

/** Mexican destinations are the only ones that may pay the courier on delivery. */
export function expressShipsToMexico(destination: ExpressDestination, localCity: ExpressLocalCity | null) {
  return expressCountry(destination, localCity) === 'MX'
}

// ---------- payment ----------

/**
 * Where a rail can be used.
 *
 * `any` is a prepaid rail — it works wherever the order is going. The two cash
 * rails are mutually exclusive and split on who bears the collection risk:
 * `pickup` is cash handed over at the distribution point, which costs Encore
 * nothing, and `mexico_delivery` is a courier collecting cash at a door in
 * Mexico, which is what the 5% pays for.
 */
export type ExpressPaymentAvailability = 'any' | 'pickup' | 'mexico_delivery'

export type ExpressPaymentMethod = {
  id: ExpressPaymentMethodId
  /** Fraction added to merchandise when this rail is chosen. */
  surchargeRate: number
  availability: ExpressPaymentAvailability
  /**
   * Where the destination account details come from. The express rails reuse
   * the interim checkout config so an operator changes a handle in exactly one
   * place. The cash rails have no destination to show.
   */
  detailsId: InterimPaymentMethodId | null
  /**
   * Rails whose account is handed over in the chat rather than printed on the
   * page. The Mexican CLABE is deliberately not published on the storefront —
   * an 18-digit bank account sitting in public HTML is worth scraping, and
   * sending it per-order lets it be rotated without a deploy.
   */
  detailsInChat?: boolean
  /**
   * Rails whose payment link accepts a trailing amount that prefills the send
   * screen. Only used when the amount owed is fully known — see
   * `expressPayableCents`.
   */
  amountInLink?: boolean
}

export const EXPRESS_PAYMENT_METHODS: readonly ExpressPaymentMethod[] = [
  { id: 'zelle', surchargeRate: 0, availability: 'any', detailsId: 'zelle' },
  { id: 'cashapp', surchargeRate: 0, availability: 'any', detailsId: 'cashapp', amountInLink: true },
  { id: 'paypal', surchargeRate: 0, availability: 'any', detailsId: 'paypal', amountInLink: true },
  { id: 'apple_pay', surchargeRate: 0, availability: 'any', detailsId: 'apple_pay' },
  { id: 'mx_bank_transfer', surchargeRate: 0, availability: 'any', detailsId: 'bank_transfer', detailsInChat: true },
  { id: 'cash_pickup', surchargeRate: 0, availability: 'pickup', detailsId: null },
  { id: 'cod', surchargeRate: CASH_ON_DELIVERY_PROCESSING_RATE, availability: 'mexico_delivery', detailsId: null },
]

export function expressPaymentMethod(id: ExpressPaymentMethodId | null) {
  return EXPRESS_PAYMENT_METHODS.find((method) => method.id === id) ?? null
}

/**
 * The rails on offer, ordered so the one this shopper is most likely to reach
 * for sits first.
 *
 * Only the two cash rails are ever withheld, and they are withheld for the same
 * reason: the cash has to be physically collectable. Cash at pickup needs the
 * shopper to be standing at the counter; cash on delivery needs a courier who
 * collects, which is the Mexican delivery network only. A pickup order is never
 * offered cash on delivery — there is no delivery to pay at.
 */
export function expressPaymentMethodsFor(
  destination: ExpressDestination,
  localCity: ExpressLocalCity | null,
  fulfillment: ExpressFulfillment = 'ship',
): ExpressPaymentMethod[] {
  const mexico = expressShipsToMexico(destination, localCity)
  const pickup = fulfillment === 'pickup'
  const available = EXPRESS_PAYMENT_METHODS.filter((method) => {
    if (method.availability === 'pickup') return pickup
    if (method.availability === 'mexico_delivery') return mexico && !pickup
    return true
  })
  const order: ExpressPaymentMethodId[] = pickup
    ? ['cash_pickup', 'zelle', 'cashapp', 'paypal', 'apple_pay', 'mx_bank_transfer']
    : mexico
      ? ['mx_bank_transfer', 'cod', 'paypal', 'zelle', 'cashapp', 'apple_pay']
      : ['zelle', 'cashapp', 'paypal', 'apple_pay', 'mx_bank_transfer']
  return [...available].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
}

/**
 * The cash-on-delivery surcharge, charged on merchandise after promotions and
 * never on shipping. This mirrors
 * `calculatePaymentProcessingFeeCents` in `lib/shipping` so the number quoted
 * in the chat matches the one the server computes if the order is later moved
 * onto the full checkout.
 */
export function expressSurchargeCents(subtotalCents: number, methodId: ExpressPaymentMethodId | null) {
  const rate = expressPaymentMethod(methodId)?.surchargeRate ?? 0
  if (!rate) return 0
  return Math.round(Math.max(0, subtotalCents - promotionDiscountCents(subtotalCents)) * rate)
}

/**
 * The account details to display for a rail, or null when there is nothing to
 * show — either because the rail has no account (the cash rails) or because its
 * account is deliberately withheld from the page and sent in the chat.
 */
export function expressPaymentDetails(
  methodId: ExpressPaymentMethodId | null,
  methods: InterimPaymentMethod[] = INTERIM_PAYMENT_METHODS,
): InterimPaymentMethod | null {
  const method = expressPaymentMethod(methodId)
  if (!method?.detailsId || method.detailsInChat) return null
  const configured = methods.find((entry) => entry.id === method.detailsId)
  return configured?.enabled && configured.details.length ? configured : null
}

/** True when the shopper is told the account arrives in the chat. */
export function expressDetailsArriveInChat(methodId: ExpressPaymentMethodId | null) {
  return expressPaymentMethod(methodId)?.detailsInChat === true
}

/**
 * The exact amount owed right now, or null when any component is still unknown.
 *
 * The rest of this module refuses to state a final total because no server
 * recomputed it. This function is the narrow exception, and it earns it by
 * returning a number only when every component is deterministic on the client:
 *
 *   merchandise   subtotal minus `promotionDiscountCents` — the same function
 *                 the Edge Function mirrors
 *   surcharge     the cash-on-delivery 5%, computed here
 *   shipping      **only** when it is provably zero: a pickup has none, and an
 *                 order over the free-shipping threshold has it waived
 *
 * A US order under $200 needs a live carrier rate, and a local home delivery
 * needs a distance-based fee. Neither is knowable here, so both return null and
 * the shopper is told the total is settled in the chat instead of being shown a
 * number that the confirmation would then contradict.
 */
export function expressPayableCents({
  items,
  fulfillment,
  paymentMethod,
}: Pick<ExpressOrderInput, 'items' | 'destination' | 'localCity' | 'fulfillment' | 'paymentMethod'>): number | null {
  const subtotalCents = Math.round(calculateSubtotal(items) * 100)
  if (subtotalCents <= 0) return null

  const shippingIsProvablyZero = fulfillment === 'pickup' || qualifiesForFreeShipping(subtotalCents)
  if (!shippingIsProvablyZero) return null

  return Math.max(
    0,
    subtotalCents - promotionDiscountCents(subtotalCents) + expressSurchargeCents(subtotalCents, paymentMethod),
  )
}

/**
 * The one-tap payment link for a rail, with the amount already filled in when
 * it is known.
 *
 * Cash App (`cash.app/$tag/12.34`) and PayPal (`paypal.me/name/12.34`) both
 * read a trailing amount and open their send screen pre-filled, which removes
 * the most common way a manual transfer goes wrong — the customer typing the
 * wrong number. Where the amount is not yet knowable the bare link is returned,
 * so the button still works and the customer enters the amount after we confirm
 * it. Amounts are always in USD, matching every price on the site.
 */
export function expressPaymentLink(
  methodId: ExpressPaymentMethodId | null,
  payableCents: number | null,
  methods: InterimPaymentMethod[] = INTERIM_PAYMENT_METHODS,
) {
  const method = expressPaymentMethod(methodId)
  const link = expressPaymentDetails(methodId, methods)?.link
  if (!method || !link) return link ?? null
  if (!method.amountInLink || payableCents === null || payableCents <= 0) return link
  return { ...link, url: `${link.url.replace(/\/$/, '')}/${(payableCents / 100).toFixed(2)}` }
}

// ---------- validation ----------

export type ExpressFieldId = 'name' | 'phone' | 'localCity' | 'street' | 'neighborhood' | 'city' | 'state' | 'postalCode' | 'paymentMethod'
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
  // A local order without a city is unactionable in both directions: a pickup
  // names no counter to walk up to, and a delivery has nothing to prefill the
  // city and state with. It is checked ahead of the pickup return for that
  // reason — pickup skips the address, not the city.
  if (destination === 'local' && !localCity) issues.localCity = 'missing'

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
  en: { us: 'United States', mexico: 'Mexico', local: 'Local (El Paso · Ciudad Juárez)' },
  es: { us: 'Estados Unidos', mexico: 'México', local: 'Local (El Paso · Ciudad Juárez)' },
}

const localCityLabels: Record<ExpressLocalCity, string> = {
  el_paso: 'El Paso, TX',
  juarez: 'Ciudad Juárez, Chih.',
}

/**
 * Pickup windows.
 *
 * The day is a preference rather than a booking — stock still has to be
 * confirmed before anyone drives over — so the message says "prefers" and the
 * exact time is agreed in the chat. Naming a window is still far better than
 * the free-text note it replaces: it is the difference between "afternoon" and
 * three messages establishing what afternoon means.
 */
export const pickupDayLabels: Record<Locale, Record<ExpressPickupDay, string>> = {
  en: { today: 'Today', tomorrow: 'Tomorrow', later: 'Another day' },
  es: { today: 'Hoy', tomorrow: 'Mañana', later: 'Otro día' },
}

export const pickupWindowLabels: Record<Locale, Record<ExpressPickupWindow, string>> = {
  en: { morning: 'morning (10am–1pm)', afternoon: 'afternoon (1–5pm)', evening: 'evening (5–8pm)' },
  es: { morning: 'mañana (10am–1pm)', afternoon: 'tarde (1–5pm)', evening: 'noche (5–8pm)' },
}

export function expressPickupSlotLabel(day: ExpressPickupDay | null | undefined, window: ExpressPickupWindow | null | undefined, locale: Locale) {
  const key = locale === 'es' ? 'es' : 'en'
  const parts = [day ? pickupDayLabels[key][day] : '', window ? pickupWindowLabels[key][window] : ''].filter(Boolean)
  return parts.join(', ')
}

const paymentLabels: Record<Locale, Record<ExpressPaymentMethodId, string>> = {
  en: {
    zelle: 'Zelle',
    cashapp: 'Cash App',
    paypal: 'PayPal',
    apple_pay: 'Apple Pay (Apple Cash)',
    mx_bank_transfer: 'Mexican bank transfer (SPEI)',
    cash_pickup: 'Cash at pickup',
    cod: 'Cash on delivery (+5%)',
  },
  es: {
    zelle: 'Zelle',
    cashapp: 'Cash App',
    paypal: 'PayPal',
    apple_pay: 'Apple Pay (Apple Cash)',
    mx_bank_transfer: 'Transferencia bancaria en México (SPEI)',
    cash_pickup: 'Efectivo al recoger',
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
  pickupDay,
  pickupWindow,
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
  const payableCents = expressPayableCents({ items, destination, localCity, fulfillment, paymentMethod })
  const purchaseTypeOf = translatePurchaseType ?? ((value: string) => value)
  const money = (cents: number) => formatCartCurrency(cents / 100, locale)
  const pickupSlot = fulfillment === 'pickup' ? expressPickupSlotLabel(pickupDay, pickupWindow, locale) : ''
  // The service Encore books, which is an instruction rather than a price —
  // below the free-shipping threshold the shopper is still charged the cheapest
  // rate and Encore covers the upgrade. Pickups have no carrier to book.
  const service = fulfillment === 'pickup' ? null : shippingServiceFor(paymentMethod === 'cod')

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
        qualifiesForFreeShipping(subtotalCents) ? 'Incluye envío gratis' : '',
        surchargeCents ? `Manejo de pago contra entrega (5%): ${money(surchargeCents)}` : '',
        payableCents === null
          ? 'Envío y total final: se confirman en este chat'
          : `TOTAL A PAGAR: ${money(payableCents)} (envío incluido)`,
      ]),
      section([
        '*PAGO*',
        paymentMethod ? `Quiero pagar con: ${expressPaymentLabel(paymentMethod, locale)}` : 'Forma de pago: por definir',
        expressDetailsArriveInChat(paymentMethod) ? '¿Me pueden enviar la CLABE y el titular de la cuenta, por favor?' : '',
      ]),
      section([
        fulfillment === 'pickup' ? '*RECOLECCIÓN*' : '*DATOS PARA LA ETIQUETA*',
        `Destino: ${destinationLine}`,
        service ? `Servicio: ${service === 'express' ? 'EXPRESS de 2 días' : 'estándar (pago contra entrega)'}` : '',
        pickupSlot ? `Prefiero recoger: ${pickupSlot}` : '',
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
      qualifiesForFreeShipping(subtotalCents) ? 'Includes free shipping' : '',
      surchargeCents ? `Cash-on-delivery handling (5%): ${money(surchargeCents)}` : '',
      payableCents === null
        ? 'Shipping and final total: confirmed in this chat'
        : `TOTAL DUE: ${money(payableCents)} (shipping included)`,
    ]),
    section([
      '*PAYMENT*',
      paymentMethod ? `I'd like to pay by: ${expressPaymentLabel(paymentMethod, locale)}` : 'Payment method: to be decided',
      expressDetailsArriveInChat(paymentMethod) ? 'Could you send me the CLABE and the account holder name?' : '',
    ]),
    section([
      fulfillment === 'pickup' ? '*PICKUP*' : '*SHIP TO — label details*',
      `Destination: ${destinationLine}`,
      service ? `Service: ${service === 'express' ? '2-day EXPRESS' : 'standard (cash on delivery)'}` : '',
      pickupSlot ? `Prefers to collect: ${pickupSlot}` : '',
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
