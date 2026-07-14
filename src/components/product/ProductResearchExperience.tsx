import { ArrowUpRight, FlaskConical, Microscope } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '../../data/products'
import type { ProductResearchContent } from '../../data/productResearchContent'
import { localizeProductResearchContent } from '../../data/productResearchTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'

function ResearchSection({ eyebrow, title, children, className = '' }: { eyebrow: string; title: string; children: React.ReactNode; className?: string }) {
  return <section className={`px-5 py-10 sm:px-8 lg:py-12 ${className}`}><div className="mx-auto max-w-[88rem]"><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">{eyebrow}</p><h2 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-.05em] text-[#071724] sm:text-4xl">{title}</h2>{children}</div></section>
}

export function ProductResearchExperience({ product, content }: { product: Product; content: ProductResearchContent }) {
  const reducedMotion = useReducedMotion()
  const { locale } = useLocale()
  const { t } = useTranslation('productResearch')
  const localized = localizeProductResearchContent(product, content, locale)
  const areas = localized.researchAreas.slice(0, 3)
  const studies = localized.studies.slice(0, 3)

  return <>
    <ResearchSection eyebrow={t('researchUseFor')} title={t('usedForTitle', { product: product.name })}>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{t('usedForBody')}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{areas.map((area) => <article key={area.title} className="rounded-[1.35rem] border border-slate-900/8 bg-white p-5 shadow-[0_15px_45px_rgba(7,23,36,.06)]"><Microscope size={20} className="text-teal-700" aria-hidden="true"/><h3 className="mt-4 text-lg font-semibold tracking-[-.025em] text-[#071724]">{area.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{area.summary}</p></article>)}</div>
      <p className="mt-5 text-sm leading-6 text-slate-500">{t('researchScopeNote')}</p>
    </ResearchSection>

    <ResearchSection eyebrow={t('pathwayContext')} title={t('howBeingStudied')} className="bg-white">
      <div className="mt-6 grid gap-5 lg:grid-cols-[.72fr_1.28fr] lg:items-start"><div className="flex gap-4"><FlaskConical className="mt-1 shrink-0 text-teal-700" aria-hidden="true"/><p className="max-w-2xl text-base leading-7 text-slate-600">{localized.howStudied}</p></div><div className="grid gap-3 sm:grid-cols-3">{localized.mechanismSteps.slice(0, 3).map((step, index) => <div key={step.label} className="rounded-2xl border border-teal-900/10 bg-[#f8fbfa] p-4"><span className="text-xs font-bold text-teal-700">{index + 1}</span><p className="mt-2 text-sm font-semibold text-[#071724]">{step.label}</p></div>)}</div></div>
    </ResearchSection>

    {studies.length > 0 ? <ResearchSection eyebrow={t('researchEvidence')} title={t('studyHighlights')}>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">{studies.map((study, index) => <motion.article key={study.pubmedId ?? study.title} initial={reducedMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: reducedMotion ? 0 : index * .05 }} className="flex flex-col rounded-[1.35rem] border border-slate-900/8 bg-white p-5 shadow-[0_15px_45px_rgba(7,23,36,.05)]"><div className="flex items-center justify-end"><span className="text-xs font-bold text-slate-500">{study.year}</span></div><h3 className="mt-4 text-lg font-semibold leading-6 text-[#071724]">{study.title}</h3><p className="mt-2 text-[.68rem] font-semibold uppercase tracking-[.1em] text-teal-800">{study.journal}</p><p className="mt-4 text-sm leading-6 text-slate-600">{study.summary}</p><a href={study.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 text-sm font-semibold text-teal-800 underline-offset-4 hover:underline">{t('viewSourceRecord')} <ArrowUpRight size={15} aria-hidden="true"/></a></motion.article>)}</div>
    </ResearchSection> : null}
  </>
}
