import type { Locale } from '../i18n/config'

export const WHATSAPP_PHONE = '19153595448'
export const WHATSAPP_DISPLAY = '+1 915 359 5448'

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

/**
 * Normalizes a lead-supplied phone number for a wa.me link.
 *
 * Leads type their number however they like, and wa.me requires a country
 * code. A bare 10-digit number is assumed to be US/Canada (+1) because that is
 * what the intake's US-facing form produces; anything longer is treated as
 * already carrying its country code. The resolved number is shown to the
 * operator before use — an outbound message to the wrong person is not
 * something to guess at silently.
 */
/** Dial codes for the markets Encore actually serves. */
export const LEAD_DIAL_CODES = [
  { code: '52', label: 'Mexico +52' },
  { code: '1', label: 'US / Canada +1' },
] as const

export type LeadDialCode = (typeof LEAD_DIAL_CODES)[number]['code']

/**
 * Picks the default dial code for a lead.
 *
 * The intake form does not ask for a country, and Mexican and US mobile numbers
 * are both 10 digits — so a bare number is genuinely ambiguous and there is no
 * way to infer it correctly. Preferred language is the only signal on file, and
 * it is a hint, not a fact: the operator sees the resolved number and can
 * switch it before sending. Guessing silently is how you message a stranger.
 */
export function defaultDialCodeForLead(preferredLanguage: string, country?: string): LeadDialCode {
  // Leads captured after the intake started asking carry a real answer. Older
  // rows all say "United States" because the RPC hard-coded it, so that value
  // proves nothing on its own — only an explicit "Mexico" is trustworthy, and
  // everything else falls back to the language hint.
  if (country && country.trim().toLowerCase() === 'mexico') return '52'
  return preferredLanguage.toLowerCase().startsWith('span') ? '52' : '1'
}

/**
 * Normalizes a lead-supplied phone number for a wa.me link.
 *
 * Numbers longer than 10 digits are assumed to already carry a country code and
 * are passed through untouched. Exactly 10 digits gets the supplied dial code.
 * Anything shorter is not dialable and returns empty rather than producing a
 * plausible-looking wrong number.
 */
export function normalizeLeadPhone(phone: string, dialCode: LeadDialCode = '52') {
  const digits = phone.replaceAll(/\D/g, '')
  if (digits.length < 10) return ''
  if (digits.length > 10) return digits
  return `${dialCode}${digits}`
}

/** Opens a chat with the LEAD (not the business line), message prefilled. */
export function buildWhatsAppUrlToLead(phone: string, message: string, dialCode: LeadDialCode = '52') {
  const number = normalizeLeadPhone(phone, dialCode)
  if (!number) return ''
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildOrderInquiryMessage({
  product = '',
  strength = '',
  quantity = '',
  locale = 'en',
}: {
  product?: string
  strength?: string
  quantity?: string
  locale?: Locale
} = {}) {
  if (locale === 'es') {
    return [
      'Hola Encore Bio Labs,',
      '',
      'Me interesa lo siguiente:',
      '',
      `Producto: ${product}`,
      `Concentración: ${strength}`,
      `Cantidad: ${quantity}`,
      '',
      '¿Podrían darme información sobre precio y disponibilidad?',
      '',
      'Gracias.',
    ].join('\n')
  }
  return [
    'Hello Encore Bio Labs,',
    '',
    "I'm interested in:",
    '',
    `Product: ${product}`,
    `Strength: ${strength}`,
    `Quantity: ${quantity}`,
    '',
    'Could you provide pricing and availability?',
    '',
    'Thank you.',
  ].join('\n')
}

export function buildEscalationMessage({
  product,
  strength,
  quantity,
  city,
  deliveryPreference,
  locale = 'en',
}: {
  product: string
  strength: string
  quantity: string
  city: string
  deliveryPreference: string
  locale?: Locale
}) {
  if (locale === 'es') {
    return [
      'Hola Encore Bio Labs,',
      '',
      'Me interesa hacer un pedido:',
      '',
      `Producto: ${product}`,
      `Concentración: ${strength}`,
      `Cantidad: ${quantity}`,
      `Ciudad: ${city}`,
      `Preferencia de entrega: ${deliveryPreference}`,
      '',
      '¿Me pueden ayudar a continuar con este pedido?',
      '',
      'Gracias.',
    ].join('\n')
  }
  return [
    'Hello Encore Bio Labs,',
    '',
    "I'm interested in placing an order:",
    '',
    `Product: ${product}`,
    `Strength: ${strength}`,
    `Quantity: ${quantity}`,
    `City: ${city}`,
    `Delivery preference: ${deliveryPreference}`,
    '',
    'Could you help me continue this order?',
    '',
    'Thank you.',
  ].join('\n')
}

export function buildCartOrderMessage({
  items,
  subtotal,
  locale = 'en',
}: {
  items: Array<{ productName: string; variantLabel: string; quantity: number; purchaseType?: string; packSize?: number; kitIncluded?: boolean }>
  subtotal: string
  locale?: Locale
}) {
  if (locale === 'es') {
    return [
      'Hola Encore Bio Labs,',
      '',
      'Me gustaría continuar con una solicitud de pedido para:',
      '',
      ...items.map((item) => `• ${item.productName} — ${item.variantLabel}${item.purchaseType ? ` — ${item.purchaseType}, paquete ${item.packSize}, kit ${item.kitIncluded ? 'sí' : 'no'}` : ''} × ${item.quantity}`),
      '',
      `Subtotal del carrito: ${subtotal}`,
      'El envío y los detalles finales del pedido se confirmarán durante la revisión.',
      '',
      '¿Me pueden ayudar a continuar?',
    ].join('\n')
  }
  return [
    'Hello Encore Bio Labs,',
    '',
    "I'd like to continue an order request for:",
    '',
    ...items.map((item) => `• ${item.productName} — ${item.variantLabel}${item.purchaseType ? ` — ${item.purchaseType}, pack ${item.packSize}, kit ${item.kitIncluded ? 'yes' : 'no'}` : ''} × ${item.quantity}`),
    '',
    `Cart subtotal: ${subtotal}`,
    'Shipping and final order details to be confirmed during review.',
    '',
    'Could you help me continue?',
  ].join('\n')
}

export function buildCartPaymentRequestMessage({
  items,
  subtotal,
  method,
  locale = 'en',
}: {
  items: Array<{ productName: string; variantLabel: string; quantity: number; purchaseType?: string; packSize?: number; kitIncluded?: boolean }>
  subtotal: string
  method: string
  locale?: Locale
}) {
  const request = locale === 'es'
    ? `¿Podrían confirmar si ${method} está disponible para este pedido y enviarme las instrucciones o la solicitud de pago correcta?`
    : `Could you confirm whether ${method} is available for this order and send the correct payment instructions or payment request?`

  return `${buildCartOrderMessage({ items, subtotal, locale })}\n\n${request}`
}

export function getGeneralInquiryMessage(locale: Locale = 'en') {
  return locale === 'es'
    ? 'Hola Encore Bio Labs, tengo una pregunta sobre su catálogo de investigación.'
    : 'Hello Encore Bio Labs, I have a question about your research catalog.'
}

/** Prefilled message for the always-on floating WhatsApp support button. */
export function getSupportInquiryMessage(locale: Locale = 'en') {
  return locale === 'es'
    ? 'Hola, necesito ayuda con un producto de investigación.'
    : 'Hi, I need help with a research product.'
}

/** @deprecated Use getGeneralInquiryMessage(locale) so the message matches the active language. */
export const GENERAL_INQUIRY_MESSAGE = getGeneralInquiryMessage('en')
