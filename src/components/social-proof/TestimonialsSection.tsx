import { EditorialReviewRail } from './EditorialReviewRail'
import { useTestimonials } from './useSocialProof'

/** Renders nothing until the requested minimum of compliance-approved testimonials exists. */
export function TestimonialsSection({ minimumItems = 1 }: { minimumItems?: number } = {}) {
  const items = useTestimonials()

  if (items.length < minimumItems) return null

  return <EditorialReviewRail items={items} mode="published" />
}
