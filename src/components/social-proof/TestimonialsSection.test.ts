import { describe, expect, it } from 'vitest'
import type { PublishedTestimonial } from '../../data/socialProof/types'
import { socialProof as socialProofEn } from '../../locales/en/socialProof'
import { socialProof as socialProofEs } from '../../locales/es/socialProof'
import { filterTestimonials, getAvailableTestimonialFilters } from './testimonialFilters'

const reviews: PublishedTestimonial[] = [
  {
    id: 'service-review',
    category: 'service',
    quote: 'Approved service feedback.',
    displayName: 'A. Researcher',
    reviewTitle: 'Helpful service',
    productName: 'BPC-157',
    rating: 5,
    verifiedPurchase: true,
    reviewDate: '2026-07-01',
    altText: '',
    incentiveDisclosure: '',
    relationshipToBusiness: '',
    sortOrder: 1,
  },
  {
    id: 'documentation-review',
    category: 'documentation',
    quote: 'Approved documentation feedback.',
    displayName: 'B. Researcher',
    reviewTitle: 'Clear documentation',
    productName: 'TB-500',
    rating: 4,
    verifiedPurchase: true,
    reviewDate: '2026-07-02',
    altText: '',
    incentiveDisclosure: '',
    relationshipToBusiness: '',
    sortOrder: 2,
  },
]

describe('TestimonialsSection review toggle', () => {
  it('returns every approved review for the all filter', () => {
    expect(filterTestimonials(reviews, 'all')).toEqual(reviews)
  })

  it('filters approved reviews by topic', () => {
    expect(filterTestimonials(reviews, 'documentation')).toEqual([reviews[1]])
    expect(filterTestimonials(reviews, 'support')).toEqual([])
  })

  it('only offers toggle filters that contain published reviews', () => {
    expect(getAvailableTestimonialFilters(reviews)).toEqual(['all', 'service', 'documentation'])
  })

  it('keeps the review controls bilingual', () => {
    expect(Object.keys(socialProofEs)).toEqual(Object.keys(socialProofEn))
    expect(socialProofEn.filterAll).toBe('All reviews')
    expect(socialProofEs.filterAll).toBe('Todas')
    expect(socialProofEn.verifiedPurchaseLabel).toBe('Verified purchase')
    expect(socialProofEs.verifiedPurchaseLabel).toBe('Compra verificada')
    expect(socialProofEn.nextReviewsLabel).toBe('Show next review')
    expect(socialProofEs.nextReviewsLabel).toBe('Mostrar la siguiente reseña')
    expect(socialProofEs.originalLanguageNotice).not.toBe(socialProofEn.originalLanguageNotice)
    expect(socialProofEn.ratingAriaLabel).not.toBe(socialProofEs.ratingAriaLabel)
  })
})
