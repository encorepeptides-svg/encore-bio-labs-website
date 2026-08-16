import { describe, expect, it } from 'vitest'
import { calculateDistributorDiscountCents, resolveDistributorPromotion } from './distributorIncentive'

describe('distributor customer incentive', () => {
  it('calculates 5% only on the merchandise subtotal', () => {
    expect(calculateDistributorDiscountCents(10_000)).toBe(500)
    expect(calculateDistributorDiscountCents(25_555)).toBe(1_278)
  })

  it('caps the customer benefit at USD 25', () => {
    expect(calculateDistributorDiscountCents(50_000)).toBe(2_500)
    expect(calculateDistributorDiscountCents(250_000)).toBe(2_500)
  })

  it('uses the distributor benefit when it is greater', () => {
    expect(resolveDistributorPromotion({ subtotalCents: 20_000, volumeDiscountCents: 0, eligible: true })).toEqual({
      discountSource: 'distributor_incentive', discountCents: 1_000, volumeDiscountCents: 0,
      distributorDiscountCents: 1_000, otherPromotionWon: false,
    })
  })

  it('does not stack and preserves attribution when the volume promotion wins', () => {
    expect(resolveDistributorPromotion({ subtotalCents: 40_000, volumeDiscountCents: 4_000, eligible: true })).toEqual({
      discountSource: 'volume_promotion', discountCents: 4_000, volumeDiscountCents: 4_000,
      distributorDiscountCents: 2_000, otherPromotionWon: true,
    })
  })

  it('gives a tie to the volume promotion so the first-purchase benefit is not consumed', () => {
    expect(resolveDistributorPromotion({ subtotalCents: 50_000, volumeDiscountCents: 2_500, eligible: true }).discountSource).toBe('volume_promotion')
  })

  it('does not calculate a distributor benefit for an ineligible repeat buyer', () => {
    expect(resolveDistributorPromotion({ subtotalCents: 20_000, volumeDiscountCents: 0, eligible: false })).toMatchObject({ discountSource: 'none', discountCents: 0 })
  })
})
