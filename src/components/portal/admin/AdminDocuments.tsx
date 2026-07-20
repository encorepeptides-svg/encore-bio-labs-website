import { FileUp } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { adminFetchClients, adminFetchDocuments, adminUploadDocument } from '../../../lib/portal/portalData'
import { Card, EmptyCard, FieldLabel, LoadState, SubmitButton, useAsync, useDateFormatter } from '../sections/shared'

export function AdminDocuments() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(adminFetchDocuments)
  const clients = useAsync(adminFetchClients)
  const [form, setForm] = useState({ userId: '', title: '', category: 'coa', version: '1.0' })
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<'saved' | 'error' | ''>('')
  const clientById = new Map((clients.data ?? []).map((row) => [row.user_id, row]))

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity || !file || !form.userId || !form.title.trim()) return
    setMessage(''); setSaving(true)
    try {
      await adminUploadDocument(identity.user.id, { file, ...form }, { title: t('notifyDocumentTitle'), body: t('notifyDocumentBody') })
      setForm({ userId: '', title: '', category: 'coa', version: '1.0' }); setFile(null)
      setMessage('saved'); reload()
    } catch { setMessage('error') } finally { setSaving(false) }
  }

  return <>
    <Card className="mt-8">
      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><FileUp size={18} /></span><h2 className="text-lg font-semibold">{t('adminUploadDocument')}</h2></div>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <FieldLabel label={t('adminOrderClient')}><select required value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="portal-input"><option value="">{t('selectPlaceholder')}</option>{(clients.data ?? []).map((row) => <option key={row.user_id} value={row.user_id}>{row.profiles?.legal_name || row.profiles?.email || row.user_id.slice(0, 8)} ({row.profiles?.email})</option>)}</select></FieldLabel>
        <FieldLabel label={t('adminDocumentTitle')}><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('adminDocumentCategory')}><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="portal-input"><option value="coa">{t('adminDocumentCategoryCoa')}</option><option value="handling">{t('adminDocumentCategoryHandling')}</option><option value="report">{t('adminDocumentCategoryReport')}</option><option value="other">{t('supportCategoryOther')}</option></select></FieldLabel>
        <FieldLabel label={t('adminDocumentVersion')}><input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('adminDocumentFile')}><input required type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="portal-input !py-3" /></FieldLabel>
        {message === 'error' ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{t('saveError')}</p> : null}
        {message === 'saved' ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 sm:col-span-2">{t('adminDocumentSaved')}</p> : null}
        <div className="sm:col-span-2"><SubmitButton loading={saving} label={t('adminUploadDocument')} loadingLabel={t('submitting')} /></div>
      </form>
    </Card>
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-slate-900/8 bg-white">
        <table className="w-full min-w-[38rem] text-left text-sm">
          <thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">{t('adminDocumentTitle')}</th><th className="px-5 py-3">{t('adminDocumentCategory')}</th><th className="px-5 py-3">{t('adminDocumentAssignedTo')}</th><th className="px-5 py-3">{t('adminSubmitted')}</th></tr></thead>
          <tbody>{data.map((document) => <tr key={document.id} className="border-t border-slate-900/6">
            <td className="px-5 py-3 font-semibold">{document.title} <span className="font-normal text-slate-400">v{document.version}</span></td>
            <td className="px-5 py-3 text-slate-600">{document.category}</td>
            <td className="px-5 py-3 text-slate-600">{document.document_assignments.filter((assignment) => !assignment.revoked_at).map((assignment) => clientById.get(assignment.user_id)?.profiles?.email ?? assignment.user_id.slice(0, 8)).join(', ') || '—'}</td>
            <td className="px-5 py-3 text-slate-500">{formatDate(document.created_at)}</td>
          </tr>)}</tbody>
        </table>
      </div> : <EmptyCard title={t('adminNoDocuments')} copy={t('adminNoDocumentsCopy')} />}
    </LoadState>
  </>
}
