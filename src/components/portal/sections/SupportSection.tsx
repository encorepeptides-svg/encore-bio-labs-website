import { Headphones, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { createSupportThread, fetchMyThreads, fetchThreadMessages, sendSupportMessage, type SupportThread } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, FieldLabel, LoadState, SectionIntro, statusTone, SubmitButton, useAsync, useDateFormatter } from './shared'

export function SupportSection() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const { data, loading, error, reload } = useAsync(fetchMyThreads)
  const [activeThread, setActiveThread] = useState<SupportThread | null>(null)
  const [form, setForm] = useState({ category: 'order', subject: '', message: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity || !form.subject.trim() || !form.message.trim()) return
    setFormError(''); setSaving(true)
    try {
      await createSupportThread(identity.user.id, form)
      setForm({ category: 'order', subject: '', message: '' })
      reload()
    } catch { setFormError(t('saveError')) } finally { setSaving(false) }
  }

  if (activeThread) return <ThreadView thread={activeThread} onBack={() => { setActiveThread(null); reload() }} />

  return <>
    <SectionIntro title={t('supportTitle')} copy={t('supportIntro')} />
    <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t('sectionEmptySupportWarning')}</p>
    <Card className="mt-6">
      <h2 className="text-lg font-semibold">{t('supportNewRequest')}</h2>
      <form onSubmit={submit} className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label={t('supportCategory')}><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="portal-input"><option value="order">{t('supportCategoryOrders')}</option><option value="document">{t('supportCategoryDocuments')}</option><option value="account">{t('supportCategoryAccount')}</option><option value="other">{t('supportCategoryOther')}</option></select></FieldLabel>
          <FieldLabel label={t('supportSubject')}><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="portal-input" /></FieldLabel>
        </div>
        <FieldLabel label={t('supportMessage')}><textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="portal-input" /></FieldLabel>
        {formError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p> : null}
        <div><SubmitButton loading={saving} label={t('supportSubmit')} loadingLabel={t('submitting')} /></div>
      </form>
    </Card>
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-6 grid gap-3">{data.map((thread) => <button key={thread.id} onClick={() => setActiveThread(thread)} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-white px-5 py-4 text-left text-sm shadow-[0_10px_35px_rgba(7,23,36,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(7,23,36,.09)]">
        <div className="flex items-center gap-3"><Headphones size={17} className="text-teal-700" /><div><p className="font-semibold">{thread.subject}</p><p className="text-xs text-slate-500">{thread.category}</p></div></div>
        <Badge tone={statusTone(thread.status)}>{thread.status === 'open' ? t('supportStatusOpen') : thread.status === 'closed' ? t('supportStatusClosed') : thread.status}</Badge>
      </button>)}</div> : <EmptyCard title={t('supportEmptyTitle')} copy={t('supportEmptyCopy')} />}
    </LoadState>
  </>
}

function ThreadView({ thread, onBack }: { thread: SupportThread; onBack: () => void }) {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(() => fetchThreadMessages(thread.id), [thread.id])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity || !message.trim()) return
    setSaving(true)
    try { await sendSupportMessage(thread.id, identity.user.id, message); setMessage(''); reload() } finally { setSaving(false) }
  }

  return <>
    <button onClick={onBack} className="text-sm font-semibold text-teal-800">← {t('supportBackToThreads')}</button>
    <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em]">{thread.subject}</h1>
    <div className="mt-2"><Badge tone={statusTone(thread.status)}>{thread.status === 'open' ? t('supportStatusOpen') : thread.status === 'closed' ? t('supportStatusClosed') : thread.status}</Badge></div>
    <LoadState loading={loading} error={error} onRetry={reload}>
      <div className="mt-6 grid gap-3">{(data ?? []).map((entry) => {
        const mine = entry.author_id === identity?.user.id
        return <div key={entry.id} className={`max-w-[85%] rounded-[1.25rem] p-4 text-sm leading-6 ${mine ? 'justify-self-end bg-[#071724] text-white' : 'bg-white text-slate-700 shadow-[0_10px_35px_rgba(7,23,36,.05)]'}`}><p className="whitespace-pre-wrap">{entry.message}</p><p className={`mt-2 text-xs ${mine ? 'text-slate-400' : 'text-slate-400'}`}>{mine ? t('supportYou') : t('supportEncoreTeam')} · {formatDate(entry.created_at, true)}</p></div>
      })}</div>
    </LoadState>
    {thread.status !== 'closed' ? <form onSubmit={submit} className="mt-6 flex gap-3">
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('supportReplyPlaceholder')} className="portal-input flex-1" />
      <button disabled={saving || !message.trim()} aria-label={t('supportSend')} className="flex size-12 items-center justify-center rounded-full bg-[#071724] text-white transition hover:bg-[#0b3a3e] disabled:opacity-50"><Send size={17} /></button>
    </form> : <p className="mt-6 text-sm text-slate-500">{t('supportThreadClosed')}</p>}
  </>
}
