import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminDecideApplication, adminFetchApplications, adminInvitePortalClient } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, LoadState, useAsync, useDateFormatter } from '../sections/shared'

const sourceKeys: Record<string, string> = {
  invitation: 'adminAgentSourceInvitation',
  public_intake: 'adminAgentSourceIntake',
  paid_order: 'adminAgentSourcePaidOrder',
  unmatched: 'adminAgentSourceUnmatched',
}

const flagKeys: Record<string, string> = {
  email_unverified: 'adminAgentFlagEmailUnverified',
  identity_mismatch: 'adminAgentFlagIdentityMismatch',
  intake_incomplete: 'adminAgentFlagIntakeIncomplete',
  account_hold: 'adminAgentFlagAccountHold',
  prior_staff_review: 'adminAgentFlagPriorReview',
  manual_invitation: 'adminAgentFlagManualInvitation',
  shipping_review_required: 'adminAgentFlagShippingReview',
  unmatched_signup: 'adminAgentFlagUnmatched',
}

export function AdminApplications() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(adminFetchApplications)
  const [busy, setBusy] = useState('')
  const [actionError, setActionError] = useState('')
  const [reasons, setReasons] = useState<Record<string, string>>({})

  async function decide(clientId: string, decision: 'approved' | 'rejected' | 'corrections_requested') {
    if (!identity) return
    const reason = (reasons[clientId] ?? '').trim()
    if (decision !== 'approved' && !reason) {
      setActionError(t('adminDecisionReasonRequired'))
      return
    }
    setActionError(''); setBusy(clientId)
    const notification = decision === 'approved'
      ? { title: t('notifyApprovedTitle'), body: t('notifyApprovedBody') }
      : decision === 'rejected'
        ? { title: t('notifyRejectedTitle'), body: t('notifyRejectedBody') }
        : { title: t('notifyCorrectionsTitle'), body: t('notifyCorrectionsBody') }
    try { await adminDecideApplication(identity.user.id, clientId, decision, notification, reason); reload() }
    catch { setActionError(t('saveError')) }
    finally { setBusy('') }
  }

  return <>
    <InviteClientForm />
    {actionError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-8 grid gap-4">{data.map((application) => <Card key={application.user_id}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-semibold">{application.profiles?.legal_name || t('adminClientApplication')}</p><p className="mt-1 text-sm text-slate-500">{application.profiles?.email}</p></div>
          <span className="text-sm text-slate-500">{t('adminSubmitted')}: {formatDate(application.submitted_at)}</span>
        </div>
        {application.goals?.length ? <div className="mt-3 flex flex-wrap gap-2">{application.goals.map((goal) => <Badge key={goal} tone="info">{goal}</Badge>)}</div> : null}
        <div className="mt-4 rounded-[1.1rem] border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="attention">{t('adminAgentManualReview')}</Badge>
            <span className="text-xs font-semibold text-amber-900">{t('adminAgentMatchedSource')}: {t(sourceKeys[application.evaluation?.matched_source ?? 'unmatched'])}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-950">{application.evaluation?.flags.length
            ? application.evaluation.flags.map((flag) => t(flagKeys[flag] ?? 'adminAgentFlagOther')).join(' · ')
            : t('adminAgentFlagLegacy')}</p>
        </div>
        <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
          {t('adminDecisionReason')}
          <textarea rows={2} value={reasons[application.user_id] ?? ''} onChange={(event) => setReasons((current) => ({ ...current, [application.user_id]: event.target.value }))} className="portal-input py-3" placeholder={t('adminDecisionReasonPlaceholder')} />
        </label>
        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={busy === application.user_id} onClick={() => void decide(application.user_id, 'approved')} className="min-h-11 rounded-full bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50">{t('adminApprove')}</button>
          <button disabled={busy === application.user_id} onClick={() => void decide(application.user_id, 'corrections_requested')} className="min-h-11 rounded-full border border-slate-900/10 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white disabled:opacity-50">{t('adminRequestCorrections')}</button>
          <button disabled={busy === application.user_id} onClick={() => { if (window.confirm(t('adminRejectConfirm'))) void decide(application.user_id, 'rejected') }} className="min-h-11 rounded-full border border-red-200 px-5 text-sm font-semibold text-red-800 transition hover:bg-red-50 disabled:opacity-50">{t('adminReject')}</button>
        </div>
      </Card>)}</div> : <EmptyCard title={t('adminNoPendingApplications')} copy={t('adminApplicationsEmptyCopy')} />}
    </LoadState>
  </>
}

function InviteClientForm() {
  const { t } = useTranslation('portal')
  const [form, setForm] = useState({ email: '', legalName: '', preferredLanguage: 'English' as 'English' | 'Spanish', approvalMode: 'automatic' as 'automatic' | 'manual' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; copy: string } | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      await adminInvitePortalClient(form)
      setForm((current) => ({ ...current, email: '', legalName: '' }))
      setMessage({ tone: 'success', copy: t('adminInviteSuccess') })
    } catch {
      setMessage({ tone: 'error', copy: t('adminInviteError') })
    } finally {
      setBusy(false)
    }
  }

  return <section className="mt-8 rounded-[1.5rem] border border-teal-900/10 bg-teal-50/60 p-5 sm:p-6">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">{t('adminAgentLabel')}</p>
    <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#071724]">{t('adminInviteTitle')}</h2>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('adminInviteIntro')}</p>
    <form onSubmit={submit} className="mt-5 grid gap-4 lg:grid-cols-2">
      <label className="grid gap-2 text-sm font-semibold text-slate-700">{t('adminInviteName')}
        <input value={form.legalName} onChange={(event) => setForm({ ...form, legalName: event.target.value })} className="portal-input" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">{t('adminInviteEmail')}
        <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="portal-input" autoComplete="off" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">{t('adminInviteLanguage')}
        <select value={form.preferredLanguage} onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value as 'English' | 'Spanish' })} className="portal-input">
          <option value="English">{t('languageEnglish')}</option><option value="Spanish">{t('languageSpanish')}</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">{t('adminInviteApprovalMode')}
        <select value={form.approvalMode} onChange={(event) => setForm({ ...form, approvalMode: event.target.value as 'automatic' | 'manual' })} className="portal-input">
          <option value="automatic">{t('adminInviteAutomatic')}</option><option value="manual">{t('adminInviteManual')}</option>
        </select>
      </label>
      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <button disabled={busy} className="min-h-11 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white disabled:opacity-50">{busy ? t('adminInviteSending') : t('adminInviteSend')}</button>
        {message ? <p role={message.tone === 'error' ? 'alert' : 'status'} className={`text-sm font-semibold ${message.tone === 'error' ? 'text-red-800' : 'text-emerald-800'}`}>{message.copy}</p> : null}
      </div>
    </form>
  </section>
}
