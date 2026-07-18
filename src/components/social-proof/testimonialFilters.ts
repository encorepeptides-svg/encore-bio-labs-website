import type { PublishedTestimonial, TestimonialCategory } from '../../data/socialProof/types'

export type TestimonialFilter = 'all' | TestimonialCategory

export function filterTestimonials(items: PublishedTestimonial[], filter: TestimonialFilter) {
  return filter === 'all' ? items : items.filter((item) => item.category === filter)
}
