import { describe, expect, it } from 'vitest'
import type { PublishedTestimonial } from '../../data/socialProof/types'
import { socialProof as socialProofEn } from '../../locales/en/socialProof'
import { socialProof as socialProofEs } from '../../locales/es/socialProof'
import { filterTestimonials } from './testimonialFilters'

const reviews: PublishedTestimonial[] = [
  {
    id: 'service-review',
    category: 'service',
    quote: 'Approved service feedback.',
    displayName: 'A. Researcher',
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

  it('keeps the review controls bilingual', () => {
    expect(Object.keys(socialProofEs)).toEqual(Object.keys(socialProofEn))
    expect(socialProofEn.filterAll).toBe('All reviews')
    expect(socialProofEs.filterAll).toBe('Todas')
  })
})
