import { Activity, Gauge, HeartPulse, MoonStar, Ruler, Scale, TrendingDown } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { RetatrutideResearchOutcome } from './retatrutideResearchData'

const icons = {
  weight: Scale,
  glucose: TrendingDown,
  waist: Ruler,
  lipid: HeartPulse,
  pressure: Gauge,
  mobility: Activity,
  sleep: MoonStar,
}

export function RetatrutideResearchNode({ outcome, index, desktop = false }: { outcome: RetatrutideResearchOutcome; index: number; desktop?: boolean }) {
  const Icon = icons[outcome.icon]
  const reducedMotion = useReducedMotion()
  return (
    <motion.article
      aria-label={`${outcome.label}: ${outcome.metric}, reported in Phase 3 research`}
      initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: reducedMotion ? 0 : index * 0.07 }}
      animate={reducedMotion || !desktop ? undefined : { translateY: [0, index % 2 ? -3 : 3, 0] }}
      className={`${desktop ? 'absolute' : `relative ${index % 2 ? 'ml-8' : 'mr-8'}`} rounded-[1.35rem] border border-white/80 bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_18px_50px_rgba(7,23,36,.1)] backdrop-blur-xl ${outcome.size === 'prominent' ? 'w-[12rem]' : 'w-[10.75rem]'}`}
      style={desktop ? { left: `${outcome.position.x}%`, top: `${outcome.position.y}%`, translate: '-50% -50%' } : undefined}
    >
      <div className="flex items-start justify-between gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Icon size={16} aria-hidden="true" /></span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] text-emerald-800">{outcome.evidence}</span></div>
      <p className="mt-3 text-[1.55rem] font-semibold leading-none tracking-[-0.055em] text-emerald-950">{outcome.metric}</p>
      <h3 className="mt-2 text-xs font-semibold leading-5 text-slate-700">{outcome.label}</h3>
    </motion.article>
  )
}
