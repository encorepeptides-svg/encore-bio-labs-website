export const reviewRailAutoAdvanceMs = 7_000
export const reviewRailInteractionPauseMs = 10_000

const edgeTolerance = 4

export type ReviewRailBoundaryState = {
  canMovePrevious: boolean
  canMoveNext: boolean
}

export function getReviewRailBoundaries(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number,
): ReviewRailBoundaryState {
  const maximumScrollLeft = Math.max(0, scrollWidth - clientWidth)
  return {
    canMovePrevious: scrollLeft > edgeTolerance,
    canMoveNext: scrollLeft < maximumScrollLeft - edgeTolerance,
  }
}

export function getReviewRailTargetIndex(currentIndex: number, direction: -1 | 1, itemCount: number) {
  if (itemCount <= 0) return 0
  return Math.min(itemCount - 1, Math.max(0, currentIndex + direction))
}

type AutoAdvanceState = {
  itemCount: number
  canMoveNext: boolean
  prefersReducedMotion: boolean
  isHovered: boolean
  isFocusWithin: boolean
  pauseUntil: number
  now: number
}

export function shouldAutoAdvanceReviewRail(state: AutoAdvanceState) {
  return (
    state.itemCount > 1 &&
    state.canMoveNext &&
    !state.prefersReducedMotion &&
    !state.isHovered &&
    !state.isFocusWithin &&
    state.now >= state.pauseUntil
  )
}
