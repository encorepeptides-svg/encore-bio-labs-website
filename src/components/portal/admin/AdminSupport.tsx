import { Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminFetchThreads, adminSetThreadStatus, fetchThreadMessages, sendSupportMessage, type SupportThread } from '../../../lib/portal/portalData'
import { Badge, EmptyCard, LoadState, statusTone, useAsync, useDateFormatter } from '../sections/shared'

type AdminThread = SupportThread & { profiles: { legal_name: string; email: string } | null }

export function AdminSupport() {
  const { t } = useTranslation('portal')
  const { data, loading, error, reload } = useAsync(adminFetchThreads)
  const [active, setActive] = useState<AdminThread | null>(null)
  const formatDate = useDateFormatter()

  if (active) return <AdminThreadView thread={active} onBack={() => { setActive(null); reload() }} />

  return <LoadState loading={loading} error={error} onRetry={reload}>
    {data?.length ? <div className="mt-8 grid gap-3">{data.map((thread) => <button key={thread.id} onClick={() => setActive(thread)} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-white px-5 py-4 text-left text-sm shadow-[0_10px_35px_rgba(7,23,36,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(7,23,36,.09)]">
      <div><p className="font-semibold">{thread.subject}</p><p className="mt-1 text-xs text-slate-500">{thread.profiles?.legal_name || thread.profiles?.email} · {thread.category} · {formatDate(thread.updated_at, true)}</p></div>
      <Badge tone={statusTone(thread.status)}>{thread.status}</Badge>
    </button>)}</div> : <EmptyCard title={t('adminNoThreads')} copy={t('adminNoThreadsCopy')} />}
  </LoadState>
}

function AdminThreadView({ thread, onBack }: { thread: AdminThread; onBack: () => void }) {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(() => fetchThreadMessages(thread.id), [thread.id])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(thread.status)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity || !message.trim()) return
    setBusy(true)
    try { await sendSupportMessage(thread.id, identity.user.id, message); setMessage(''); reload() } finally { setBusy(false) }
  }

  async function changeStatus(next: string) {
    setBusy(true)
    try { await adminSetThreadStatus(thread.id, next); setStatus(next) } finally { setBusy(false) }
  }

  return <>
    <button onClick={onBack} className="text-sm font-semibold text-teal-800">← {t('supportBackToThreads')}</button>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-semibold tracking-[-.05em]">{thread.subject}</h1><p className="mt-1 text-sm text-slate-500">{thread.profiles?.legal_name || thread.profiles?.email}</p></div>
      <select disabled={busy} value={status} onChange={(e) => void changeStatus(e.target.value)} className="portal-input !min-h-10 max-w-40 !py-1">{['open', 'in_progress', 'resolved', 'closed'].map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}</select>
    </div>
    <LoadState loading={loading} error={error} onRetry={reload}>
      <div className="mt-6 grid gap-3">{(data ?? []).map((entry) => {
        const staff = entry.author_id !== thread.user_id
        return <div key={entry.id} className={`max-w-[85%] rounded-[1.25rem] p-4 text-sm leading-6 ${staff ? 'justify-self-end bg-[#071724] text-white' : 'bg-white text-slate-700 shadow-[0_10px_35px_rgba(7,23,36,.05)]'}`}><p className="whitespace-pre-wrap">{entry.message}</p><p className="mt-2 text-xs text-slate-400">{staff ? t('supportEncoreTeam') : thread.profiles?.legal_name || t('adminClientApplication')} · {formatDate(entry.created_at, true)}</p></div>
      })}</div>
    </LoadState>
    <form onSubmit={submit} className="mt-6 flex gap-3">
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('supportReplyPlaceholder')} className="portal-input flex-1" />
      <button disabled={busy || !message.trim()} aria-label={t('supportSend')} className="flex size-12 items-center justify-center rounded-full bg-[#071724] text-white transition hover:bg-[#0b3a3e] disabled:opacity-50"><Send size={17} /></button>
    </form>
  </>
}
