import { BadgeCheck, FileCheck2, Microscope } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'

const qualityItemKeys = [
  { icon: Microscope, titleKey: 'qualityItem1Title', copyKey: 'qualityItem1Copy' },
  { icon: FileCheck2, titleKey: 'qualityItem2Title', copyKey: 'qualityItem2Copy' },
  { icon: BadgeCheck, titleKey: 'qualityItem3Title', copyKey: 'qualityItem3Copy' },
]

export function RetatrutideQualitySection() {
  const { path } = useLocale()
  const { t } = useTranslation('retatrutideResearch')
  return <section className="px-5 py-20 sm:px-8 lg:py-28" aria-labelledby="retatrutide-quality-title"><div className="mx-auto max-w-[88rem]"><p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('qualityEyebrow')}</p><h2 id="retatrutide-quality-title" className="mt-4 text-center text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{t('qualityTitle')}</h2><div className="mt-10 grid gap-4 md:grid-cols-3">{qualityItemKeys.map((item,index)=><motion.article key={item.titleKey} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.06}} className="rounded-[1.5rem] bg-white p-7 shadow-[0_20px_60px_rgba(7,23,36,.06)]"><item.icon size={25} className="text-teal-700" aria-hidden="true"/><h3 className="mt-5 text-xl font-semibold">{t(item.titleKey)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{t(item.copyKey)}</p></motion.article>)}</div><div className="mt-8 text-center"><a href={path('/quality')} className="inline-flex min-h-12 items-center rounded-full border border-teal-900/12 bg-white px-6 text-sm font-semibold text-teal-900 transition hover:-translate-y-0.5 hover:bg-teal-50">{t('reviewQualityStandards')}</a></div></div></section>
}
