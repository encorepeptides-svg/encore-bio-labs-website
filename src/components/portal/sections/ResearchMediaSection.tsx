import { Camera, ImagePlus, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { useTranslation } from '../../../i18n/LocaleContext'
import { acceptProgressPhotoConsent, fetchProgressPhotos, hasProgressPhotoConsent, uploadProgressPhoto } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, FieldLabel, LoadState, SectionIntro, SubmitButton, useAsync, useDateFormatter } from './shared'

export function ResearchMediaSection() {
  const { identity } = usePortalAuth()
  const { t } = useTranslation('portal')
  const formatDate = useDateFormatter()
  const consent = useAsync(hasProgressPhotoConsent, [identity?.user.id])
  const photos = useAsync(() => identity ? fetchProgressPhotos(identity.user.id) : Promise.resolve([]), [identity?.user.id])
  const [signature, setSignature] = useState('')
  const [consentSaving, setConsentSaving] = useState(false)
  const [form, setForm] = useState({ captureDate: new Date().toISOString().slice(0, 10), caption: '', staffVisible: false })
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<'saved' | 'error' | ''>('')

  async function saveConsent(event: FormEvent) {
    event.preventDefault()
    if (!identity || signature.trim().length < 2) return
    setConsentSaving(true)
    try { await acceptProgressPhotoConsent(identity.user.id, signature); consent.reload() } finally { setConsentSaving(false) }
  }

  async function upload(event: FormEvent) {
    event.preventDefault()
    if (!identity || !file) { setMessage('error'); return }
    setSaving(true); setMessage('')
    try {
      await uploadProgressPhoto(identity.user.id, { file, ...form })
      setFile(null); setForm((current) => ({ ...current, caption: '', staffVisible: false })); setMessage('saved'); photos.reload()
    } catch { setMessage('error') } finally { setSaving(false) }
  }

  return <>
    <SectionIntro title={t('mediaTitle')} copy={t('mediaIntro')} />
    <div className="mt-6 grid gap-3 sm:grid-cols-3"><TrustPoint icon={LockKeyhole} copy={t('mediaTrustPrivate')} /><TrustPoint icon={ShieldCheck} copy={t('mediaTrustNoPublish')} /><TrustPoint icon={Camera} copy={t('mediaTrustControl')} /></div>
    <LoadState loading={consent.loading} error={consent.error} onRetry={consent.reload}>
      {consent.data ? <Card className="mt-6 border-teal-900/10 bg-[linear-gradient(145deg,#edf9f6,#ffffff)]">
        <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white"><ImagePlus size={20} /></span><div><h2 className="text-xl font-semibold">{t('mediaUploadTitle')}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{t('mediaUploadCopy')}</p></div></div>
        <form onSubmit={upload} className="mt-6 grid gap-5 sm:grid-cols-2">
          <FieldLabel label={t('mediaImageLabel')}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="portal-input file:mr-3 file:rounded-full file:border-0 file:bg-[#071724] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white" /></FieldLabel>
          <FieldLabel label={t('mediaDateLabel')}><input type="date" value={form.captureDate} onChange={(event) => setForm({ ...form, captureDate: event.target.value })} className="portal-input" /></FieldLabel>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">{t('mediaCaptionLabel')}<textarea className="portal-input min-h-24 py-3" maxLength={500} value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} /><span className="text-xs font-normal leading-5 text-slate-500">{t('mediaCaptionHelp')}</span></label>
          <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 sm:col-span-2"><input type="checkbox" checked={form.staffVisible} onChange={(event) => setForm({ ...form, staffVisible: event.target.checked })} className="mt-1 size-4 accent-teal-700" />{t('mediaStaffVisible')}</label>
          {message === 'saved' ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 sm:col-span-2">{t('mediaSaved')}</p> : null}
          {message === 'error' ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{t('mediaError')}</p> : null}
          <div className="sm:col-span-2"><SubmitButton loading={saving} label={t('mediaUpload')} loadingLabel={t('mediaUploading')} /></div>
        </form>
      </Card> : <Card className="mt-6"><h2 className="text-xl font-semibold">{t('mediaConsentTitle')}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('mediaConsentCopy')}</p><form onSubmit={saveConsent} className="mt-5 max-w-lg"><FieldLabel label={t('mediaConsentSignature')}><input className="portal-input" value={signature} onChange={(event) => setSignature(event.target.value)} /></FieldLabel><label className="mt-4 flex items-start gap-3 text-sm leading-6 text-slate-700"><input type="checkbox" required className="mt-1 size-4 accent-teal-700" />{t('mediaConsentAcknowledge')}</label><div className="mt-5"><SubmitButton loading={consentSaving} label={t('mediaConsentAccept')} loadingLabel={t('portalSaving')} /></div></form></Card>}
    </LoadState>
    <LoadState loading={photos.loading} error={photos.error} onRetry={photos.reload}>
      {photos.data?.length ? <div className="mt-8"><h2 className="text-xl font-semibold">{t('mediaLibrary')}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{photos.data.map((photo) => <article key={photo.id} className="overflow-hidden rounded-[1.25rem] border border-slate-900/8 bg-white">{photo.signed_url ? <img src={photo.signed_url} alt={t('mediaPrivateAlt')} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-slate-100 text-slate-400"><LockKeyhole /></div>}<div className="p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{formatDate(photo.capture_date)}</p><Badge tone={photo.staff_visible ? 'info' : 'neutral'}>{photo.staff_visible ? t('mediaSharedBadge') : t('mediaPrivateBadge')}</Badge></div>{photo.caption ? <p className="mt-2 text-sm leading-6 text-slate-600">{photo.caption}</p> : null}</div></article>)}</div></div> : <EmptyCard title={t('mediaEmptyTitle')} copy={t('mediaEmptyCopy')} />}
    </LoadState>
  </>
}

function TrustPoint({ icon: Icon, copy }: { icon: typeof LockKeyhole; copy: string }) {
  return <div className="flex items-start gap-3 rounded-[1.1rem] bg-white p-4 text-sm font-semibold leading-6 text-slate-700 shadow-[0_10px_35px_rgba(7,23,36,.05)]"><Icon size={18} className="mt-0.5 shrink-0 text-teal-700" />{copy}</div>
}
