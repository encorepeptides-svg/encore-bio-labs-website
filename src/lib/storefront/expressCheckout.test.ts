import { describe, expect, it } from 'vitest'
import { products } from '../../data/products'
import { createCartItem } from '../cart'
import {
  EXPRESS_LOCAL_CITIES,
  buildExpressLabelBlock,
  buildExpressOrderMessage,
  buildExpressOrderUrl,
  createExpressOrderReference,
  emptyExpressAddress,
  expressAcknowledgment,
  expressOrderIssues,
  expressOrderReady,
  expressDetailsArriveInChat,
  expressPayableCents,
  expressPaymentDetails,
  expressPaymentLink,
  expressPaymentMethodsFor,
  expressSurchargeCents,
  type ExpressOrderInput,
} from './expressCheckout'

const kisspeptin = products.find((product) => product.slug === 'kisspeptin')!
const retatrutide = products.find((product) => product.slug === 'retatrutide')!

const kitLine = createCartItem(kisspeptin, kisspeptin.variants[0], 1, { optionId: 'complete-kit', packSize: 1, includeKit: true })
/** 3 × $179 = $537, which clears the 15% tier and the free 2-day express. */
const bigOrder = [createCartItem(retatrutide, retatrutide.variants[4], 3, { optionId: 'complete-kit', packSize: 1, includeKit: true })]

const usAddress = {
  street: '1234 Airway Blvd',
  line2: 'Suite 200',
  neighborhood: '',
  city: 'El Paso',
  state: 'TX',
  postalCode: '79925',
  references: '',
}

const mxAddress = {
  street: 'Vicente Guerrero 1234',
  line2: 'Int. 5',
  neighborhood: 'Partido Romero',
  city: 'Ciudad Juárez',
  state: 'Chihuahua',
  postalCode: '32030',
  references: 'Casa blanca junto al OXXO',
}

function order(overrides: Partial<ExpressOrderInput> = {}): ExpressOrderInput {
  return {
    reference: 'EXP-260826-AAAA',
    items: [kitLine],
    locale: 'en',
    contact: { name: '  Hector Ramirez  ', phone: '+1 915 123 4567', email: '' },
    destination: 'us',
    localCity: null,
    fulfillment: 'ship',
    address: usAddress,
    paymentMethod: 'zelle',
    ...overrides,
  }
}

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

describe('shipping label', () => {
  it('writes a US label with the street line first and City, ST ZIP last', () => {
    const label = buildExpressLabelBlock({ ...order(), locale: 'en' })
    expect(label).toBe([
      'Hector Ramirez',
      '+1 915 123 4567',
      '1234 Airway Blvd',
      'Suite 200',
      'El Paso, TX 79925',
      'United States',
    ].join('\n'))
  })

  it('writes a Mexican label with the colonia on its own line and the C.P. ahead of the city', () => {
    const label = buildExpressLabelBlock({ ...order({ destination: 'mexico', address: mxAddress }), locale: 'es' })
    expect(label).toContain('Col. Partido Romero')
    expect(label).toContain('C.P. 32030, Ciudad Juárez, Chihuahua')
    expect(label).toContain('México')
    // Last-mile drivers in Mexico route on the landmark, so it rides on the label.
    expect(label).toContain('Referencias: Casa blanca junto al OXXO')
  })

  it('writes the label for the courier who reads it, not the shopper who typed it', () => {
    // An English-speaking shopper shipping to Mexico still gets a Spanish label.
    const mexican = buildExpressLabelBlock({ ...order({ destination: 'mexico', address: mxAddress }), locale: 'en' })
    expect(mexican).toContain('México')
    expect(mexican).toContain('Referencias: Casa blanca junto al OXXO')
    // And a Spanish-speaking shopper shipping inside the US gets an English one.
    const american = buildExpressLabelBlock({ ...order({ address: { ...usAddress, references: 'Grey door' } }), locale: 'es' })
    expect(american).toContain('United States')
    expect(american).toContain('Landmark: Grey door')
  })

  it('keeps the tracking email off the label and beside the destination instead', () => {
    const contact = { name: 'Hector Ramirez', phone: '+1 915 123 4567', email: 'hector@example.com' }
    expect(buildExpressLabelBlock({ ...order({ contact }), locale: 'en' })).not.toContain('hector@example.com')
    expect(buildExpressOrderMessage(order({ contact }))).toContain('Tracking to: hector@example.com')
  })

  it('replaces the label with pickup details when nothing is being shipped', () => {
    const label = buildExpressLabelBlock({ ...order({ destination: 'local', localCity: 'juarez', fulfillment: 'pickup' }), locale: 'en' })
    expect(label).toContain('PICKUP AT DISTRIBUTION POINT')
    expect(label).toContain('Ciudad Juárez, Chih.')
    expect(label).not.toContain('1234 Airway Blvd')
  })
})

