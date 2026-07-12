import { Activity, HeartPulse, MoonStar, Network, Ruler, TrendingDown, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { evidenceLabels, type RetatrutideResearchBenefit } from './retatrutideResearchData'

const icons: Record<RetatrutideResearchBenefit['icon'], LucideIcon> = {
  body: Ruler,
  glucose: TrendingDown,
  heart: HeartPulse,
  mobility: Activity,
  sleep: MoonStar,
  pathway: Network,
}

const pathwayRows = [
  { label: 'GLP-1', detail: 'Appetite & satiety', className: 'bg-teal-50 text-teal-900' },
  { label: 'GIP', detail: 'Nutrient-response signaling', className: 'bg-cyan-50 text-cyan-900' },
  { label: 'Glucagon', detail: 'Energy and metabolic signaling', className: 'bg-emerald-50 text-emerald-900' },
]

type ResearchOutcomeCardProps = {
  benefit: RetatrutideResearchBenefit
  size?: 'primary' | 'secondary'
  index?: number
  className?: string
}

export function ResearchOutcomeCard({ benefit, size = 'secondary', index = 0, className = '' }: ResearchOutcomeCardProps) {
  const Icon = icons[benefit.icon]
  const isPathway = benefit.icon === 'pathway'
  const metricSize = size === 'primary' ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'
  const padding = size === 'primary' ? 'p-7 sm:p-8' : 'p-6 sm:p-8'

  return (
    <motion.article
      id={`research-${benefit.id}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-teal-900/10 bg-white shadow-[0_18px_55px_rgba(7,23,36,0.06)] focus-within:ring-2 focus-within:ring-teal-600 ${padding} ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon size={21} aria-hidden="true" />
        </span>
        <span className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] ${benefit.evidenceLevel === 'ongoing' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
          {evidenceLabels[benefit.evidenceLevel]}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-2xl">{benefit.title}</h3>

      {benefit.metric ? (
        <p className={`mt-4 font-semibold leading-none tracking-[-0.05em] text-emerald-900 ${metricSize}`}>{benefit.metric}</p>
      ) : isPathway ? (
        <p className="mt-4 inline-flex w-fit items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-amber-800">
          Mechanism Research
        </p>
      ) : null}
      {benefit.metricLabel ? <p className="mt-2 text-sm font-semibold text-slate-700">{benefit.metricLabel}</p> : null}

      <p className="mt-4 text-sm leading-6 text-slate-600">{benefit.description}</p>

      {isPathway ? (
        <div className="mt-5 flex flex-col gap-2">
          {pathwayRows.map((row) => (
            <div key={row.label} className={`flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold ${row.className}`}>
              <span className="font-bold">{row.label}</span>
              <span className="text-right font-medium opacity-80">{row.detail}</span>
            </div>
          ))}
        </div>
      ) : null}

      {benefit.supportingStats ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {benefit.supportingStats.map((stat) => (
            <span key={stat} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">{stat}</span>
          ))}
        </div>
      ) : null}

      {benefit.trial ? <p className="mt-auto pt-6 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-slate-500">{benefit.trial}</p> : null}
    </motion.article>
  )
}
