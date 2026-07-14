import { describe, expect, it } from 'vitest'
import { buildCartOrderMessage, buildEscalationMessage, buildOrderInquiryMessage, buildWhatsAppUrl, getGeneralInquiryMessage } from './whatsapp'

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

  it('returns a locale-matched general inquiry message', () => {
    expect(getGeneralInquiryMessage('en')).toMatch(/^Hello Encore Bio Labs/)
    expect(getGeneralInquiryMessage('es')).toMatch(/^Hola Encore Bio Labs/)
  })

  it('builds a wa.me URL with the message URL-encoded', () => {
    const url = buildWhatsAppUrl(getGeneralInquiryMessage('es'))
    expect(url).toBe('https://wa.me/19153595448?text=' + encodeURIComponent(getGeneralInquiryMessage('es')))
  })
})
