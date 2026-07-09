export const WHATSAPP_PHONE = '19153595448'
export const WHATSAPP_DISPLAY = '9153595448'

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`
}

export function buildOrderInquiryMessage({
  product = '',
  strength = '',
  quantity = '',
}: {
  product?: string
  strength?: string
  quantity?: string
} = {}) {
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
}: {
  product: string
  strength: string
  quantity: string
  city: string
  deliveryPreference: string
}) {
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

export const GENERAL_INQUIRY_MESSAGE =
  'Hello Encore Bio Labs, I have a question about your research catalog.'
