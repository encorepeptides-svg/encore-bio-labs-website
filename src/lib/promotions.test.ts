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
    [30_000, 'volume_10'],
    [49_999, 'volume_10'],
    [50_000, 'volume_15'],
    [99_999, 'volume_15'],
    [100_000, 'volume_20'],
    [500_000, 'volume_20'],
  ])('places a %i-cent subtotal in the %s tier', (subtotal, tier) => {
    expect(promotionTierFor(subtotal)).toBe(tier)
  })

  it('treats each threshold as inclusive', () => {
    expect(qualifiesForFreeShipping(20_000)).toBe(true)
    expect(qualifiesForFreeShipping(19_999)).toBe(false)
    expect(qualifiesForExpressUpgrade(30_000)).toBe(true)
    expect(qualifiesForExpressUpgrade(29_999)).toBe(false)
  })

  it('keeps free shipping and express at every tier above the first', () => {
    for (const subtotal of [30_000, 50_000, 100_000, 250_000]) {
      expect(qualifiesForFreeShipping(subtotal)).toBe(true)
      expect(qualifiesForExpressUpgrade(subtotal)).toBe(true)
    }
  })

  it('applies one rate per tier rather than stacking them', () => {
    expect(promotionDiscountCents(29_999)).toBe(0)
    expect(promotionDiscountCents(30_000)).toBe(3_000)
    expect(promotionDiscountCents(45_678)).toBe(4_568)
    expect(promotionDiscountCents(50_000)).toBe(7_500)
    expect(promotionDiscountCents(99_999)).toBe(15_000)
    expect(promotionDiscountCents(100_000)).toBe(20_000)
    expect(promotionDiscountCents(250_000)).toBe(50_000)
  })

  // Only the percentage tiers can invert the subtotal this way. The $200 tier
  // pays its benefit in waived shipping, which is not part of the subtotal.
  it('never lets crossing a discount threshold cost the shopper more', () => {
    const payable = (subtotal: number) => subtotal - promotionDiscountCents(subtotal)
    for (const threshold of [30_000, 50_000, 100_000]) {
      expect(payable(threshold)).toBeLessThanOrEqual(payable(threshold - 1))
    }
  })

  it('reports the gap to the next tier and nothing at the top', () => {
    expect(centsToNextTier(5_000)).toEqual({ tier: 'free_shipping', remainingCents: 15_000 })
    expect(centsToNextTier(20_000)).toEqual({ tier: 'volume_10', remainingCents: 10_000 })
    expect(centsToNextTier(30_000)).toEqual({ tier: 'volume_15', remainingCents: 20_000 })
    expect(centsToNextTier(50_000)).toEqual({ tier: 'volume_20', remainingCents: 50_000 })
    expect(centsToNextTier(100_000)).toBeNull()
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
