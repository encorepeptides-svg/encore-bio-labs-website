import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from '../../../i18n/LocaleContext'

export function RetatrutideEditorialStatement() {
  const reducedMotion = useReducedMotion()
  const { t } = useTranslation('retatrutideResearch')

  return (
    <motion.aside
      initial={reducedMotion ? false : { opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65 }}
      className="relative max-w-[29rem] border-l-2 border-emerald-600/70 py-3 pl-6 sm:pl-8 lg:py-6"
      aria-labelledby="retatrutide-generational-advance"
    >
      <div aria-hidden="true" className="absolute -left-20 top-1/3 size-56 rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="relative">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-emerald-800">{t('editorialEyebrow')}</p>
        <h3 id="retatrutide-generational-advance" className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#071724] sm:text-4xl xl:text-[2.7rem]">
          {t('editorialHeadlinePrefix')} <span className="text-emerald-800">{t('editorialHeadlineHighlight')}</span> {t('editorialHeadlineSuffix')}
        </h3>
        <p className="mt-6 text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">{t('editorialBody')}</p>
        <p className="mt-6 text-xs leading-5 text-slate-500">{t('editorialDisclaimer')}</p>
      </div>
    </motion.aside>
  )
}
