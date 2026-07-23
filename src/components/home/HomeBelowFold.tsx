import { BadgeCheck, FileText, FlaskConical, MessageCircle, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { faqLibrary } from '../../data/faq'
import { getLocalizedFaqGroup } from '../../data/faqTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { FinalCTA } from '../FinalCTA'
import { TestimonialsSection } from '../social-proof/TestimonialsSection'
import { FAQAccordion } from '../content/EditorialModules'
import { CategoryShowcase } from './CategoryShowcase'

const processIcons = [FlaskConical, PackageCheck, Truck]
const trustIcons = [PackageCheck, Truck, MessageCircle, FileText, ShieldCheck, BadgeCheck]

function PremiumTrustSection() {
  const { t } = useTranslation('homepage')
  const trustItems = [
    { icon: trustIcons[0], label: t('trustCompleteKits') },
    { icon: trustIcons[1], label: t('trustUsaFulfillment') },
    { icon: trustIcons[2], label: t('trustFastSupport') },
    { icon: trustIcons[3], label: t('trustCoaRequest') },
    { icon: trustIcons[4], label: t('trustSecurePackaging') },
    { icon: trustIcons[5], label: t('trustClearPricing') },
  ]

  return (
    <section id="why-encore" className="border-y border-slate-900/8 bg-white px-5 py-10 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('whyEncoreEyebrow')}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#071724] sm:text-4xl">
            {t('whyEncoreTitle')}
          </h2>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-[1.15rem] border border-slate-900/8 bg-[#f7f8f5] p-4 text-center"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                <item.icon size={17} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold leading-5 text-[#071724]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const { t } = useTranslation('homepage')
  const processSteps = [
    { icon: processIcons[0], title: t('step1Title'), body: t('step1Body') },
    { icon: processIcons[1], title: t('step2Title'), body: t('step2Body') },
    { icon: processIcons[2], title: t('step3Title'), body: t('step3Body') },
  ]

  return (
    <section id="how-it-works" className="relative scroll-mt-28 overflow-hidden bg-[#071724] px-5 py-12 text-white sm:px-8 lg:py-16">
      <div className="molecule-field opacity-[0.06]" aria-hidden="true" />
      <div className="mx-auto max-w-[88rem]">
        <div className="relative max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">{t('processEyebrow')}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            {t('processTitle')}
          </h2>
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-300/14 text-teal-100">
                  <step.icon size={19} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeBelowFold() {
  const { locale } = useLocale()
  const { t } = useTranslation('homepage')
  const previewFaqs = faqLibrary.flatMap((group) => getLocalizedFaqGroup(group, locale).items).slice(0, 3)

  return (
    <>
      <CategoryShowcase />
      <PremiumTrustSection />

      {/* Compliance-gated social proof stays hidden while approved records are empty. */}
      <TestimonialsSection />

      <HowItWorks />

      <FAQAccordion
        eyebrow={t('faqPreviewEyebrow')}
        title={t('faqPreviewTitle')}
        items={previewFaqs}
        cta={{ label: t('viewAllFaqs'), href: '/faq' }}
      />

      <FinalCTA />
    </>
  )
}
