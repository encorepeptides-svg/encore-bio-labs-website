import {
  ArrowDown,
  ArrowRight,
  Check,
  ExternalLink,
  FileCheck2,
  FlaskConical,
  Info,
  Network,
  ShieldAlert,
  X,
} from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import heroArtworkAvif1586 from '../../assets/images/research/retatrutide-triple-pathway-hero-1586.avif'
import heroArtworkAvif768 from '../../assets/images/research/retatrutide-triple-pathway-hero-768.avif'
import heroArtworkWebp1586 from '../../assets/images/research/retatrutide-triple-pathway-hero-1586.webp'
import heroArtworkWebp768 from '../../assets/images/research/retatrutide-triple-pathway-hero-768.webp'
import {
  retatrutideDocumentation,
  retatrutideTimeline,
  sourceById,
  type ResearchDocumentationRecord,
} from '../../data/retatrutideClinicalData'
import type { ResearchArea } from '../../data/products'
import { SITE_ORIGIN } from '../../i18n/config'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { track } from '../../lib/analytics'
import { FAQAccordion } from '../content/EditorialModules'
import { TestimonialsSection } from '../social-proof/TestimonialsSection'
import { CategoryBreadcrumb } from './CategoryPageSections'
import { RetatrutideDataExplorer } from './RetatrutideDataExplorer'

function SectionIntro({ eyebrow, title, description, inverted = false }: { eyebrow: string; title: string; description?: string; inverted?: boolean }) {
  return (
    <div className="max-w-4xl">
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${inverted ? 'text-teal-200' : 'text-teal-700'}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-5xl ${inverted ? 'text-white' : 'text-[#071724]'}`}>{title}</h2>
      {description ? <p className={`mt-5 max-w-3xl text-base leading-7 sm:text-lg ${inverted ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p> : null}
    </div>
  )
}