describe('cash on delivery', () => {
  it('is offered to Mexican destinations only', () => {
    const forMexico = expressPaymentMethodsFor('mexico', null).map((method) => method.id)
    const forUs = expressPaymentMethodsFor('us', null).map((method) => method.id)
    expect(forMexico).toContain('cod')
    expect(forUs).not.toContain('cod')
    // A local order follows the city it is going to, not the "local" label.
    expect(expressPaymentMethodsFor('local', 'juarez').map((method) => method.id)).toContain('cod')
    expect(expressPaymentMethodsFor('local', 'el_paso').map((method) => method.id)).not.toContain('cod')
  })

  it('is withheld from a pickup, which has no delivery to pay at', () => {
    const juarezPickup = expressPaymentMethodsFor('local', 'juarez', 'pickup').map((method) => method.id)
    expect(juarezPickup).not.toContain('cod')
    expect(juarezPickup).toContain('cash_pickup')
  })

  it('charges 5% of merchandise after promotions, and nothing on any other rail', () => {
    // $537 subtotal, 15% off = $456.45 of merchandise; 5% of that is $22.82.
    expect(expressSurchargeCents(53_700, 'cod')).toBe(2_282)
    expect(expressSurchargeCents(53_700, 'zelle')).toBe(0)
    expect(expressSurchargeCents(53_700, null)).toBe(0)
  })

  it('quotes the surcharge as its own line rather than burying it in a total', () => {
    const message = buildExpressOrderMessage(order({ items: bigOrder, destination: 'mexico', address: mxAddress, paymentMethod: 'cod' }))
    expect(message).toContain('Cash-on-delivery handling (5%): $22.82')
    // This order clears free shipping, so every component is known and the
    // total is stated. The surcharge still stands on its own line above it.
    expect(message).toContain('TOTAL DUE: $479.27')
  })

  it('leaves the total open while shipping is still unknown', () => {
    const message = buildExpressOrderMessage(order({ destination: 'mexico', address: mxAddress, paymentMethod: 'cod' }))
    expect(message).toContain('Cash-on-delivery handling (5%): $2.95')
    expect(message).toContain('Shipping and final total: confirmed in this chat')
    expect(message).not.toContain('TOTAL DUE')
  })
})

