import type { TestimonialCategory, TestimonialRecord } from './types'

const IMPORT_SOURCE = 'research_peptide_mock_reviews.json'

export const missingReviewPublicationFields = [
  'consent_verified',
  'consent_record_reference',
  'relationship_to_business',
  'incentive_provided',
  'incentive_disclosure',
  'verification_notes',
  'claim_review_passed',
  'reviewed_by',
  'reviewed_at',
  'published_at',
] as const

type SourceObject = Record<string, unknown>

export type ReviewImportIssue = {
  index: number
  sourceId: string
  reasons: string[]
}

export type ReviewImportResult = {
  records: TestimonialRecord[]
  skipped: ReviewImportIssue[]
  published: number
  drafts: number
  missingPublicationFields: readonly string[]
}

const categoryPatterns: Record<TestimonialCategory, RegExp> = {
  service: /\b(order(?:ing|ed)?|checkout|vendor|price|pricing|value|purchase|reorder|recommend|experience|service|easy)\b/gi,
  documentation: /\b(coa|certificate|documentation|paperwork|batch|lot|hplc|purity|specs?|traceability)\b/gi,
  fulfillment: /\b(ship(?:ping|ped|s)?|arriv(?:e|ed|al)?|delivery|deliver(?:ed|y)?|packag(?:e|ed|ing)?|packed|tracking|cold|ice pack|box|sealed?|schedule)\b/gi,
  support: /\b(support|customer service|email(?:ed)?|respond(?:ed|ing)?|response|reply|refund|inquiry|complaint)\b/gi,
}

const categoryTieBreakOrder: TestimonialCategory[] = ['documentation', 'support', 'fulfillment', 'service']

function matchCount(value: string, pattern: RegExp) {
  return Array.from(value.matchAll(pattern)).length
}

/**
 * Assigns the one category supported by the existing testimonial model. Title
 * matches are weighted so an explicit review topic wins over incidental words.
 */
export function categorizeReview(title: string, reviewText: string): TestimonialCategory {
  const scores = Object.fromEntries(
    Object.entries(categoryPatterns).map(([category, pattern]) => [
      category,
      matchCount(title, pattern) * 2 + matchCount(reviewText, pattern),
    ]),
  ) as Record<TestimonialCategory, number>
  const maximum = Math.max(...Object.values(scores))
  if (maximum === 0) return 'service'
  return categoryTieBreakOrder.find((category) => scores[category] === maximum) ?? 'service'
}

function fnv1a(value: string, seed: number) {
  let hash = seed >>> 0
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function hashedUuid(value: string) {
  const compact = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b, 0xc2b2ae35]
    .map((seed, index) => fnv1a(`${index}:${value}`, seed))
    .join('')
  const versioned = `${compact.slice(0, 12)}5${compact.slice(13, 16)}8${compact.slice(17)}`
  return `${versioned.slice(0, 8)}-${versioned.slice(8, 12)}-${versioned.slice(12, 16)}-${versioned.slice(16, 20)}-${versioned.slice(20)}`
}

/** Uses a readable deterministic UUID for numeric source IDs and a content hash otherwise. */
export function createStableReviewId(sourceId: unknown, fingerprintSource: string) {
  if (Number.isSafeInteger(sourceId) && Number(sourceId) >= 0) {
    const numericId = String(sourceId)
    if (numericId.length <= 12) return `ec0e0000-0000-5000-8000-${numericId.padStart(12, '0')}`
  }
  if (typeof sourceId === 'string' && sourceId.trim()) return hashedUuid(`${IMPORT_SOURCE}:id:${sourceId}`)
  return hashedUuid(`${IMPORT_SOURCE}:content:${fingerprintSource}`)
}

function isSourceObject(value: unknown): value is SourceObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readRequiredString(source: SourceObject, key: string, reasons: string[]) {
  const value = source[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    reasons.push(`${key} must be a non-empty string`)
    return ''
  }
  return value
}

