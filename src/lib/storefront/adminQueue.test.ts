import { describe, expect, it } from 'vitest'
import { selectStorefrontFollowUps, storefrontOrderNeedsFollowUp } from './adminQueue'

describe('storefront admin follow-up queue', () => {
  it('keeps every unresolved checkout status visible to administrators', () => {
    expect(storefrontOrderNeedsFollowUp({ status: 'pending_shipping_review' })).toBe(true)
    expect(storefrontOrderNeedsFollowUp({ status: 'quote_pending' })).toBe(true)
    expect(storefrontOrderNeedsFollowUp({ status: 'pending_payment' })).toBe(true)
    expect(storefrontOrderNeedsFollowUp({ status: 'paid' })).toBe(false)
    expect(storefrontOrderNeedsFollowUp({ status: 'cancelled' })).toBe(false)
  })

  it('shows the newest unresolved requests first and respects the dashboard limit', () => {
    const rows = [
      { id: 'paid', status: 'paid' as const, created_at: '2026-08-10T10:00:00Z' },
      { id: 'old', status: 'pending_payment' as const, created_at: '2026-08-08T10:00:00Z' },
      { id: 'new', status: 'pending_shipping_review' as const, created_at: '2026-08-09T10:00:00Z' },
    ]

    expect(selectStorefrontFollowUps(rows, 1).map((row) => row.id)).toEqual(['new'])
  })
})
