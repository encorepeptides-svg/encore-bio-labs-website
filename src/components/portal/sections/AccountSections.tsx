import { Bell, BellOff, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { updatePortalPassword } from '../../../lib/portal/portalAuth'
import { fetchMyProfile, fetchNotifications, markAllNotificationsRead, markNotificationRead, requestAccountDeletion, requestDataExport, updateMyProfile } from '../../../lib/portal/portalData'
import { Card, EmptyCard, FieldLabel, LoadState, SectionIntro, SubmitButton, useAsync, useDateFormatter } from './shared'

export function NotificationsSection() {
  const { t } = useTranslation('portal')
  const { path } = useLocale()
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(fetchNotifications)
  const unread = (data ?? []).filter((notification) => !notification.read_at)

  return <>
    <SectionIntro title={t('notificationsTitle')} copy={t('notificationsIntro')} />
    {unread.length && identity ? <button onClick={() => void markAllNotificationsRead(identity.user.id).then(reload)} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-900/10 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white"><BellOff size={15} />{t('notificationsMarkAllRead')}</button> : null}
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-6 grid gap-3">{data.map((notification) => <div key={notification.id} className={`rounded-[1.25rem] p-5 text-sm ${notification.read_at ? 'bg-white/60 text-slate-500' : 'bg-white shadow-[0_10px_35px_rgba(7,23,36,.05)]'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Bell size={16} className={notification.read_at ? 'text-slate-400' : 'text-teal-700'} /><p className="font-semibold">{notification.title}</p></div>
          <span className="text-xs text-slate-400">{formatDate(notification.created_at, true)}</span>
        </div>
        {notification.body ? <p className="mt-2 leading-6">{notification.body}</p> : null}
        <div className="mt-3 flex gap-4">
          {notification.action_path ? <a href={path(notification.action_path)} className="font-semibold text-teal-800">{t('notificationsView')}</a> : null}
          {!notification.read_at ? <button onClick={() => void markNotificationRead(notification.id).then(reload)} className="font-semibold text-slate-500">{t('notificationsMarkRead')}</button> : null}
        </div>
      </div>)}</div> : <EmptyCard title={t('statusNoNotifications')} copy={t('notificationsEmptyCopy')} />}
    </LoadState>
  </>
}

export function ProfileSection() {
  const { t } = useTranslation('portal')
  const { identity, refresh } = usePortalAuth()
  const { data, loading, error, reload } = useAsync(() => identity ? fetchMyProfile(identity.user.id) : Promise.reject(new Error('no identity')), [identity?.user.id])
  return <>
    <SectionIntro title={t('profileTitle')} copy={t('profileIntro')} />
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data ? <ProfileForm initial={data} onSaved={() => { void refresh(); reload() }} /> : null}
    </LoadState>
  </>
}

function ProfileForm({ initial, onSaved }: { initial: { legal_name: string; preferred_name: string; email: string; mobile: string; preferred_language: string; time_zone: string }; onSaved: () => void }) {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<'saved' | 'error' | ''>('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity) return
    setMessage(''); setSaving(true)
    try {
      await updateMyProfile(identity.user.id, { legal_name: form.legal_name, preferred_name: form.preferred_name, mobile: form.mobile, preferred_language: form.preferred_language, time_zone: form.time_zone })
      setMessage('saved'); onSaved()
    } catch { setMessage('error') } finally { setSaving(false) }
  }

  return <Card className="mt-8">
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <FieldLabel label={t('legalNameLabel')}><input required value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('preferredNameLabel')}><input value={form.preferred_name} onChange={(e) => setForm({ ...form, preferred_name: e.target.value })} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('emailLabel')}><input value={form.email} disabled className="portal-input opacity-60" /></FieldLabel>
      <FieldLabel label={t('mobileLabel')}><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="portal-input" /></FieldLabel>
      <FieldLabel label={t('preferredLanguageLabel')}><select value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })} className="portal-input"><option value="English">{t('languageEnglish')}</option><option value="Spanish">{t('languageSpanish')}</option></select></FieldLabel>
      <FieldLabel label={t('timeZoneLabel')}><input value={form.time_zone} onChange={(e) => setForm({ ...form, time_zone: e.target.value })} className="portal-input" /></FieldLabel>
      {message === 'error' ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{t('saveError')}</p> : null}
      {message === 'saved' ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 sm:col-span-2">{t('profileSaved')}</p> : null}
      <div className="sm:col-span-2"><SubmitButton loading={saving} label={t('profileSave')} loadingLabel={t('submitting')} /></div>
    </form>
  </Card>
}

export function SecuritySection() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<'saved' | 'error' | 'mismatch' | ''>('')
  const [requestState, setRequestState] = useState<'export' | 'deletion' | 'error' | ''>('')

  async function changePassword(event: FormEvent) {
    event.preventDefault()
    if (password.length < 12 || password !== confirm) { setMessage('mismatch'); return }
    setMessage(''); setSaving(true)
    try {
      const { error } = await updatePortalPassword(password)
      if (error) throw error
      setMessage('saved'); setPassword(''); setConfirm('')
    } catch { setMessage('error') } finally { setSaving(false) }
  }

  return <>
    <SectionIntro title={t('securityTitle')} copy={t('securityIntro')} />
    <Card className="mt-8">
      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><ShieldCheck size={18} /></span><h2 className="text-lg font-semibold">{t('securityChangePassword')}</h2></div>
      <form onSubmit={changePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
        <FieldLabel label={t('newPasswordLabel')}><input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('confirmPasswordLabel')}><input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="portal-input" /></FieldLabel>
        {message === 'mismatch' ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{t('errorRegisterStep1')}</p> : null}
        {message === 'error' ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{t('saveError')}</p> : null}
        {message === 'saved' ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 sm:col-span-2">{t('successReset')}</p> : null}
        <div className="sm:col-span-2"><SubmitButton loading={saving} label={t('updatePassword')} loadingLabel={t('pleaseWait')} /></div>
      </form>
    </Card>
    <Card className="mt-4">
      <h2 className="text-lg font-semibold">{t('securityDataRights')}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{t('securityDataRightsCopy')}</p>
      {requestState === 'export' ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{t('securityExportRequested')}</p> : null}
      {requestState === 'deletion' ? <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{t('securityDeletionRequested')}</p> : null}
      {requestState === 'error' ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{t('saveError')}</p> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => { if (identity) void requestDataExport(identity.user.id).then(() => setRequestState('export')).catch(() => setRequestState('error')) }} className="min-h-11 rounded-full border border-slate-900/10 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white">{t('securityRequestExport')}</button>
        <button onClick={() => { if (identity && window.confirm(t('securityDeletionConfirm'))) void requestAccountDeletion(identity.user.id).then(() => setRequestState('deletion')).catch(() => setRequestState('error')) }} className="min-h-11 rounded-full border border-red-200 px-5 text-sm font-semibold text-red-800 transition hover:bg-red-50">{t('securityRequestDeletion')}</button>
      </div>
    </Card>
  </>
}
