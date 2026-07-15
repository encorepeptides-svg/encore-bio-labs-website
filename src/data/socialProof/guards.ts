import type {
  PagePlacement,
  PublishedTestimonial,
  PublishedTransformation,
  TestimonialRecord,
  TransformationRecord,
} from './types'

/**
 * Publication gates. These are the single source of truth for "is this record
 * allowed to appear publicly?" and they run as defense-in-depth alongside the
 * server-authoritative Supabase RLS / published views. If either layer says no,
 * the record is not shown. Nothing draft, review, rejected, archived, or
 * unverified can ever pass.
 */

function isNonEmpty(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/** A testimonial renders only when every one of these is satisfied. */
export function isPublishableTestimonial(record: TestimonialRecord): boolean {
  return (
    record.status === 'approved' &&
    record.consentVerified === true &&
    isNonEmpty(record.quote) &&
    isNonEmpty(record.displayName) &&
    // Any material connection or incentive must be clearly disclosed.
    (record.incentiveProvided ? isNonEmpty(record.incentiveDisclosure) : true) &&
    // "Approved for public use" is represented by an actual publication stamp.
    isNonEmpty(record.publishedAt)
  )
}

/** Projects an approved record down to the safe, public-only fields. */
export function toPublishedTestimonial(record: TestimonialRecord): PublishedTestimonial {
  return {
    id: record.id,
    category: record.category,
    quote: record.quote,
    displayName: record.displayName,
    approvedPhoto: record.approvedPhoto ?? null,
    altText: record.altText,
    incentiveDisclosure: record.incentiveProvided ? record.incentiveDisclosure : '',
    relationshipToBusiness: record.relationshipToBusiness,
    sortOrder: record.sortOrder,
  }
}

export function selectPublishedTestimonials(records: TestimonialRecord[]): PublishedTestimonial[] {
  return records
    .filter(isPublishableTestimonial)
    .map(toPublishedTestimonial)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * A transformation renders only when every advertising-compliance gate passes
 * AND the specific page has been explicitly approved for this record. An
 * uploaded image alone is never sufficient.
 */
export function isPublishableTransformation(record: TransformationRecord, placement: PagePlacement): boolean {
  return (
    record.status === 'approved' &&
    record.subjectConsentVerified === true &&
    record.originalFilesVerified === true &&
    isNonEmpty(record.beforeImage) &&
    isNonEmpty(record.afterImage) &&
    // Identifiable before AND after dates.
    isNonEmpty(record.beforeCaptureDate) &&
    isNonEmpty(record.afterCaptureDate) &&
    // Documented review of the implied advertising claim.
    isNonEmpty(record.accompanyingClaim) &&
    isNonEmpty(record.claimEvidenceReference) &&
    // Substantiated typical-outcomes disclosure (required where the claim implies results).
    isNonEmpty(record.typicalOutcomeEvidenceReference) &&
    // Explicit per-page approval — never auto-placed (e.g. Retatrutide page).
    record.approvedPlacements.includes(placement) &&
    isNonEmpty(record.publishedAt)
  )
}

export function toPublishedTransformation(record: TransformationRecord): PublishedTransformation {
  return {
    id: record.id,
    beforeImage: record.beforeImage,
    afterImage: record.afterImage,
    beforeAltText: record.beforeAltText,
    afterAltText: record.afterAltText,
    beforeCaptureDate: record.beforeCaptureDate ?? '',
    afterCaptureDate: record.afterCaptureDate ?? '',
    editsDisclosure: record.editsDisclosure,
    accompanyingClaim: record.accompanyingClaim,
    // Public disclosure text — NOT the internal evidence reference, which only gates publication.
    typicalOutcomeDisclosure: record.typicalOutcomeDisclosure,
    concurrentFactorsDisclosure: record.concurrentFactorsDisclosure,
    productOrServiceReferenced: record.productOrServiceReferenced,
    sortOrder: record.sortOrder,
  }
}

export function selectPublishedTransformations(
  records: TransformationRecord[],
  placement: PagePlacement,
): PublishedTransformation[] {
  return records
    .filter((record) => isPublishableTransformation(record, placement))
    .map(toPublishedTransformation)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
