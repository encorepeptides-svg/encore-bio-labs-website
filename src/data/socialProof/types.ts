/**
 * Social-proof content models (testimonials + before/after transformation media).
 *
 * These records are content, kept strictly separate from the presentation
 * components that render them. A record is never published to the public site
 * unless every compliance gate in `guards.ts` passes. The public site only ever
 * receives the `Published*` projections below — never the raw admin records —
 * so consent references, verification notes, and internal review fields cannot
 * leak to the browser.
 */

export type ContentStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived'

export type TestimonialCategory = 'service' | 'documentation' | 'fulfillment' | 'support'

/** Where a transformation record has been explicitly approved to appear. */
export type PagePlacement = 'home' | 'retatrutide' | 'catalog' | 'about'

/**
 * Full testimonial record as stored in the admin/CMS layer (Supabase table
 * `public.testimonials`). Includes sensitive compliance fields that must never
 * reach the public bundle.
 */
export type TestimonialRecord = {
  id: string
  status: ContentStatus
  category: TestimonialCategory
  quote: string
  displayName: string
  /** Source-supplied review title. Empty for legacy testimonial records. */
  reviewTitle: string
  /** Source-supplied product name. Empty for non-product testimonials. */
  productName: string
  /** Source-supplied star rating. Null when the source did not provide one. */
  rating: number | null
  /** Distinct from consent verification; this preserves the source purchase flag only. */
  verifiedPurchase: boolean | null
  /** Public URL of an approved, optimized derivative. Optional. */
  approvedPhoto?: string | null
  submissionDate: string
  consentVerified: boolean
  consentRecordReference: string
  relationshipToBusiness: string
  /** Null means the source did not disclose whether an incentive was provided. */
  incentiveProvided: boolean | null
  incentiveDisclosure: string
  sourceRecordReference: string
  /** Source-only fields remain private and are never included in PublishedTestimonial. */
  sourceReviewId: string
  sourceUserStyle: string
  sourceLengthLabel: string
  importFingerprint: string
  verificationNotes: string
  /** Explicit reviewer attestation that the quote contains no prohibited medical or human-outcome claim. */
  claimReviewPassed: boolean
  reviewedBy: string
  reviewedAt: string | null
  publishedAt: string | null
  sortOrder: number
  altText: string
}

/** Safe projection sent to the public site once a testimonial is publishable. */
export type PublishedTestimonial = {
  id: string
  category: TestimonialCategory
  quote: string
  displayName: string
  reviewTitle: string
  productName: string
  rating: number | null
  verifiedPurchase: boolean | null
  reviewDate: string
  approvedPhoto?: string | null
  altText: string
  /** Shown when there is a material connection or incentive to disclose. */
  incentiveDisclosure: string
  relationshipToBusiness: string
  sortOrder: number
}

/**
 * Full before/after transformation record as stored in the admin/CMS layer
 * (Supabase table `public.transformation_media`).
 */
export type TransformationRecord = {
  id: string
  status: ContentStatus
  beforeImage: string
  afterImage: string
  beforeCaptureDate: string | null
  afterCaptureDate: string | null
  imageOwner: string
  subjectConsentVerified: boolean
  consentRecordReference: string
  originalFilesVerified: boolean
  editsDisclosure: string
  accompanyingClaim: string
  claimEvidenceReference: string
  /** Internal reference substantiating the typical-outcomes disclosure (gate only, never public). */
  typicalOutcomeEvidenceReference: string
  /** Approved public-facing typical-outcomes disclosure text. */
  typicalOutcomeDisclosure: string
  productOrServiceReferenced: string
  concurrentFactorsDisclosure: string
  reviewer: string
  reviewedAt: string | null
  publishedAt: string | null
  sortOrder: number
  beforeAltText: string
  afterAltText: string
  /**
   * Explicit per-page publication approval. A record is NEVER auto-placed on a
   * page (e.g. the Retatrutide research page) just because it is approved — the
   * page must be listed here after a separate review for that context.
   */
  approvedPlacements: PagePlacement[]
}

/** Safe projection sent to the public site once a transformation is publishable. */
export type PublishedTransformation = {
  id: string
  beforeImage: string
  afterImage: string
  beforeAltText: string
  afterAltText: string
  beforeCaptureDate: string
  afterCaptureDate: string
  editsDisclosure: string
  accompanyingClaim: string
  /** Typical-outcomes disclosure, surfaced where legally required. */
  typicalOutcomeDisclosure: string
  concurrentFactorsDisclosure: string
  productOrServiceReferenced: string
  sortOrder: number
}