function SectionShell({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:py-24 ${className}`}><div className="mx-auto max-w-[88rem]">{children}</div></section>
}

function StructuredData({ areaName }: { areaName: string }) {
  const { locale, path } = useLocale()

  useEffect(() => {
    const id = 'retatrutide-category-structured-data'
    document.getElementById(id)?.remove()
    const url = `${SITE_ORIGIN}${path('/categories/metabolic-weight-management')}`
    const home = `${SITE_ORIGIN}${path('/')}`
    const script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': url,
          url,
          name: locale === 'es' ? 'Panorama de investigación sobre Retatrutide' : 'Retatrutide Research Overview',
          description: locale === 'es'
            ? 'Conoce el mecanismo de tres receptores de Retatrutide, los hitos clínicos reportados por el patrocinador y la documentación de investigación disponible.'
            : 'Explore retatrutide’s triple-receptor mechanism, sponsor-reported clinical-trial milestones, and available research documentation.',
          inLanguage: locale,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: locale === 'es' ? 'Inicio' : 'Home', item: home },
            { '@type': 'ListItem', position: 2, name: areaName, item: url },
          ],
        },
      ],
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [areaName, locale, path])

  return null
}

function DocumentationFields({ record }: { record: ResearchDocumentationRecord }) {
  const { locale } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const fields = [
    ['batchId', record.batchId],
    ['testingDate', record.testingDate],
    ['laboratory', record.laboratory],
    ['method', record.method],
    ['purity', record.purity],
    ['hplcResult', record.hplcResult],
    ['massSpectrometryResult', record.massSpectrometryResult],
    ['storage', record.storage],
    ['version', record.version],
    ['lastVerified', record.lastVerified],
  ] as const

  return (
    <article className="rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_20px_55px_rgba(7,23,36,0.08)]">
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.filter(([, value]) => value.trim()).map(([key, value]) => (
          <div key={key} className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">{t(key)}</dt>
            <dd className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{value}</dd>
          </div>
        ))}
      </dl>
      {record.reportUrl ? (
        <a
          href={record.reportUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => track('coa_document_open', { batchId: record.batchId, locale })}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          {t('openReport')}<ExternalLink size={15} aria-hidden="true" />
        </a>
      ) : null}
    </article>
  )
}

export function MetabolicWeightManagementCategoryPage({ area }: { area: ResearchArea }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const pathwayCards = [
    { key: 'gip', accent: 'from-cyan-400 to-cyan-200' },
    { key: 'glp1', accent: 'from-teal-400 to-emerald-200' },
    { key: 'glucagon', accent: 'from-indigo-400 to-violet-300' },
  ] as const
  const suggests = [1, 2, 3].map((index) => t(`suggests${index}`))
  const notEstablished = [1, 2, 3, 4, 5, 6].map((index) => t(`notEstablish${index}`))
  const faqItems = Array.from({ length: 8 }, (_, index) => ({
    question: t(`faq${index + 1}Question`),
    answer: t(`faq${index + 1}Answer`),
  }))

  return (
    <main id="main-content" className="retatrutide-category-page overflow-x-clip bg-[#F8FAFC]">
      <StructuredData areaName={area.name} />
      <CategoryBreadcrumb area={area} />

      <section className="relative min-h-[calc(100svh-9rem)] overflow-hidden bg-[#030b18] px-5 pb-14 pt-8 text-white sm:px-8 lg:flex lg:items-center lg:py-16">
        <picture>
          <source type="image/avif" srcSet={`${heroArtworkAvif768} 768w, ${heroArtworkAvif1586} 1586w`} sizes="100vw" />
          <source type="image/webp" srcSet={`${heroArtworkWebp768} 768w, ${heroArtworkWebp1586} 1586w`} sizes="100vw" />
          <img
            src={heroArtworkWebp1586}
            alt={t('heroVisualAlt')}
            width="1586"
            height="1024"
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover object-[62%_center] opacity-75"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030b18_0%,rgba(3,11,24,0.96)_34%,rgba(3,11,24,0.52)_62%,rgba(3,11,24,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(34,211,238,0.14),transparent_30%)]" />

        <div className="relative mx-auto grid w-full max-w-[88rem] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-teal-200/25 bg-teal-200/10 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-teal-100">{t('heroEyebrow')}</p>
            <h1 className="mt-6 text-[clamp(2.8rem,7.8vw,6.9rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-white">{t('heroTitle')}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{t('heroDescription')}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-100/10 px-4 py-2 text-xs font-bold text-amber-50 sm:text-sm"><ShieldAlert size={16} aria-hidden="true" />{t('statusBadge')}</p>
            <div className="mt-8 flex flex-col gap-3 pr-14 sm:flex-row sm:flex-wrap sm:pr-0">
              <a
                href="#triumph-data"
                onClick={() => track('retatrutide_hero_research_click', { locale })}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] shadow-[0_18px_44px_rgba(45,212,191,0.25)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/40"
              >
                {t('heroPrimaryCta')}<ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href="#research-documentation"
                onClick={() => track('retatrutide_documentation_click', { placement: 'hero', locale })}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/8 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                {t('heroSecondaryCta')}
              </a>
            </div>
            <p className="mt-7 max-w-2xl border-l-2 border-teal-300/60 pl-4 text-xs font-semibold leading-6 text-slate-300 sm:text-sm">{t('researchUseNotice')}</p>
          </div>

          <div className="self-end lg:pb-8">
            <p className="ml-auto max-w-sm rounded-[1.5rem] border border-white/12 bg-black/25 p-5 text-sm font-semibold leading-6 text-slate-100 shadow-[0_22px_64px_rgba(0,0,0,0.2)] backdrop-blur-sm">{t('heroVisualLabel')}</p>
          </div>
        </div>

        <a href="#triple-pathways" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 transition hover:text-white lg:inline-flex">
          {t('scrollCue')}<ArrowDown size={15} aria-hidden="true" />
        </a>
      </section>

      <SectionShell id="triple-pathways" className="bg-white">
        <SectionIntro eyebrow={t('pathwaysEyebrow')} title={t('pathwaysTitle')} description={t('pathwaysDescription')} />
        <div className="relative mt-10 grid gap-5 lg:grid-cols-3">
          <span className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-cyan-300 via-teal-400 to-violet-300 lg:block" aria-hidden="true" />
          {pathwayCards.map((card, index) => (
            <article key={card.key} className="relative overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-[#F8FAFC] p-6 shadow-[0_20px_55px_rgba(7,23,36,0.07)] sm:p-7">
              <span className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-[#071724] shadow-lg`}><Network size={22} aria-hidden="true" /></span>
              <span className="absolute right-5 top-5 text-5xl font-semibold tracking-[-0.06em] text-slate-200">0{index + 1}</span>
              <h3 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-[#071724]">{t(`${card.key}Title`)}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{t(`${card.key}Body`)}</p>
              <details className="group mt-5 rounded-xl border border-slate-900/8 bg-white p-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold text-teal-800"><Info size={14} aria-hidden="true" />{t('definitionLabel')}</summary>
                <p className="mt-3 text-xs leading-5 text-slate-600">{t(`${card.key}Definition`)}</p>
              </details>
            </article>
          ))}
        </div>
      </SectionShell>

      <RetatrutideDataExplorer />

      <SectionShell className="bg-[#eef4f3]">
        <SectionIntro eyebrow={t('meaningEyebrow')} title={t('meaningTitle')} />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-teal-800/10 bg-white p-6 shadow-[0_20px_55px_rgba(7,23,36,0.07)] sm:p-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800"><Check size={22} aria-hidden="true" /></span>
            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('suggestsTitle')}</h3>
            <ul className="mt-6 grid gap-4">{suggests.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700"><Check size={17} aria-hidden="true" className="mt-1 shrink-0 text-teal-600" />{item}</li>)}</ul>
          </article>
          <article className="rounded-[1.75rem] border border-amber-900/10 bg-[#fffaf0] p-6 shadow-[0_20px_55px_rgba(7,23,36,0.07)] sm:p-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><X size={22} aria-hidden="true" /></span>
            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('notEstablishTitle')}</h3>
            <ul className="mt-6 grid gap-4">{notEstablished.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700"><X size={16} aria-hidden="true" className="mt-1 shrink-0 text-amber-700" />{item}</li>)}</ul>
          </article>
        </div>
      </SectionShell>

      <SectionShell className="bg-white">
        <SectionIntro eyebrow={t('timelineEyebrow')} title={t('timelineTitle')} description={t('timelineDescription')} />
        <ol className="relative mt-12 grid gap-5 border-l-2 border-teal-200 pl-7 lg:grid-cols-5 lg:border-l-0 lg:border-t-2 lg:pl-0 lg:pt-8">
          {retatrutideTimeline.map((item) => {
            const source = sourceById(item.sourceId)
            const date = item.date.length === 4 ? item.date : new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${item.date}T00:00:00Z`))
            return (
              <li key={`${item.date}-${item.labelKey}`} className="relative rounded-2xl border border-slate-900/10 bg-[#F8FAFC] p-5 shadow-sm lg:min-h-52">
                <span className="absolute -left-[2.15rem] top-6 size-3 rounded-full bg-teal-500 ring-4 ring-white lg:-top-[2.45rem] lg:left-5" aria-hidden="true" />
                <time className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{date}</time>
                <h3 className="mt-3 text-lg font-semibold leading-6 tracking-[-0.03em] text-[#071724]">{t(item.labelKey)}</h3>
                {source ? <a href={source.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 underline decoration-teal-300 underline-offset-4 hover:text-[#071724]">{t('timelineSource')}<ExternalLink size={13} aria-hidden="true" /></a> : null}
              </li>
            )
          })}
        </ol>
      </SectionShell>

      <SectionShell id="research-documentation" className="bg-[#edf5f4]">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <SectionIntro eyebrow={t('documentationEyebrow')} title={t('documentationTitle')} description={t('documentationDescription')} />
            <p className="mt-6 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500"><Info size={15} aria-hidden="true" className="mt-0.5 shrink-0" />{t('documentationDisclosure')}</p>
          </div>
          <div className="grid gap-5">
            {retatrutideDocumentation.length ? retatrutideDocumentation.map((record) => <DocumentationFields key={record.batchId} record={record} />) : (
              <div className="rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_60px_rgba(7,23,36,0.08)] sm:p-8">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><FileCheck2 size={22} aria-hidden="true" /></span>
                <p className="mt-5 text-lg font-semibold leading-8 text-[#071724]">{t('documentationEmpty')}</p>
                <a
                  href={path('/products/retatrutide')}
                  onClick={() => track('retatrutide_documentation_click', { placement: 'documentation', locale })}
                  className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#071724] px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                >
                  {t('documentationCta')}<ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </div>
      </SectionShell>

      <TestimonialsSection minimumItems={3} />

      <div className="bg-white py-6 sm:py-10">
        <FAQAccordion eyebrow={t('faqEyebrow')} title={t('faqTitle')} items={faqItems} />
      </div>

      <section className="bg-[#071724] px-5 pb-32 pt-16 text-white sm:px-8 sm:pb-20 lg:py-24">
        <div className="mx-auto grid max-w-[88rem] gap-8 overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_88%_20%,rgba(45,212,191,0.22),transparent_34%),rgba(255,255,255,0.05)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{t('finalEyebrow')}</p>
            <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">{t('finalTitle')}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t('finalDescription')}</p>
            <p className="mt-7 max-w-3xl border-l-2 border-teal-300/50 pl-4 text-xs font-semibold leading-5 text-slate-300">{t('independenceDisclosure')}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#research-documentation"
              onClick={() => track('retatrutide_documentation_click', { placement: 'final', locale })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] transition hover:bg-white"
            >
              {t('finalPrimaryCta')}<ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              href={path('/intake?interest=retatrutide')}
              onClick={() => track('research_inquiry_start', { source: 'retatrutide_category', locale })}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/14"
            >
              <FlaskConical size={16} aria-hidden="true" />{t('finalSecondaryCta')}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
