import type { PublishedTestimonial, TestimonialCategory } from '../../data/socialProof/types'

export type TestimonialFilter = 'all' | TestimonialCategory

const filterOrder: TestimonialFilter[] = ['all', 'service', 'documentation', 'fulfillment', 'support']

export function filterTestimonials(items: PublishedTestimonial[], filter: TestimonialFilter) {
  return filter === 'all' ? items : items.filter((item) => item.category === filter)
}

/** Keeps the toggle compact by omitting categories that have no published reviews. */
export function getAvailableTestimonialFilters(items: PublishedTestimonial[]): TestimonialFilter[] {
  return filterOrder.filter((filter) => filter === 'all' || items.some((item) => item.category === filter))
}
