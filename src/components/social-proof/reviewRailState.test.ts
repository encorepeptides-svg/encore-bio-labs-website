import { describe, expect, it } from 'vitest'
import {
  getReviewRailBoundaries,
  getReviewRailTargetIndex,
  shouldAutoAdvanceReviewRail,
} from './reviewRailState'

describe('editorial review rail state', () => {
  it('reports the beginning, middle, and end scroll boundaries', () => {
    expect(getReviewRailBoundaries(0, 300, 900)).toEqual({ canMovePrevious: false, canMoveNext: true })
    expect(getReviewRailBoundaries(300, 300, 900)).toEqual({ canMovePrevious: true, canMoveNext: true })
    expect(getReviewRailBoundaries(600, 300, 900)).toEqual({ canMovePrevious: true, canMoveNext: false })
  })

  it('keeps previous and next navigation within the available reviews', () => {
    expect(getReviewRailTargetIndex(0, -1, 5)).toBe(0)
    expect(getReviewRailTargetIndex(1, 1, 5)).toBe(2)
    expect(getReviewRailTargetIndex(4, 1, 5)).toBe(4)
    expect(getReviewRailTargetIndex(0, 1, 0)).toBe(0)
  })

  it('disables auto-advance for reduced motion and during the interaction pause', () => {
    const ready = {
      itemCount: 5,
      canMoveNext: true,
      prefersReducedMotion: false,
      isHovered: false,
      isFocusWithin: false,
      pauseUntil: 0,
      now: 20_000,
    }

    expect(shouldAutoAdvanceReviewRail(ready)).toBe(true)
    expect(shouldAutoAdvanceReviewRail({ ...ready, prefersReducedMotion: true })).toBe(false)
    expect(shouldAutoAdvanceReviewRail({ ...ready, pauseUntil: 25_000 })).toBe(false)
    expect(shouldAutoAdvanceReviewRail({ ...ready, isHovered: true })).toBe(false)
    expect(shouldAutoAdvanceReviewRail({ ...ready, isFocusWithin: true })).toBe(false)
  })
})
