import { describe, expect, it } from 'vitest'
import migration from '../../../supabase/migrations/202607180001_import_research_peptide_reviews.sql?raw'

const insertBlock = migration.slice(
  migration.indexOf('insert into public.testimonials'),
  migration.indexOf('create or replace view public.published_testimonials'),
)

describe('research review SQL import migration', () => {
  it('imports all 50 supplied records with an explicit draft status', () => {
    const importedIds = insertBlock.match(/ec0e0000-0000-5000-8000-\d{12}/g) ?? []

    expect(importedIds).toHaveLength(50)
    expect(new Set(importedIds).size).toBe(50)
    expect(insertBlock).toContain("'draft'::public.content_status")
    expect(insertBlock).not.toContain("'approved'::public.content_status")
  })

  it('keeps unknown incentive status null for every imported draft', () => {
    const importedRows = insertBlock
      .split('\n')
      .filter((line) => line.trimStart().startsWith("('ec0e0000-"))

    expect(importedRows).toHaveLength(50)
    expect(importedRows.every((row) => /, null\),?$/.test(row))).toBe(true)
  })

  it('retains every server-side publication predicate after the import', () => {
    expect(migration).toContain("where status = 'approved'")
    expect(migration).toContain('consent_verified = true')
    expect(migration).toContain('claim_review_passed = true')
    expect(migration).toContain('length(btrim(consent_record_reference)) > 0')
    expect(migration).toContain('length(btrim(source_record_reference)) > 0')
    expect(migration).toContain('length(btrim(verification_notes)) > 0')
    expect(migration).toContain('length(btrim(relationship_to_business)) > 0')
    expect(migration).toContain('reviewed_by is not null')
    expect(migration).toContain('reviewed_at is not null')
    expect(migration).toContain('incentive_provided is not null')
    expect(migration).toContain('published_at is not null')
  })
})
