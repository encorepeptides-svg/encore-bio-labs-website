import type { ShippingRate } from './shipping'

/**
 * Order-value promotions.
 *
 * Four tiers, all measured against the cart subtotal before shipping, import
 * fees, or any discount:
 *
 *   $200+    free shipping
 *   $300+    free 2-day express shipping AND 10% off the subtotal
 *   $500+    free 2-day express shipping AND 15% off the subtotal
 *   $1,000+  free 2-day express shipping AND 20% off the subtotal
 *
 * Tiers supersede rather than stack — a $1,000 order takes 20%, not 10+15+20 —
 * and each tier carries every benefit of the ones below it, so free shipping
 * survives all the way up.
 *
 * These thresholds are duplicated in supabase/functions/shipping-checkout,
 * which recomputes every total server-side and is the authority for what a
 * customer is actually quoted. Change both together or the cart will promise
 * something the recorded order does not honor.
 */

export type PromotionTier = 'none' | 'free_shipping' | 'volume_10' | 'volume_15' | 'volume_20'
export type EarnedTier = Exclude<PromotionTier, 'none'>

export type PromotionTierRule = {
  id: EarnedTier
  thresholdCents: number
  discountRate: number
  express: boolean
}

/** Ordered by threshold, ascending — every lookup below relies on that order. */
export const PROMOTION_TIERS: readonly PromotionTierRule[] = [
  { id: 'free_shipping', thresholdCents: 20_000, discountRate: 0, express: false },
  { id: 'volume_10', thresholdCents: 30_000, discountRate: 0.1, express: true },
  { id: 'volume_15', thresholdCents: 50_000, discountRate: 0.15, express: true },
  { id: 'volume_20', thresholdCents: 100_000, discountRate: 0.2, express: true },
]

export const FREE_SHIPPING_THRESHOLD_CENTS = PROMOTION_TIERS[0].thresholdCents
export const VOLUME_TIER_THRESHOLD_CENTS = PROMOTION_TIERS[1].thresholdCents
/** A rate has to beat this to count as the promised "2-day express". */
export const EXPRESS_MAX_DELIVERY_DAYS = 2

/** The highest tier the subtotal clears, or null below the first threshold. */
export function promotionRuleFor(subtotalCents: number): PromotionTierRule | null {
  let earned: PromotionTierRule | null = null
  for (const tier of PROMOTION_TIERS) {
    if (subtotalCents >= tier.thresholdCents) earned = tier
  }
  return earned
}

export function promotionTierFor(subtotalCents: number): PromotionTier {
  return promotionRuleFor(subtotalCents)?.id ?? 'none'
}

export function qualifiesForFreeShipping(subtotalCents: number) {
  return promotionRuleFor(subtotalCents) !== null
}

export function qualifiesForExpressUpgrade(subtotalCents: number) {
  return promotionRuleFor(subtotalCents)?.express ?? false
}

export function promotionDiscountRate(subtotalCents: number) {
  return promotionRuleFor(subtotalCents)?.discountRate ?? 0
}

/**
 * The discount comes off the whole subtotal, including lines that already carry
 * multi-vial pack savings. The two discounts stack by design.
 */
export function promotionDiscountCents(subtotalCents: number) {
  const rate = promotionDiscountRate(subtotalCents)
  return rate ? Math.round(subtotalCents * rate) : 0
}

/**
 * What the shopper still has to add to reach the next tier, for the cart
 * progress note. Returns null once the top tier is reached.
 */
export function centsToNextTier(subtotalCents: number): { tier: EarnedTier; remainingCents: number } | null {
  const next = PROMOTION_TIERS.find((tier) => subtotalCents < tier.thresholdCents)
  return next ? { tier: next.id, remainingCents: next.thresholdCents - subtotalCents } : null
}

/**
 * Picks the rate to hand an order that earned the express upgrade: the quickest
 * service at or under two transit days, cheapest first when several tie on
 * speed.
 *
 * Carriers do not always quote a 2-day service to every postal code, and a rate
 * list can arrive with no transit estimate at all. Rather than dropping the
 * promise, this falls back to the quickest rate on offer — Encore is paying for
 * it either way, and an unquoted service is still better than none. Rates with
 * no delivery estimate rank last, since they cannot be shown to beat anything.
 */
export function selectExpressRate(rates: ShippingRate[]): ShippingRate | null {
  if (!rates.length) return null

  const ranked = [...rates].sort((a, b) => {
    const daysA = a.deliveryDays ?? Number.POSITIVE_INFINITY
    const daysB = b.deliveryDays ?? Number.POSITIVE_INFINITY
    if (daysA !== daysB) return daysA - daysB
    return a.amountCents - b.amountCents
  })

  const withinExpress = ranked.filter((rate) => rate.deliveryDays !== null && rate.deliveryDays <= EXPRESS_MAX_DELIVERY_DAYS)
  return withinExpress[0] ?? ranked[0]
}
