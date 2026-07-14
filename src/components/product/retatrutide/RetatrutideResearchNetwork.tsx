import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from '../../../i18n/LocaleContext'
import { RetatrutideResearchNode } from './RetatrutideResearchNode'
import { interconnectedOutcomes } from './retatrutideResearchData'

function connectionPath(xPercent: number, yPercent: number, index: number) {
  const x = xPercent * 10
  const y = yPercent * 7.2
  const midpointX = (500 + x) / 2
  const midpointY = (360 + y) / 2
  const curve = index % 2 ? 42 : -42
  return `M 500 360 Q ${midpointX + curve} ${midpointY - curve / 2} ${x} ${y}`
}

export function RetatrutideResearchNetwork() {
  const reducedMotion = useReducedMotion()
  const { t } = useTranslation('retatrutideResearch')
  return (
    <div className="min-w-0">
        <div data-research-network="orbital" className="relative hidden min-h-[46rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_50%_48%,rgba(20,184,166,.2),transparent_23%),radial-gradient(circle_at_80%_20%,rgba(103,232,249,.13),transparent_28%),linear-gradient(145deg,rgba(255,255,255,.86),rgba(228,248,244,.64)_55%,rgba(229,246,250,.76))] shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_24px_70px_rgba(7,23,36,.08)] min-[900px]:block">
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle,rgba(100,116,139,.35)_1px,transparent_1.2px)] [background-size:28px_28px]" />
          <svg aria-hidden="true" viewBox="0 0 1000 720" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <defs><linearGradient id="network-path" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0f766e" stopOpacity=".18"/><stop offset=".5" stopColor="#14b8a6" stopOpacity=".7"/><stop offset="1" stopColor="#67e8f9" stopOpacity=".22"/></linearGradient></defs>
            <motion.ellipse cx="500" cy="360" rx="315" ry="250" fill="none" stroke="rgba(13,148,136,.18)" strokeWidth="1.5" strokeDasharray="7 11" animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 140, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '500px 360px' }} />
            <motion.ellipse cx="500" cy="360" rx="205" ry="160" fill="none" stroke="rgba(6,182,212,.15)" strokeWidth="1.2" animate={reducedMotion ? undefined : { rotate: -360 }} transition={{ duration: 180, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '500px 360px' }} />
            {interconnectedOutcomes.map((outcome,index)=>{const d=connectionPath(outcome.position.x,outcome.position.y,index);return <g key={outcome.id}><motion.path d={d} fill="none" stroke="url(#network-path)" strokeWidth="1.8" initial={reducedMotion?false:{pathLength:0,opacity:.2}} whileInView={{pathLength:1,opacity:1}} viewport={{once:true}} transition={{duration:1,delay:reducedMotion?0:index*.08}}/><motion.path d={d} fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="3" strokeDasharray="2 42" animate={reducedMotion?undefined:{strokeDashoffset:[0,-88]}} transition={{duration:8+index,repeat:Infinity,ease:'linear'}}/></g>})}
          </svg>

          <motion.div initial={reducedMotion?false:{opacity:0,scale:.94}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:.65}} className="absolute left-1/2 top-1/2 flex size-56 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-emerald-300/25 bg-[radial-gradient(circle_at_35%_25%,#18374a,#071724_62%)] p-7 text-center text-white shadow-[0_0_0_15px_rgba(20,184,166,.06),0_30px_90px_rgba(7,23,36,.28)]">
            <div aria-hidden="true" className="absolute inset-4 rounded-full border border-cyan-300/12" />
            <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-teal-200">{t('networkBadge')}</p><p className="relative mt-2 text-2xl font-semibold leading-tight tracking-[-0.04em]">{t('networkTitle')}</p><p className="relative mt-3 text-[0.65rem] font-semibold tracking-[0.08em] text-slate-300">{t('networkPathways')}</p>
          </motion.div>
          {interconnectedOutcomes.map((outcome,index)=><RetatrutideResearchNode key={outcome.id} outcome={outcome} index={index} desktop />)}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">{t('networkFootnote')}</p>
        </div>

        <div data-research-network="vertical" className="relative min-[900px]:hidden">
          <div className="relative mx-auto flex size-48 flex-col items-center justify-center rounded-full bg-[#071724] p-6 text-center text-white shadow-[0_0_0_12px_rgba(20,184,166,.07),0_26px_70px_rgba(7,23,36,.22)]"><p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-teal-200">{t('networkBadge')}</p><p className="mt-2 text-xl font-semibold">{t('networkTitle')}</p><p className="mt-2 text-[0.6rem] text-slate-300">{t('networkPathways')}</p></div>
          <div aria-hidden="true" className="absolute bottom-4 left-1/2 top-44 w-px -translate-x-1/2 bg-gradient-to-b from-teal-400 via-cyan-200 to-transparent" />
          <div className="relative mt-10 grid gap-5">{interconnectedOutcomes.map((outcome,index)=><RetatrutideResearchNode key={outcome.id} outcome={outcome} index={index} />)}</div>
        </div>
    </div>
  )
}
