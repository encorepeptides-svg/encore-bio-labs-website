import { describe, expect, it } from 'vitest'
import type { CartItem } from '../cart'
import {
  buildHandoffMessage,
  buildInstagramDmUrl,
  buildWhatsAppHandoffUrl,
  createPendingOrder,
  generateOrderReference,
  toOrderItemsPayload,
} from './interimCheckout'
import { getEnabledPaymentMethods, type InterimPaymentMethod } from '../../config/interimCheckout'
import type { ShippingSelection } from '../shipping'

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

const pickupShipping: ShippingSelection = {
  destination: 'local_juarez',
  localFulfillment: 'pickup',
  kitCount: 4,
  address: { country: 'MX', state: 'Chihuahua', city: 'Ciudad Juárez', neighborhood: '', postalCode: '', street: '', streetNumber: '', line2: '' },
  verification: {
    status: 'verified',
    provider: 'local_rules',
    originalAddress: { country: 'MX', state: 'Chihuahua', city: 'Ciudad Juárez', neighborhood: '', postalCode: '', street: '', streetNumber: '', line2: '' },
    recommendedAddress: null,
    messages: [],
    rates: [],
    localDeliveryFeeCents: 0,
    localDeliveryTime: 'Monday–Friday, 9am–5pm',
    distanceMiles: null,
    coverageCenterPostalCode: '32510',
    pickupPointName: 'Encore Juárez',
    pickupPointAddress: 'Zona Pronaf, Ciudad Juárez, Chihuahua',
    verificationId: null,
    checkedAt: '2026-07-20T00:00:00.000Z',
    manualReviewRequired: false,
    deliverable: true,
  },
  addressChoice: null,
  selectedRateId: null,
  manualReviewRequested: false,
  destinationAcknowledged: true,
}

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
    const message = buildHandoffMessage({
      reference: 'ORD-1000',
      items: [item()],
      paymentMethod: 'cash_on_delivery',
      locale: 'es',
      contact: { name: 'María Rivera', address: '123 Calle Principal', city: 'Juárez', notes: 'Llame al llegar' },
    })
    expect(message).toContain('Pedido [ORD-1000]')
    expect(message).toContain('Quiero pagar con: Pago contra entrega / recolección')
    expect(message).toContain('Nombre: María Rivera')
    expect(message).toContain('Envío: 123 Calle Principal, Juárez')
    expect(message).toContain('Notas: Llame al llegar')
    expect(message).not.toContain('Order [')
  })

  it('identifies free local pickup and retains the Mexico import fee in the handoff', () => {
    const message = buildHandoffMessage({
      reference: 'ORD-2026',
      items: [item()],
      paymentMethod: 'cash_on_delivery',
      locale: 'es',
      shipping: pickupShipping,
    })
    expect(message).toContain('Importación: $25')
    expect(message).toContain('Envío: $0')
    expect(message).toContain('Recepción local: recoger en punto de distribución')
    expect(message).toContain('Centro de cobertura: 32510')
    expect(message).toContain('Punto de distribución: Encore Juárez · Zona Pronaf, Ciudad Juárez, Chihuahua')
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

  it('keeps the message handoff available when the order store is not configured', async () => {
    const order = await createPendingOrder({
      items: [item()],
      channel: 'whatsapp',
      paymentMethod: 'cash_on_delivery',
      locale: 'en',
      contact: { name: 'Test Researcher', phone: '5551234567', email: 'researcher@example.test' },
    })

    expect(order.reference).toMatch(/^ORD-\d{4}$/)
    expect(order.subtotalCents).toBe(4000)
    expect(order.recorded).toBe(false)
  })
})
