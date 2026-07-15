import { CircleCheck, Quote } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'
import type { PublishedTestimonial } from '../../data/socialProof/types'
import { useTestimonials } from './useSocialProof'

function TestimonialCard({ item }: { item: PublishedTestimonial }) {
  const { t } = useTranslation('socialProof')
  const disclosure = [item.relationshipToBusiness, item.incentiveDisclosure].filter((value) => value.trim()).join(' · ')

  return (
    <figure className="flex h-full flex-col rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
      <Quote size={22} aria-hidden="true" className="text-teal-600" />
      <blockquote className="mt-4 flex-1 text-base leading-7 text-[#071724]">{item.quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        {item.approvedPhoto ? (
          <img
            src={item.approvedPhoto}
            alt={item.altText}
            loading="lazy"
            decoding="async"
            className="size-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700" aria-hidden="true">
            <CircleCheck size={20} />
          </span>
        )}
        <span className="text-sm font-semibold text-[#071724]">{item.displayName}</span>
      </figcaption>
      {disclosure ? (
        <p className="mt-3 border-t border-slate-900/8 pt-3 text-xs leading-5 text-slate-500">
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

  if (items.length < minimumItems) return null

  return (
    <section className="bg-[#F8FAFC] px-5 py-[clamp(56px,7vw,96px)] sm:px-8">
      <div className="mx-auto max-w-[88rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('testimonialsEyebrow')}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[#071724] sm:text-4xl">
          {t('testimonialsTitle')}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
