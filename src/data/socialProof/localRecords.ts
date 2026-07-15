import type { TestimonialRecord, TransformationRecord } from './types'

/**
 * Local, typed content records — the fallback data layer used when Supabase is
 * not configured. It is intentionally EMPTY at launch: no sample testimonials,
 * fake names, placeholder quotes, stock photos, or generated before/after
 * images. Real, approved records are served from Supabase (see
 * `src/lib/socialProof/provider.ts`); this array only exists so the app builds
 * and the sections stay hidden until approved content exists.
 *
 * Adding a record here (or, in production, in Supabase) requires no changes to
 * the presentation components.
 */
export const localTestimonials: TestimonialRecord[] = []

export const localTransformations: TransformationRecord[] = []
