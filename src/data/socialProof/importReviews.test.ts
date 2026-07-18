import { describe, expect, it } from 'vitest'
import sourceReviews from './research_peptide_mock_reviews.json'
import { isPublishableTestimonial } from './guards'
import {
  createStableReviewId,
  missingReviewPublicationFields,
  normalizeResearchPeptideReviews,
} from './importReviews'

const completeReview = {
  id: 101,
  product: 'Test product',
  rating: 5,
  length: 'short',
  user_style: 'verified_buyer',
  reviewer_name: 'A. Reviewer',
  verified_purchase: true,
  date: '2026-07-01',
  title: 'Fast shipping',
  review_text: 'The package arrived cold and on time.',
}

describe('research peptide review normalization', () => {
  it('imports the supplied JSON unchanged as compliance-gated drafts', () => {
    const result = normalizeResearchPeptideReviews(sourceReviews)

    expect(result.records).toHaveLength(50)
    expect(result.skipped).toEqual([])
    expect(result.published).toBe(0)
    expect(result.drafts).toBe(50)
    expect(new Set(result.records.map((record) => record.id)).size).toBe(50)
    expect(result.records.every((record) => record.status === 'draft')).toBe(true)
    expect(result.records.every((record) => !isPublishableTestimonial(record))).toBe(true)
    expect(result.missingPublicationFields).toEqual(missingReviewPublicationFields)

    sourceReviews.forEach((source) => {
      const normalized = result.records.find((record) => record.sourceReviewId === String(source.id))!
      expect(normalized).toMatchObject({
        displayName: source.reviewer_name,
        reviewTitle: source.title,
        quote: source.review_text,
        productName: source.product,
        rating: source.rating,
        submissionDate: source.date,
        verifiedPurchase: source.verified_purchase,
      })
    })
  })

  it('categorizes the supplied reviews into every supported populated filter', () => {
    const result = normalizeResearchPeptideReviews(sourceReviews)
    const counts = result.records.reduce<Record<string, number>>((totals, record) => {
      totals[record.category] = (totals[record.category] ?? 0) + 1
      return totals
    }, {})

    expect(counts.service).toBe(17)
    expect(counts.documentation).toBe(10)
    expect(counts.fulfillment).toBe(21)
    expect(counts.support).toBe(2)
  })

  it('creates the same stable ID when a source ID is absent', () => {
    const withoutId = { ...completeReview, id: undefined }
    const first = normalizeResearchPeptideReviews([withoutId]).records[0]
    const second = normalizeResearchPeptideReviews([withoutId]).records[0]

    expect(first.id).toBe(second.id)
    expect(first.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(createStableReviewId(101, 'ignored')).toBe('ec0e0000-0000-5000-8000-000000000101')
  })

  it('skips invalid or incomplete entries without creating placeholder content', () => {
    const result = normalizeResearchPeptideReviews([
      { ...completeReview, id: 102, review_text: '' },
      { ...completeReview, id: 103, rating: 6 },
      null,
    ])

    expect(result.records).toEqual([])
    expect(result.skipped).toHaveLength(3)
    expect(result.skipped[0].reasons).toContain('review_text must be a non-empty string')
    expect(result.skipped[1].reasons).toContain('rating must be an integer from 1 to 5')
    expect(result.skipped[2].reasons).toContain('review entry must be an object')
  })

  it('prevents duplicate source IDs and duplicate review content', () => {
    const result = normalizeResearchPeptideReviews([
      completeReview,
      { ...completeReview, review_text: 'Different content with the same source ID.' },
      { ...completeReview, id: 104 },
    ])

    expect(result.records).toHaveLength(1)
    expect(result.skipped).toHaveLength(2)
    expect(result.skipped[0].reasons).toContain('duplicate source id: 101')
    expect(result.skipped[1].reasons).toContain('duplicate review content')
  })
})
