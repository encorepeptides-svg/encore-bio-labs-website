import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminFetchClients, adminFetchProtocols, adminSaveProtocol, type ClientProtocol } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, FieldLabel, LoadState, statusTone, SubmitButton, useAsync, useDateFormatter } from '../sections/shared'

type EditableProtocol = { id?: string; userId: string; title: string; summary: string; body: string; status: ClientProtocol['status'] }
const EMPTY: EditableProtocol = { userId: '', title: '', summary: '', body: '', status: 'active' }

export function AdminProtocols() {
  const { t } = useTranslation('portal')
  const { data, loading, error, reload } = useAsync(adminFetchProtocols)
  const [editing, setEditing] = useState<EditableProtocol | null>(null)
  const formatDate = useDateFormatter()

  return <>
    <button onClick={() => setEditing(EMPTY)} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white transition hover:bg-[#0b3a3e]"><Plus size={16} />{t('adminNewProtocol')}</button>
    {editing ? <ProtocolForm initial={editing} onDone={() => { setEditing(null); reload() }} onCancel={() => setEditing(null)} /> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-6 grid gap-4">{data.map((protocol) => <Card key={protocol.id}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-semibold">{protocol.title}</p><p className="mt-1 text-sm text-slate-500">{protocol.profiles?.legal_name || protocol.profiles?.email || protocol.user_id.slice(0, 8)} · {formatDate(protocol.updated_at)}</p></div>
          <div className="flex items-center gap-3"><Badge tone={statusTone(protocol.status)}>{protocol.status}</Badge><button onClick={() => setEditing({ id: protocol.id, userId: protocol.user_id, title: protocol.title, summary: protocol.summary, body: protocol.body, status: protocol.status })} className="text-sm font-semibold text-teal-800">{t('adminEdit')}</button></div>
        </div>
        {protocol.summary ? <p className="mt-3 text-sm leading-6 text-slate-600">{protocol.summary}</p> : null}
      </Card>)}</div> : <EmptyCard title={t('adminNoProtocols')} copy={t('adminNoProtocolsCopy')} />}
    </LoadState>
  </>
}

function ProtocolForm({ initial, onDone, onCancel }: { initial: EditableProtocol; onDone: () => void; onCancel: () => void }) {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const clients = useAsync(adminFetchClients)
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity || !form.userId || !form.title.trim()) return
    setFormError(''); setSaving(true)
    try {
      await adminSaveProtocol(identity.user.id, form, { title: t('notifyProtocolTitle'), body: t('notifyProtocolBody') })
      onDone()
    } catch { setFormError(t('saveError')) } finally { setSaving(false) }
  }

  return <Card className="mt-4">
    <h2 className="text-lg font-semibold">{form.id ? t('adminEditProtocol') : t('adminNewProtocol')}</h2>
    <form onSubmit={submit} className="mt-4 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel label={t('adminOrderClient')}><select required disabled={Boolean(form.id)} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="portal-input"><option value="">{t('selectPlaceholder')}</option>{(clients.data ?? []).map((row) => <option key={row.user_id} value={row.user_id}>{row.profiles?.legal_name || row.profiles?.email || row.user_id.slice(0, 8)} ({row.profiles?.email})</option>)}</select></FieldLabel>
        <FieldLabel label={t('adminProtocolStatus')}><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientProtocol['status'] })} className="portal-input">{(['draft', 'active', 'completed', 'archived'] as const).map((status) => <option key={status} value={status}>{status}</option>)}</select></FieldLabel>
      </div>
      <FieldLabel label={t('adminProtocolTitle')}><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('adminProtocolSummary')}><input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('adminProtocolBody')}><textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="portal-input" /></FieldLabel>
      {formError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p> : null}
      <div className="flex gap-3"><SubmitButton loading={saving} label={form.id ? t('adminSaveChanges') : t('adminCreateProtocol')} loadingLabel={t('submitting')} /><button type="button" onClick={onCancel} className="min-h-12 rounded-full border border-slate-900/10 px-6 text-sm font-semibold text-slate-700">{t('adminCancel')}</button></div>
    </form>
  </Card>
}
