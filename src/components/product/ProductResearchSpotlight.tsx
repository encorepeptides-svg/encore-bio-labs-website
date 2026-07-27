import { Atom, Dna, ShieldCheck, TrendingUp, Zap } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ProductConversionLocaleContent } from '../../data/productConversionContent'
import type { Product } from '../../data/products'
import { ProductImage } from '../ProductImage'

const spotlightIcons = [Zap, ShieldCheck, Dna]
const spotlightRotations = [18, 138, 258] as const

export function ProductResearchSpotlight({
  product,
  copy,
}: {
  product: Product
  copy: ProductConversionLocaleContent
}) {
  const reducedMotion = useReducedMotion()
  const productName = product.name
  const trends = copy.trends

  if (!trends) return null

  return (
    <section
      className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:py-20"
      aria-labelledby="product-interest-heading"
      data-research-presentation="nad-spotlight"
      data-highlight-presentation="product-highlights"
    >
      <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2.2rem] border border-teal-950/10 bg-[linear-gradient(145deg,#ffffff_0%,#eef7f4_43%,#f8faf9_100%)] shadow-[0_35px_110px_rgba(7,23,36,0.13)] sm:rounded-[2.75rem]">
        <div className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-12 -top-12 size-72 rounded-full bg-cyan-200/45 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 left-[28%] size-80 rounded-full bg-teal-200/35 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute left-[38%] top-[18%] h-[30rem] w-28 -rotate-[22deg] bg-white/60 blur-3xl" aria-hidden="true" />
        <p className="pointer-events-none absolute -right-3 top-0 select-none text-[clamp(7rem,19vw,18rem)] font-semibold leading-none tracking-[-0.09em] text-white/70" aria-hidden="true">{productName}</p>

        <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:p-12 xl:p-16">
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-800/12 bg-white/80 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-teal-800">
                <TrendingUp size={14} aria-hidden="true" /> {trends.eyebrow}
              </span>
            </div>
            <h2 id="product-interest-heading" className="mt-5 max-w-2xl text-[clamp(2.35rem,5vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-[#071724]">{trends.heading}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">{trends.body}</p>

            <div className="relative mx-auto mt-8 aspect-square w-full max-w-[26rem]" aria-hidden="true">
              <div className="absolute inset-[2%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0%,rgba(207,245,237,0.48)_32%,rgba(255,255,255,0)_69%)]" />
              <div className="absolute inset-[9%] rounded-full border border-white/90 bg-white/20 shadow-[inset_0_0_60px_rgba(255,255,255,0.9),0_28px_90px_rgba(13,148,136,0.14)] backdrop-blur-[2px]" />
              <motion.div
                className="absolute inset-[5%] rounded-full border border-teal-800/14 shadow-[0_0_45px_rgba(13,148,136,0.08)]"
                animate={reducedMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 34, ease: 'linear', repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-[17%] rounded-full border border-dashed border-cyan-700/24"
                animate={reducedMotion ? undefined : { rotate: -360 }}
                transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
              />
              <div className="absolute inset-[27%] rounded-full border border-white bg-[radial-gradient(circle_at_38%_28%,#ffffff_0%,#d6f7ef_44%,#83d8ca_100%)] shadow-[0_26px_80px_rgba(15,118,110,0.28),inset_0_1px_0_rgba(255,255,255,0.95)]" />
              <div className="absolute inset-x-[24%] bottom-[9%] h-[13%] rounded-[50%] bg-teal-950/14 blur-xl" />
              <motion.div
                className="absolute inset-x-[27%] bottom-[12%] top-[7%] z-10"
                animate={reducedMotion ? undefined : { y: [0, -7, 0], rotate: [-0.8, 0.8, -0.8] }}
                transition={{ duration: 5.5, ease: 'easeInOut', repeat: Infinity }}
              >
                <ProductImage
                  product={product}
                  alt=""
                  loading="lazy"
                  sizes="(min-width: 1024px) 18vw, 52vw"
                  className="size-full object-contain drop-shadow-[0_30px_28px_rgba(7,23,36,0.3)]"
                />
              </motion.div>
              <div className="absolute bottom-[12%] left-[4%] z-20 rounded-full border border-white/90 bg-white/80 px-4 py-2 shadow-[0_14px_35px_rgba(7,23,36,0.12)] backdrop-blur-xl">
                <span className="text-sm font-semibold tracking-[-0.03em] text-[#071724]">{productName}</span>
              </div>
              {spotlightRotations.map((rotation, index) => (
                <span
                  key={rotation}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg) translateY(clamp(-11.2rem, -42vw, -8.8rem))` }}
                >
                  <motion.span
                    className="block size-4 rounded-full border-[3px] border-white bg-teal-600 shadow-[0_6px_22px_rgba(15,118,110,0.45)]"
                    animate={reducedMotion ? undefined : { scale: [1, 1.22, 1] }}
                    transition={{ duration: 3.4, delay: index * 0.45, ease: 'easeInOut', repeat: Infinity }}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className="self-center">
            <div className="grid gap-4">
              {trends.cards.map((card, index) => {
                const Icon = spotlightIcons[index] ?? Atom
                return (
                  <motion.article
                    key={card.title}
                    initial={reducedMotion ? false : { opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : index * 0.07 }}
                    whileHover={reducedMotion ? undefined : { x: -6 }}
                    className="group relative grid grid-cols-[auto_1fr] gap-4 overflow-hidden rounded-[1.5rem] border border-white/90 bg-white/82 p-5 shadow-[0_18px_55px_rgba(7,23,36,0.08)] backdrop-blur-xl transition-shadow hover:shadow-[0_24px_65px_rgba(7,23,36,0.13)] sm:gap-5 sm:p-6"
                  >
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 via-teal-500 to-teal-800 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    <div className="flex flex-col items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-[#071724] text-[#71f0db] shadow-[0_12px_28px_rgba(7,23,36,0.16)] transition group-hover:bg-teal-800"><Icon size={19} aria-hidden="true" /></span>
                      <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-400">0{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-2xl">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{card.body}</p>
                    </div>
                  </motion.article>
                )
              })}
            </div>

            <p className="mt-4 rounded-2xl border border-teal-900/10 bg-white/68 px-5 py-4 text-xs font-medium leading-5 text-slate-500 backdrop-blur">{trends.context}</p>
          </div>
        </div>

        <div className="relative border-t border-teal-950/8 bg-white/45 px-6 py-5 sm:px-9 lg:px-12 xl:px-16" aria-hidden="true">
          <div className="absolute left-[10%] right-[10%] top-1/2 h-px bg-gradient-to-r from-transparent via-teal-800/20 to-transparent" />
          <div className="relative grid grid-cols-3">
            {trends.cards.map((card, index) => (
              <div key={card.title} className="flex items-center justify-center">
                <motion.span
                  className="grid size-10 place-items-center rounded-full border border-teal-900/12 bg-white text-[0.65rem] font-bold tracking-[0.12em] text-teal-800 shadow-[0_8px_24px_rgba(7,23,36,0.1)] sm:size-12"
                  animate={reducedMotion ? undefined : { boxShadow: ['0 8px 24px rgba(7,23,36,0.1)', '0 8px 32px rgba(13,148,136,0.24)', '0 8px 24px rgba(7,23,36,0.1)'] }}
                  transition={{ duration: 4, delay: index * 0.55, ease: 'easeInOut', repeat: Infinity }}
                >
                  0{index + 1}
                </motion.span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
