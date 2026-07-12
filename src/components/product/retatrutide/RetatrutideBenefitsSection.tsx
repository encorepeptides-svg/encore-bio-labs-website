import { FileText, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { ResearchOutcomeCard } from './ResearchOutcomeCard'
import { RetatrutideWaistResearchVisual } from './RetatrutideWaistResearchVisual'
import { RetatrutideResearchNetwork } from './RetatrutideResearchNetwork'
import { RetatrutideReferences } from './RetatrutideReferences'
import { researchBenefits } from './retatrutideResearchData'

const bodyComposition = researchBenefits.find((benefit) => benefit.id === 'body-composition')!
const glucoseA1c = researchBenefits.find((benefit) => benefit.id === 'glucose-a1c')!
const cardiometabolic = researchBenefits.find((benefit) => benefit.id === 'cardiometabolic')!
const kneeMobility = researchBenefits.find((benefit) => benefit.id === 'knee-mobility')!
const sleepApnea = researchBenefits.find((benefit) => benefit.id === 'sleep-apnea')!
const appetiteSignaling = researchBenefits.find((benefit) => benefit.id === 'appetite-signaling')!

export function RetatrutideBenefitsSection() {
  return (
    <section id="retatrutide-full-research" className="scroll-mt-24 px-5 py-20 sm:px-8 lg:py-28" aria-labelledby="beyond-weight-loss-title">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Multi-dimensional metabolic research</p>
        <h2 id="beyond-weight-loss-title" className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Researchers are studying more than weight loss.</h2>
        <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Retatrutide’s Phase 3 program is evaluating how a triple-pathway mechanism may influence multiple interconnected dimensions of metabolic health. The strongest public findings currently extend across body weight, glucose control, cardiovascular risk markers, sleep-disordered breathing and obesity-related mobility.</p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <RetatrutideWaistResearchVisual metric={bodyComposition.metric!} duration={bodyComposition.duration!} trial={bodyComposition.trial!} className="lg:col-span-8" />
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

        <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-20 rounded-[2.25rem] bg-gradient-to-br from-[#eefaf7] via-white to-[#edf8fb] p-6 shadow-[0_26px_85px_rgba(7,23,36,.07)] sm:p-10 lg:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Interconnected health</p>
          <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">One pathway of research. Multiple connected outcomes.</h2>
          <p className="mt-5 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Clinical development is examining whether targeting three hormone-receptor pathways within one molecule can influence several dimensions of metabolic disease at the same time.</p>
          <p className="mt-3 text-sm font-semibold text-slate-500">Phase 3 findings reported across obesity, diabetes, joint mobility and sleep-apnea research programs.</p>
          <RetatrutideResearchNetwork />
          <p className="mt-4 border-t border-slate-900/8 pt-4 text-xs leading-5 text-slate-500">Investigational findings shown are drawn from specific clinical-trial populations and do not establish expected individual outcomes.</p>
        </motion.div>

        <aside className="mt-12 rounded-[2rem] border border-slate-900/8 bg-white p-6 shadow-[0_20px_65px_rgba(7,23,36,.06)] sm:p-8" aria-labelledby="understanding-research-title">
          <div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><ShieldCheck size={20} aria-hidden="true" /></span><div><h2 id="understanding-research-title" className="text-2xl font-semibold tracking-[-0.035em]">Understanding the research</h2><p className="mt-3 max-w-5xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">Retatrutide is an investigational molecule under clinical development. It has not been approved by the U.S. Food and Drug Administration. The findings shown above come from specific clinical-trial populations and should not be interpreted as expected individual outcomes, medical advice or authorized treatment claims.</p><p className="mt-3 text-sm leading-6 text-slate-500">Encore Bio Labs materials are provided for research and educational context. Products are labeled for research use only.</p><a href="#retatrutide-references" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-800 underline-offset-4 hover:underline"><FileText size={15} aria-hidden="true" />View study references</a></div></div>
        </aside>
        <RetatrutideReferences />
      </div>
    </section>
  )
}
