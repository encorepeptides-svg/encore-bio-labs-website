import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { fetchProgressEntries, saveProgressEntry } from '../../../lib/portal/portalData'
import { Card, EmptyCard, FieldLabel, LoadState, SectionIntro, SubmitButton, useAsync, useDateFormatter } from './shared'

export function ProgressSection() {
  const { t } = useTranslation('portal')
  const { identity } = usePortalAuth()
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(fetchProgressEntries)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: '', waist: '', energy: '3', wellness: '3', notes: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity) return
    setFormError('')
    setSaving(true)
    try {
      await saveProgressEntry(identity.user.id, {
        entry_date: form.date,
        measurements: { ...(form.weight ? { weight_kg: Number(form.weight) * 0.453592 } : {}), ...(form.waist ? { waist_cm: Number(form.waist) * 2.54 } : {}) },
        scores: { energy: Number(form.energy), wellness: Number(form.wellness) },
        notes: form.notes,
      })
      setForm((current) => ({ ...current, weight: '', waist: '', notes: '' }))
      reload()
    } catch { setFormError(t('saveError')) } finally { setSaving(false) }
  }

  const entries = data ?? []
  const weights = entries.filter((entry) => entry.measurements.weight_kg != null)
  const delta = weights.length >= 2 ? (weights[0].measurements.weight_kg! - weights[weights.length - 1].measurements.weight_kg!) / 0.453592 : null

  return <>
    <SectionIntro title={t('progressTitle')} copy={t('progressIntro')} />
    <Card className="mt-8">
      <h2 className="text-lg font-semibold">{t('progressLogEntry')}</h2>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FieldLabel label={t('progressDate')}><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('progressWeightLb')}><input type="number" step="0.1" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('progressWaistIn')}><input type="number" step="0.1" min="0" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} className="portal-input" /></FieldLabel>
        <FieldLabel label={t('energyRatingLabel')}><select value={form.energy} onChange={(e) => setForm({ ...form, energy: e.target.value })} className="portal-input">{['1', '2', '3', '4', '5'].map((value) => <option key={value}>{value}</option>)}</select></FieldLabel>
        <FieldLabel label={t('wellnessRatingLabel')}><select value={form.wellness} onChange={(e) => setForm({ ...form, wellness: e.target.value })} className="portal-input">{['1', '2', '3', '4', '5'].map((value) => <option key={value}>{value}</option>)}</select></FieldLabel>
        <FieldLabel label={t('progressNotes')}><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="portal-input" /></FieldLabel>
        {formError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2 lg:col-span-3">{formError}</p> : null}
        <div className="sm:col-span-2 lg:col-span-3"><SubmitButton loading={saving} label={t('progressSave')} loadingLabel={t('submitting')} /></div>
      </form>
    </Card>
    <LoadState loading={loading} error={error} onRetry={reload}>
      {entries.length ? <>
        {delta != null ? <div className="mt-4 rounded-[1.25rem] bg-white p-5 shadow-[0_14px_45px_rgba(7,23,36,.06)]"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('progressNetChange')}</p><p className="mt-2 text-2xl font-semibold">{delta > 0 ? '+' : ''}{delta.toFixed(1)} lb</p></div> : null}
        <div className="mt-4 overflow-x-auto rounded-[1.5rem] border border-slate-900/8 bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">{t('progressDate')}</th><th className="px-5 py-3">{t('progressWeightLb')}</th><th className="px-5 py-3">{t('progressWaistIn')}</th><th className="px-5 py-3">{t('energyRatingLabel')}</th><th className="px-5 py-3">{t('progressNotes')}</th></tr></thead>
            <tbody>{entries.map((entry) => <tr key={entry.id} className="border-t border-slate-900/6"><td className="px-5 py-3 font-semibold">{formatDate(entry.entry_date)}</td><td className="px-5 py-3">{entry.measurements.weight_kg != null ? (entry.measurements.weight_kg / 0.453592).toFixed(1) : '—'}</td><td className="px-5 py-3">{entry.measurements.waist_cm != null ? (entry.measurements.waist_cm / 2.54).toFixed(1) : '—'}</td><td className="px-5 py-3">{entry.scores.energy ?? '—'}</td><td className="px-5 py-3 text-slate-500">{entry.notes ?? ''}</td></tr>)}</tbody>
          </table>
        </div>
      </> : <EmptyCard title={t('progressEmptyTitle')} copy={t('progressEmptyCopy')} />}
    </LoadState>
  </>
}
