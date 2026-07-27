import { ArrowUpRight, Beaker, CircleHelp, FileSearch, Microscope, ShieldAlert, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { EvidenceTone, ProductConversionLocaleContent } from '../../data/productConversionContent'

const evidenceToneStyles: Record<EvidenceTone, string> = {
  'human-trials': 'border-emerald-300/35 bg-emerald-400/12 text-emerald-100',
  preclinical: 'border-amber-300/35 bg-amber-300/12 text-amber-100',
  'early-human': 'border-cyan-300/35 bg-cyan-300/12 text-cyan-100',
}

const rowIcons = [FileSearch, Microscope, CircleHelp, ShieldAlert]

export function ProductInterestSection({ copy }: { copy: ProductConversionLocaleContent }) {
  const reducedMotion = useReducedMotion()

  return (
    <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:py-20" aria-labelledby="product-interest-heading">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{copy.interests.eyebrow}</p>
          <h2 id="product-interest-heading" className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl lg:text-5xl">{copy.interests.heading}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{copy.interests.body}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {copy.interests.cards.map((card, index) => (
            <motion.article
              key={card.question}
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : index * 0.06 }}
              whileHover={reducedMotion ? undefined : { y: -5 }}
              className="rounded-[1.6rem] border border-slate-900/10 bg-[#f8fafc] p-6 shadow-[0_16px_46px_rgba(7,23,36,0.055)]"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800"><Sparkles size={17} aria-hidden="true" /></span>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-[#071724]">{card.question}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.answer}</p>
            </motion.article>
          ))}
        </div>

        <p className="mt-5 rounded-2xl border border-slate-900/8 bg-slate-50 px-5 py-4 text-xs leading-5 text-slate-500">{copy.interests.socialContext}</p>
      </div>
    </section>
  )
}

export function ProductEvidenceSnapshot({
  copy,
  tone,
}: {
  copy: ProductConversionLocaleContent
  tone: EvidenceTone
}) {
  return (
    <section id="product-evidence" className="scroll-mt-20 bg-[#071724] px-5 py-12 text-white sm:px-8 sm:py-16 lg:py-20" aria-labelledby="product-evidence-heading">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#71f0db]">{copy.evidence.eyebrow}</p>
            <h2 id="product-evidence-heading" className="mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">{copy.evidence.heading}</h2>
            <span className={`mt-5 inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] ${evidenceToneStyles[tone]}`}>
              {copy.evidence.levelLabel}
            </span>
            <p className="mt-5 text-base leading-7 text-slate-300">{copy.evidence.summary}</p>
            <p className="mt-5 rounded-2xl border border-amber-200/20 bg-amber-200/8 p-4 text-sm font-semibold leading-6 text-amber-100">{copy.evidence.caveat}</p>
          </div>

          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.evidence.rows.map((row, index) => {
                const Icon = rowIcons[index] ?? Beaker
                return (
                  <article key={row.label} className="rounded-[1.4rem] border border-white/12 bg-white/[0.055] p-5 backdrop-blur">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#28e0c1]/12 text-[#71f0db]"><Icon size={17} aria-hidden="true" /></span>
                    <h3 className="mt-4 text-sm font-bold uppercase tracking-[0.12em] text-white">{row.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{row.body}</p>
                  </article>
                )
              })}
            </div>

            <details className="group mt-4 rounded-[1.4rem] border border-white/12 bg-white/[0.045] p-5">
              <summary className="cursor-pointer list-none font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#71f0db] [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {copy.evidence.technicalSummaryLabel}
                  <span aria-hidden="true" className="text-[#71f0db] transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                </span>
              </summary>
              <ul className="mt-4 grid gap-3 border-t border-white/10 pt-4">
                {copy.evidence.technicalSummary.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[#71f0db]" />
                    {item}
                  </li>
                ))}
              </ul>
            </details>

            <div className="mt-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-slate-400">{copy.evidence.sourcesLabel}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {copy.evidence.sources.map((source) => (
                  <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#71f0db]/60 hover:bg-[#28e0c1]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#71f0db]">
                    {source.label}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProductResearchOverview({ copy }: { copy: ProductConversionLocaleContent }) {
  return (
    <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:py-20" aria-labelledby="product-research-overview-heading">
      <div className="mx-auto grid max-w-[88rem] gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{copy.overview.eyebrow}</p>
          <h2 id="product-research-overview-heading" className="mt-3 text-3xl font-semibold leading-[1.04] tracking-[-0.045em] text-[#071724] sm:text-4xl">{copy.overview.heading}</h2>
        </div>
        <div className="rounded-[1.6rem] border border-slate-900/10 bg-[#f8fafc] p-6 shadow-[0_18px_50px_rgba(7,23,36,0.05)] sm:p-8">
          {copy.overview.paragraphs.map((paragraph, index) => (
            <p key={paragraph} className={`${index ? 'mt-5' : ''} text-base leading-7 text-slate-600`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
