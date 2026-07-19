import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import {
  getTestimonialPublicationReadiness,
  type TestimonialPublicationReadiness,
} from '../../data/socialProof/adminReadiness'
import type { ContentStatus, PagePlacement } from '../../data/socialProof/types'

/**
 * Content-admin panel for testimonials and before/after transformation media.
 *
 * Every mutation goes to Supabase, where RLS (`is_content_admin()`) is the
 * authority — the buttons here are conveniences, not the gate. Original uploads
 * go to the private `compliance-private` bucket; only cleared, optimized
 * derivative URLs are stored in the public columns. This panel never bypasses
 * the publication gates enforced by the `published_*` views.
 */

const STATUSES: ContentStatus[] = ['draft', 'review', 'approved', 'rejected', 'archived']
const PLACEMENTS: PagePlacement[] = ['home', 'retatrutide', 'catalog', 'about']

type Row = Record<string, unknown> & { id: string; status: ContentStatus; sort_order: number }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
      {label}
      {children}
    </label>
  )
}

function useCollection(table: 'testimonials' | 'transformation_media') {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured in this environment.')
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: queryError } = await supabase.from(table).select('*').order('sort_order', { ascending: true })
    if (queryError) setError(queryError.message)
    else {
      setRows((data ?? []) as Row[])
      setError('')
    }
    setLoading(false)
  }, [table])

  useEffect(() => {
    void reload()
  }, [reload])

  const update = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      if (!supabase) return
      const { error: updateError } = await supabase.from(table).update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id)
      if (updateError) setError(updateError.message)
      else await reload()
    },
    [reload, table],
  )

  const create = useCallback(async () => {
    if (!supabase) return
    const { error: insertError } = await supabase.from(table).insert({ status: 'draft', sort_order: rows.length })
    if (insertError) setError(insertError.message)
    else await reload()
  }, [reload, rows.length, table])

  return { rows, loading, error, reload, update, create }
}

/** Uploads an original into the private compliance bucket; returns its path. */
async function uploadOriginal(file: File): Promise<string | null> {
  if (!supabase) return null
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { error } = await supabase.storage.from('compliance-private').upload(path, file, { upsert: false })
  return error ? null : path
}

