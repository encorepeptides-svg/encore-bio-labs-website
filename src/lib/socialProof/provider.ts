import { localTestimonials, localTransformations } from '../../data/socialProof/localRecords'
import { selectPublishedTestimonials, selectPublishedTransformations } from '../../data/socialProof/guards'
import type {
  PagePlacement,
  PublishedTestimonial,
  PublishedTransformation,
} from '../../data/socialProof/types'
import { isSupabaseConfigured, supabase } from '../supabaseClient'

/**
 * Social-proof provider: the single seam the public site reads through, so
 * swapping the backing store (Supabase now, a different CMS later) never
 * touches the presentation components.
 *
 * When Supabase is configured, published content is read from the
 * server-side `published_testimonials` / `published_transformations` views.
 * Those views are the authoritative gate — RLS keeps the base tables private
 * and the views expose ONLY publishable rows and ONLY non-sensitive columns,
 * so consent references and review notes never reach the browser.
 *
 * When Supabase is not configured, the local (empty) records are filtered
 * through the same TypeScript guards, so behavior is identical: no approved
 * records ⇒ empty result ⇒ hidden section.
 */

type TestimonialRow = {
  id: string
  category: PublishedTestimonial['category']
  quote: string
  display_name: string
  review_title: string | null
  product_name: string | null
  rating: number | null
  verified_purchase: boolean | null
  review_date: string | null
  approved_photo_url: string | null
  alt_text: string | null
  incentive_disclosure: string | null
  relationship_to_business: string | null
  sort_order: number | null
}

type TransformationRow = {
  id: string
  before_image_url: string
  after_image_url: string
  before_alt_text: string | null
  after_alt_text: string | null
  before_capture_date: string | null
  after_capture_date: string | null
  edits_disclosure: string | null
  accompanying_claim: string | null
  typical_outcome_disclosure: string | null
  concurrent_factors_disclosure: string | null
  product_or_service_referenced: string | null
  sort_order: number | null
}

function mapTestimonialRow(row: TestimonialRow): PublishedTestimonial {
  return {
    id: row.id,
    category: row.category,
    quote: row.quote,
    displayName: row.display_name,
    reviewTitle: row.review_title ?? '',
    productName: row.product_name ?? '',
    rating: row.rating,
    verifiedPurchase: row.verified_purchase,
    reviewDate: row.review_date ?? '',
    approvedPhoto: row.approved_photo_url,
    altText: row.alt_text ?? '',
    incentiveDisclosure: row.incentive_disclosure ?? '',
    relationshipToBusiness: row.relationship_to_business ?? '',
    sortOrder: row.sort_order ?? 0,
  }
}

function mapTransformationRow(row: TransformationRow): PublishedTransformation {
  return {
    id: row.id,
    beforeImage: row.before_image_url,
    afterImage: row.after_image_url,
    beforeAltText: row.before_alt_text ?? '',
    afterAltText: row.after_alt_text ?? '',
    beforeCaptureDate: row.before_capture_date ?? '',
    afterCaptureDate: row.after_capture_date ?? '',
    editsDisclosure: row.edits_disclosure ?? '',
    accompanyingClaim: row.accompanying_claim ?? '',
    typicalOutcomeDisclosure: row.typical_outcome_disclosure ?? '',
    concurrentFactorsDisclosure: row.concurrent_factors_disclosure ?? '',
    productOrServiceReferenced: row.product_or_service_referenced ?? '',
    sortOrder: row.sort_order ?? 0,
  }
}

export async function getPublishedTestimonials(): Promise<PublishedTestimonial[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('published_testimonials')
      .select('id, category, quote, display_name, review_title, product_name, rating, verified_purchase, review_date, approved_photo_url, alt_text, incentive_disclosure, relationship_to_business, sort_order')
      .order('sort_order', { ascending: true })
    if (error || !data) return []
    return (data as TestimonialRow[]).map(mapTestimonialRow)
  }
  return selectPublishedTestimonials(localTestimonials)
}

export async function getPublishedTransformations(placement: PagePlacement): Promise<PublishedTransformation[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('published_transformations')
      .select('id, before_image_url, after_image_url, before_alt_text, after_alt_text, before_capture_date, after_capture_date, edits_disclosure, accompanying_claim, typical_outcome_disclosure, concurrent_factors_disclosure, product_or_service_referenced, sort_order')
      // The view only returns rows already approved for this placement.
      .contains('approved_placements', [placement])
      .order('sort_order', { ascending: true })
    if (error || !data) return []
    return (data as TransformationRow[]).map(mapTransformationRow)
  }
  return selectPublishedTransformations(localTransformations, placement)
}
