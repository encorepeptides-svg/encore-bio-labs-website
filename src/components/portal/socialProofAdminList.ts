import type { ContentStatus } from '../../data/socialProof/types'

/**
 * Pure list shaping for the content-admin testimonial list: archive separation,
 * approval/publication filtering, and alphabetical sorting.
 *
 * "Published" is derived from `published_at`, not from `status` — a row can be
 * approved but unpublished (the Unpublish action clears the stamp), so the two
 * filters are genuinely independent and are meant to combine.
 */

export type AdminSortKey = 'manual' | 'display_name' | 'review_title'
export type AdminSortDirection = 'asc' | 'desc'
export type PublicationFilter = 'all' | 'published' | 'unpublished'
export type ApprovalFilter = 'all' | Exclude<ContentStatus, 'archived'>
export type AdminListScope = 'active' | 'archived'

export type AdminTestimonialRow = {
  id: string
  status: ContentStatus
  sort_order: number
  display_name?: unknown
  review_title?: unknown
  published_at?: unknown
}

export const APPROVAL_FILTERS: ApprovalFilter[] = ['all', 'draft', 'review', 'approved', 'rejected']
export const PUBLICATION_FILTERS: PublicationFilter[] = ['all', 'published', 'unpublished']

export function isArchived(row: Pick<AdminTestimonialRow, 'status'>) {
  return row.status === 'archived'
}

/** Publication is the server's `published_at` stamp, independent of approval status. */
export function isPublished(row: Pick<AdminTestimonialRow, 'published_at'>) {
  const stamp = row.published_at
  return stamp != null && String(stamp).trim() !== ''
}

function sortText(row: AdminTestimonialRow, key: Exclude<AdminSortKey, 'manual'>) {
  const raw = key === 'display_name' ? row.display_name : row.review_title
  return String(raw ?? '').trim()
}

export type SelectAdminTestimonialsOptions = {
  scope: AdminListScope
  approval?: ApprovalFilter
  publication?: PublicationFilter
  sortKey?: AdminSortKey
  sortDirection?: AdminSortDirection
}

/**
 * Filters and sorts rows for one admin list view. Archived rows live only in the
 * archived scope so day-to-day review management is never cluttered by them.
 */
export function selectAdminTestimonials<T extends AdminTestimonialRow>(
  rows: T[],
  { scope, approval = 'all', publication = 'all', sortKey = 'manual', sortDirection = 'asc' }: SelectAdminTestimonialsOptions,
): T[] {
  const scoped = rows.filter((row) => (scope === 'archived' ? isArchived(row) : !isArchived(row)))

  const filtered = scoped.filter((row) => {
    if (approval !== 'all' && row.status !== approval) return false
    if (publication === 'published' && !isPublished(row)) return false
    if (publication === 'unpublished' && isPublished(row)) return false
    return true
  })

  const direction = sortDirection === 'desc' ? -1 : 1
  return [...filtered].sort((a, b) => {
    if (sortKey === 'manual') return (a.sort_order - b.sort_order) * direction

    const left = sortText(a, sortKey)
    const right = sortText(b, sortKey)
    // Keep blanks at the bottom in both directions so unnamed drafts never
    // dominate the top of an A–Z list.
    if (!left && !right) return a.sort_order - b.sort_order
    if (!left) return 1
    if (!right) return -1

    const comparison = left.localeCompare(right, undefined, { sensitivity: 'base', numeric: true })
    if (comparison !== 0) return comparison * direction
    return a.sort_order - b.sort_order
  })
}
