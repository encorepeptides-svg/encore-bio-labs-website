import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'

export function useAsync<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((value) => value + 1), [])
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    load().then((result) => { if (active) { setData(result); setLoading(false) } }).catch(() => { if (active) { setError(true); setLoading(false) } })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps])
  return { data, loading, error, reload }
}

export function SectionIntro({ title, copy }: { title: string; copy: string }) {
  const { t } = useTranslation('portal')
  return <>
    <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('clientPortalLabel')}</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{title}</h1>
    <p className="mt-4 max-w-2xl leading-7 text-slate-600">{copy}</p>
  </>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-5 sm:p-6 ${className}`}>{children}</div>
}

export function LoadState({ loading, error, onRetry, children }: { loading: boolean; error: boolean; onRetry: () => void; children: ReactNode }) {
  const { t } = useTranslation('portal')
  if (loading) return <p className="mt-8 text-sm text-slate-500">{t('loadingRecords')}</p>
  if (error) return <div className="mt-8 rounded-[1.25rem] bg-red-50 p-5 text-sm text-red-800"><p role="alert">{t('loadError')}</p><button onClick={onRetry} className="mt-3 min-h-11 rounded-full bg-red-800 px-5 text-sm font-semibold text-white">{t('retry')}</button></div>
  return children
}

export function EmptyCard({ title, copy }: { title: string; copy: string }) {
  return <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{copy}</p></div>
}

const badgeTones: Record<string, string> = {
  positive: 'bg-emerald-50 text-emerald-900',
  neutral: 'bg-slate-100 text-slate-700',
  attention: 'bg-amber-50 text-amber-950',
  info: 'bg-teal-50 text-teal-900',
  negative: 'bg-red-50 text-red-900',
}
export function Badge({ tone, children }: { tone: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeTones[tone]}`}>{children}</span>
}

export function statusTone(status: string): keyof typeof badgeTones {
  if (['paid', 'delivered', 'active', 'approved', 'completed', 'resolved'].includes(status)) return 'positive'
  if (['payment_pending', 'review_required', 'pending', 'processing', 'open', 'requested'].includes(status)) return 'attention'
  if (['shipped', 'in_transit'].includes(status)) return 'info'
  if (['rejected', 'cancelled', 'suspended', 'refunded'].includes(status)) return 'negative'
  return 'neutral'
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function useDateFormatter() {
  const { locale } = useLocale()
  return useCallback((iso: string | null, withTime = false) => {
    if (!iso) return '—'
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }).format(new Date(iso))
  }, [locale])
}

export function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return <button disabled={loading} className="min-h-12 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white transition hover:bg-[#0b3a3e] disabled:opacity-50">{loading ? loadingLabel : label}</button>
}

export function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold text-slate-700"><span>{label}</span>{children}</label>
}
