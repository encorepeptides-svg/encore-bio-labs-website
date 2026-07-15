import { ExternalLink, Info, Table2 } from 'lucide-react'
import { useRef, useState, type ToggleEvent } from 'react'
import { sourceById, triumphOne, type TriumphArm } from '../../data/retatrutideClinicalData'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { track } from '../../lib/analytics'

type Metric = 'averageWeightReduction' | 'reachedThirtyPercent'

const tolerabilityRows = [
  'nausea',
  'diarrhea',
  'constipation',
  'vomiting',
  'discontinuedForAdverseEvents',
] as const

function localizedArmLabel(arm: TriumphArm, locale: 'en' | 'es') {
  return arm.id === 'placebo' && locale === 'es' ? 'Placebo' : arm.label
}

export function RetatrutideDataExplorer() {
  const { locale } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const [metric, setMetric] = useState<Metric>('averageWeightReduction')
  const tolerabilityTracked = useRef(false)
  const source = sourceById(triumphOne.sourceId)
  const max = metric === 'averageWeightReduction' ? 30 : 50

  function selectMetric(next: Metric) {
    setMetric(next)
    track('triumph_chart_toggle', { metric: next, locale })
  }

  function handleTolerabilityToggle(event: ToggleEvent<HTMLDetailsElement>) {
    if (!event.currentTarget.open || tolerabilityTracked.current) return
    tolerabilityTracked.current = true
    track('tolerability_panel_open', { trial: triumphOne.trialIdentifier, locale })
  }

  return (
    <section id="triumph-data" className="scroll-mt-24 bg-[#071724] px-5 py-16 text-white sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">{t('dataEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] sm:text-5xl">{t('dataTitle')}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t('dataDescription')}</p>
        </div>

        <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <div className="rounded-[2rem] border border-white/12 bg-white/[0.07] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] sm:p-7">
            <div role="group" aria-label={t('dataTitle')} className="inline-grid w-full grid-cols-2 rounded-full border border-white/12 bg-black/20 p-1 sm:w-auto">
              {([
                ['averageWeightReduction', 'averageReductionTab'],
                ['reachedThirtyPercent', 'thirtyPercentTab'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={metric === value}
                  onClick={() => selectMetric(value)}
                  className={`min-h-11 rounded-full px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-300/30 sm:text-sm ${metric === value ? 'bg-[#28e0c1] text-[#071724]' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
                >
                  {t(label)}
                </button>
              ))}
            </div>

            <h3 className="mt-8 max-w-3xl text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
              {t(metric === 'averageWeightReduction' ? 'averageReductionTitle' : 'thirtyPercentTitle')}
            </h3>

            <div className="mt-8 grid gap-5" role="img" aria-label={t(metric === 'averageWeightReduction' ? 'averageReductionTitle' : 'thirtyPercentTitle')}>
              {triumphOne.arms.map((arm) => {
                const value = arm[metric]
                const label = localizedArmLabel(arm, locale)
                return (
                  <div key={arm.id}>
                    <div className="mb-2 flex items-end justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-200">{label}</span>
                      <strong className="text-2xl tracking-[-0.04em] text-white">{value.toFixed(1)}%</strong>
                    </div>
                    <div
                      className="h-4 overflow-hidden rounded-full bg-white/10"
                      role="meter"
                      aria-valuemin={0}
                      aria-valuemax={max}
                      aria-valuenow={value}
                      aria-label={t(metric === 'averageWeightReduction' ? 'chartAccessibleValue' : 'chartAccessibleReached', { arm: label, value: value.toFixed(1) })}
                    >
                      <span
                        className={`block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${arm.id === 'placebo' ? 'bg-slate-400' : 'bg-gradient-to-r from-teal-400 to-cyan-300'}`}
                        style={{ width: `${(value / max) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <details className="group mt-8 rounded-2xl border border-white/10 bg-black/15 p-4">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-bold text-teal-100">
                <Table2 size={17} aria-hidden="true" />{t('showTable')}
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <caption className="sr-only">{t('dataTableLabel')}</caption>
                  <thead className="border-b border-white/15 text-slate-300">
                    <tr>
                      <th scope="col" className="px-3 py-3 font-semibold">{t('armColumn')}</th>
                      <th scope="col" className="px-3 py-3 font-semibold">{t('averageColumn')}</th>
                      <th scope="col" className="px-3 py-3 font-semibold">{t('thresholdColumn')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {triumphOne.arms.map((arm) => (
                      <tr key={arm.id}>
                        <th scope="row" className="px-3 py-3 font-semibold text-white">{localizedArmLabel(arm, locale)}</th>
                        <td className="px-3 py-3 text-slate-200">{arm.averageWeightReduction.toFixed(1)}%</td>
                        <td className="px-3 py-3 text-slate-200">{arm.reachedThirtyPercent.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>

            {source ? (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('triumph_chart_source_open', { source: source.id, locale })}
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal-200 underline decoration-teal-500/70 underline-offset-4 transition hover:text-white"
              >
                {t('sourceLink')}<ExternalLink size={15} aria-hidden="true" />
              </a>
            ) : null}
          </div>

          <aside className="rounded-[2rem] border border-teal-200/15 bg-[#0c2b3a] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.18)] sm:p-7" aria-label={t('reportingLabel')}>
            <dl className="grid gap-5">
              <div><dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-200">{t('phaseLabel')}</dt><dd className="mt-1 text-xl font-semibold text-white">{locale === 'es' ? 'Fase 3' : triumphOne.phase}</dd></div>
              <div><dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-200">{t('participantLabel')}</dt><dd className="mt-1 text-xl font-semibold text-white">{new Intl.NumberFormat(locale).format(triumphOne.participantsRandomized)}</dd></div>
              <div><dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-200">{t('durationLabel')}</dt><dd className="mt-1 text-xl font-semibold text-white">{t('durationValue')}</dd></div>
              <div><dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-200">{t('populationLabel')}</dt><dd className="mt-1 text-sm leading-6 text-slate-200">{locale === 'es' ? 'Adultos con obesidad o sobrepeso y al menos una comorbilidad relacionada con el peso, sin diabetes' : triumphOne.population}</dd></div>
              <div><dt className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-teal-200">{t('reportingLabel')}</dt><dd className="mt-1 text-sm font-semibold leading-6 text-slate-100">{t('sponsorTopline')}</dd></div>
            </dl>
          </aside>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-amber-200/25 bg-amber-100/10 p-5 text-sm font-semibold leading-6 text-amber-50 sm:p-6">
          <Info size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-200" />
          <p>{t('dataDisclosure')}</p>
        </div>

        <details onToggle={handleTolerabilityToggle} className="group mt-6 rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-5 sm:p-7">
          <summary className="cursor-pointer list-none pr-8 text-xl font-semibold tracking-[-0.025em] text-white marker:hidden sm:text-2xl">
            {t('tolerabilitySummary')}
            <span className="mt-3 block text-sm font-normal leading-6 text-slate-300">{t('tolerabilityIntro')}</span>
          </summary>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <caption className="sr-only">{t('tolerabilityTableLabel')}</caption>
              <thead className="border-b border-white/15 text-slate-300">
                <tr>
                  <th scope="col" className="px-3 py-3">{t('eventColumn')}</th>
                  {triumphOne.arms.map((arm) => <th key={arm.id} scope="col" className="px-3 py-3">{localizedArmLabel(arm, locale)}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {tolerabilityRows.map((row) => (
                  <tr key={row}>
                    <th scope="row" className="px-3 py-3 font-semibold text-white">{t(row)}</th>
                    {triumphOne.arms.map((arm) => <td key={arm.id} className="px-3 py-3 text-slate-200">{arm.tolerability[row].toFixed(1)}%</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-xs font-semibold leading-5 text-slate-300">{t('tolerabilityNotice')}</p>
        </details>
      </div>
    </section>
  )
}
