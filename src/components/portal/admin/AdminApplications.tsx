import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminDecideApplication, adminFetchApplications } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, LoadState, useAsync, useDateFormatter } from '../sections/shared'

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
    {actionError ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-8 grid gap-4">{data.map((application) => <Card key={application.user_id}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-semibold">{application.profiles?.legal_name || t('adminClientApplication')}</p><p className="mt-1 text-sm text-slate-500">{application.profiles?.email}</p></div>
          <span className="text-sm text-slate-500">{t('adminSubmitted')}: {formatDate(application.submitted_at)}</span>
        </div>
        {application.goals?.length ? <div className="mt-3 flex flex-wrap gap-2">{application.goals.map((goal) => <Badge key={goal} tone="info">{goal}</Badge>)}</div> : null}
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
