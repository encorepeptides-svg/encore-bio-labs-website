import { BadgeCheck, FileText, FlaskConical, PackageCheck, Truck, UserCheck } from 'lucide-react'
import { faqLibrary } from '../../data/faq'
import { getLocalizedFaqGroup } from '../../data/faqTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import { FinalCTA } from '../FinalCTA'
import { ResearchProfilePrompt } from '../ResearchProfilePrompt'
import { TestimonialsSection } from '../social-proof/TestimonialsSection'
import { TransformationSection } from '../social-proof/TransformationSection'
import { FAQAccordion } from '../content/EditorialModules'
import { CategoryShowcase } from './CategoryShowcase'

const processIcons = [FlaskConical, BadgeCheck, PackageCheck, Truck]
const whyChooseIcons = [PackageCheck, FileText, FlaskConical, UserCheck]

function CompactWhyChooseEncore() {
  const { t } = useTranslation('homepage')
  const whyChooseCards = [
    { icon: whyChooseIcons[0], title: t('whyCard1Title'), body: t('whyCard1Body') },
    { icon: whyChooseIcons[1], title: t('whyCard2Title'), body: t('whyCard2Body') },
    { icon: whyChooseIcons[2], title: t('whyCard3Title'), body: t('whyCard3Body') },
    { icon: whyChooseIcons[3], title: t('whyCard4Title'), body: t('whyCard4Body') },
  ]

  return (
    <section id="why-encore" className="px-5 py-14 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('whyEncoreEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
            {t('whyEncoreTitle')}
          </h2>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseCards.map((card) => (
            <div
              key={card.title}
              className="group flex h-full flex-col items-start gap-3 rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(20,184,166,0.12)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                <card.icon size={17} aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold tracking-[-0.02em] text-[#071724]">{card.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{card.body}</p>
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
    { icon: processIcons[3], title: t('step4Title'), body: t('step4Body') },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-28 bg-[#071724] px-5 py-16 text-white sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">{t('processEyebrow')}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
            {t('processTitle')}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-300/14 text-teal-100">
                  <step.icon size={19} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.035em]">{step.title}</h3>
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
  const previewFaqs = faqLibrary.flatMap((group) => getLocalizedFaqGroup(group, locale).items).slice(0, 5)

  return (
    <>
      <CategoryShowcase />

      <section className="px-5 pb-4 sm:px-8">
        <div className="mx-auto max-w-[88rem]">
          <EncoreCompleteKit variant="inline" />
        </div>
      </section>

      <ResearchProfilePrompt />
      <CompactWhyChooseEncore />
      <HowItWorks />

      {/* Compliance-gated social proof stays hidden while approved records are empty. */}
      <TestimonialsSection />
      <TransformationSection placement="home" />

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
