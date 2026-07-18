import type { TestimonialCategory } from '../../data/socialProof/types'

export type TestimonialFilter = 'all' | TestimonialCategory

const filterOrder: TestimonialFilter[] = ['all', 'service', 'documentation', 'fulfillment', 'support']

type CategorizedTestimonial = { category: TestimonialCategory }

export function filterTestimonials<T extends CategorizedTestimonial>(items: T[], filter: TestimonialFilter) {
  return filter === 'all' ? items : items.filter((item) => item.category === filter)
}

/** Keeps the toggle compact by omitting categories that have no reviews. */
export function getAvailableTestimonialFilters<T extends CategorizedTestimonial>(items: T[]): TestimonialFilter[] {
  return filterOrder.filter((filter) => filter === 'all' || items.some((item) => item.category === filter))
}
