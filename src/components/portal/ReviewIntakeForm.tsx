import { Plus, ShieldCheck, X } from 'lucide-react'
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

      <form className="mt-7 space-y-7" onSubmit={submit} noValidate>
        <fieldset>
          <legend className="text-base font-semibold text-slate-950">{t('adminReviewIntakeContentSection')}</legend>
          <p className="mt-1 text-xs leading-5 text-slate-500">{t('adminReviewIntakeExactText')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <IntakeField label={t('adminReviewIntakeDisplayName')} required error={fieldError('displayName')}>
              <input value={form.displayName} onChange={(event) => update('displayName', event.target.value)} aria-invalid={fieldInvalid('displayName')} className={inputClass} />
            </IntakeField>
            <IntakeField label={t('adminReviewIntakeReviewTitle')} required error={fieldError('reviewTitle')}>
              <input value={form.reviewTitle} onChange={(event) => update('reviewTitle', event.target.value)} aria-invalid={fieldInvalid('reviewTitle')} className={inputClass} />
            </IntakeField>
            <div className="sm:col-span-2">
              <IntakeField label={t('adminReviewIntakeQuote')} required error={fieldError('quote')}>
                <textarea value={form.quote} onChange={(event) => update('quote', event.target.value)} aria-invalid={fieldInvalid('quote')} rows={5} className={`${inputClass} py-3`} />
              </IntakeField>
            </div>
            <IntakeField label={t('adminReviewIntakeProduct')} required error={fieldError('productName')}>
              <input value={form.productName} onChange={(event) => update('productName', event.target.value)} aria-invalid={fieldInvalid('productName')} className={inputClass} />
            </IntakeField>
            <IntakeField label={t('adminReviewIntakeRating')} required error={fieldError('rating')}>
              <select value={form.rating} onChange={(event) => update('rating', event.target.value)} aria-invalid={fieldInvalid('rating')} className={inputClass}>
                <option value="">{t('adminReviewIntakeSelect')}</option>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={String(rating)}>{rating}</option>)}
              </select>
            </IntakeField>
            <IntakeField label={t('adminReviewIntakeCategory')} required>
              <select value={form.category} onChange={(event) => update('category', event.target.value as ReviewIntakeFormState['category'])} className={inputClass}>
                {REVIEW_INTAKE_CATEGORIES.map((category) => <option key={category} value={category}>{t(`adminReviewCategory${category[0].toUpperCase()}${category.slice(1)}`)}</option>)}
              </select>
            </IntakeField>
            <IntakeField label={t('adminReviewIntakeDate')} required error={fieldError('submissionDate')}>
              <input type="date" value={form.submissionDate} onChange={(event) => update('submissionDate', event.target.value)} aria-invalid={fieldInvalid('submissionDate')} className={inputClass} />
            </IntakeField>
            <IntakeField label={t('adminReviewIntakePurchase')}>
              <select value={form.verifiedPurchase} onChange={(event) => update('verifiedPurchase', event.target.value as ReviewIntakeFormState['verifiedPurchase'])} className={inputClass}>
                <option value="unknown">{t('adminReviewIntakeUnknown')}</option>
                <option value="no">{t('adminReviewIntakeNo')}</option>
                <option value="yes">{t('adminReviewIntakeYes')}</option>
              </select>
            </IntakeField>
          </div>
        </fieldset>

        <fieldset className="border-t border-slate-200 pt-6">
          <legend className="text-base font-semibold text-slate-950">{t('adminReviewIntakeEvidenceSection')}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <IntakeField label={t('adminReviewIntakeSourceReference')} required error={fieldError('sourceRecordReference')} help={t('adminReviewIntakeSourceHelp')}>
              <input value={form.sourceRecordReference} onChange={(event) => update('sourceRecordReference', event.target.value)} aria-invalid={fieldInvalid('sourceRecordReference')} className={inputClass} />
            </IntakeField>
            <IntakeField label={t('adminReviewIntakeRelationship')} help={t('adminReviewIntakeRelationshipHelp')}>
              <input value={form.relationshipToBusiness} onChange={(event) => update('relationshipToBusiness', event.target.value)} className={inputClass} />
            </IntakeField>
            <div className="sm:col-span-2">
              <IntakeField label={t('adminReviewIntakeVerificationNotes')} help={t('adminReviewIntakePrivateHelp')}>
                <textarea value={form.verificationNotes} onChange={(event) => update('verificationNotes', event.target.value)} rows={3} className={`${inputClass} py-3`} />
              </IntakeField>
            </div>
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
          </div>
        </fieldset>

        <fieldset className="border-t border-slate-200 pt-6">
          <legend className="text-base font-semibold text-slate-950">{t('adminReviewIntakeApprovalSection')}</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <IntakeField label={t('adminReviewIntakeConsentReference')} error={fieldError('consentRecordReference')} help={t('adminReviewIntakeConsentHelp')}>
              <input value={form.consentRecordReference} onChange={(event) => update('consentRecordReference', event.target.value)} aria-invalid={fieldInvalid('consentRecordReference')} className={inputClass} />
            </IntakeField>
            <div className="grid content-start gap-3 pt-1 text-sm font-semibold text-slate-700">
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
