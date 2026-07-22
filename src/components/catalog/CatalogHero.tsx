import { ArrowDown, ArrowRight, FlaskConical } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ENCORE_COMPLETE_KIT_CATALOG_HERO_IMAGE,
  ENCORE_COMPLETE_KIT_IMAGE_HEIGHT,
  ENCORE_COMPLETE_KIT_IMAGE_WIDTH,
} from '../../data/kitMedia'
import { useTranslation } from '../../i18n/LocaleContext'

export function CatalogHero() {
  const prefersReducedMotion = useReducedMotion()
  const { t } = useTranslation('catalog')

  const enter = (delay: number) =>
    prefersReducedMotion
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: 'easeOut' as const, delay },
        }

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] px-5 py-8 sm:px-8 sm:py-10 lg:py-11">
      <div className="molecule-field opacity-[0.08]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-6rem] top-[-5rem] size-[24rem] rounded-full bg-teal-200/30 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[88rem] items-center gap-7 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-12">
        {/* Left: compact editorial copy */}
        <div>
          <motion.span
            {...enter(0)}
            className="inline-flex items-center gap-2 rounded-full border border-teal-700/15 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_28px_rgba(7,23,36,0.05)] backdrop-blur-xl"
          >
            <FlaskConical size={14} aria-hidden="true" />
            {t('heroEyebrow')}
          </motion.span>

          <motion.h1
            {...enter(0.06)}
            className="mt-5 text-[clamp(2.35rem,1.9rem+1.8vw,4.15rem)] font-semibold leading-[1.01] tracking-[-0.05em] text-[#071724]"
          >
            {t('heroTitle').split('\n').map((line) => (
              <span key={line} className="block md:whitespace-nowrap">{line}</span>
            ))}
          </motion.h1>

          <motion.p {...enter(0.12)} className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {t('heroSupporting')}
          </motion.p>

          <motion.div {...enter(0.18)} className="mt-6 flex gap-3">
            <a
              href="#catalog-products"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#071724] px-4 py-3 text-center text-xs font-semibold text-white shadow-[0_16px_40px_rgba(7,23,36,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:px-6 sm:text-sm"
            >
              {t('heroPrimaryCta')}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              href="#catalog-categories"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-slate-900/15 bg-white px-4 py-3 text-center text-xs font-semibold text-[#071724] transition duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:px-6 sm:text-sm"
            >
              {t('heroSecondaryCta')}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </motion.div>
          <motion.p {...enter(0.22)} className="mt-4 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
            {t('heroReassurance')}
          </motion.p>
        </div>

        {/* Right: premium kit visual */}
        <motion.div {...enter(0.14)} className="relative mx-auto w-full max-w-[42rem] md:max-w-none">
          <div className="relative mx-auto aspect-video max-h-[28rem] w-full overflow-hidden rounded-[1.75rem] border border-teal-900/10 bg-white shadow-[0_24px_60px_rgba(7,23,36,0.10)]">
            <img
              src={ENCORE_COMPLETE_KIT_CATALOG_HERO_IMAGE}
              alt={t('heroVisualAlt')}
              width={ENCORE_COMPLETE_KIT_IMAGE_WIDTH}
              height={ENCORE_COMPLETE_KIT_IMAGE_HEIGHT}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative h-full w-full object-cover object-center"
              sizes="(min-width: 1280px) 48rem, (min-width: 768px) 54vw, 100vw"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
