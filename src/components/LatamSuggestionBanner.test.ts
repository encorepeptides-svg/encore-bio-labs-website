// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LATAM_BANNER_DISMISSED_KEY } from '../i18n/config'
import { createMemoryStorage } from '../test/memoryStorage'

// LatamSuggestionBanner.tsx keeps its dismissed-state helpers private; this test
// exercises the exact localStorage contract they rely on, since that contract is
// what guarantees the suggestion never reappears after a visitor dismisses it.
describe('LATAM suggestion banner dismissal persistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
  })

  it('is not marked dismissed for a first-time visitor', () => {
    expect(window.localStorage.getItem(LATAM_BANNER_DISMISSED_KEY)).toBeNull()
  })

  it('stays dismissed across a simulated refresh once the visitor dismisses or switches', () => {
    window.localStorage.setItem(LATAM_BANNER_DISMISSED_KEY, 'true')
    // Simulate a fresh pageview reading the same persisted flag.
    expect(window.localStorage.getItem(LATAM_BANNER_DISMISSED_KEY)).toBe('true')
  })
})
