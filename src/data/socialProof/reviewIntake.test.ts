import { describe, expect, it } from 'vitest'
import {
  buildReviewIntakePayload,
  createEmptyReviewIntake,
  validateReviewIntake,
  type ReviewIntakeFormState,
} from './reviewIntake'

const completeForm: ReviewIntakeFormState = {
  ...createEmptyReviewIntake(),
  displayName: 'A. Reviewer',
  reviewTitle: 'Fast, careful fulfillment',
  quote: '  The original wording stays exactly as submitted.  ',
  productName: 'BPC-157',
  rating: '5',
  category: 'fulfillment',
  submissionDate: '2026-07-19',
  verifiedPurchase: 'yes',
  sourceRecordReference: 'Order 1001 / email 2026-07-19',
  verificationNotes: 'Matched the submission to the order and original email.',
  relationshipToBusiness: 'Verified customer; no other relationship.',
  incentiveStatus: 'no',
  consentVerified: true,
  consentRecordReference: 'Consent email 2026-07-19',
  claimReviewPassed: true,
}

describe('review intake', () => {
  it('requires the review and its source reference before saving', () => {
    const issues = validateReviewIntake(createEmptyReviewIntake())

    expect(issues.map((issue) => issue.field)).toEqual([
      'displayName',
      'reviewTitle',
      'quote',
      'productName',
      'rating',
      'submissionDate',
      'sourceRecordReference',
    ])
  })

  it('requires supporting text for checked consent and provided incentives', () => {
    const issues = validateReviewIntake({
      ...completeForm,
      consentRecordReference: '',
      incentiveStatus: 'yes',
      incentiveDisclosure: '',
    })

    expect(issues).toEqual([
      { field: 'consentRecordReference', code: 'consent-reference' },
      { field: 'incentiveDisclosure', code: 'incentive-disclosure' },
    ])
  })

  it('creates a private draft and preserves reviewer-authored text exactly', () => {
    const payload = buildReviewIntakePayload(completeForm)

    expect(payload.status).toBe('draft')
    expect(payload.quote).toBe('  The original wording stays exactly as submitted.  ')
    expect(payload.verified_purchase).toBe(true)
    expect(payload.incentive_provided).toBe(false)
    expect(payload.source_user_style).toBe('manual_intake')
  })

  it('keeps unknown purchase and incentive status unknown', () => {
    const payload = buildReviewIntakePayload({
      ...completeForm,
      verifiedPurchase: 'unknown',
      incentiveStatus: 'unknown',
    })

    expect(payload.verified_purchase).toBeNull()
    expect(payload.incentive_provided).toBeNull()
  })
})
