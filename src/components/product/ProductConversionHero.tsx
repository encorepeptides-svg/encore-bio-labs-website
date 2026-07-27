import { ArrowDown, BadgeCheck, CircleHelp, FileSearch } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Product } from '../../data/products'
import type { ProductConversionContent } from '../../data/productConversionContent'
import { getProductCutout } from '../../data/productCutouts'
import { useTranslation } from '../../i18n/LocaleContext'
import { money } from '../../lib/purchaseOptions'
import { cn } from '../../lib/utils'
import { ProductHero as ProductHeroEnvironment } from './ProductHero'

export function ProductConversionHero({
  product,
  content,
}: {
  product: Product
  content: ProductConversionContent & { localeContent: ProductConversionContent['locales']['en'] }
}) {
  const reducedMotion = useReducedMotion()
  const { t } = useTranslation('product')
  const copy = content.localeContent.hero
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)
  const startingPrice = prices.length ? money(Math.min(...prices)) : '—'
  const productCutout = getProductCutout(product)
  const evidenceDescriptionId = `evidence-badge-description-${product.slug}`
  const isCleanPharma = product.slug !== 'retatrutide'

  return (
    <section className={cn('relative isolate overflow-hidden px-5 pb-12 pt-8 sm:px-8 sm:pb-16 lg:pb-24 lg:pt-12', isCleanPharma ? 'bg-[linear-gradient(180deg,#f8faf8_0%,#edf2ef_100%)] text-[#071724]' : 'bg-[#030b18] text-white')}>
      <div className={cn('pointer-events-none absolute inset-0 -z-20', isCleanPharma ? 'bg-[radial-gradient(circle_at_78%_20%,rgba(40,224,193,0.13),transparent_30%),radial-gradient(circle_at_18%_70%,rgba(148,163,184,0.13),transparent_34%)]' : 'bg-[radial-gradient(circle_at_75%_20%,rgba(40,224,193,0.13),transparent_34%),linear-gradient(145deg,#030b18_0%,#071724_54%,#04101a_100%)]')} aria-hidden="true" />
      <div className={cn('pointer-events-none absolute inset-0 -z-10 [background-size:64px_64px] [mask-image:linear-gradient(to_right,black,transparent_76%)]', isCleanPharma ? 'opacity-[0.16] [background-image:linear-gradient(rgba(71,102,102,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(71,102,102,.12)_1px,transparent_1px)]' : 'opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)]')} aria-hidden="true" />

      <div className="mx-auto grid max-w-[88rem] items-center gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:gap-14">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-3xl"
        >
          <p className={cn('text-xs font-bold uppercase tracking-[0.22em]', isCleanPharma ? 'text-teal-800' : 'text-[#71f0db]')}>{copy.eyebrow}</p>
          <h1 className={cn('mt-4 text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.065em]', isCleanPharma ? 'text-[#071724]' : 'text-white')}>
            {product.name}
          </h1>
          <p className={cn('mt-5 max-w-2xl text-[clamp(1.5rem,2.7vw,2.5rem)] font-semibold leading-[1.04] tracking-[-0.045em]', isCleanPharma ? 'text-[#071724]' : 'text-white')}>
            {copy.headline}
          </p>
          <p className={cn('mt-5 max-w-2xl text-base leading-7 sm:text-lg', isCleanPharma ? 'text-slate-600' : 'text-slate-300')}>{copy.support}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="group relative">
              <button
                type="button"
                aria-describedby={evidenceDescriptionId}
                className={cn('inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] outline-none transition focus-visible:ring-2 focus-visible:ring-[#159f8d] focus-visible:ring-offset-2', isCleanPharma ? 'border-teal-800/20 bg-white/85 text-teal-900 shadow-[0_10px_28px_rgba(7,23,36,0.07)] hover:border-teal-700/40 hover:bg-white focus-visible:ring-offset-[#f4f7f6]' : 'border-[#71f0db]/35 bg-[#28e0c1]/12 text-[#b8fff3] hover:border-[#71f0db]/65 hover:bg-[#28e0c1]/18 focus-visible:ring-offset-[#030b18]')}
              >
                <BadgeCheck size={16} aria-hidden="true" />
                {copy.evidenceLabel}
                <CircleHelp size={14} aria-hidden="true" className="opacity-70" />
              </button>
              <span
                id={evidenceDescriptionId}
                role="tooltip"
                className="pointer-events-none absolute left-0 top-[calc(100%+0.65rem)] z-30 w-[min(21rem,calc(100vw-2.5rem))] translate-y-1 rounded-2xl border border-white/15 bg-[#071724] p-4 text-left text-xs font-medium normal-case leading-5 tracking-normal text-slate-200 opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
              >
                {copy.evidenceTooltip}
              </span>
            </div>
            <span className={cn('inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.13em]', isCleanPharma ? 'border-slate-900/10 bg-white/85 text-slate-600 shadow-[0_10px_28px_rgba(7,23,36,0.06)]' : 'border-white/12 bg-white/[0.06] text-slate-200')}>
              {copy.startingAtLabel}&nbsp;<strong className={isCleanPharma ? 'text-[#071724]' : 'text-white'}>{startingPrice}</strong>
            </span>
          </div>

          <div className="mt-6">
            <p className={cn('text-[0.68rem] font-bold uppercase tracking-[0.17em]', isCleanPharma ? 'text-slate-500' : 'text-slate-400')}>{copy.strengthsLabel}</p>
            <ul className="mt-2 flex flex-wrap gap-2" aria-label={copy.strengthsLabel}>
              {product.variants.map((variant) => (
                <li key={variant.sku ?? variant.label} className={cn('rounded-xl border px-3 py-2 text-sm font-semibold backdrop-blur', isCleanPharma ? 'border-slate-900/10 bg-white/80 text-[#071724] shadow-[0_8px_22px_rgba(7,23,36,0.05)]' : 'border-white/12 bg-white/[0.055] text-white')}>
                  {variant.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#product-purchase" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] shadow-[0_16px_42px_rgba(40,224,193,0.18)] transition hover:-translate-y-0.5 hover:bg-[#71f0db] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#71f0db] motion-reduce:transform-none">
              {copy.primaryCta}
              <ArrowDown size={16} aria-hidden="true" />
            </a>
            <a href="#product-evidence" className={cn('inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold backdrop-blur transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600', isCleanPharma ? 'border-slate-900/12 bg-white/85 text-[#071724] shadow-[0_10px_28px_rgba(7,23,36,0.06)] hover:border-teal-700/30 hover:bg-white' : 'border-white/18 bg-white/[0.06] text-white hover:border-white/35 hover:bg-white/10')}>
              <FileSearch size={16} aria-hidden="true" />
              {copy.secondaryCta}
            </a>
          </div>
          <p className={cn('mt-6 border-l-2 border-[#28e0c1]/60 pl-4 text-xs font-semibold uppercase tracking-[0.1em]', isCleanPharma ? 'text-slate-500' : 'text-slate-400')}>{copy.researchUseOnly}</p>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, scale: 0.96, x: 18 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-[42rem]"
        >
          {productCutout ? (
            <ProductHeroEnvironment
              imageSrc={productCutout}
              imageAlt={t('productImageAlt', { product: product.name })}
              accent={isCleanPharma ? '#67e8f9' : content.accent}
              theme={isCleanPharma ? 'lab' : 'dark'}
              density={isCleanPharma ? 'medium' : 'high'}
              priority
              className={isCleanPharma ? 'ph-variant-longevity' : `ph-variant-${content.visualVariant}`}
              imageWidth={1000}
              imageHeight={1000}
            />
          ) : null}
          <div className={cn('pointer-events-none absolute bottom-5 left-5 right-5 z-10 flex items-center justify-between rounded-2xl border px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.14em] backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7', isCleanPharma ? 'border-white/80 bg-white/78 text-slate-600 shadow-[0_14px_34px_rgba(7,23,36,0.12)]' : 'border-white/12 bg-[#030b18]/75 text-slate-300')}>
            <span>{product.name}</span>
            <span className={isCleanPharma ? 'text-teal-800' : 'text-[#71f0db]'}>RUO</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
