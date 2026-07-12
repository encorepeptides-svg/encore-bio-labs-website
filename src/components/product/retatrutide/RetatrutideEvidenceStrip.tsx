import { ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { phaseThreeStats } from './retatrutideResearchData'

export function RetatrutideEvidenceStrip() {
  return (
    <section className="px-5 pb-12 sm:px-8 lg:pb-16" aria-labelledby="phase-three-evidence-title">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] border border-slate-900/8 bg-white px-5 py-8 shadow-[0_24px_75px_rgba(7,23,36,0.07)] sm:px-8 lg:px-10">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(13,148,136,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,.14)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Phase 3 headline results</p><h2 id="phase-three-evidence-title" className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Evidence at a glance</h2></div><a href="#retatrutide-full-research" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-800 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">Explore the research <ArrowDown size={15} aria-hidden="true" /></a></div>
        <div className="relative mt-7 grid gap-6 md:grid-cols-3 md:gap-0">
          {phaseThreeStats.map((stat) => <article key={stat.metric} className="border-b border-slate-900/8 pb-6 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:pb-0 md:first:pl-0 md:last:border-r-0"><p className="bg-gradient-to-r from-emerald-800 to-teal-500 bg-clip-text text-5xl font-semibold tracking-[-0.065em] text-transparent sm:text-6xl">{stat.metric}</p><h3 className="mt-3 text-lg font-semibold leading-6">{stat.label}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{stat.note}</p></article>)}
        </div>
        <p className="relative mt-7 border-t border-slate-900/8 pt-5 text-xs leading-5 text-slate-500">Investigational Phase 3 findings reported by Eli Lilly. Trial populations, durations and outcomes vary. These findings do not establish expected individual results.</p>
      </motion.div>
    </section>
  )
}
