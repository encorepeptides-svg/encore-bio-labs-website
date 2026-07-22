import { MessageSquareQuote, ShieldCheck, Star } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { products } from '../../../data/products'
import { getLocalizedProduct } from '../../../data/productTranslations'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { fetchMyReviewSubmissions, submitPortalReview } from '../../../lib/portal/portalData'
import { Badge, Card, EmptyCard, FieldLabel, LoadState, SectionIntro, SubmitButton, statusTone, useAsync, useDateFormatter } from './shared'

export function FeedbackSection() {
  const { identity } = usePortalAuth()
  const { locale } = useLocale()
  const { t } = useTranslation('portal')
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(
    () => identity ? fetchMyReviewSubmissions(identity.user.id) : Promise.resolve([]),
    [identity?.user.id],
  )
  const localizedProducts = useMemo(() => products.map((product) => getLocalizedProduct(product, locale)), [locale])
  const [form, setForm] = useState({
    displayName: identity?.profile.preferred_name || identity?.profile.legal_name || '',
    reviewTitle: '', quote: '', productName: '', rating: 5, category: 'service', publicationConsent: false,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<'saved' | 'error' | ''>('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!identity || !form.publicationConsent || form.displayName.trim().length < 2 || form.quote.trim().length < 10) {
      setMessage('error')
      return
    }
    setSaving(true); setMessage('')
    try {
      await submitPortalReview(identity.user.id, form)
      setForm((current) => ({ ...current, reviewTitle: '', quote: '', productName: '', rating: 5, category: 'service', publicationConsent: false }))
      setMessage('saved'); reload()
    } catch { setMessage('error') } finally { setSaving(false) }
  }

  return <>
    <SectionIntro title={t('feedbackTitle')} copy={t('feedbackIntro')} />
    <Card className="mt-8 border-teal-900/10 bg-[linear-gradient(145deg,#edf9f6,#ffffff)]">
      <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-teal-700 text-white"><MessageSquareQuote size={20} /></span><div><h2 className="text-xl font-semibold">{t('feedbackFormTitle')}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{t('feedbackFormCopy')}</p></div></div>
      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><p className="text-sm font-semibold text-slate-700">{t('feedbackRating')}</p><div className="mt-2 flex flex-wrap gap-2">{[1,2,3,4,5].map((rating) => <button key={rating} type="button" onClick={() => setForm({ ...form, rating })} aria-pressed={form.rating === rating} aria-label={t('feedbackStarLabel', { rating })} className={`grid size-11 place-items-center rounded-xl border ${rating <= form.rating ? 'border-amber-300 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-300'}`}><Star size={21} fill={rating <= form.rating ? 'currentColor' : 'none'} /></button>)}</div></div>
        <FieldLabel label={t('feedbackCategory')}><select className="portal-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="service">{t('feedbackCategoryService')}</option><option value="documentation">{t('feedbackCategoryDocumentation')}</option><option value="fulfillment">{t('feedbackCategoryFulfillment')}</option><option value="support">{t('feedbackCategorySupport')}</option></select></FieldLabel>
        <FieldLabel label={t('feedbackProductOptional')}><select className="portal-input" value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })}><option value="">{t('feedbackNoProduct')}</option>{localizedProducts.map((product) => <option key={product.slug} value={product.name}>{product.name}</option>)}</select></FieldLabel>
        <FieldLabel label={t('feedbackDisplayName')}><input className="portal-input" maxLength={80} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></FieldLabel>
        <FieldLabel label={t('feedbackReviewTitle')}><input className="portal-input" maxLength={120} value={form.reviewTitle} onChange={(event) => setForm({ ...form, reviewTitle: event.target.value })} /></FieldLabel>
        <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">{t('feedbackReviewLabel')}<textarea className="portal-input min-h-36 py-3" minLength={10} maxLength={1500} required value={form.quote} onChange={(event) => setForm({ ...form, quote: event.target.value })} /><span className="text-xs font-normal leading-5 text-slate-500">{t('feedbackReviewHelp')}</span></label>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 sm:col-span-2"><input type="checkbox" checked={form.publicationConsent} onChange={(event) => setForm({ ...form, publicationConsent: event.target.checked })} className="mt-1 size-4 accent-teal-700" /><span><strong>{t('feedbackConsentTitle')}</strong><br />{t('feedbackConsentCopy')}</span></label>
        {message === 'saved' ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 sm:col-span-2">{t('feedbackSaved')}</p> : null}
        {message === 'error' ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 sm:col-span-2">{t('feedbackError')}</p> : null}
        <div className="sm:col-span-2"><SubmitButton loading={saving} label={t('feedbackSubmit')} loadingLabel={t('submitting')} /></div>
      </form>
      <div className="mt-5 flex items-start gap-2 border-t border-teal-900/10 pt-5 text-xs leading-5 text-slate-500"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal-700" />{t('feedbackModerationNotice')}</div>
    </Card>
    <LoadState loading={loading} error={error} onRetry={reload}>
      {data?.length ? <div className="mt-8 grid gap-3"><h2 className="text-xl font-semibold">{t('feedbackHistory')}</h2>{data.map((review) => <article key={review.id} className="rounded-[1.25rem] border border-slate-900/8 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{review.review_title || t('feedbackUntitled')}</p><p className="mt-1 text-xs text-slate-500">{formatDate(review.created_at)} · {review.rating}/5</p></div><Badge tone={statusTone(review.status)}>{t(review.status === 'approved' ? 'feedbackStatusApproved' : review.status === 'rejected' ? 'feedbackStatusRejected' : 'feedbackStatusReview')}</Badge></div><p className="mt-3 text-sm leading-6 text-slate-600">{review.quote}</p></article>)}</div> : <EmptyCard title={t('feedbackHistoryEmpty')} copy={t('feedbackHistoryEmptyCopy')} />}
    </LoadState>
  </>
}
