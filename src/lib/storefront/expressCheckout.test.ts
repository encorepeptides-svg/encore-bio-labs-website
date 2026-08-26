import { describe, expect, it } from 'vitest'
import { products } from '../../data/products'
import { createCartItem } from '../cart'
import {
  buildExpressOrderMessage,
  buildExpressOrderUrl,
  createExpressOrderReference,
  expressAcknowledgment,
} from './expressCheckout'

const kisspeptin = products.find((product) => product.slug === 'kisspeptin')!
const retatrutide = products.find((product) => product.slug === 'retatrutide')!

const kitLine = createCartItem(kisspeptin, kisspeptin.variants[0], 1, { optionId: 'complete-kit', packSize: 1, includeKit: true })

describe('express order reference', () => {
  it('stamps the date and stays free of ambiguous glyphs', () => {
    const reference = createExpressOrderReference(new Date(2026, 7, 26), () => 0)
    expect(reference).toBe('EXP-260826-AAAA')
    // Only the random suffix avoids ambiguous glyphs; the date stamp is digits.
    expect(reference.split('-')[2]).not.toMatch(/[01IO]/)
  })

  it('marks the order as having no stored record to look up', () => {
    expect(createExpressOrderReference()).toMatch(/^EXP-\d{6}-[A-Z2-9]{4}$/)
  })
})

describe('express order message', () => {
  it('quotes the line, the subtotal, and never invents a total', () => {
    const message = buildExpressOrderMessage({
      reference: 'EXP-260826-AAAA',
      items: [kitLine],
      locale: 'en',
      name: '  Hector  ',
      destination: 'mexico',
    })
    expect(message).toContain('- 1x Kisspeptin 10 mg · Encore Complete Kit ($59)')
    expect(message).toContain('Subtotal: $59')
    expect(message).toContain('Shipping and total: confirmed on WhatsApp')
    expect(message).toContain('Name: Hector')
    expect(message).toContain('Destination: Mexico')
    expect(message).not.toMatch(/^Total:/m)
  })

  it('carries the acknowledgment into the message instead of leaving it in the browser', () => {
    const message = buildExpressOrderMessage({ reference: 'EXP-260826-AAAA', items: [kitLine], locale: 'es', name: 'Hector', destination: 'unspecified' })
    expect(message).toContain(expressAcknowledgment.es)
    // The acknowledgment stands as its own paragraph even when optional lines drop out.
    expect(message).toContain(`\n\n${expressAcknowledgment.es}\n\n`)
    expect(message).toContain('Pedido exprés [EXP-260826-AAAA]')
    // An unspecified destination is left out rather than guessed at.
    expect(message).not.toContain('Destino:')
  })

  it('writes Spanish prices as USD so they cannot be read as pesos', () => {
    const message = buildExpressOrderMessage({ reference: 'EXP-260826-AAAA', items: [kitLine], locale: 'es', name: 'Hector', destination: 'mexico' })
    expect(message).toContain('Subtotal: USD $59')
  })

  it('localizes the purchase type when the caller supplies a translator', () => {
    const message = buildExpressOrderMessage({
      reference: 'EXP-260826-AAAA',
      items: [kitLine],
      locale: 'es',
      name: 'Hector',
      destination: 'mexico',
      translatePurchaseType: () => 'Kit Completo Encore',
    })
    expect(message).toContain('· Kit Completo Encore (USD $59)')
  })

  it('leaves the canonical purchase type alone without a translator', () => {
    const message = buildExpressOrderMessage({ reference: 'EXP-260826-AAAA', items: [kitLine], locale: 'en', name: 'Hector', destination: 'us' })
    expect(message).toContain('· Encore Complete Kit ($59)')
  })

  it('states an earned promotion and the shipping benefit that comes with it', () => {
    const bigOrder = [createCartItem(retatrutide, retatrutide.variants[4], 3, { optionId: 'complete-kit', packSize: 1, includeKit: true })]
    const message = buildExpressOrderMessage({ reference: 'EXP-260826-AAAA', items: bigOrder, locale: 'en', name: 'Hector', destination: 'us' })
    // 3 x $179 = $537, which earns the 15% tier and free 2-day express.
    expect(message).toContain('Subtotal: $537')
    expect(message).toContain('Volume promotion: -$80.55')
    expect(message).toContain('Includes free 2-day express')
  })

  it('omits promotion lines an order has not earned', () => {
    const message = buildExpressOrderMessage({ reference: 'EXP-260826-AAAA', items: [kitLine], locale: 'en', name: 'Hector', destination: 'us' })
    expect(message).not.toContain('Volume promotion')
    expect(message).not.toContain('free shipping')
  })

  it('keeps distributor attribution and shopper notes when present', () => {
    const message = buildExpressOrderMessage({
      reference: 'EXP-260826-AAAA',
      items: [kitLine],
      locale: 'en',
      name: 'Hector',
      destination: 'local',
      notes: '  Pickup after 5pm  ',
      referralCode: 'ENCORE10',
    })
    expect(message).toContain('Notes: Pickup after 5pm')
    expect(message).toContain('Distributor code: ENCORE10')
    expect(message).toContain('Destination: Local delivery or pickup (El Paso · Ciudad Juárez · Chihuahua)')
  })

  it('builds a wa.me link with the message encoded', () => {
    const url = buildExpressOrderUrl({ reference: 'EXP-260826-AAAA', items: [kitLine], locale: 'en', name: 'Hector', destination: 'us' })
    expect(url.startsWith('https://wa.me/')).toBe(true)
    expect(decodeURIComponent(url.split('?text=')[1])).toContain('Express order [EXP-260826-AAAA]')
  })
})
