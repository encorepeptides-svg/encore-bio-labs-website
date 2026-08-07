import { describe, expect, it } from 'vitest'
import { buildCartOrderMessage, buildCartPaymentRequestMessage, buildEscalationMessage, buildOrderInquiryMessage, buildWhatsAppUrl, buildWhatsAppUrlToLead, defaultDialCodeForLead, getGeneralInquiryMessage, normalizeLeadPhone } from './whatsapp'

describe('WhatsApp message localization', () => {
  it('builds an English order inquiry message by default', () => {
    const message = buildOrderInquiryMessage({ product: 'Retatrutide', strength: '10mg', quantity: '1' })
    expect(message).toContain('Hello Encore Bio Labs')
    expect(message).toContain('Product: Retatrutide')
  })

  it('builds a Spanish order inquiry message when locale is es, preserving the compound name', () => {
    const message = buildOrderInquiryMessage({ product: 'Retatrutide', strength: '10mg', quantity: '1', locale: 'es' })
    expect(message).toContain('Hola Encore Bio Labs')
    expect(message).toContain('Producto: Retatrutide')
    expect(message).not.toContain('Hello Encore Bio Labs')
  })

  it('localizes the escalation message', () => {
    const args = { product: 'Tesamorelin', strength: '5mg', quantity: '2', city: 'El Paso', deliveryPreference: 'Standard' }
    const en = buildEscalationMessage({ ...args, locale: 'en' })
    const es = buildEscalationMessage({ ...args, locale: 'es' })
    expect(en).not.toBe(es)
    expect(es).toContain('Producto: Tesamorelin')
    expect(en).toContain('Product: Tesamorelin')
  })

  it('localizes the cart order message and keeps quantities/subtotal identical between languages', () => {
    const items = [{ productName: 'BPC-157', variantLabel: '5mg', quantity: 2 }]
    const en = buildCartOrderMessage({ items, subtotal: '$120.00', locale: 'en' })
    const es = buildCartOrderMessage({ items, subtotal: '$120.00', locale: 'es' })
    expect(en).toContain('$120.00')
    expect(es).toContain('$120.00')
    expect(en).toContain('× 2')
    expect(es).toContain('× 2')
    expect(en).not.toBe(es)
  })

  it('requests payment instructions through WhatsApp without claiming that a method is available', () => {
    const message = buildCartPaymentRequestMessage({
      items: [{ productName: 'BPC-157', variantLabel: '5mg', quantity: 1 }],
      subtotal: '$60.00',
      method: 'Zelle',
      locale: 'en',
    })
    expect(message).toContain('Could you confirm whether Zelle is available')
    expect(message).toContain('$60.00')
  })

  it('returns a locale-matched general inquiry message', () => {
    expect(getGeneralInquiryMessage('en')).toMatch(/^Hello Encore Bio Labs/)
    expect(getGeneralInquiryMessage('es')).toMatch(/^Hola Encore Bio Labs/)
  })

  it('builds a wa.me URL with the message URL-encoded', () => {
    const url = buildWhatsAppUrl(getGeneralInquiryMessage('es'))
    expect(url).toBe('https://wa.me/19153595448?text=' + encodeURIComponent(getGeneralInquiryMessage('es')))
  })
})

describe('outbound lead messaging', () => {
  it('applies the supplied dial code to a bare 10-digit number', () => {
    expect(normalizeLeadPhone('687 194 7695', '52')).toBe('526871947695')
    expect(normalizeLeadPhone('(915) 555-0123', '1')).toBe('19155550123')
  })

  it('defaults to Mexico rather than silently assuming US', () => {
    expect(normalizeLeadPhone('6871947695')).toBe('526871947695')
  })

  it('leaves a number that already carries a country code untouched', () => {
    expect(normalizeLeadPhone('+52 656 123 4567', '1')).toBe('526561234567')
  })

  it('refuses numbers too short to dial instead of inventing one', () => {
    expect(normalizeLeadPhone('555-0123')).toBe('')
    expect(normalizeLeadPhone('no phone on file')).toBe('')
  })

  it('derives the default code from preferred language', () => {
    expect(defaultDialCodeForLead('Spanish')).toBe('52')
    expect(defaultDialCodeForLead('English')).toBe('1')
  })

  it('targets the lead with the chosen code', () => {
    const url = buildWhatsAppUrlToLead('687 194 7695', 'Hola Diana', '52')
    expect(url).toContain('wa.me/526871947695')
    expect(url).toContain('Hola%20Diana')
  })

  it('yields no link when the number is unusable, rather than dialling the business', () => {
    expect(buildWhatsAppUrlToLead('', 'Hola')).toBe('')
  })
})
