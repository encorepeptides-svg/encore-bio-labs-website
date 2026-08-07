import type { ShippingRate } from './shipping'

/**
 * Order-value promotions.
 *
 * Two tiers, both measured against the cart subtotal before shipping, import
 * fees, or any discount:
 *
 *   $200+  free shipping
 *   $300+  free 2-day express shipping AND 10% off the subtotal
 *
 * The $300 tier supersedes the $200 tier rather than stacking with it — there
 * is only one shipping charge to waive.
 *
 * These thresholds are duplicated in supabase/functions/shipping-checkout,
 * which recomputes every total server-side and is the authority for what a
 * customer is actually quoted. Change both together or the cart will promise
 * something the recorded order does not honor.
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 20_000
export const VOLUME_TIER_THRESHOLD_CENTS = 30_000
export const VOLUME_DISCOUNT_RATE = 0.1
/** A rate has to beat this to count as the promised "2-day express". */
export const EXPRESS_MAX_DELIVERY_DAYS = 2

export type PromotionTier = 'none' | 'free_shipping' | 'volume'

export function promotionTierFor(subtotalCents: number): PromotionTier {
  if (subtotalCents >= VOLUME_TIER_THRESHOLD_CENTS) return 'volume'
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 'free_shipping'
  return 'none'
}

export function qualifiesForFreeShipping(subtotalCents: number) {
  return promotionTierFor(subtotalCents) !== 'none'
}

export function qualifiesForExpressUpgrade(subtotalCents: number) {
  return promotionTierFor(subtotalCents) === 'volume'
}

/**
 * The 10% comes off the whole subtotal, including lines that already carry
 * multi-vial pack savings. The two discounts stack by design.
 */
export function promotionDiscountCents(subtotalCents: number) {
  if (subtotalCents < VOLUME_TIER_THRESHOLD_CENTS) return 0
  return Math.round(subtotalCents * VOLUME_DISCOUNT_RATE)
}

/**
 * What the shopper still has to add to reach the next tier, for the cart
 * progress note. Returns null once the top tier is reached.
 */
export function centsToNextTier(subtotalCents: number): { tier: Exclude<PromotionTier, 'none'>; remainingCents: number } | null {
  if (subtotalCents < FREE_SHIPPING_THRESHOLD_CENTS) {
    return { tier: 'free_shipping', remainingCents: FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents }
  }
  if (subtotalCents < VOLUME_TIER_THRESHOLD_CENTS) {
    return { tier: 'volume', remainingCents: VOLUME_TIER_THRESHOLD_CENTS - subtotalCents }
  }
  return null
}

/**
 * Picks the rate to hand a $300+ order: the quickest service at or under two
 * transit days, cheapest first when several tie on speed.
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
