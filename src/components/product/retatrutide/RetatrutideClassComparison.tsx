import { ArrowDown, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from '../../../i18n/LocaleContext'
import { cn } from '../../../lib/utils'

/**
 * Single / dual / triple agonist comparison.
 *
 * Sourcing note, because these numbers sit next to competitor brand names:
 * the semaglutide and tirzepatide figures are both from SURMOUNT-5 (NEJM 2025),
 * a genuine head-to-head — 751 adults, 72 weeks, maximum tolerated dose. The
 * retatrutide figure is TRIUMPH-1 (Lilly, 21 May 2026), a separate trial. That
 * asymmetry is stated in the footnote rather than glossed over.
 */
type Column = {
  nameKey: string
  classKey: string
  metricKey: string
  noteKey: string
  receptors: [boolean, boolean, boolean]
  flagship?: boolean
}

const columns: Column[] = [
  { nameKey: 'classCompareSemaName', classKey: 'classCompareSemaClass', metricKey: 'classCompareSemaMetric', noteKey: 'classCompareSemaNote', receptors: [true, false, false] },
  { nameKey: 'classCompareTirzeName', classKey: 'classCompareTirzeClass', metricKey: 'classCompareTirzeMetric', noteKey: 'classCompareTirzeNote', receptors: [true, true, false] },
  { nameKey: 'classCompareRetaName', classKey: 'classCompareRetaClass', metricKey: 'classCompareRetaMetric', noteKey: 'classCompareRetaNote', receptors: [true, true, true], flagship: true },
]

const receptorKeys = ['classCompareReceptorGlp1', 'classCompareReceptorGip', 'classCompareReceptorGcg'] as const

export function RetatrutideClassComparison() {
  const { t } = useTranslation('retatrutideCategory')

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24" aria-labelledby="retatrutide-comparison-title">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{t('classCompareEyebrow')}</p>
          <h2 id="retatrutide-comparison-title" className="mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('classCompareTitle')}</h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{t('classCompareDescription')}</p>
        </div>

        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {columns.map((column, index) => (
            <motion.article
              key={column.nameKey}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={cn(
                'relative flex flex-col rounded-[1.75rem] border p-6 sm:p-7',
                column.flagship
                  ? 'border-teal-700/45 bg-[linear-gradient(165deg,#f0fdfa_0%,#ffffff_55%)] shadow-[0_28px_80px_rgba(13,148,136,0.16)] lg:scale-[1.035]'
                  : 'border-slate-900/8 bg-white shadow-[0_20px_55px_rgba(7,23,36,0.07)]',
              )}
            >
              {column.flagship ? (
                <span className="absolute -top-3 left-7 rounded-full bg-[#071724] px-3 py-1.5 text-[0.63rem] font-extrabold uppercase tracking-[0.16em] text-teal-300">
                  {t('classCompareFlag')}
                </span>
              ) : null}

              <p className="text-2xl font-semibold tracking-[-0.045em] text-[#071724]">{t(column.nameKey)}</p>
              <p className={cn('mt-1.5 text-xs font-bold uppercase tracking-[0.1em]', column.flagship ? 'text-teal-700' : 'text-slate-500')}>{t(column.classKey)}</p>

              <ul className="my-6 grid gap-2.5 border-y border-slate-900/8 py-5">
                {receptorKeys.map((receptorKey, receptorIndex) => {
                  const active = column.receptors[receptorIndex]
                  return (
                    <li key={receptorKey} className={cn('flex items-center gap-2.5 text-sm', active ? 'text-slate-700' : 'text-slate-300')}>
                      <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full', active ? 'bg-teal-100 text-emerald-800' : 'bg-slate-100 text-slate-300')}>
                        {active ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <X size={12} strokeWidth={3} aria-hidden="true" />}
                      </span>
                      {t(receptorKey)}
                    </li>
                  )
                })}
              </ul>

              <div className="mt-auto">
                <p className={cn(
                  'font-semibold leading-none tracking-[-0.06em]',
                  column.flagship
                    ? 'bg-gradient-to-r from-emerald-800 to-teal-500 bg-clip-text text-[3.4rem] text-transparent'
                    : 'text-[2.75rem] text-[#071724]',
                )}>
                  {t(column.metricKey)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t(column.noteKey)}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 border-t border-slate-900/8 pt-5 text-xs leading-6 text-slate-500">
          {t('classCompareSourceNote')}{' '}
          <a href="#retatrutide-references" className="inline-flex items-center gap-1.5 font-semibold text-teal-800 underline-offset-4 hover:underline">
            {t('classCompareSourceCta')}
            <ArrowDown size={13} aria-hidden="true" />
          </a>
        </p>
      </div>
    </section>
  )
}
