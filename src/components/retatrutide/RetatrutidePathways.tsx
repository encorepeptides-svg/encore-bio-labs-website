import { Info, Network } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'

type RetatrutidePathwaysProps = {
  id?: string
  compact?: boolean
}

const pathways = [
  { key: 'gip', accent: 'from-cyan-400 to-cyan-200' },
  { key: 'glp1', accent: 'from-teal-400 to-emerald-200' },
  { key: 'glucagon', accent: 'from-indigo-400 to-violet-300' },
] as const

export function RetatrutidePathways({ id = 'triple-pathways', compact = false }: RetatrutidePathwaysProps) {
  const { t } = useTranslation('retatrutideCategory')

  return (
    <section id={id} className={`scroll-mt-24 bg-white px-5 sm:px-8 ${compact ? 'py-14 sm:py-16' : 'py-16 sm:py-20 lg:py-24'}`}>
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{t('pathwaysEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('pathwaysTitle')}</h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{t('pathwaysDescription')}</p>
        </div>

        <div className="relative mt-10 grid gap-5 lg:grid-cols-3">
          <span className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-cyan-300 via-teal-400 to-violet-300 lg:block" aria-hidden="true" />
          {pathways.map((pathway, index) => (
            <article key={pathway.key} className="relative overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-[#F8FAFC] p-6 shadow-[0_20px_55px_rgba(7,23,36,0.07)] sm:p-7">
              <span className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${pathway.accent} text-[#071724] shadow-lg`}>
                <Network size={22} aria-hidden="true" />
              </span>
              <span className="absolute right-5 top-5 text-5xl font-semibold tracking-[-0.06em] text-slate-200">0{index + 1}</span>
              <h3 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-[#071724]">{t(`${pathway.key}Title`)}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{t(`${pathway.key}Body`)}</p>
              <details className="group mt-5 rounded-xl border border-slate-900/8 bg-white p-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold text-teal-800">
                  <Info size={14} aria-hidden="true" />{t('definitionLabel')}
                </summary>
                <p className="mt-3 text-xs leading-5 text-slate-600">{t(`${pathway.key}Definition`)}</p>
              </details>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
