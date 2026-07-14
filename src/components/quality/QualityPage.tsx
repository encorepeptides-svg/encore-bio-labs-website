import { ArrowRight, ArrowUpRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import { coaBySlug } from '../../data/coa'
import { products } from '../../data/products'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { QualitySection } from '../QualitySection'
import { Reveal } from '../Reveal'
import { InternalLinkGrid } from '../content/EditorialModules'

export function QualityPage() {
  const { path } = useLocale()
  const { t } = useTranslation('quality')

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

      {/* Hero */}
      <section className="px-5 pb-8 pt-8 sm:px-8 lg:pb-10">
        <Reveal className="mx-auto max-w-[88rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#071724] sm:text-5xl lg:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {t('heroBody')}
          </p>
        </Reveal>
      </section>

      {/* Real, on-file Certificates of Analysis — not a promise that documentation exists, proof that it does. */}
      <section className="px-5 pb-10 sm:px-8 lg:pb-14">
        <Reveal className="mx-auto max-w-[88rem]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('certificatesEyebrow')}</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-3xl">
            {t('certificatesTitle')}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {t('certificatesBody')}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(coaBySlug).map(([slug, coa]) => {
              const product = products.find((entry) => entry.slug === slug)
              if (!product) return null

              return (
                <a
                  key={slug}
                  href={coa.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(7,23,36,0.1)]"
                >
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                    <BadgeCheck size={18} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-base font-semibold tracking-[-0.02em] text-[#071724]">{product.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {coa.labName} · {coa.method} · {coa.reportDate}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-800">
                    {t('viewCertificate')}
                    <ArrowUpRight size={13} aria-hidden="true" className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </a>
              )
            })}
          </div>
        </Reveal>
      </section>

      {/* Existing documentation / quality-handling section, relocated as-is */}
      <QualitySection />

      {/* Research-use-only reminder */}
      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <Reveal className="mx-auto max-w-[88rem]">
          <div className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-[0_24px_80px_rgba(7,23,36,0.08)] sm:p-8">
            <ShieldCheck size={26} aria-hidden="true" className="text-teal-700" />
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-3xl">
              {t('disclaimerTitle')}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
              {t('disclaimerBody')}
            </p>
            <a
              href={path('/about#research-use-only')}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3"
            >
              {t('readFullExplanation')}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </section>

      <InternalLinkGrid
        eyebrow={t('relatedPagesEyebrow')}
        title={t('relatedPagesTitle')}
        links={[
          {
            label: t('questionsLabel'),
            title: t('questionsTitle'),
            href: '/faq#documentation',
            description: t('questionsDescription'),
          },
          {
            label: t('aboutLabel'),
            title: t('aboutTitle'),
            href: '/about',
            description: t('aboutDescription'),
          },
          {
            label: t('policyLabel'),
            title: t('policyTitle'),
            href: '/legal/shipping-returns',
            description: t('policyDescription'),
          },
        ]}
      />
    </main>
  )
}
