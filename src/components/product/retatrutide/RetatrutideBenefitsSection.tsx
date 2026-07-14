import { FileText, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from '../../../i18n/LocaleContext'
import { ResearchOutcomeCard } from './ResearchOutcomeCard'
import { RetatrutideWaistResearchVisual } from './RetatrutideWaistResearchVisual'
import { RetatrutideResearchNetwork } from './RetatrutideResearchNetwork'
import { RetatrutideEditorialStatement } from './RetatrutideEditorialStatement'
import { RetatrutideReferences } from './RetatrutideReferences'
import { researchBenefits } from './retatrutideResearchData'

const bodyComposition = researchBenefits.find((benefit) => benefit.id === 'body-composition')!
const glucoseA1c = researchBenefits.find((benefit) => benefit.id === 'glucose-a1c')!
const cardiometabolic = researchBenefits.find((benefit) => benefit.id === 'cardiometabolic')!
const kneeMobility = researchBenefits.find((benefit) => benefit.id === 'knee-mobility')!
const sleepApnea = researchBenefits.find((benefit) => benefit.id === 'sleep-apnea')!
const appetiteSignaling = researchBenefits.find((benefit) => benefit.id === 'appetite-signaling')!

export function RetatrutideBenefitsSection() {
  const { t } = useTranslation('retatrutideResearch')
  return (
    <section id="retatrutide-full-research" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28" aria-label="Retatrutide research outcomes">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          <RetatrutideWaistResearchVisual metric={bodyComposition.metric!} duration={t('durationBodyComposition')} trial={t('trialBodyComposition')} className="lg:col-span-8" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-4 lg:flex lg:flex-col">
            <ResearchOutcomeCard benefit={glucoseA1c} size="primary" className="flex-1" />
            <ResearchOutcomeCard benefit={cardiometabolic} size="primary" index={1} className="flex-1" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <ResearchOutcomeCard benefit={kneeMobility} index={2} />
          <ResearchOutcomeCard benefit={sleepApnea} index={3} />
          <ResearchOutcomeCard benefit={appetiteSignaling} index={4} className="sm:col-span-2 lg:col-span-1" />
        </div>

        <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="relative mt-20 overflow-hidden rounded-[2.5rem] border border-white/80 bg-[radial-gradient(circle_at_82%_45%,rgba(34,211,238,.13),transparent_34%),radial-gradient(circle_at_8%_88%,rgba(16,185,129,.14),transparent_31%),linear-gradient(135deg,#f5fbf9_0%,#ffffff_43%,#edf9fb_100%)] p-6 shadow-[0_32px_100px_rgba(7,23,36,.1)] sm:p-10 lg:p-12 xl:p-14">
          <div aria-hidden="true" className="absolute inset-0 opacity-[.16] [background-image:radial-gradient(circle,rgba(15,118,110,.3)_1px,transparent_1.2px)] [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
          <header className="relative max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('interconnectedEyebrow')}</p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{t('interconnectedTitle')}</h2>
            <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{t('interconnectedBody')}</p>
            <p className="mt-3 text-sm font-semibold text-slate-500">{t('interconnectedNote')}</p>
          </header>
          <div className="relative mt-12 grid gap-12 lg:grid-cols-[minmax(18rem,.36fr)_minmax(0,.64fr)] lg:items-center xl:gap-14">
            <RetatrutideEditorialStatement />
            <RetatrutideResearchNetwork />
          </div>
          <p className="mt-4 border-t border-slate-900/8 pt-4 text-xs leading-5 text-slate-500">{t('interconnectedDisclaimer')}</p>
        </motion.div>

        <aside className="mt-12 rounded-[2rem] border border-slate-900/8 bg-white p-6 shadow-[0_20px_65px_rgba(7,23,36,.06)] sm:p-8" aria-labelledby="understanding-research-title">
          <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><ShieldCheck size={20} aria-hidden="true" /></span><div><h2 id="understanding-research-title" className="text-2xl font-semibold tracking-[-0.035em]">{t('understandingResearchTitle')}</h2><p className="mt-3 max-w-5xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{t('understandingResearchBody')}</p><p className="mt-3 text-sm leading-6 text-slate-500">{t('understandingResearchNote')}</p><a href="#retatrutide-references" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-800 underline-offset-4 hover:underline"><FileText size={15} aria-hidden="true" />{t('viewStudyReferences')}</a></div></div>
        </aside>
        <RetatrutideReferences />
      </div>
    </section>
  )
}
