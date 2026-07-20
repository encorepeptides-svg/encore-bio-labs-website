import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { fetchCheckins, saveCheckin } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, FieldLabel, LoadState, SectionIntro, SubmitButton, useAsync, useDateFormatter } from './shared'

function currentWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return monday.toISOString().slice(0, 10)
}

export function CheckInsSection() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(fetchCheckins)
  const [form, setForm] = useState({ weight: '', waist: '', energy: '3', appetite: '3', sleep: '3', stress: '3', concern: false, notes: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const weekStart = currentWeekStart()
  const alreadySubmitted = (data ?? []).some((checkin) => checkin.week_start === weekStart)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity) return
    setFormError(''); setSaved(false); setSaving(true)
    try {
      await saveCheckin(identity.user.id, {
        week_start: weekStart,
        measurements: { ...(form.weight ? { weight_kg: Number(form.weight) * 0.453592 } : {}), ...(form.waist ? { waist_cm: Number(form.waist) * 2.54 } : {}) },
        scores: { energy: Number(form.energy), appetite: Number(form.appetite), sleep: Number(form.sleep), stress: Number(form.stress) },
        support_concern: form.concern,
        notes: form.notes,
      })
      setSaved(true)
      reload()
    } catch { setFormError(t('saveError')) } finally { setSaving(false) }
  }

  return <>
    <SectionIntro title={t('checkinsTitle')} copy={t('checkinsIntro')} />
    <Card className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t('checkinsWeekOf', { date: formatDate(weekStart) })}</h2>{alreadySubmitted ? <Badge tone="positive">{t('checkinsSubmittedBadge')}</Badge> : <Badge tone="attention">{t('checkinsDueBadge')}</Badge>}</div>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FieldLabel label={t('progressWeightLb')}><input type="number" step="0.1" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('progressWaistIn')}><input type="number" step="0.1" min="0" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} className="portal-input" /></FieldLabel>
        {([['energy', t('energyRatingLabel')], ['appetite', t('appetiteRatingLabel')], ['sleep', t('checkinSleepRating')], ['stress', t('stressRatingLabel')]] as const).map(([key, label]) => <FieldLabel key={key} label={label}><select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="portal-input">{['1', '2', '3', '4', '5'].map((value) => <option key={value}>{value}</option>)}</select></FieldLabel>)}
        <FieldLabel label={t('progressNotes')}><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="portal-input" /></FieldLabel>
        <label className="flex min-h-12 items-start gap-3 rounded-xl border border-slate-900/8 bg-white p-3 text-sm font-semibold sm:col-span-2 lg:col-span-3"><input type="checkbox" checked={form.concern} onChange={(e) => setForm({ ...form, concern: e.target.checked })} className="mt-1 size-4 accent-teal-700" />{t('checkinConcernLabel')}</label>
        {formError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2 lg:col-span-3">{formError}</p> : null}
        {saved ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 sm:col-span-2 lg:col-span-3">{t('checkinSaved')}</p> : null}
        <div className="sm:col-span-2 lg:col-span-3"><SubmitButton loading={saving} label={alreadySubmitted ? t('checkinUpdate') : t('checkinSubmit')} loadingLabel={t('submitting')} /></div>
      </form>
      <p className="mt-5 text-xs leading-5 text-slate-500">{t('sectionEmptyCheckInsWarning')}</p>
    </Card>
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-6 grid gap-3">{data.map((checkin) => <div key={checkin.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-white px-5 py-4 text-sm shadow-[0_10px_35px_rgba(7,23,36,.05)]"><p className="font-semibold">{t('checkinsWeekOf', { date: formatDate(checkin.week_start) })}</p><div className="flex flex-wrap gap-2 text-slate-600"><span>{t('energyRatingLabel')}: {checkin.scores.energy ?? '—'}/5</span><span>{t('checkinSleepRating')}: {checkin.scores.sleep ?? '—'}/5</span>{checkin.measurements.weight_kg != null ? <span>{(checkin.measurements.weight_kg / 0.453592).toFixed(1)} lb</span> : null}</div>{checkin.support_concern ? <Badge tone="attention">{t('checkinConcernBadge')}</Badge> : null}</div>)}</div> : <EmptyCard title={t('checkinsEmptyTitle')} copy={t('checkinsEmptyCopy')} />}
    </LoadState>
  </>
}
