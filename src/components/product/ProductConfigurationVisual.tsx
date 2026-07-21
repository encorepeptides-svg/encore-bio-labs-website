import { motion } from 'framer-motion'
import type { Product, ProductVariant } from '../../data/products'
import { getEncoreCompleteKitConfig } from '../../data/encoreCompleteKit'
import { useTranslation } from '../../i18n/LocaleContext'
import type { PurchaseSelection } from '../../lib/purchaseOptions'
import { cn } from '../../lib/utils'
import { ProductImage } from '../ProductImage'
import { CompleteKitHeroImage } from './CompleteKitHeroImage'
import { getPurchaseVisualDetails } from './productConfigurationVisualState'

export function ProductConfigurationVisual({
  product,
  variant,
  selection,
  theme = 'dark',
  className,
}: {
  product: Product
  variant: ProductVariant
  selection: PurchaseSelection
  theme?: 'dark' | 'light'
  className?: string
}) {
  const { t } = useTranslation('purchaseSelector')
  const { t: tKit } = useTranslation('kit')
  const { vialCount, includesKit } = getPurchaseVisualDetails(selection)
  const kit = getEncoreCompleteKitConfig({ bacWaterAmount: product.bacWaterAmount }, tKit)
  const visualAlt = includesKit
    ? selection.optionId === 'multipack'
      ? t('visualMultipackKitAlt', { product: product.name, strength: variant.label, count: vialCount, bacWater: kit.bacWaterLabel, syringes: kit.syringeCount, gauge: kit.syringeGauge, pads: kit.prepPadCount })
      : t('visualCompleteKitAlt', { product: product.name, strength: variant.label, bacWater: kit.bacWaterLabel, syringes: kit.syringeCount, gauge: kit.syringeGauge, pads: kit.prepPadCount })
    : selection.optionId === 'multipack'
      ? t('visualMultipackAlt', { product: product.name, strength: variant.label, count: vialCount })
      : t('visualVialOnlyAlt', { product: product.name, strength: variant.label })
  const visualLabel = selection.optionId === 'complete-kit'
    ? t('visualCompleteKitLabel')
    : selection.optionId === 'multipack'
      ? t('visualMultipackLabel', { count: vialCount })
      : t('visualVialOnlyLabel')

  return (
    <figure
      role="img"
      aria-label={visualAlt}
      className={cn('relative flex min-h-[27rem] flex-col justify-center overflow-hidden rounded-[1.7rem] p-4 sm:min-h-[34rem] sm:p-6', theme === 'dark' ? 'text-white' : 'text-[#071724]', className)}
    >
      <motion.div
        key={`${variant.sku}-${selection.optionId}-${vialCount}-${includesKit}`}
        initial={{ opacity: 0.7, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative z-[1] w-full"
      >
        {includesKit ? (
          <div className="relative mx-auto aspect-[16/9] w-full max-w-[58rem] overflow-hidden rounded-[1.35rem] border border-slate-900/10 bg-white shadow-[0_24px_60px_rgba(7,23,36,0.18)]">
            <CompleteKitHeroImage alt="" priority sizes="(min-width: 1024px) 46vw, 96vw" className="size-full object-cover object-center" />
            <div className="pointer-events-none absolute bottom-[7%] right-[4%] h-[40%] w-[15%] rounded-[45%] bg-[radial-gradient(ellipse_at_center,rgba(249,251,252,1)_0%,rgba(249,251,252,0.98)_60%,rgba(249,251,252,0)_100%)]" aria-hidden="true" />
            <div
              className={cn('absolute bottom-[5%] right-[1.5%] flex h-[44%] items-end justify-end', vialCount === 1 ? 'w-[19%]' : 'w-[30%] -space-x-[12%]')}
              aria-hidden="true"
            >
              {Array.from({ length: vialCount }, (_, index) => (
                <div key={index} className={cn('relative aspect-square shrink-0', vialCount === 1 ? 'h-full w-full' : 'h-[76%] w-[35%]')}>
                  <ProductImage product={product} alt="" loading={index === 0 ? 'eager' : 'lazy'} sizes={vialCount === 1 ? '(min-width: 1024px) 9vw, 19vw' : '(min-width: 1024px) 6vw, 11vw'} className="size-full object-contain drop-shadow-[0_12px_18px_rgba(7,23,36,0.28)]" />
                </div>
              ))}
            </div>
            <div className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/88 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-teal-900 shadow-sm backdrop-blur sm:left-5 sm:top-5 sm:px-4 sm:py-2 sm:text-[0.68rem]">
              {product.name} · {variant.label} · {t('visualVialCount', { count: vialCount })}
            </div>
          </div>
        ) : (
          <div className={cn('mx-auto grid w-full max-w-[31rem] place-items-end gap-1', vialCount === 1 ? 'grid-cols-1' : vialCount === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
            {Array.from({ length: vialCount }, (_, index) => (
              <div key={index} className={cn('relative mx-auto aspect-square w-full', vialCount === 1 ? 'max-w-[25rem]' : 'max-w-[11rem]')} aria-hidden="true">
                <ProductImage product={product} alt="" loading={index === 0 ? 'eager' : 'lazy'} sizes={vialCount === 1 ? '(min-width: 1024px) 34vw, 76vw' : '(min-width: 1024px) 12vw, 30vw'} className="size-full object-contain drop-shadow-[0_24px_34px_rgba(0,0,0,0.32)]" />
              </div>
            ))}
            <div className={cn('col-span-full mx-auto -mt-2 rounded-full border px-3 py-1.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] backdrop-blur', theme === 'dark' ? 'border-white/15 bg-[#071724]/75 text-teal-100' : 'border-slate-900/10 bg-white/85 text-teal-800')}>
              {product.name} · {variant.label} · {t('visualVialCount', { count: vialCount })}
            </div>
          </div>
        )}
      </motion.div>
      <figcaption className={cn('relative z-[1] mx-auto mt-4 rounded-full border px-4 py-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.14em] backdrop-blur', theme === 'dark' ? 'border-white/15 bg-[#071724]/75 text-teal-100' : 'border-slate-900/10 bg-white/85 text-teal-800')}>
        {visualLabel}
      </figcaption>
    </figure>
  )
}