function StatusControls({
  row,
  onUpdate,
  approvalReadiness,
}: {
  row: Row
  onUpdate: (patch: Record<string, unknown>) => void
  approvalReadiness?: TestimonialPublicationReadiness
}) {
  const approveDisabled = approvalReadiness ? !approvalReadiness.canApproveAndPublish : false
  const readinessDescriptionId = approvalReadiness ? `testimonial-readiness-${row.id}` : undefined

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Content status"
        value={row.status}
        onChange={(event) => onUpdate({ status: event.target.value })}
        className="h-9 rounded-lg border border-slate-300 px-2 text-xs font-semibold"
      >
        {STATUSES.map((status) => (
          <option
            key={status}
            value={status}
            disabled={Boolean(approvalReadiness && status === 'approved' && row.status !== 'approved')}
          >
            {status}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onUpdate({ status: 'approved', published_at: new Date().toISOString() })}
        disabled={approveDisabled}
        aria-describedby={readinessDescriptionId}
        title={approvalReadiness && approvalReadiness.missingPrerequisites.length > 0
          ? `Complete first: ${approvalReadiness.missingPrerequisites.join(', ')}`
          : undefined}
        className="h-9 rounded-lg bg-[#071724] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {approvalReadiness?.isPublished ? 'Published' : 'Approve & publish'}
      </button>
      <button
        type="button"
        onClick={() => onUpdate({ published_at: null })}
        className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-semibold"
      >
        Unpublish
      </button>
      <button
        type="button"
        onClick={() => onUpdate({ status: 'archived', published_at: null })}
        className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-500"
      >
        Archive
      </button>
    </div>
  )
}

function PublicationReadiness({ row, readiness }: { row: Row; readiness: TestimonialPublicationReadiness }) {
  const importedDraft = String(row.source_record_reference ?? '').includes('research_peptide_mock_reviews.json')
  const summary = readiness.isPublished
    ? 'Published: every server gate is complete.'
    : readiness.canApproveAndPublish
      ? 'Ready for approval. Supabase will add the reviewer and publication stamps.'
      : `${readiness.missingPrerequisites.length} required ${readiness.missingPrerequisites.length === 1 ? 'field is' : 'fields are'} incomplete.`

  return (
    <section
      id={`testimonial-readiness-${row.id}`}
      aria-label="Publication readiness"
      className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Publication readiness</h3>
        <span className={`rounded-full px-3 py-1 text-[0.7rem] font-bold ${
          readiness.isPublished
            ? 'bg-emerald-100 text-emerald-800'
            : readiness.canApproveAndPublish
              ? 'bg-teal-100 text-teal-900'
              : 'bg-amber-100 text-amber-900'
        }`}>
          {readiness.isPublished ? 'Published' : readiness.canApproveAndPublish ? 'Ready to approve' : 'Action required'}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{summary}</p>
      {importedDraft ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
          Imported draft from a file labeled “mock reviews.” Do not approve unless the review is genuine and the source, identity, consent, relationship, incentive status, and claims have been independently verified.
        </p>
      ) : null}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {readiness.gates.map((gate) => (
          <li key={gate.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold ${gate.ready ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                {gate.ready ? '✓' : '—'}
              </span>
              <span className="text-xs font-semibold text-slate-800">{gate.label}</span>
            </div>
            <p className={`mt-1 pl-7 text-[0.7rem] leading-4 ${gate.ready ? 'text-slate-500' : 'text-amber-800'}`}>
              {gate.ready
                ? gate.readyDetail
                : gate.administratorSupplied
                  ? `Missing: ${gate.missing.join(', ')}.`
                  : 'Completed automatically when approval succeeds.'}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TestimonialsPanel() {
  const { rows, loading, error, update, create } = useCollection('testimonials')
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => void create()} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
        + New testimonial (draft)
      </button>
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {rows.map((row) => {
        const readiness = getTestimonialPublicationReadiness(row)
        return (
        <div key={row.id} className="rounded-2xl border border-slate-900/10 bg-white p-5">
          <StatusControls row={row} approvalReadiness={readiness} onUpdate={(patch) => void update(row.id, patch)} />
          <PublicationReadiness row={row} readiness={readiness} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Display name">
              <input defaultValue={String(row.display_name ?? '')} onBlur={(e) => void update(row.id, { display_name: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Review title">
              <input defaultValue={String(row.review_title ?? '')} onBlur={(e) => void update(row.id, { review_title: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Product name">
              <input defaultValue={String(row.product_name ?? '')} onBlur={(e) => void update(row.id, { product_name: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Rating (1–5)">
              <input type="number" min="1" max="5" defaultValue={String(row.rating ?? '')} onBlur={(e) => void update(row.id, { rating: e.target.value ? Number(e.target.value) : null })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Category">
              <input defaultValue={String(row.category ?? 'service')} onBlur={(e) => void update(row.id, { category: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Quote">
              <textarea defaultValue={String(row.quote ?? '')} onBlur={(e) => void update(row.id, { quote: e.target.value })} className="min-h-16 rounded-lg border border-slate-300 px-2 py-1 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Submission date">
              <input type="date" defaultValue={String(row.submission_date ?? '')} onBlur={(e) => void update(row.id, { submission_date: e.target.value || null })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Alt text (photo)">
              <input defaultValue={String(row.alt_text ?? '')} onBlur={(e) => void update(row.id, { alt_text: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Source record reference">
              <input defaultValue={String(row.source_record_reference ?? '')} onBlur={(e) => void update(row.id, { source_record_reference: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Consent record reference">
              <input defaultValue={String(row.consent_record_reference ?? '')} onBlur={(e) => void update(row.id, { consent_record_reference: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Relationship to business (public disclosure)">
              <input defaultValue={String(row.relationship_to_business ?? '')} onBlur={(e) => void update(row.id, { relationship_to_business: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Incentive disclosure">
              <input defaultValue={String(row.incentive_disclosure ?? '')} onBlur={(e) => void update(row.id, { incentive_disclosure: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Verification notes (private)">
              <textarea defaultValue={String(row.verification_notes ?? '')} onBlur={(e) => void update(row.id, { verification_notes: e.target.value })} className="min-h-16 rounded-lg border border-slate-300 px-2 py-1 text-sm font-normal text-slate-800" />
            </Field>
            <Field label="Source user style (private)">
              <input defaultValue={String(row.source_user_style ?? '')} onBlur={(e) => void update(row.id, { source_user_style: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={Boolean(row.consent_verified)} onChange={(e) => void update(row.id, { consent_verified: e.target.checked })} />
              Consent verified
            </label>
            <label className="flex items-center gap-2">
              Incentive status
              <select
                value={row.incentive_provided === true ? 'yes' : row.incentive_provided === false ? 'no' : 'unknown'}
                onChange={(e) => void update(row.id, { incentive_provided: e.target.value === 'unknown' ? null : e.target.value === 'yes' })}
                className="h-8 rounded border border-slate-300 px-2"
              >
                <option value="unknown">Unknown</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Verified purchase
              <select
                value={row.verified_purchase === true ? 'yes' : row.verified_purchase === false ? 'no' : 'unknown'}
                onChange={(e) => void update(row.id, { verified_purchase: e.target.value === 'unknown' ? null : e.target.value === 'yes' })}
                className="h-8 rounded border border-slate-300 px-2"
              >
                <option value="unknown">Unknown</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={Boolean(row.claim_review_passed)} onChange={(e) => void update(row.id, { claim_review_passed: e.target.checked })} />
              Claim review passed: service-only, no medical or human-outcome claims
            </label>
            <span className="flex items-center gap-2">
              Sort
              <button type="button" onClick={() => void update(row.id, { sort_order: row.sort_order - 1 })} className="rounded border border-slate-300 px-2">↑</button>
              <button type="button" onClick={() => void update(row.id, { sort_order: row.sort_order + 1 })} className="rounded border border-slate-300 px-2">↓</button>
            </span>
            <span className="flex items-center gap-2">
              Original photo
              <input ref={(el) => { fileRefs.current[row.id] = el }} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const p = await uploadOriginal(f); if (p) void update(row.id, { original_photo_path: p }) } }} />
              <button type="button" onClick={() => fileRefs.current[row.id]?.click()} className="rounded border border-slate-300 px-2 py-1">Upload private</button>
            </span>
          </div>
        </div>
        )
      })}
    </div>
  )
}

function TransformationsPanel() {
  const { rows, loading, error, update, create } = useCollection('transformation_media')

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => void create()} className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
        + New before/after (draft)
      </button>
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      {rows.map((row) => {
        const placements = (row.approved_placements as PagePlacement[] | undefined) ?? []
        return (
          <div key={row.id} className="rounded-2xl border border-slate-900/10 bg-white p-5">
            <StatusControls row={row} onUpdate={(patch) => void update(row.id, patch)} />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Before capture date"><input type="date" defaultValue={String(row.before_capture_date ?? '')} onBlur={(e) => void update(row.id, { before_capture_date: e.target.value || null })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal" /></Field>
              <Field label="After capture date"><input type="date" defaultValue={String(row.after_capture_date ?? '')} onBlur={(e) => void update(row.id, { after_capture_date: e.target.value || null })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal" /></Field>
              <Field label="Accompanying claim"><input defaultValue={String(row.accompanying_claim ?? '')} onBlur={(e) => void update(row.id, { accompanying_claim: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" /></Field>
              <Field label="Claim evidence reference"><input defaultValue={String(row.claim_evidence_reference ?? '')} onBlur={(e) => void update(row.id, { claim_evidence_reference: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" /></Field>
              <Field label="Typical-outcome evidence reference"><input defaultValue={String(row.typical_outcome_evidence_reference ?? '')} onBlur={(e) => void update(row.id, { typical_outcome_evidence_reference: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" /></Field>
              <Field label="Typical-outcome disclosure (public)"><input defaultValue={String(row.typical_outcome_disclosure ?? '')} onBlur={(e) => void update(row.id, { typical_outcome_disclosure: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" /></Field>
              <Field label="Edits disclosure"><input defaultValue={String(row.edits_disclosure ?? '')} onBlur={(e) => void update(row.id, { edits_disclosure: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" /></Field>
              <Field label="Concurrent factors disclosure"><input defaultValue={String(row.concurrent_factors_disclosure ?? '')} onBlur={(e) => void update(row.id, { concurrent_factors_disclosure: e.target.value })} className="h-9 rounded-lg border border-slate-300 px-2 text-sm font-normal text-slate-800" /></Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked={Boolean(row.subject_consent_verified)} onChange={(e) => void update(row.id, { subject_consent_verified: e.target.checked })} />Subject consent verified</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked={Boolean(row.original_files_verified)} onChange={(e) => void update(row.id, { original_files_verified: e.target.checked })} />Original files verified</label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
              <span>Page placements (explicit approval):</span>
              {PLACEMENTS.map((placement) => (
                <label key={placement} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    defaultChecked={placements.includes(placement)}
                    onChange={(e) => {
                      const next = e.target.checked ? [...new Set([...placements, placement])] : placements.filter((value) => value !== placement)
                      void update(row.id, { approved_placements: next })
                    }}
                  />
                  {placement}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[0.7rem] text-slate-400">Retatrutide placement must be checked here explicitly; it is never auto-applied.</p>
          </div>
        )
      })}
    </div>
  )
}

export function SocialProofAdmin() {
  const [tab, setTab] = useState<'testimonials' | 'transformations'>('testimonials')
  return (
    <div className="mt-9">
      <div className="mb-5 inline-flex rounded-full border border-slate-300 p-1">
        <button type="button" onClick={() => setTab('testimonials')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === 'testimonials' ? 'bg-[#071724] text-white' : 'text-slate-600'}`}>Testimonials</button>
        <button type="button" onClick={() => setTab('transformations')} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === 'transformations' ? 'bg-[#071724] text-white' : 'text-slate-600'}`}>Before / After</button>
      </div>
      {tab === 'testimonials' ? <TestimonialsPanel /> : <TransformationsPanel />}
    </div>
  )
}
