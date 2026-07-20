import { describe, expect, it } from 'vitest'
import type { CartItem } from '../cart'
import {
  buildHandoffMessage,
  buildInstagramDmUrl,
  buildWhatsAppHandoffUrl,
  generateOrderReference,
  toOrderItemsPayload,
} from './interimCheckout'
import { getEnabledPaymentMethods, type InterimPaymentMethod } from '../../config/interimCheckout'

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 'retatrutide__10mg',
  productSlug: 'retatrutide',
  productName: 'Retatrutide',
  variantLabel: '10mg',
  variantFormat: 'vial',
  image: '',
  unitPrice: 20,
  sku: 'RET-10',
  optionId: 'vial-only',
  purchaseType: 'Vial Only',
  kitIncluded: false,
  packSize: 1,
  savings: 0,
  linePrice: 20,
  quantity: 2,
  ...overrides,
})

describe('interim checkout handoff', () => {
  it('builds the WhatsApp message with reference, line items, total, and payment method', () => {
    const message = buildHandoffMessage({
      reference: 'ORD-4821',
      items: [item(), item({ id: 'b', productName: 'BPC-157', variantLabel: '5mg', unitPrice: 15, linePrice: 15, quantity: 1, sku: 'BPC-5' })],
      paymentMethod: 'bank_transfer',
      locale: 'en',
    })
    expect(message).toContain('Order [ORD-4821]')
    expect(message).toContain('- 2x Retatrutide 10mg ($40)')
    expect(message).toContain('- 1x BPC-157 5mg ($15)')
    expect(message).toContain('Total: $55')
    expect(message).toContain("I'd like to pay by: Bank transfer")
  })

  it('localizes the handoff message in Spanish with the same reference', () => {
    const message = buildHandoffMessage({ reference: 'ORD-1000', items: [item()], paymentMethod: 'cash_on_delivery', locale: 'es' })
    expect(message).toContain('Pedido [ORD-1000]')
    expect(message).toContain('Quiero pagar con: Pago contra entrega / recolección')
    expect(message).not.toContain('Order [')
  })

  it('generates short human-readable references and url-encodes the wa.me link', () => {
    const reference = generateOrderReference()
    expect(reference).toMatch(/^ORD-\d{4}$/)
    const url = buildWhatsAppHandoffUrl('Order [ORD-1]\nTotal: $5')
    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=Order%20%5BORD-1%5D%0ATotal%3A%20%245$/)
    expect(buildInstagramDmUrl()).toMatch(/^https:\/\/ig\.me\/m\/[\w.]+$/)
  })

  it('serializes cart items into a processor-ready integer-cents payload', () => {
    const [payload] = toOrderItemsPayload([item({ unitPrice: 19.99, linePrice: 19.99 })])
    expect(payload).toMatchObject({ sku: 'RET-10', quantity: 2, unit_price_cents: 1999, line_total_cents: 3998 })
  })

  it('only exposes enabled payment methods that have a destination (cash on delivery exempt)', () => {
    const methods: InterimPaymentMethod[] = [
      { id: 'bank_transfer', enabled: true, details: [] },
      { id: 'paypal', enabled: true, details: ['paypal.me/x'] },
      { id: 'venmo', enabled: false, details: ['@x'] },
      { id: 'cash_on_delivery', enabled: true, details: [] },
    ]
    expect(getEnabledPaymentMethods(methods).map((method) => method.id)).toEqual(['paypal', 'cash_on_delivery'])
  })
})
