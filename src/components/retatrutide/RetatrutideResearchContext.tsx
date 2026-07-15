import { ArrowRight, Check, ExternalLink, FileCheck2, Info, X } from 'lucide-react'
import { type ReactNode } from 'react'
import {
  retatrutideDocumentation,
  retatrutideTimeline,
  sourceById,
  type ResearchDocumentationRecord,
} from '../../data/retatrutideClinicalData'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { track } from '../../lib/analytics'
import { RetatrutideDataExplorer } from '../category/RetatrutideDataExplorer'

function SectionShell({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20 lg:py-24 ${className}`}><div className="mx-auto max-w-[88rem]">{children}</div></section>
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{eyebrow}</p><h2 className="mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] text-[#071724] sm:text-5xl">{title}</h2>{description ? <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}</div>
}

function DocumentationFields({ record }: { record: ResearchDocumentationRecord }) {
  const { locale } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const fields = [
    ['batchId', record.batchId], ['testingDate', record.testingDate], ['laboratory', record.laboratory], ['method', record.method],
    ['purity', record.purity], ['hplcResult', record.hplcResult], ['massSpectrometryResult', record.massSpectrometryResult],
    ['storage', record.storage], ['version', record.version], ['lastVerified', record.lastVerified],
  ] as const

  return (
    <article className="rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_20px_55px_rgba(7,23,36,0.08)]">
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.filter(([, value]) => value.trim()).map(([key, value]) => <div key={key} className="rounded-2xl bg-slate-50 p-4"><dt className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-500">{t(key)}</dt><dd className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{value}</dd></div>)}
      </dl>
      {record.reportUrl ? <a href={record.reportUrl} target="_blank" rel="noreferrer" onClick={() => track('coa_document_open', { batchId: record.batchId, locale })} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">{t('openReport')}<ExternalLink size={15} aria-hidden="true" /></a> : null}
    </article>
  )
}

export function RetatrutideResearchContext() {
  const { locale, path } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const suggests = [1, 2, 3].map((index) => t(`suggests${index}`))
  const notEstablished = [1, 2, 3, 4, 5, 6].map((index) => t(`notEstablish${index}`))

  return (
    <>
      <RetatrutideDataExplorer />

      <SectionShell className="bg-[#eef4f3]">
        <SectionIntro eyebrow={t('meaningEyebrow')} title={t('meaningTitle')} />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="border-t-4 border-teal-500 bg-white p-6 shadow-[0_20px_55px_rgba(7,23,36,0.07)] sm:p-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800"><Check size={22} aria-hidden="true" /></span>
            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('suggestsTitle')}</h3>
            <ul className="mt-6 grid gap-4">{suggests.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700"><Check size={17} aria-hidden="true" className="mt-1 shrink-0 text-teal-600" />{item}</li>)}</ul>
          </article>
          <article className="border-t-4 border-amber-500 bg-[#fffaf0] p-6 shadow-[0_20px_55px_rgba(7,23,36,0.07)] sm:p-8">
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
            return <li key={`${item.date}-${item.labelKey}`} className="relative border border-slate-900/10 bg-[#F8FAFC] p-5 shadow-sm lg:min-h-52"><span className="absolute -left-[2.15rem] top-6 size-3 rounded-full bg-teal-500 ring-4 ring-white lg:-top-[2.45rem] lg:left-5" aria-hidden="true" /><time className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{date}</time><h3 className="mt-3 text-lg font-semibold leading-6 tracking-[-0.03em] text-[#071724]">{t(item.labelKey)}</h3>{source ? <a href={source.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 underline decoration-teal-300 underline-offset-4 hover:text-[#071724]">{t('timelineSource')}<ExternalLink size={13} aria-hidden="true" /></a> : null}</li>
          })}
        </ol>
      </SectionShell>

      <SectionShell id="research-documentation" className="bg-[#edf5f4]">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div><SectionIntro eyebrow={t('documentationEyebrow')} title={t('documentationTitle')} description={t('documentationDescription')} /><p className="mt-6 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500"><Info size={15} aria-hidden="true" className="mt-0.5 shrink-0" />{t('documentationDisclosure')}</p></div>
          <div className="grid gap-5">
            {retatrutideDocumentation.length ? retatrutideDocumentation.map((record) => <DocumentationFields key={record.batchId} record={record} />) : <div className="rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_60px_rgba(7,23,36,0.08)] sm:p-8"><span className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-800"><FileCheck2 size={22} aria-hidden="true" /></span><p className="mt-5 text-lg font-semibold leading-8 text-[#071724]">{t('documentationEmpty')}</p><a href={path('/intake?product=retatrutide&request=documentation')} onClick={() => track('retatrutide_documentation_click', { placement: 'product', locale })} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#071724] px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700">{t('documentationRequestCta')}<ArrowRight size={16} aria-hidden="true" /></a></div>}
          </div>
        </div>
      </SectionShell>
    </>
  )
}
