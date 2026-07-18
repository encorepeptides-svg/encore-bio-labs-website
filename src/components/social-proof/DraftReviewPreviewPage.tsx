import { CircleAlert, CircleCheck, Quote, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import sourceReviews from '../../data/socialProof/research_peptide_mock_reviews.json'
import { normalizeResearchPeptideReviews } from '../../data/socialProof/importReviews'
import type { TestimonialCategory, TestimonialRecord } from '../../data/socialProof/types'
import { useTranslation } from '../../i18n/LocaleContext'
import {
  filterTestimonials,
  getAvailableTestimonialFilters,
  type TestimonialFilter,
} from './testimonialFilters'

type DraftReviewPreview = Pick<
  TestimonialRecord,
  | 'id'
  | 'category'
  | 'quote'
  | 'displayName'
  | 'reviewTitle'
  | 'productName'
  | 'rating'
  | 'verifiedPurchase'
  | 'submissionDate'
>

const filterLabelKeys: Record<TestimonialFilter, string> = {
  all: 'filterAll',
  service: 'filterService',
  documentation: 'filterDocumentation',
  fulfillment: 'filterFulfillment',
  support: 'filterSupport',
}

const categoryAccent: Record<TestimonialCategory, string> = {
  service: 'bg-sky-50 text-sky-800',
  documentation: 'bg-violet-50 text-violet-800',
  fulfillment: 'bg-teal-50 text-teal-800',
  support: 'bg-amber-50 text-amber-800',
}

const normalizedDrafts = normalizeResearchPeptideReviews(sourceReviews)
const draftReviews: DraftReviewPreview[] = normalizedDrafts.records.map((record) => ({
  id: record.id,
  category: record.category,
  quote: record.quote,
  displayName: record.displayName,
  reviewTitle: record.reviewTitle,
  productName: record.productName,
  rating: record.rating,
  verifiedPurchase: record.verifiedPurchase,
  submissionDate: record.submissionDate,
}))

function DraftReviewCard({ item }: { item: DraftReviewPreview }) {
  const { t } = useTranslation('socialProof')

  return (
    <figure className="group flex h-full flex-col rounded-[1.65rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_50px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:border-teal-700/20 hover:shadow-[0_26px_70px_rgba(20,184,166,0.12)] sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-teal-50 group-hover:text-teal-700">
          <Quote size={18} aria-hidden="true" />
        </span>
        <span className={`rounded-full px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${categoryAccent[item.category]}`}>
          {t(filterLabelKeys[item.category])}
        </span>
      </div>

      {item.rating !== null ? (
        <span
          className="mt-5 inline-flex w-fit items-center gap-1 text-amber-500"
          role="img"
          aria-label={t('ratingAriaLabel', { rating: item.rating })}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              size={17}
              aria-hidden="true"
              className={index < item.rating! ? 'fill-current' : 'fill-transparent text-slate-300'}
            />
          ))}
        </span>
      ) : null}

      <h2 className="mt-4 text-lg font-semibold tracking-[-0.025em] text-[#071724]">{item.reviewTitle}</h2>
      <blockquote className="mt-4 flex-1 text-base leading-7 tracking-[-0.01em] text-slate-700">{item.quote}</blockquote>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
        <span>
          <span className="sr-only">{t('reviewedProductLabel')}: </span>
          {item.productName}
        </span>
        <time dateTime={item.submissionDate} aria-label={`${t('reviewDateLabel')}: ${item.submissionDate}`}>
          {item.submissionDate}
        </time>
      </div>

      <figcaption className="mt-6 border-t border-slate-900/8 pt-5">
        <span className="block text-sm font-semibold text-[#071724]">{item.displayName}</span>
        <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          {item.verifiedPurchase ? <CircleCheck size={14} aria-hidden="true" className="text-teal-700" /> : null}
          {t('sourcePurchaseFlagLabel')}: {t(item.verifiedPurchase ? 'sourcePurchaseFlagYes' : 'sourcePurchaseFlagNo')}
        </span>
      </figcaption>
    </figure>
  )
}

export function DraftReviewPreviewPage() {
  const { t } = useTranslation('socialProof')
  const [activeFilter, setActiveFilter] = useState<TestimonialFilter>('all')
  const availableFilters = useMemo(() => getAvailableTestimonialFilters(draftReviews), [])
  const visibleItems = useMemo(
    () => filterTestimonials(draftReviews, activeFilter),
    [activeFilter],
  )

  return (
    <main id="main-content" className="bg-[#eef3f1]">
      <section className="relative isolate overflow-hidden bg-[#071724] px-5 py-[clamp(64px,8vw,108px)] text-white sm:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[32rem] rounded-full bg-teal-400/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-52 left-1/4 -z-10 size-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="mx-auto max-w-[88rem]">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            <CircleAlert size={15} aria-hidden="true" />
            {t('draftPreviewBadge')}
          </span>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">{t('draftPreviewEyebrow')}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">
            {t('draftPreviewTitle')}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t('draftPreviewIntro')}</p>
        </div>
      </section>

      <section className="px-5 py-[clamp(48px,7vw,96px)] sm:px-8" aria-labelledby="draft-review-heading">
        <div className="mx-auto max-w-[88rem]">
          <div className="rounded-[1.5rem] border border-amber-700/20 bg-amber-50 p-5 text-amber-950 shadow-[0_14px_45px_rgba(120,53,15,0.08)] sm:p-6">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 shrink-0 text-amber-700" size={20} aria-hidden="true" />
              <div>
                <h2 id="draft-review-heading" className="font-semibold">{t('draftPreviewComplianceTitle')}</h2>
                <p className="mt-1 text-sm leading-6 text-amber-900/80">{t('draftPreviewComplianceBody')}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,1.2fr)] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                {t('draftPreviewListEyebrow', { count: draftReviews.length })}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t('draftPreviewLanguageNote')}</p>
            </div>

            <div className="lg:justify-self-end">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('filterPrompt')}</p>
              <div
                className="flex max-w-full gap-1.5 overflow-x-auto rounded-[1.15rem] border border-slate-900/10 bg-white/80 p-1.5 shadow-[0_12px_35px_rgba(7,23,36,0.06)] backdrop-blur-xl"
                role="group"
                aria-label={t('draftFilterAriaLabel')}
              >
                {availableFilters.map((filter) => {
                  const isActive = filter === activeFilter
                  return (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={isActive}
                      aria-controls="draft-review-grid"
                      onClick={() => setActiveFilter(filter)}
                      className={`min-h-10 shrink-0 rounded-[0.85rem] px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25 ${
                        isActive
                          ? 'bg-[#071724] text-white shadow-[0_8px_20px_rgba(7,23,36,0.18)]'
                          : 'text-slate-600 hover:bg-white hover:text-[#071724]'
                      }`}
                    >
                      {t(filterLabelKeys[filter])}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-2 text-sm font-medium text-slate-600" aria-live="polite">
            <CircleAlert size={16} aria-hidden="true" className="text-amber-700" />
            {t(visibleItems.length === 1 ? 'draftCountOne' : 'draftCountOther', { count: visibleItems.length })}
          </div>

          <div id="draft-review-grid" className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => <DraftReviewCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>
    </main>
  )
}
