import { describe, expect, it } from 'vitest'
import type { TestimonialRecord } from './types'
import { isPublishableTestimonial, selectPublishedTestimonials, toPublishedTestimonial } from './guards'

const approvedRecord: TestimonialRecord = {
  id: 'verified-service-1',
  status: 'approved',
  category: 'documentation',
  quote: 'The batch document was easy to find.',
  displayName: 'J. R.',
  reviewTitle: 'Clear documentation',
  productName: 'Example product',
  rating: 5,
  verifiedPurchase: true,
  approvedPhoto: null,
  submissionDate: '2026-07-01',
  consentVerified: true,
  consentRecordReference: 'private-consent-1',
  relationshipToBusiness: 'Verified customer',
  incentiveProvided: false,
  incentiveDisclosure: '',
  sourceRecordReference: 'submission-1',
  sourceReviewId: 'source-1',
  sourceUserStyle: 'verified_buyer',
  sourceLengthLabel: 'short',
  importFingerprint: 'fingerprint-1',
  verificationNotes: 'Service-only feedback; no medical or human-outcome claims.',
  claimReviewPassed: true,
  reviewedBy: 'reviewer-1',
  reviewedAt: '2026-07-02T00:00:00Z',
  publishedAt: '2026-07-03T00:00:00Z',
  sortOrder: 1,
  altText: '',
}

describe('testimonial publication gates', () => {
  it('publishes a completely reviewed service record', () => {
    expect(isPublishableTestimonial(approvedRecord)).toBe(true)
  })

  it('rejects records without an explicit service-claim review', () => {
    expect(isPublishableTestimonial({ ...approvedRecord, claimReviewPassed: false })).toBe(false)
  })

  it('rejects records without documented provenance or reviewer identity', () => {
    expect(isPublishableTestimonial({ ...approvedRecord, sourceRecordReference: '' })).toBe(false)
    expect(isPublishableTestimonial({ ...approvedRecord, reviewedBy: '' })).toBe(false)
  })

  it('rejects records when incentive status is unknown', () => {
    expect(isPublishableTestimonial({ ...approvedRecord, incentiveProvided: null })).toBe(false)
  })

  it('keeps drafts out of the production testimonial projection', () => {
    expect(selectPublishedTestimonials([{ ...approvedRecord, status: 'draft' }])).toEqual([])
    expect(selectPublishedTestimonials([approvedRecord])).toHaveLength(1)
  })

  it('never includes private compliance or import metadata in the public projection', () => {
    const published = toPublishedTestimonial(approvedRecord)

    expect(published).not.toHaveProperty('consentRecordReference')
    expect(published).not.toHaveProperty('sourceRecordReference')
    expect(published).not.toHaveProperty('sourceUserStyle')
    expect(published).not.toHaveProperty('importFingerprint')
    expect(published).not.toHaveProperty('verificationNotes')
    expect(published).not.toHaveProperty('reviewedBy')
  })
})
