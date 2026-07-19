import { describe, expect, it } from 'vitest'
import { getTestimonialPublicationReadiness, type TestimonialAdminRow } from './adminReadiness'

const readyForApproval: TestimonialAdminRow = {
  status: 'review',
  quote: 'The order arrived on schedule.',
  display_name: 'A. Reviewer',
  submission_date: '2026-07-01',
  source_record_reference: 'submission-101',
  verification_notes: 'Original submission and identity checked.',
  consent_verified: true,
  consent_record_reference: 'consent-101',
  relationship_to_business: 'Verified customer; no other relationship.',
  incentive_provided: false,
  incentive_disclosure: '',
  claim_review_passed: true,
  reviewed_by: null,
  reviewed_at: null,
  published_at: null,
}

describe('testimonial administrator publication readiness', () => {
  it('enables approval only after every administrator-supplied prerequisite is complete', () => {
    const readiness = getTestimonialPublicationReadiness(readyForApproval)

    expect(readiness.canApproveAndPublish).toBe(true)
    expect(readiness.missingPrerequisites).toEqual([])
    expect(readiness.gates.find((gate) => gate.id === 'status')?.ready).toBe(false)
    expect(readiness.gates.find((gate) => gate.id === 'review-stamp')?.ready).toBe(false)
    expect(readiness.gates.find((gate) => gate.id === 'publication-stamp')?.ready).toBe(false)
  })

  it('lists every missing field that blocks the approval button', () => {
    const readiness = getTestimonialPublicationReadiness({
      ...readyForApproval,
      quote: ' ',
      source_record_reference: '',
      verification_notes: '',
      consent_verified: false,
      consent_record_reference: '',
      relationship_to_business: '',
      incentive_provided: null,
      claim_review_passed: false,
    })

    expect(readiness.canApproveAndPublish).toBe(false)
    expect(readiness.missingPrerequisites).toEqual([
      'review text',
      'source record reference',
      'private verification notes',
      'consent verification',
      'consent record reference',
      'public relationship disclosure',
      'known incentive status',
      'claim-review approval',
    ])
  })

  it('requires a public disclosure when an incentive was provided', () => {
    const missingDisclosure = getTestimonialPublicationReadiness({
      ...readyForApproval,
      incentive_provided: true,
      incentive_disclosure: '',
    })
    const disclosed = getTestimonialPublicationReadiness({
      ...readyForApproval,
      incentive_provided: true,
      incentive_disclosure: 'Reviewer received a free research product.',
    })

    expect(missingDisclosure.canApproveAndPublish).toBe(false)
    expect(missingDisclosure.missingPrerequisites).toContain('public incentive disclosure')
    expect(disclosed.canApproveAndPublish).toBe(true)
  })

  it('recognizes publication only after the server-controlled status and stamps exist', () => {
    const published = getTestimonialPublicationReadiness({
      ...readyForApproval,
      status: 'approved',
      reviewed_by: 'admin-user-1',
      reviewed_at: '2026-07-19T10:00:00Z',
      published_at: '2026-07-19T10:00:00Z',
    })

    expect(published.isPublished).toBe(true)
    expect(published.canApproveAndPublish).toBe(false)
    expect(published.gates.every((gate) => gate.ready)).toBe(true)
  })
})