describe('express order message', () => {
  it('quotes the line, the subtotal, the rail, and the label block', () => {
    const message = buildExpressOrderMessage(order())
    expect(message).toContain('• 1× Kisspeptin 10 mg — Encore Complete Kit — $59')
    expect(message).toContain('Subtotal: $59')
    expect(message).toContain("I'd like to pay by: Zelle")
    expect(message).toContain('Destination: United States')
    // The label travels in a monospace fence so it can be copied as one block.
    expect(message).toContain('```\nHector Ramirez\n+1 915 123 4567\n1234 Airway Blvd\nSuite 200\nEl Paso, TX 79925\nUnited States\n```')
  })

  it('carries the acknowledgment into the message instead of leaving it in the browser', () => {
    const message = buildExpressOrderMessage(order({ locale: 'es', destination: 'mexico', address: mxAddress }))
    expect(message).toContain(expressAcknowledgment.es)
    expect(message).toContain('*ENCORE BIO LABS — PEDIDO EXPRÉS*')
    expect(message).toContain('Folio EXP-260826-AAAA')
  })

  it('writes Spanish prices as USD so they cannot be read as pesos', () => {
    const message = buildExpressOrderMessage(order({ locale: 'es', destination: 'mexico', address: mxAddress }))
    expect(message).toContain('Subtotal: USD $59')
  })

  it('localizes the purchase type when the caller supplies a translator', () => {
    const message = buildExpressOrderMessage(order({ locale: 'es', translatePurchaseType: () => 'Kit Completo Encore' }))
    expect(message).toContain('— Kit Completo Encore — USD $59')
  })

  it('states an earned promotion and the shipping benefit that comes with it', () => {
    const message = buildExpressOrderMessage(order({ items: bigOrder }))
    expect(message).toContain('Subtotal: $537')
    expect(message).toContain('Volume promotion (15%): -$80.55')
    // Express is no longer the reward — every order gets it — so what this
    // order earns is the shipping being free, stated separately from service.
    expect(message).toContain('Includes free shipping')
    expect(message).toContain('Service: 2-day EXPRESS')
  })

  it('omits promotion lines an order has not earned', () => {
    const message = buildExpressOrderMessage(order())
    expect(message).not.toContain('Volume promotion')
    expect(message).not.toContain('free shipping')
  })

  it('quotes no import fee on any destination now that the fee is retired', () => {
    for (const input of [
      order({ destination: 'mexico', address: mxAddress }),
      order(),
      order({ destination: 'local', localCity: 'juarez', fulfillment: 'pickup' }),
    ]) {
      expect(buildExpressOrderMessage(input)).not.toContain('import fee')
    }
  })

  it('keeps distributor attribution and shopper notes when present', () => {
    const message = buildExpressOrderMessage(order({ notes: '  Leave with the front desk  ', referralCode: 'ENCORE10' }))
    expect(message).toContain('Leave with the front desk')
    expect(message).toContain('Distributor code: ENCORE10')
  })

  it('builds a wa.me link with the message encoded', () => {
    const url = buildExpressOrderUrl(order())
    expect(url.startsWith('https://wa.me/')).toBe(true)
    expect(decodeURIComponent(url.split('?text=')[1])).toContain('*ENCORE BIO LABS — EXPRESS ORDER*')
  })
})

describe('express order validation', () => {
  const base = { contact: { name: 'Hector', phone: '9151234567', email: '' }, destination: 'us', localCity: null, fulfillment: 'ship', address: usAddress, paymentMethod: 'zelle' } as const

  it('accepts a complete US order', () => {
    expect(expressOrderIssues(base)).toEqual({})
    expect(expressOrderReady(base)).toBe(true)
  })

  it('blocks the handoff until a payment rail is chosen', () => {
    expect(expressOrderIssues({ ...base, paymentMethod: null }).paymentMethod).toBe('missing')
  })

  it('demands every field a carrier prints, including the phone', () => {
    const issues = expressOrderIssues({ ...base, contact: { name: '', phone: '', email: '' }, address: emptyExpressAddress() })
    expect(issues).toMatchObject({ name: 'missing', phone: 'missing', street: 'missing', city: 'missing', state: 'missing', postalCode: 'missing' })
  })

  it('flags a phone that is too short to dial rather than accepting it', () => {
    expect(expressOrderIssues({ ...base, contact: { name: 'Hector', phone: '555 12', email: '' } }).phone).toBe('invalid')
  })

  it('requires the colonia on a Mexican label and not on a US one', () => {
    expect(expressOrderIssues({ ...base, destination: 'mexico', address: { ...mxAddress, neighborhood: '' } }).neighborhood).toBe('missing')
    expect(expressOrderIssues({ ...base, address: { ...usAddress, neighborhood: '' } }).neighborhood).toBeUndefined()
  })

  it('checks the postal-code shape for the destination country', () => {
    expect(expressOrderIssues({ ...base, address: { ...usAddress, postalCode: '799' } }).postalCode).toBe('invalid')
    expect(expressOrderIssues({ ...base, address: { ...usAddress, postalCode: '79925-1234' } }).postalCode).toBeUndefined()
    expect(expressOrderIssues({ ...base, destination: 'mexico', address: { ...mxAddress, postalCode: '79925-1234' } }).postalCode).toBe('invalid')
  })

  it('asks a pickup order for nothing but a name, a phone, a city, and a rail', () => {
    const pickup = { ...base, destination: 'local', localCity: 'juarez', fulfillment: 'pickup', address: emptyExpressAddress() } as const
    expect(expressOrderIssues(pickup)).toEqual({})
  })

  it('will not let a local order leave without naming its city', () => {
    // Otherwise the label reads "Local (El Paso · Ciudad Juárez · Chihuahua)"
    // and nobody knows which counter the shopper is walking up to.
    const noCity = { ...base, destination: 'local', localCity: null, fulfillment: 'pickup', address: emptyExpressAddress() } as const
    expect(expressOrderIssues(noCity).localCity).toBe('missing')
    // The city is checked even though a pickup skips the rest of the address.
    expect(expressOrderIssues({ ...noCity, fulfillment: 'ship' }).localCity).toBe('missing')
    // And it is irrelevant to a non-local destination.
    expect(expressOrderIssues(base).localCity).toBeUndefined()
  })
})

