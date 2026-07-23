import { describe, expect, it } from 'vitest'
import {
  isPublished,
  selectAdminTestimonials,
  type AdminTestimonialRow,
} from './socialProofAdminList'

function row(partial: Partial<AdminTestimonialRow> & { id: string }): AdminTestimonialRow {
  return { status: 'draft', sort_order: 0, ...partial }
}

const rows: AdminTestimonialRow[] = [
  row({ id: 'charlie', display_name: 'Charlie', review_title: 'Alpha title', status: 'approved', sort_order: 2, published_at: '2026-07-01T00:00:00Z' }),
  row({ id: 'alice', display_name: 'alice', review_title: 'Zulu title', status: 'approved', sort_order: 0, published_at: null }),
  row({ id: 'bravo', display_name: 'Bravo', review_title: 'Mike title', status: 'review', sort_order: 1 }),
  row({ id: 'old', display_name: 'Archived Ann', review_title: 'Archived title', status: 'archived', sort_order: 3 }),
  row({ id: 'blank', display_name: '   ', review_title: '', status: 'draft', sort_order: 4 }),
]

const ids = (result: AdminTestimonialRow[]) => result.map((entry) => entry.id)

describe('selectAdminTestimonials', () => {
  it('keeps archived rows out of the active scope and alone in the archived scope', () => {
    expect(ids(selectAdminTestimonials(rows, { scope: 'active' }))).not.toContain('old')
    expect(ids(selectAdminTestimonials(rows, { scope: 'archived' }))).toEqual(['old'])
  })

  it('sorts by display name A–Z and Z–A, keeping blanks last in both directions', () => {
    expect(ids(selectAdminTestimonials(rows, { scope: 'active', sortKey: 'display_name' })))
      .toEqual(['alice', 'bravo', 'charlie', 'blank'])
    expect(ids(selectAdminTestimonials(rows, { scope: 'active', sortKey: 'display_name', sortDirection: 'desc' })))
      .toEqual(['charlie', 'bravo', 'alice', 'blank'])
  })

  it('sorts by review title as an alternate key', () => {
    expect(ids(selectAdminTestimonials(rows, { scope: 'active', sortKey: 'review_title' })))
      .toEqual(['charlie', 'bravo', 'alice', 'blank'])
  })

  it('preserves manual sort_order ordering by default', () => {
    expect(ids(selectAdminTestimonials(rows, { scope: 'active' }))).toEqual(['alice', 'bravo', 'charlie', 'blank'])
  })

  it('treats publication as independent of approval status', () => {
    expect(isPublished({ published_at: '2026-07-01T00:00:00Z' })).toBe(true)
    expect(isPublished({ published_at: null })).toBe(false)
    expect(isPublished({ published_at: '  ' })).toBe(false)

    expect(ids(selectAdminTestimonials(rows, { scope: 'active', publication: 'published' }))).toEqual(['charlie'])
    // `alice` is approved but unpublished, so it survives the unpublished filter.
    expect(ids(selectAdminTestimonials(rows, { scope: 'active', publication: 'unpublished' })))
      .toEqual(['alice', 'bravo', 'blank'])
  })

  it('combines the approval filter, publication filter, and sorting', () => {
    expect(ids(selectAdminTestimonials(rows, {
      scope: 'active',
      approval: 'approved',
      publication: 'unpublished',
      sortKey: 'display_name',
    }))).toEqual(['alice'])

    expect(ids(selectAdminTestimonials(rows, { scope: 'active', approval: 'approved', sortKey: 'display_name', sortDirection: 'desc' })))
      .toEqual(['charlie', 'alice'])
  })

  it('does not mutate the source array', () => {
    const original = [...rows]
    selectAdminTestimonials(rows, { scope: 'active', sortKey: 'display_name' })
    expect(rows).toEqual(original)
  })
})
