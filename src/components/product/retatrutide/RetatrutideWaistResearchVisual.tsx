import { motion, useReducedMotion } from 'framer-motion'
import waistResearchJourney from '../../../assets/images/research/retatrutide-waist-reduction-research-journey.png'

type RetatrutideWaistResearchVisualProps = {
  metric: string
  duration: string
  trial: string
  className?: string
}

export function RetatrutideWaistResearchVisual({ metric, duration, trial, className = '' }: RetatrutideWaistResearchVisualProps) {
  const reducedMotion = useReducedMotion()
  const trialName = trial.split(' ·')[0]

  return (
    <motion.article
      id="research-body-composition"
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65 }}
      className={`relative flex flex-col overflow-hidden rounded-[1.75rem] border border-teal-900/10 bg-[linear-gradient(150deg,#ffffff_0%,#fbfdfd_45%,#eefaf7_100%)] shadow-[0_20px_60px_rgba(7,23,36,.08)] ${className}`}
    >
      <header className="px-6 pt-6 sm:px-8 sm:pt-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">Body Composition Research</p>
        <h3 className="sr-only">Waist Reduction Research Journey</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Reported changes in waist circumference and body composition across the {duration} {trialName} research period.
        </p>
      </header>

      <div className="mt-5 flex-1 sm:mt-6">
        <img
          src={waistResearchJourney}
          alt={`Waist Reduction Research Journey infographic showing a Baseline through Week 80 progression, ${metric.toLowerCase()} average waist reduction reported, and body-weight, waist-circumference, and body-composition research markers from TRIUMPH-1.`}
          width="1672"
          height="941"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full object-contain"
        />
      </div>

      <p className="border-t border-teal-900/8 px-6 py-4 text-center text-xs leading-5 text-slate-500 sm:px-8">
        Research summary based on publicly reported clinical-trial data over {duration}. Reported findings reflect a specific clinical-trial population and do not establish expected individual outcomes.
      </p>
    </motion.article>
  )
}
