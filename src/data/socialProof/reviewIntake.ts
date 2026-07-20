import type { TestimonialCategory } from './types'

export const REVIEW_INTAKE_CATEGORIES: TestimonialCategory[] = [
  'service',
  'documentation',
  'fulfillment',
  'support',
]

export type ReviewIntakeAnswer = 'unknown' | 'no' | 'yes'

export type ReviewIntakeFormState = {
  displayName: string
  reviewTitle: string
  quote: string
  productName: string
  rating: string
  category: TestimonialCategory
  submissionDate: string
  verifiedPurchase: ReviewIntakeAnswer
  sourceRecordReference: string
  verificationNotes: string
  relationshipToBusiness: string
  incentiveStatus: ReviewIntakeAnswer
  incentiveDisclosure: string
  consentVerified: boolean
  consentRecordReference: string
  claimReviewPassed: boolean
}

export type ReviewIntakeField = keyof ReviewIntakeFormState

export type ReviewIntakeValidationIssue = {
  field: ReviewIntakeField
  code: 'required' | 'consent-reference' | 'incentive-disclosure'
}

export function createEmptyReviewIntake(submissionDate = new Date().toISOString().slice(0, 10)): ReviewIntakeFormState {
  return {
    displayName: '',
    reviewTitle: '',
    quote: '',
    productName: '',
    rating: '',
    category: 'service',
    submissionDate,
    verifiedPurchase: 'unknown',
    sourceRecordReference: '',
    verificationNotes: '',
    relationshipToBusiness: '',
    incentiveStatus: 'unknown',
    incentiveDisclosure: '',
    consentVerified: false,
    consentRecordReference: '',
    claimReviewPassed: false,
  }
}

export function validateReviewIntake(form: ReviewIntakeFormState): ReviewIntakeValidationIssue[] {
  const requiredFields: ReviewIntakeField[] = [
    'displayName',
    'quote',
    'rating',
  ]
  const issues = requiredFields
    .filter((field) => typeof form[field] === 'string' && String(form[field]).trim().length === 0)
    .map<ReviewIntakeValidationIssue>((field) => ({ field, code: 'required' }))

  if (form.consentVerified && !form.consentRecordReference.trim()) {
    issues.push({ field: 'consentRecordReference', code: 'consent-reference' })
  }
  if (form.incentiveStatus === 'yes' && !form.incentiveDisclosure.trim()) {
    issues.push({ field: 'incentiveDisclosure', code: 'incentive-disclosure' })
  }

  return issues
}

function mapAnswer(value: ReviewIntakeAnswer) {
  return value === 'unknown' ? null : value === 'yes'
}

/**
 * Builds a private draft record. Review-authored content is intentionally kept
 * byte-for-byte as entered; approval and publication remain separate actions.
 */
export function buildReviewIntakePayload(form: ReviewIntakeFormState) {
  return {
    status: 'draft' as const,
    display_name: form.displayName,
    review_title: form.reviewTitle,
    quote: form.quote,
    product_name: form.productName,
    rating: Number(form.rating),
    category: form.category,
    submission_date: form.submissionDate,
    verified_purchase: mapAnswer(form.verifiedPurchase),
    source_record_reference: form.sourceRecordReference,
    source_user_style: 'manual_intake',
    verification_notes: form.verificationNotes,
    relationship_to_business: form.relationshipToBusiness,
    incentive_provided: mapAnswer(form.incentiveStatus),
    incentive_disclosure: form.incentiveDisclosure,
    consent_verified: form.consentVerified,
    consent_record_reference: form.consentRecordReference,
    claim_review_passed: form.claimReviewPassed,
  }
}