function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return date.toISOString().slice(0, 10) === value
}

function sourceIdLabel(sourceId: unknown) {
  return typeof sourceId === 'string' || typeof sourceId === 'number' ? String(sourceId) : ''
}

export function normalizeResearchPeptideReviews(input: unknown): ReviewImportResult {
  const records: TestimonialRecord[] = []
  const skipped: ReviewImportIssue[] = []
  const seenSourceIds = new Set<string>()
  const seenFingerprints = new Set<string>()

  if (!Array.isArray(input)) {
    return {
      records,
      skipped: [{ index: -1, sourceId: '', reasons: ['review source must be an array'] }],
      published: 0,
      drafts: 0,
      missingPublicationFields: missingReviewPublicationFields,
    }
  }

  input.forEach((entry, index) => {
    if (!isSourceObject(entry)) {
      skipped.push({ index, sourceId: '', reasons: ['review entry must be an object'] })
      return
    }

    const reasons: string[] = []
    const productName = readRequiredString(entry, 'product', reasons)
    const displayName = readRequiredString(entry, 'reviewer_name', reasons)
    const reviewTitle = readRequiredString(entry, 'title', reasons)
    const quote = readRequiredString(entry, 'review_text', reasons)
    const submissionDate = readRequiredString(entry, 'date', reasons)
    const sourceUserStyle = readRequiredString(entry, 'user_style', reasons)
    const sourceLengthLabel = readRequiredString(entry, 'length', reasons)
    const rating = entry.rating
    const verifiedPurchase = entry.verified_purchase

    if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      reasons.push('rating must be an integer from 1 to 5')
    }
    if (typeof verifiedPurchase !== 'boolean') reasons.push('verified_purchase must be a boolean')
    if (submissionDate && !isValidIsoDate(submissionDate)) reasons.push('date must be a valid YYYY-MM-DD date')

    const sourceId = sourceIdLabel(entry.id)
    const fingerprintSource = JSON.stringify([
      productName,
      rating,
      sourceUserStyle,
      displayName,
      verifiedPurchase,
      submissionDate,
      reviewTitle,
      quote,
    ])
    const fingerprint = hashedUuid(`${IMPORT_SOURCE}:fingerprint:${fingerprintSource}`)

    if (sourceId && seenSourceIds.has(sourceId)) reasons.push(`duplicate source id: ${sourceId}`)
    if (seenFingerprints.has(fingerprint)) reasons.push('duplicate review content')

    if (reasons.length > 0) {
      skipped.push({ index, sourceId, reasons })
      return
    }

    seenSourceIds.add(sourceId)
    seenFingerprints.add(fingerprint)
    const id = createStableReviewId(entry.id, fingerprintSource)
    const sourceAnchor = sourceId ? `id=${encodeURIComponent(sourceId)}` : `generated=${id}`

    records.push({
      id,
      status: 'draft',
      category: categorizeReview(reviewTitle, quote),
      quote,
      displayName,
      reviewTitle,
      productName,
      rating: Number(rating),
      verifiedPurchase: Boolean(verifiedPurchase),
      approvedPhoto: null,
      submissionDate,
      consentVerified: false,
      consentRecordReference: '',
      relationshipToBusiness: '',
      incentiveProvided: null,
      incentiveDisclosure: '',
      sourceRecordReference: `${IMPORT_SOURCE}#${sourceAnchor}`,
      sourceReviewId: sourceId,
      sourceUserStyle,
      sourceLengthLabel,
      importFingerprint: fingerprint,
      verificationNotes: '',
      claimReviewPassed: false,
      reviewedBy: '',
      reviewedAt: null,
      publishedAt: null,
      sortOrder: index,
      altText: '',
    })
  })

  return {
    records,
    skipped,
    published: 0,
    drafts: records.length,
    missingPublicationFields: missingReviewPublicationFields,
  }
}
