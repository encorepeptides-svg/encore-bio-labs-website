import { describe, expect, it } from 'vitest'
import { draftReviewPreviewPath, isDraftReviewPreviewPath } from './draftReviewPreviewRoute'
import { localizePath } from '../../i18n/config'

describe('draft review preview route', () => {
  it('is available only in development', () => {
    expect(isDraftReviewPreviewPath(draftReviewPreviewPath, true)).toBe(true)
    expect(isDraftReviewPreviewPath(`${draftReviewPreviewPath}/`, true)).toBe(true)
    expect(isDraftReviewPreviewPath(draftReviewPreviewPath, false)).toBe(false)
    expect(isDraftReviewPreviewPath('/?previewReviews=1', true)).toBe(false)
  })

  it('uses the same logical route in English and Spanish', () => {
    expect(localizePath(draftReviewPreviewPath, 'en')).toBe('/review-preview')
    expect(localizePath(draftReviewPreviewPath, 'es')).toBe('/es/review-preview')
  })
})
