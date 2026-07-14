import { motion, useReducedMotion } from 'framer-motion'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import waistResearchJourney from '../../../assets/images/research/retatrutide-waist-reduction-research-journey.png'
import waistResearchJourneyEs from '../../../assets/images/research/retatrutide-waist-reduction-research-journey-es.svg'

type RetatrutideWaistResearchVisualProps = {
  metric: string
  duration: string
  trial: string
  className?: string
}

export function RetatrutideWaistResearchVisual({ metric, duration, trial, className = '' }: RetatrutideWaistResearchVisualProps) {
  const reducedMotion = useReducedMotion()
  const { t } = useTranslation('retatrutideResearch')
  const { locale } = useLocale()
  const trialName = trial.split(' ·')[0]
  const metricWithPrefix = `${t('upToPrefix')} ${metric.replace(/^Up to /, '')}`.toLowerCase()

  return (
    <motion.article
      id="research-body-composition"
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65 }}
      className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-teal-900/10 bg-[linear-gradient(150deg,#ffffff_0%,#fbfdfd_45%,#eefaf7_100%)] shadow-[0_20px_60px_rgba(7,23,36,.08)] ${className}`}
    >
      <header className="px-6 pt-7 sm:px-8 sm:pt-8 lg:px-9 lg:pt-9">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700">{t('waistVisualEyebrow')}</p>
        <h3 className="mt-3 max-w-[46rem] text-3xl font-semibold leading-[1.03] tracking-[-.05em] text-[#071724] sm:text-4xl">{t('waistVisualTitle')}</h3>
        <p className="mt-4 max-w-[44rem] text-base leading-7 text-slate-600">
          {t('waistVisualBody')}
        </p>
      </header>

      <div className="mx-6 mt-7 border-t border-teal-900/8 pt-6 sm:mx-8 lg:mx-9">
        <p className="text-[.68rem] font-bold uppercase tracking-[.18em] text-teal-700">{t('waistVisualBodyCompLabel')}</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {t('waistVisualBodyCompCopy', { duration, trialName })}
        </p>
      </div>

      <figure className="mt-4 flex min-h-0 flex-1 items-center justify-center sm:mt-5">
        <img
          src={locale === 'es' ? waistResearchJourneyEs : waistResearchJourney}
          alt={t('waistVisualImageAlt', { metric: metricWithPrefix })}
          width="1672"
          height="941"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full object-contain lg:h-full"
        />
      </figure>

      <p className="border-t border-teal-900/8 px-6 py-4 text-left text-[.68rem] leading-5 text-slate-500 sm:px-8 lg:px-9">
        {t('waistVisualFootnote', { duration })}
      </p>
    </motion.article>
  )
}
