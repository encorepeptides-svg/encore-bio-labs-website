import { CircleCheck, Quote } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from '../../i18n/LocaleContext'
import type { PublishedTestimonial } from '../../data/socialProof/types'
import { filterTestimonials, type TestimonialFilter } from './testimonialFilters'
import { useTestimonials } from './useSocialProof'

const filterOrder: TestimonialFilter[] = ['all', 'service', 'documentation', 'fulfillment', 'support']

const filterLabelKeys: Record<TestimonialFilter, string> = {
  all: 'filterAll',
  service: 'filterService',
  documentation: 'filterDocumentation',
  fulfillment: 'filterFulfillment',
  support: 'filterSupport',
}

function TestimonialCard({ item }: { item: PublishedTestimonial }) {
  const { t } = useTranslation('socialProof')
  const disclosure = [item.relationshipToBusiness, item.incentiveDisclosure].filter((value) => value.trim()).join(' · ')

  return (
    <figure className="group flex h-full flex-col rounded-[1.65rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_50px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:border-teal-700/20 hover:shadow-[0_26px_70px_rgba(20,184,166,0.12)] sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <span className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
          <Quote size={18} aria-hidden="true" />
        </span>
        <span className="rounded-full border border-slate-900/8 bg-[#f5f5f2] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-600">
          {t(filterLabelKeys[item.category])}
        </span>
      </div>
      <blockquote className="mt-5 flex-1 text-[1.05rem] leading-8 tracking-[-0.01em] text-[#071724]">{item.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-900/8 pt-5">
        {item.approvedPhoto ? (
          <img
            src={item.approvedPhoto}
            alt={item.altText}
            loading="lazy"
            decoding="async"
            className="size-11 shrink-0 rounded-full object-cover ring-2 ring-teal-100"
          />
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#071724] text-teal-200" aria-hidden="true">
            <CircleCheck size={20} />
          </span>
        )}
        <span>
          <span className="block text-sm font-semibold text-[#071724]">{item.displayName}</span>
          <span className="mt-0.5 block text-xs font-medium text-teal-700">{t('verifiedLabel')}</span>
        </span>
      </figcaption>
      {disclosure ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          <span className="font-semibold">{t('disclosureLabel')}:</span> {disclosure}
        </p>
      ) : null}
    </figure>
  )
}

/** Renders nothing until the requested minimum of approved testimonials exists. */
export function TestimonialsSection({ minimumItems = 1 }: { minimumItems?: number } = {}) {
  const items = useTestimonials()
  const { t } = useTranslation('socialProof')
  const [activeFilter, setActiveFilter] = useState<TestimonialFilter>('all')
  const availableFilters = useMemo(
    () => filterOrder.filter((filter) => filter === 'all' || items.some((item) => item.category === filter)),
    [items],
  )
  const visibleItems = useMemo(() => filterTestimonials(items, activeFilter), [activeFilter, items])

  if (items.length < minimumItems) return null

  return (
    <section className="relative isolate overflow-hidden bg-[#eef3f1] px-5 py-[clamp(64px,8vw,112px)] sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-36 -z-10 size-[30rem] rounded-full bg-teal-200/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 -left-28 -z-10 size-[28rem] rounded-full bg-slate-300/35 blur-3xl" />

      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(28rem,1.22fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('testimonialsEyebrow')}</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#071724] sm:text-5xl">
              {t('testimonialsTitle')}
            </h2>
          </div>

          <div className="lg:justify-self-end">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('filterPrompt')}
            </p>
            <div
              className="flex max-w-full gap-1.5 overflow-x-auto rounded-[1.15rem] border border-slate-900/10 bg-white/70 p-1.5 shadow-[0_12px_35px_rgba(7,23,36,0.06)] backdrop-blur-xl"
              role="group"
              aria-label={t('filterAriaLabel')}
            >
              {availableFilters.map((filter) => {
                const isActive = filter === activeFilter
                return (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={isActive}
                    aria-controls="verified-review-grid"
                    onClick={() => setActiveFilter(filter)}
                    className={`min-h-10 shrink-0 rounded-[0.85rem] px-4 py-2 text-sm font-semibold transition ${
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
          <CircleCheck size={16} aria-hidden="true" className="text-teal-700" />
          {t(visibleItems.length === 1 ? 'verifiedCountOne' : 'verifiedCountOther', { count: visibleItems.length })}
        </div>

        <div id="verified-review-grid" className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
