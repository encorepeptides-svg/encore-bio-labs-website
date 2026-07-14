import { ArrowUpRight, Atom, BookOpen, FlaskConical, Microscope, Network, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '../../data/products'
import type { EvidenceLevel, ProductResearchContent } from '../../data/productResearchContent'
import { localizeProductResearchContent } from '../../data/productResearchTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'

const evidenceStyles: Record<EvidenceLevel, string> = {
  'human-clinical': 'bg-emerald-100 text-emerald-900',
  'human-observational': 'bg-teal-100 text-teal-900',
  animal: 'bg-amber-100 text-amber-900',
  'in-vitro': 'bg-cyan-100 text-cyan-900',
  mechanistic: 'bg-slate-200 text-slate-800',
  limited: 'bg-rose-100 text-rose-900',
}

function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const { t } = useTranslation('productResearch')
  const labelKey: Record<EvidenceLevel, string> = {
    'human-clinical': 'evidenceHumanClinical',
    'human-observational': 'evidenceHumanObservational',
    animal: 'evidenceAnimal',
    'in-vitro': 'evidenceInVitro',
    mechanistic: 'evidenceMechanistic',
    limited: 'evidenceLimited',
  }
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-[.62rem] font-bold uppercase tracking-[.12em] ${evidenceStyles[level]}`}>{t(labelKey[level])}</span>
}

function ResearchSection({ eyebrow, title, children, className = '' }: { eyebrow: string; title: string; children: React.ReactNode; className?: string }) {
  return <section className={`px-5 py-16 sm:px-8 lg:py-24 ${className}`}><div className="mx-auto max-w-[88rem]"><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">{eyebrow}</p><h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.055em] text-[#071724] sm:text-5xl">{title}</h2>{children}</div></section>
}

export function ProductResearchExperience({ product, content }: { product: Product; content: ProductResearchContent }) {
  const reducedMotion = useReducedMotion()
  const { locale } = useLocale()
  const { t } = useTranslation('productResearch')
  content = localizeProductResearchContent(product, content, locale)
  const snapshots = [
    [t('compoundClass'), content.compoundClass, Atom],
    [t('primaryFocus'), content.primaryFocus, Microscope],
    [t('biologicalPathway'), content.biologicalPathway, Network],
    [t('evidenceProfile'), content.evidenceProfile, BookOpen],
  ] as const

  return <>
    <ResearchSection eyebrow={t('researchSnapshot')} title={t('atAGlance', { product: product.name })} className="bg-white">
      <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{snapshots.map(([label,value,Icon])=><article key={label} className="rounded-[1.4rem] border border-slate-900/8 bg-gradient-to-br from-white to-teal-50/60 p-5 shadow-[0_16px_42px_rgba(7,23,36,.05)]"><Icon size={20} className="text-teal-700" aria-hidden="true"/><p className="mt-5 text-[.65rem] font-bold uppercase tracking-[.16em] text-slate-500">{label}</p><p className="mt-2 text-base font-semibold leading-6 text-slate-800">{value}</p></article>)}</div>
    </ResearchSection>

    <ResearchSection eyebrow={t('compoundOverview')} title={t('whatIs', { product: product.name })}>
      <div className="mt-9 grid gap-5 lg:grid-cols-2"><article className="rounded-[2rem] bg-white p-7 shadow-[0_22px_65px_rgba(7,23,36,.07)] sm:p-9"><FlaskConical className="text-teal-700" aria-hidden="true"/><h3 className="mt-5 text-2xl font-semibold tracking-[-.035em]">{t('scientificIdentity')}</h3><p className="mt-4 text-base leading-7 text-slate-600">{content.overview}</p><p className="mt-4 text-sm leading-6 text-slate-500">{content.scientificIdentity}</p></article><article className="rounded-[2rem] bg-[#071724] p-7 text-white shadow-[0_22px_65px_rgba(7,23,36,.14)] sm:p-9"><Microscope className="text-teal-300" aria-hidden="true"/><h3 className="mt-5 text-2xl font-semibold tracking-[-.035em]">{t('howStudied')}</h3><p className="mt-4 text-base leading-7 text-slate-300">{content.howStudied}</p></article></div>
    </ResearchSection>

    <ResearchSection eyebrow={t('proposedMechanism')} title={t('molecularToEndpoint')} className="bg-white">
      <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600">{content.mechanismSummary}</p>
      <div className="relative mt-10 grid gap-4 lg:grid-cols-5"><span aria-hidden="true" className="absolute left-[8%] right-[8%] top-7 hidden h-px bg-gradient-to-r from-teal-200 via-teal-600 to-cyan-200 lg:block"/>{content.mechanismSteps.map((step,index)=><motion.article key={step.label} initial={reducedMotion?false:{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:reducedMotion?0:index*.08}} className="relative rounded-[1.35rem] border border-teal-900/10 bg-[#f8fbfa] p-5 shadow-[0_14px_38px_rgba(7,23,36,.05)]"><span className="relative z-10 flex size-11 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">{index+1}</span><h3 className="mt-5 text-lg font-semibold">{step.label}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p></motion.article>)}</div>
    </ResearchSection>

    <ResearchSection eyebrow={t('scientificResearchAreas')} title={t('investigating')}>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{content.researchAreas.map(area=><article key={area.title} className="rounded-[1.5rem] border border-white bg-white p-6 shadow-[0_18px_55px_rgba(7,23,36,.06)]"><EvidenceBadge level={area.evidenceLevel}/><h3 className="mt-5 text-xl font-semibold tracking-[-.03em]">{area.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{area.summary}</p></article>)}</div>
    </ResearchSection>

    <ResearchSection eyebrow={t('researchEvidence')} title={t('studyHighlights')} className="bg-white">
      {content.studies.length > 0 ? <div className="mt-9 grid gap-5 lg:grid-cols-3">{content.studies.map(study=><article key={study.pubmedId??study.title} className="flex flex-col rounded-[1.6rem] border border-slate-900/8 bg-[#fbfcfc] p-6 shadow-[0_18px_55px_rgba(7,23,36,.05)]"><div className="flex items-center justify-between gap-3"><EvidenceBadge level={study.studyType}/><span className="text-xs font-bold text-slate-500">{study.year}</span></div><h3 className="mt-5 text-xl font-semibold leading-7 tracking-[-.025em]">{study.title}</h3><p className="mt-2 text-xs font-semibold uppercase tracking-[.1em] text-teal-800">{study.journal}{study.authors?` · ${study.authors}`:''}</p><p className="mt-5 text-sm leading-6 text-slate-600">{study.summary}</p><div className="mt-5 rounded-xl bg-emerald-50 p-4"><p className="text-[.62rem] font-bold uppercase tracking-[.14em] text-emerald-800">{t('keyFinding')}</p><p className="mt-2 text-sm leading-6 text-slate-700">{study.keyFinding}</p></div><div className="mt-3 rounded-xl bg-amber-50 p-4"><p className="text-[.62rem] font-bold uppercase tracking-[.14em] text-amber-800">{t('importantLimitation')}</p><p className="mt-2 text-sm leading-6 text-slate-700">{study.limitation}</p></div><a href={study.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-teal-800 underline-offset-4 hover:underline">{t('viewSourceRecord')} <ArrowUpRight size={15} aria-hidden="true"/></a></article>)}</div> : <div className="mt-9 rounded-[1.6rem] border border-amber-900/10 bg-amber-50 p-6 text-sm leading-6 text-amber-950"><strong>{t('noStudyRecord')}</strong> {t('noStudyBody')}</div>}
    </ResearchSection>

    <ResearchSection eyebrow={t('evidenceAndLimitations')} title={t('literatureCanShow')}>
      <div className="mt-9 grid gap-4 lg:grid-cols-[.38fr_.62fr]"><div className="rounded-[1.7rem] bg-[#071724] p-7 text-white"><ShieldCheck className="text-teal-300" aria-hidden="true"/><h3 className="mt-5 text-2xl font-semibold">{t('evidenceProfile')}</h3><p className="mt-3 text-base leading-7 text-slate-300">{content.evidenceProfile}</p></div><ul className="grid gap-3 sm:grid-cols-2">{content.limitations.map(item=><li key={item} className="rounded-[1.25rem] border border-slate-900/8 bg-white p-5 text-sm leading-6 text-slate-600">{item}</li>)}</ul></div>
    </ResearchSection>

    <ResearchSection eyebrow={t('productSpecificFaq')} title={t('researchQuestions', { product: product.name })} className="bg-white">
      <div className="mt-9 divide-y divide-slate-900/8 rounded-[1.7rem] border border-slate-900/8 px-6 sm:px-8">{content.faq.map(item=><details key={item.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">{item.question}</summary><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">{item.answer}</p></details>)}</div>
      {content.studies.length > 0 ? <details className="mt-6 rounded-[1.4rem] border border-slate-900/8 bg-[#f8fbfa] p-5"><summary className="cursor-pointer font-semibold">{t('researchReferences')}</summary><ol className="mt-4 grid gap-3">{content.studies.map(study=><li key={study.pubmedId??study.title} className="break-words text-sm leading-6 text-slate-600">{study.authors?`${study.authors} `:''}“{study.title}.” <em>{study.journal}</em> ({study.year}). {study.doi?`doi:${study.doi}. `:''}<a href={study.url} target="_blank" rel="noreferrer" className="font-semibold text-teal-800 underline">{t('source')}{study.pubmedId?` · ${t('pubmed',{id:study.pubmedId})}`:''}</a></li>)}</ol></details> : null}
    </ResearchSection>
  </>
}
