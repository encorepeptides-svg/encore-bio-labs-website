import { ChevronDown, Plus, ShieldCheck, Star, X } from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  buildReviewIntakePayload,
  createEmptyReviewIntake,
  REVIEW_INTAKE_CATEGORIES,
  validateReviewIntake,
  type ReviewIntakeField,
  type ReviewIntakeFormState,
} from '../../data/socialProof/reviewIntake'
import { useTranslation } from '../../i18n/LocaleContext'

type ReviewIntakePayload = ReturnType<typeof buildReviewIntakePayload>

type ReviewIntakeFormProps = {
  onCreate: (payload: ReviewIntakePayload) => Promise<boolean>
}

function IntakeField({
  label,
  children,
  required = false,
  error,
  help,
}: {
  label: string
  children: ReactNode
  required?: boolean
  error?: string
  help?: string
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-red-700" aria-hidden="true">*</span> : null}
      </span>
      {children}
      {help ? <span className="text-xs font-normal leading-5 text-slate-500">{help}</span> : null}
      {error ? <span className="text-xs font-semibold text-red-700">{error}</span> : null}
    </label>
  )
}

const inputClass = 'min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15'

export function ReviewIntakeForm({ onCreate }: ReviewIntakeFormProps) {
  const { t } = useTranslation('portal')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ReviewIntakeFormState>(() => createEmptyReviewIntake())
  const [issueFields, setIssueFields] = useState<Set<ReviewIntakeField>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<'saved' | 'error' | ''>('')

  const fieldErrors = useMemo(() => {
    const errors = new Map<ReviewIntakeField, string>()
    validateReviewIntake(form).forEach((issue) => {
      const messageKey = issue.code === 'required'
        ? 'adminReviewIntakeRequiredError'
        : issue.code === 'consent-reference'
          ? 'adminReviewIntakeConsentError'
          : 'adminReviewIntakeIncentiveError'
      errors.set(issue.field, t(messageKey))
    })
    return errors
  }, [form, t])

  function update<K extends keyof ReviewIntakeFormState>(key: K, value: ReviewIntakeFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setIssueFields((current) => {
      if (!current.has(key)) return current
      const next = new Set(current)
      next.delete(key)
      return next
    })
    setMessage('')
  }

  function close() {
    setOpen(false)
    setIssueFields(new Set())
    setMessage('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const issues = validateReviewIntake(form)
    if (issues.length > 0) {
      setIssueFields(new Set(issues.map((issue) => issue.field)))
      setMessage('error')
      return
    }

    setSubmitting(true)
    setMessage('')
    const saved = await onCreate(buildReviewIntakePayload(form))
    setSubmitting(false)
    if (!saved) {
      setMessage('error')
      return
    }
    setForm(createEmptyReviewIntake())
    setIssueFields(new Set())
    setMessage('saved')
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); setMessage('') }}
        aria-expanded="false"
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
      >
        <Plus size={17} aria-hidden="true" />
        {t('adminReviewIntakeOpen')}
      </button>
    )
  }

  const fieldError = (field: ReviewIntakeField) => issueFields.has(field) ? fieldErrors.get(field) : undefined
  const fieldInvalid = (field: ReviewIntakeField) => Boolean(fieldError(field))

  return (
    <section className="rounded-[1.75rem] border border-teal-900/10 bg-[linear-gradient(145deg,#f3fbf9_0%,#ffffff_55%)] p-5 shadow-[0_18px_55px_rgba(7,23,36,.06)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
            <ShieldCheck size={16} aria-hidden="true" />
            {t('adminReviewIntakeEyebrow')}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950">{t('adminReviewIntakeTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('adminReviewIntakeIntro')}</p>
        </div>
        <button type="button" onClick={close} aria-label={t('adminReviewIntakeClose')} className="grid size-11 place-items-center rounded-full border border-slate-300 bg-white text-slate-600 hover:bg-slate-50">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <form className="mt-6 space-y-6" onSubmit={submit} noValidate>
        <fieldset className="rounded-2xl border border-teal-900/10 bg-white p-4 sm:p-5">
          <legend className="px-1 text-base font-semibold text-slate-950">{t('adminReviewIntakeQuickSection')}</legend>
          <p className="mt-1 text-xs leading-5 text-slate-500">{t('adminReviewIntakeQuickPrompt')}</p>
          <div className="mt-5 grid gap-5">
            <div className="grid gap-1.5">
              <span className="text-sm font-semibold text-slate-700">
                {t('adminReviewIntakeRating')}<span className="ml-1 text-red-700" aria-hidden="true">*</span>
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label={t('adminReviewIntakeRating')} aria-invalid={fieldInvalid('rating')}>
                {[1, 2, 3, 4, 5].map((rating) => {
                  const selectedRating = Number(form.rating)
                  const active = selectedRating >= rating
                  return (
                    <button
                      key={rating}
                      type="button"
                      aria-label={t('adminReviewIntakeStarLabel', { rating })}
                      aria-pressed={selectedRating === rating}
                      onClick={() => update('rating', String(rating))}
                      className={`grid size-12 place-items-center rounded-xl border transition ${active ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-slate-300 bg-white text-slate-300 hover:border-amber-300 hover:text-amber-400'}`}
                    >
                      <Star size={24} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
              {fieldError('rating') ? <span className="text-xs font-semibold text-red-700">{fieldError('rating')}</span> : null}
            </div>
            <IntakeField label={t('adminReviewIntakeQuote')} required error={fieldError('quote')} help={t('adminReviewIntakeExactText')}>
              <textarea value={form.quote} onChange={(event) => update('quote', event.target.value)} aria-invalid={fieldInvalid('quote')} rows={4} className={`${inputClass} py-3`} />
            </IntakeField>
            <div className="grid gap-4 sm:grid-cols-2">
              <IntakeField label={t('adminReviewIntakeDisplayName')} required error={fieldError('displayName')}>
                <input value={form.displayName} onChange={(event) => update('displayName', event.target.value)} aria-invalid={fieldInvalid('displayName')} className={inputClass} />
              </IntakeField>
              <IntakeField label={`${t('adminReviewIntakeProduct')} (${t('adminReviewIntakeOptional')})`}>
                <input value={form.productName} onChange={(event) => update('productName', event.target.value)} className={inputClass} />
              </IntakeField>
            </div>
            <IntakeField label={`${t('adminReviewIntakeReviewTitle')} (${t('adminReviewIntakeOptional')})`}>
              <input value={form.reviewTitle} onChange={(event) => update('reviewTitle', event.target.value)} className={inputClass} />
            </IntakeField>
          </div>
        </fieldset>

        <details className="group rounded-2xl border border-slate-200 bg-slate-50">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-semibold text-slate-800 marker:content-none sm:px-5">
            <span>
              {t('adminReviewIntakeMoreDetails')}
              <span className="mt-0.5 block text-xs font-normal leading-5 text-slate-500">{t('adminReviewIntakeMoreDetailsHelp')}</span>
            </span>
            <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="space-y-6 border-t border-slate-200 px-4 py-5 sm:px-5">
            <fieldset>
              <legend className="text-sm font-semibold text-slate-950">{t('adminReviewIntakeDetailsSection')}</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <IntakeField label={t('adminReviewIntakeCategory')}>
                  <select value={form.category} onChange={(event) => update('category', event.target.value as ReviewIntakeFormState['category'])} className={inputClass}>
                    {REVIEW_INTAKE_CATEGORIES.map((category) => <option key={category} value={category}>{t(`adminReviewCategory${category[0].toUpperCase()}${category.slice(1)}`)}</option>)}
                  </select>
                </IntakeField>
                <IntakeField label={t('adminReviewIntakeDate')}>
                  <input type="date" value={form.submissionDate} onChange={(event) => update('submissionDate', event.target.value)} className={inputClass} />
                </IntakeField>
                <IntakeField label={t('adminReviewIntakePurchase')}>
                  <select value={form.verifiedPurchase} onChange={(event) => update('verifiedPurchase', event.target.value as ReviewIntakeFormState['verifiedPurchase'])} className={inputClass}>
                    <option value="unknown">{t('adminReviewIntakeUnknown')}</option>
                    <option value="no">{t('adminReviewIntakeNo')}</option>
                    <option value="yes">{t('adminReviewIntakeYes')}</option>
                  </select>
                </IntakeField>
                <IntakeField label={t('adminReviewIntakeSourceReference')} help={t('adminReviewIntakeSourceHelp')}>
                  <input value={form.sourceRecordReference} onChange={(event) => update('sourceRecordReference', event.target.value)} className={inputClass} />
                </IntakeField>
                <IntakeField label={t('adminReviewIntakeRelationship')} help={t('adminReviewIntakeRelationshipHelp')}>
                  <input value={form.relationshipToBusiness} onChange={(event) => update('relationshipToBusiness', event.target.value)} className={inputClass} />
                </IntakeField>
                <IntakeField label={t('adminReviewIntakeIncentive')}>
                  <select value={form.incentiveStatus} onChange={(event) => update('incentiveStatus', event.target.value as ReviewIntakeFormState['incentiveStatus'])} className={inputClass}>
                    <option value="unknown">{t('adminReviewIntakeUnknown')}</option>
                    <option value="no">{t('adminReviewIntakeNo')}</option>
                    <option value="yes">{t('adminReviewIntakeYes')}</option>
                  </select>
                </IntakeField>
                <IntakeField label={t('adminReviewIntakeIncentiveDisclosure')} error={fieldError('incentiveDisclosure')} help={t('adminReviewIntakeDisclosureHelp')}>
                  <input value={form.incentiveDisclosure} onChange={(event) => update('incentiveDisclosure', event.target.value)} aria-invalid={fieldInvalid('incentiveDisclosure')} className={inputClass} />
                </IntakeField>
                <div className="sm:col-span-2">
                  <IntakeField label={t('adminReviewIntakeVerificationNotes')} help={t('adminReviewIntakePrivateHelp')}>
                    <textarea value={form.verificationNotes} onChange={(event) => update('verificationNotes', event.target.value)} rows={3} className={`${inputClass} py-3`} />
                  </IntakeField>
                </div>
              </div>
            </fieldset>
            <fieldset className="border-t border-slate-200 pt-5">
              <legend className="text-sm font-semibold text-slate-950">{t('adminReviewIntakeApprovalSection')}</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <IntakeField label={t('adminReviewIntakeConsentReference')} error={fieldError('consentRecordReference')} help={t('adminReviewIntakeConsentHelp')}>
                  <input value={form.consentRecordReference} onChange={(event) => update('consentRecordReference', event.target.value)} aria-invalid={fieldInvalid('consentRecordReference')} className={inputClass} />
                </IntakeField>
                <div className="grid content-start gap-3 text-sm font-semibold text-slate-700">
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <input type="checkbox" checked={form.consentVerified} onChange={(event) => update('consentVerified', event.target.checked)} className="mt-0.5 size-4 accent-teal-700" />
                    <span>{t('adminReviewIntakeConsentVerified')}</span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <input type="checkbox" checked={form.claimReviewPassed} onChange={(event) => update('claimReviewPassed', event.target.checked)} className="mt-0.5 size-4 accent-teal-700" />
                    <span>{t('adminReviewIntakeClaimReview')}</span>
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </details>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-950">
          {t('adminReviewIntakeDraftNotice')}
        </div>
        {message ? (
          <p role={message === 'error' ? 'alert' : 'status'} className={`text-sm font-semibold ${message === 'saved' ? 'text-emerald-800' : 'text-red-700'}`}>
            {message === 'saved' ? t('adminReviewIntakeSaved') : t('adminReviewIntakeFormError')}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="min-h-11 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
            {submitting ? t('adminReviewIntakeSaving') : t('adminReviewIntakeSave')}
          </button>
          <button type="button" onClick={close} className="min-h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700">
            {t('adminReviewIntakeCancel')}
          </button>
        </div>
      </form>
    </section>
  )
}