describe('local distribution', () => {
  it('serves El Paso and Ciudad Juárez, and no longer Chihuahua city', () => {
    expect(Object.keys(EXPRESS_LOCAL_CITIES)).toEqual(['el_paso', 'juarez'])
  })

  it('sends a Chihuahua order down the ordinary Mexico path', () => {
    // Nothing special is needed for this: with the local option gone the
    // shopper picks Mexico, which is ordinary flat-rate carrier shipping.
    const message = buildExpressOrderMessage(order({ destination: 'mexico', address: { ...mxAddress, city: 'Chihuahua' } }))
    expect(message).toContain('Destination: Mexico')
    expect(message).not.toContain('Local')
  })
})

describe('cash at pickup', () => {
  it('is offered wherever the shopper collects in person, and nowhere else', () => {
    // Cash handed over at the counter carries no collection cost anywhere,
    // so unlike cash on delivery it is not restricted to Mexico.
    expect(expressPaymentMethodsFor('local', 'el_paso', 'pickup').map((m) => m.id)).toContain('cash_pickup')
    expect(expressPaymentMethodsFor('local', 'juarez', 'pickup').map((m) => m.id)).toContain('cash_pickup')
    expect(expressPaymentMethodsFor('local', 'el_paso', 'ship').map((m) => m.id)).not.toContain('cash_pickup')
    expect(expressPaymentMethodsFor('us', null).map((m) => m.id)).not.toContain('cash_pickup')
  })

  it('adds no surcharge, unlike paying a courier at the door', () => {
    expect(expressSurchargeCents(53_700, 'cash_pickup')).toBe(0)
    expect(expressSurchargeCents(53_700, 'cod')).toBe(2_282)
  })

  it('leads the list when the shopper is collecting', () => {
    expect(expressPaymentMethodsFor('local', 'el_paso', 'pickup')[0].id).toBe('cash_pickup')
  })
})

describe('the amount owed', () => {
  // Typed rather than `as const`: the helper takes a mutable CartItem[].
  const base: Parameters<typeof expressPayableCents>[0] = { items: [kitLine], destination: 'us', localCity: null, fulfillment: 'ship', paymentMethod: 'zelle' }

  it('refuses to name a figure while shipping is still a carrier quote', () => {
    // $59 is under the $200 free-shipping threshold, so a rate is still needed.
    expect(expressPayableCents(base)).toBeNull()
  })

  it('names it once shipping is provably zero', () => {
    // $537, 15% off = $456.45, shipping waived by the promotion.
    expect(expressPayableCents({ ...base, items: bigOrder })).toBe(45_645)
  })

  it('counts a pickup as zero shipping regardless of order size', () => {
    expect(expressPayableCents({ ...base, destination: 'local', localCity: 'el_paso', fulfillment: 'pickup', paymentMethod: 'cash_pickup' })).toBe(5_900)
  })

  it('includes the cash-on-delivery surcharge, and no longer an import fee', () => {
    // $537 - $80.55 + $22.82 surcharge. Shipping is waived at this value.
    expect(expressPayableCents({ ...base, items: bigOrder, destination: 'mexico', paymentMethod: 'cod' })).toBe(45_645 + 2_282)
  })

  it('states the total in the message only when it is fully known', () => {
    expect(buildExpressOrderMessage(order({ items: bigOrder }))).toContain('TOTAL DUE: $456.45 (shipping included)')
    expect(buildExpressOrderMessage(order())).toContain('Shipping and final total: confirmed in this chat')
    expect(buildExpressOrderMessage(order())).not.toContain('TOTAL DUE')
  })
})

