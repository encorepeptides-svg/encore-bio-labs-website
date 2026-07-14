import { ArrowRight, Check, CheckCircle2, FileText, LayoutGrid, MapPin, ShieldCheck, Truck, UserCheck, XCircle } from 'lucide-react'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { researchAreas } from '../data/products'
import { CTA } from './CTA'
import { Reveal } from './Reveal'
import { InternalLinkGrid } from './content/EditorialModules'

const categoryKeyBySlug: Record<string, { titleKey: string; descriptionKey: string }> = {
  'metabolic-weight-management': {
    titleKey: 'metabolicWeightManagementTitle',
    descriptionKey: 'metabolicWeightManagementDescription',
  },
  'recovery-regeneration': {
    titleKey: 'recoveryRegenerationTitle',
    descriptionKey: 'recoveryRegenerationDescription',
  },
  'longevity-cellular-health': {
    titleKey: 'longevityCellularHealthTitle',
    descriptionKey: 'longevityCellularHealthDescription',
  },
  'cognitive-performance': {
    titleKey: 'cognitivePerformanceTitle',
    descriptionKey: 'cognitivePerformanceDescription',
  },
  'hormone-wellness': {
    titleKey: 'hormoneWellnessTitle',
    descriptionKey: 'hormoneWellnessDescription',
  },
}

export function AboutPage() {
  const { path } = useLocale()
  const { t } = useTranslation('about')
  const { t: tBrand } = useTranslation('brand')
  const { t: tCategories } = useTranslation('categories')

  const whatThisMeans = [tBrand('researchUsePoint1'), tBrand('researchUsePoint2'), tBrand('researchUsePoint3')]
  const whatThisDoesnt = [tBrand('researchUseBoundary1'), tBrand('researchUseBoundary2'), tBrand('researchUseBoundary3')]

  const standards = [
    { icon: FileText, title: t('standard1Title'), body: t('standard1Body') },
    { icon: LayoutGrid, title: t('standard2Title'), body: t('standard2Body') },
    { icon: UserCheck, title: t('standard3Title'), body: t('standard3Body') },
  ]

  const beliefs = [t('belief1'), t('belief2'), t('belief3'), t('belief4'), t('belief5')]

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
          <a href={path('/')} className="font-medium transition hover:text-[#071724]">
            {t('home')}
          </a>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-[#071724]">{t('breadcrumb')}</span>
        </div>
      </div>

      {/* 1. Hero */}
      <section className="px-5 pb-12 pt-8 sm:px-8 lg:pb-16">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {t('heroEyebrow')}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#071724] sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              {t('heroBody')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTA href="/#products">{t('browseCategories')}</CTA>
              <CTA href="#research-use-only" tone="ghost">
                {t('readRuoExplanation')}
              </CTA>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-[0_28px_90px_rgba(7,23,36,0.1)] sm:p-8">
            <ShieldCheck size={26} aria-hidden="true" className="text-teal-700" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#071724]">
              {t('complianceTitle')}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {tBrand('complianceDisclaimer')} {t('complianceSuffix')}
            </p>
            <div className="mt-6 grid gap-3">
              <a href={path('/legal/terms')} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                {t('reviewTerms')} <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href={path('/faq#safety-compliance')} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                {t('readSafetyFaqs')} <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Explore the Catalog — fast path to the research areas, right after the intro */}
      <InternalLinkGrid
        eyebrow={t('exploreCatalogEyebrow')}
        title={t('exploreCatalogTitle')}
        links={researchAreas.map((area) => {
          const copy = categoryKeyBySlug[area.slug]
          return {
            label: t('researchCategoryLabel'),
            title: copy ? tCategories(copy.titleKey) : area.name,
            href: `/categories/${area.slug}`,
            description: copy ? tCategories(copy.descriptionKey) : area.description,
          }
        })}
      />

      {/* 3. Why Encore Exists */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <Reveal className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {t('whyEyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              {t('whyTitle')}
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              {t('whyBody')}
            </p>
          </div>
        </Reveal>
      </section>

      {/* 4. What We Believe */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {t('believeEyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              {t('believeTitle')}
            </h2>
          </div>
          <div className="mt-8 grid gap-3">
            {beliefs.map((belief, index) => (
              <Reveal
                as="div"
                key={belief}
                delay={index * 0.05}
                className="flex items-start gap-4 rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                  <Check size={16} aria-hidden="true" />
                </span>
                <p className="text-sm leading-6 text-slate-600">{belief}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Quality and Documentation Philosophy */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {t('qualityEyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              {t('qualityTitle')}
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              {t('qualityBody')}
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {standards.map((standard) => (
              <article
                key={standard.title}
                className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  <standard.icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">{standard.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{standard.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Research-Use-Only Positioning */}
      <section id="research-use-only" className="px-5 py-10 sm:px-8 lg:py-14">
        <Reveal className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              {t('ruoEyebrow')}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
              {t('ruoTitle')}
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              {t('ruoBody')}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{t('whatThisMeansLabel')}</p>
              <div className="mt-4 grid gap-3">
                {whatThisMeans.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <CheckCircle2 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('whatThisDoesntMeanLabel')}</p>
              <div className="mt-4 grid gap-3">
                {whatThisDoesnt.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <XCircle size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={path('/legal/terms')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3 sm:col-span-2"
            >
              {t('readFullTerms')}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>

      {/* 7. Local El Paso Support and Nationwide Shipping */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                {t('deliveryEyebrow')}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
                {t('deliveryTitle')}
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                {t('deliveryBody')}
              </p>
              <a
                href={path('/faq#shipping')}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3"
              >
                {t('seeShippingFaqs')}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </Reveal>

            <Reveal delay={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  <MapPin size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">
                  {t('localDeliveryTitle')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t('localDeliveryBody')}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  <Truck size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#071724]">
                  {t('destinationTitle')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t('destinationBody')}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <InternalLinkGrid
        eyebrow={t('trustEyebrow')}
        title={t('trustTitle')}
        links={[
          {
            label: t('qualityPageLabel'),
            title: t('qualityPageTitle'),
            href: '/quality',
            description: t('qualityPageDescription'),
          },
          {
            label: t('policyLabel'),
            title: t('policyTitle'),
            href: '/#research-use-only',
            description: t('policyDescription'),
          },
          {
            label: t('questionsLabel'),
            title: t('questionsTitle'),
            href: '/faq',
            description: t('questionsDescription'),
          },
        ]}
      />

      {/* 8. Final CTA */}
      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-12 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
            {t('finalEyebrow')}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            {t('finalTitle')}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            {t('finalBody')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTA href="/intake" tone="light">
              {t('findMyMatch')}
            </CTA>
            <CTA href="/research" tone="ghost" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
              {t('visitResearchLibrary')}
            </CTA>
          </div>
        </div>
      </section>
    </main>
  )
}
