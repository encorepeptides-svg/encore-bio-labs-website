// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ANALYTICS_CONSENT_KEY, attributionSessionId, distributorEventIdempotencyKey, getAnalyticsConsent, setAnalyticsConsent } from './distributorAnalytics'
import type { ReferralAttribution } from './referralAttribution'

const attribution: ReferralAttribution = {
  code: 'PARTNER25', capturedAt: '2026-08-16T00:00:00.000Z', landingPath: '/catalog',
  source: 'referral_link', customerDiscountRateBps: 500, customerDiscountMaxCents: 2500,
  partnerLinkSlug: 'partnerlink',
}

describe('privacy-aware distributor analytics', () => {
  beforeEach(() => {
    const makeStorage = () => {
      const values = new Map<string, string>()
      return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
        key: (index: number) => [...values.keys()][index] ?? null,
        get length() { return values.size },
      } satisfies Storage
    }
    vi.stubGlobal('localStorage', makeStorage())
    vi.stubGlobal('sessionStorage', makeStorage())
    vi.restoreAllMocks()
  })

  it('defaults to unknown and persists an explicit consent choice', () => {
    expect(getAnalyticsConsent()).toBe('unknown')
    setAnalyticsConsent('accepted')
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('accepted')
    expect(getAnalyticsConsent()).toBe('accepted')
  })

  it('keeps one anonymous session id per tab session', () => {
    const first = attributionSessionId()
    expect(attributionSessionId()).toBe(first)
    expect(first).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('deduplicates the same funnel event but separates product views', () => {
    const checkoutA = distributorEventIdempotencyKey('checkout_started', attribution)
    const checkoutB = distributorEventIdempotencyKey('checkout_started', attribution)
    expect(checkoutB).toBe(checkoutA)
    expect(distributorEventIdempotencyKey('product_viewed', attribution, 'retatrutide')).not.toBe(
      distributorEventIdempotencyKey('product_viewed', attribution, 'bpc-157'),
    )
  })
})
