import { useState } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminFetchClients, adminSetClientStatus } from '../../../lib/portal/portalData'
import { Badge, EmptyCard, LoadState, statusTone, useAsync } from '../sections/shared'

const STATUSES = ['unverified', 'onboarding_incomplete', 'pending_review', 'active', 'suspended', 'archived'] as const

export function AdminClients() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const { data, loading, error, reload } = useAsync(adminFetchClients)
  const [busy, setBusy] = useState('')
  const [actionError, setActionError] = useState('')
  const [filter, setFilter] = useState('')

  async function setStatus(clientId: string, status: string) {
    if (!identity) return
    setActionError(''); setBusy(clientId)
    try { await adminSetClientStatus(identity.user.id, clientId, status); reload() }
    catch { setActionError(t('saveError')) }
    finally { setBusy('') }
  }

  const rows = (data ?? []).filter((row) => {
    if (!filter.trim()) return true
    const needle = filter.toLowerCase()
    return (row.profiles?.legal_name ?? '').toLowerCase().includes(needle) || (row.profiles?.email ?? '').toLowerCase().includes(needle)
  })

  return <>
    <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t('adminClientSearch')} className="portal-input mt-6 max-w-sm" />
    {actionError ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{actionError}</p> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {rows.length ? <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-slate-900/8 bg-white">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">{t('adminClientName')}</th><th className="px-5 py-3">{t('emailLabel')}</th><th className="px-5 py-3">{t('statusAccountStatus')}</th><th className="px-5 py-3">{t('adminClientSetStatus')}</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.user_id} className="border-t border-slate-900/6">
            <td className="px-5 py-3 font-semibold">{row.profiles?.legal_name || '—'}</td>
            <td className="px-5 py-3 text-slate-600">{row.profiles?.email || '—'}</td>
            <td className="px-5 py-3"><Badge tone={statusTone(row.status)}>{row.status.replaceAll('_', ' ')}</Badge></td>
            <td className="px-5 py-3"><select disabled={busy === row.user_id} value={row.status} onChange={(e) => void setStatus(row.user_id, e.target.value)} className="portal-input !min-h-10 !py-1">{STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></td>
          </tr>)}</tbody>
        </table>
      </div> : <EmptyCard title={t('adminNoClients')} copy={t('adminNoClientsCopy')} />}
    </LoadState>
  </>
}
