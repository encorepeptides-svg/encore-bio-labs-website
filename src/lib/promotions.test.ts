import { describe, expect, it } from 'vitest'
import type { ShippingRate } from './shipping'
import {
  centsToNextTier,
  promotionDiscountCents,
  promotionTierFor,
  qualifiesForExpressUpgrade,
  qualifiesForFreeShipping,
  selectExpressRate,
} from './promotions'

function rate(id: string, deliveryDays: number | null, amountCents: number): ShippingRate {
  return { id, carrier: 'FedEx', service: id, amountCents, currency: 'USD', deliveryDays, deliveryDate: null }
}

describe('order-value promotion tiers', () => {
  it.each([
    [0, 'none'],
    [19_999, 'none'],
    [20_000, 'free_shipping'],
    [29_999, 'free_shipping'],
    [30_000, 'volume'],
    [100_000, 'volume'],
  ])('places a %i-cent subtotal in the %s tier', (subtotal, tier) => {
    expect(promotionTierFor(subtotal)).toBe(tier)
  })

  it('treats each threshold as inclusive', () => {
    expect(qualifiesForFreeShipping(20_000)).toBe(true)
    expect(qualifiesForFreeShipping(19_999)).toBe(false)
    expect(qualifiesForExpressUpgrade(30_000)).toBe(true)
    expect(qualifiesForExpressUpgrade(29_999)).toBe(false)
  })

  it('keeps free shipping once the volume tier is reached', () => {
    expect(qualifiesForFreeShipping(50_000)).toBe(true)
  })

  it('discounts nothing below $300 and 10% at or above it', () => {
    expect(promotionDiscountCents(29_999)).toBe(0)
    expect(promotionDiscountCents(30_000)).toBe(3_000)
    expect(promotionDiscountCents(45_678)).toBe(4_568)
  })

  it('reports the gap to the next tier and nothing at the top', () => {
    expect(centsToNextTier(5_000)).toEqual({ tier: 'free_shipping', remainingCents: 15_000 })
    expect(centsToNextTier(20_000)).toEqual({ tier: 'volume', remainingCents: 10_000 })
    expect(centsToNextTier(30_000)).toBeNull()
  })
})

describe('express rate selection', () => {
  it('takes the quickest service within two days', () => {
    const rates = [rate('ground', 5, 900), rate('express', 2, 4_200), rate('overnight', 1, 8_900)]
    expect(selectExpressRate(rates)?.id).toBe('overnight')
  })

  it('breaks a speed tie on price, since Encore absorbs the cost', () => {
    const rates = [rate('ups-2day', 2, 4_500), rate('fedex-2day', 2, 3_900)]
    expect(selectExpressRate(rates)?.id).toBe('fedex-2day')
  })

  it('falls back to the quickest available when nothing hits two days', () => {
    const rates = [rate('ground', 6, 900), rate('regional', 3, 2_400)]
    expect(selectExpressRate(rates)?.id).toBe('regional')
  })

  it('ranks rates with no transit estimate last rather than dropping them', () => {
    expect(selectExpressRate([rate('unknown', null, 500), rate('ground', 4, 3_000)])?.id).toBe('ground')
    expect(selectExpressRate([rate('unknown', null, 500)])?.id).toBe('unknown')
  })

  it('returns null when the carrier quoted nothing', () => {
    expect(selectExpressRate([])).toBeNull()
  })
})