describe('payment links', () => {
  it('prefills the amount on rails whose link accepts one', () => {
    expect(expressPaymentLink('cashapp', 45_645)?.url).toBe('https://cash.app/$hektoren/456.45')
    expect(expressPaymentLink('paypal', 5_900)?.url).toBe('https://paypal.me/encorepeptides/59.00')
  })

  it('falls back to the bare link when the amount is not yet knowable', () => {
    expect(expressPaymentLink('cashapp', null)?.url).toBe('https://cash.app/$hektoren')
  })

  it('leaves rails that cannot carry an amount untouched', () => {
    // Apple Cash opens Messages; there is nowhere to put a number.
    expect(expressPaymentLink('apple_pay', 45_645)?.url).toBe('sms:+19154128874')
  })
})

describe('booked service', () => {
  it('tells the operator to send it express', () => {
    expect(buildExpressOrderMessage(order())).toContain('Service: 2-day EXPRESS')
  })

  it('drops to standard for cash on delivery, where a courier collects', () => {
    const message = buildExpressOrderMessage(order({ destination: 'mexico', address: mxAddress, paymentMethod: 'cod' }))
    expect(message).toContain('Service: standard (cash on delivery)')
  })

  it('says nothing about a carrier on a pickup, which has none', () => {
    const message = buildExpressOrderMessage(order({ destination: 'local', localCity: 'juarez', fulfillment: 'pickup', paymentMethod: 'cash_pickup' }))
    expect(message).not.toContain('Service:')
  })
})

describe('pickup slots', () => {
  it('carries the requested window into the message as a preference', () => {
    const message = buildExpressOrderMessage(order({
      destination: 'local', localCity: 'el_paso', fulfillment: 'pickup',
      paymentMethod: 'cash_pickup', pickupDay: 'tomorrow', pickupWindow: 'afternoon',
    }))
    expect(message).toContain('Prefers to collect: Tomorrow, afternoon (1–5pm)')
  })

  it('says nothing when no window was picked', () => {
    const message = buildExpressOrderMessage(order({ destination: 'local', localCity: 'el_paso', fulfillment: 'pickup', paymentMethod: 'cash_pickup' }))
    expect(message).not.toContain('Prefers to collect')
  })

  it('ignores a stale window on an order that is being shipped', () => {
    expect(buildExpressOrderMessage(order({ pickupDay: 'today', pickupWindow: 'morning' }))).not.toContain('Prefers to collect')
  })
})

describe('payment destinations', () => {
  it('shows the configured account for a rail that has one', () => {
    expect(expressPaymentDetails('zelle')?.details).toEqual(['9153595448'])
  })

  it('shows nothing for cash on delivery, which has no account to pay into', () => {
    expect(expressPaymentDetails('cod')).toBeNull()
  })

  it('keeps the Mexican CLABE off the page and promises it in the chat instead', () => {
    // Deliberate: an 18-digit account in public HTML is worth scraping, and
    // sending it per order lets it be rotated without a deploy.
    expect(expressPaymentDetails('mx_bank_transfer')).toBeNull()
    expect(expressDetailsArriveInChat('mx_bank_transfer')).toBe(true)
    expect(expressDetailsArriveInChat('zelle')).toBe(false)
  })

  it('asks for the CLABE inside the message so the reply is one step', () => {
    expect(buildExpressOrderMessage(order({ paymentMethod: 'mx_bank_transfer' }))).toContain('Could you send me the CLABE and the account holder name?')
    expect(buildExpressOrderMessage(order())).not.toContain('CLABE')
  })
})
