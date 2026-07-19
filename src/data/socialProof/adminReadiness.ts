export type TestimonialAdminRow = {
  status?: unknown
  quote?: unknown
  display_name?: unknown
  submission_date?: unknown
  source_record_reference?: unknown
  verification_notes?: unknown
  consent_verified?: unknown
  consent_record_reference?: unknown
  relationship_to_business?: unknown
  incentive_provided?: unknown
  incentive_disclosure?: unknown
  claim_review_passed?: unknown
  reviewed_by?: unknown
  reviewed_at?: unknown
  published_at?: unknown
}

export type TestimonialReadinessGate = {
  id:
    | 'content'
    | 'status'
    | 'source'
    | 'consent'
    | 'relationship'
    | 'incentive'
    | 'claim-review'
    | 'review-stamp'
    | 'publication-stamp'
  label: string
  ready: boolean
  administratorSupplied: boolean
  missing: string[]
  readyDetail: string
}

export type TestimonialPublicationReadiness = {
  gates: TestimonialReadinessGate[]
  missingPrerequisites: string[]
  canApproveAndPublish: boolean
  isPublished: boolean
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function missingFields(checks: Array<[boolean, string]>) {
  return checks.filter(([ready]) => !ready).map(([, label]) => label)
}

/**
 * Mirrors every testimonial predicate in `published_testimonials` while
 * distinguishing fields an administrator must supply from stamps Supabase
 * writes during approval. The database view remains the publication authority.
 */
export function getTestimonialPublicationReadiness(
  row: TestimonialAdminRow,
): TestimonialPublicationReadiness {
  const incentiveKnown = row.incentive_provided === true || row.incentive_provided === false
  const incentiveDisclosureReady = row.incentive_provided !== true || isNonEmpty(row.incentive_disclosure)

  const gates: TestimonialReadinessGate[] = [
    {
      id: 'content',
      label: 'Review content',
      ready: isNonEmpty(row.quote) && isNonEmpty(row.display_name),
      administratorSupplied: true,
      missing: missingFields([
        [isNonEmpty(row.quote), 'review text'],
        [isNonEmpty(row.display_name), 'display name'],
      ]),
      readyDetail: 'Review text and display name are present.',
    },
    {
      id: 'status',
      label: 'Approval status',
      ready: row.status === 'approved',
      administratorSupplied: false,
      missing: row.status === 'approved' ? [] : ['approved status'],
      readyDetail: 'Status is approved.',
    },
    {
      id: 'source',
      label: 'Submission and source verification',
      ready:
        isNonEmpty(row.submission_date) &&
        isNonEmpty(row.source_record_reference) &&
        isNonEmpty(row.verification_notes),
      administratorSupplied: true,
      missing: missingFields([
        [isNonEmpty(row.submission_date), 'submission date'],
        [isNonEmpty(row.source_record_reference), 'source record reference'],
        [isNonEmpty(row.verification_notes), 'private verification notes'],
      ]),
      readyDetail: 'Submission date, source reference, and private verification notes are recorded.',
    },
    {
      id: 'consent',
      label: 'Publication consent',
      ready: row.consent_verified === true && isNonEmpty(row.consent_record_reference),
      administratorSupplied: true,
      missing: missingFields([
        [row.consent_verified === true, 'consent verification'],
        [isNonEmpty(row.consent_record_reference), 'consent record reference'],
      ]),
      readyDetail: 'Consent is verified and linked to its private record.',
    },
    {
      id: 'relationship',
      label: 'Relationship disclosure',
      ready: isNonEmpty(row.relationship_to_business),
      administratorSupplied: true,
      missing: isNonEmpty(row.relationship_to_business) ? [] : ['public relationship disclosure'],
      readyDetail: 'The reviewer’s relationship to the business is disclosed.',
    },
    {
      id: 'incentive',
      label: 'Incentive disclosure',
      ready: incentiveKnown && incentiveDisclosureReady,
      administratorSupplied: true,
      missing: missingFields([
        [incentiveKnown, 'known incentive status'],
        [incentiveDisclosureReady, 'public incentive disclosure'],
      ]),
      readyDetail:
        row.incentive_provided === true
          ? 'An incentive was provided and its public disclosure is recorded.'
          : 'Incentive status is verified as none provided.',
    },
    {
      id: 'claim-review',
      label: 'Claim review',
      ready: row.claim_review_passed === true,
      administratorSupplied: true,
      missing: row.claim_review_passed === true ? [] : ['claim-review approval'],
      readyDetail: 'The review passed the service-only claim review.',
    },
    {
      id: 'review-stamp',
      label: 'Reviewer stamp',
      ready: isNonEmpty(row.reviewed_by) && isNonEmpty(row.reviewed_at),
      administratorSupplied: false,
      missing: missingFields([
        [isNonEmpty(row.reviewed_by), 'reviewing administrator'],
        [isNonEmpty(row.reviewed_at), 'review timestamp'],
      ]),
      readyDetail: `Supabase recorded reviewer ${String(row.reviewed_by)} at ${String(row.reviewed_at)}.`,
    },
    {
      id: 'publication-stamp',
      label: 'Publication stamp',
      ready: isNonEmpty(row.published_at),
      administratorSupplied: false,
      missing: isNonEmpty(row.published_at) ? [] : ['publication timestamp'],
      readyDetail: `Supabase recorded publication at ${String(row.published_at)}.`,
    },
  ]

  const missingPrerequisites = gates
    .filter((gate) => gate.administratorSupplied && !gate.ready)
    .flatMap((gate) => gate.missing)
  const isPublished = gates.every((gate) => gate.ready)

  return {
    gates,
    missingPrerequisites,
    canApproveAndPublish: missingPrerequisites.length === 0 && !isPublished,
    isPublished,
  }
}
