import { Bandage, Box, Droplet, Syringe } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Product, ProductVariant } from '../../data/products'
import { getEncoreCompleteKitConfig } from '../../data/encoreCompleteKit'
import { products } from '../../data/products'
import { useTranslation } from '../../i18n/LocaleContext'
import type { PurchaseSelection } from '../../lib/purchaseOptions'
import { cn } from '../../lib/utils'
import { ProductImage } from '../ProductImage'
import { getPurchaseVisualDetails } from './productConfigurationVisualState'

function VisualCount({ count, children }: { count: number; children: (index: number) => ReactNode }) {
  return <div className="flex flex-wrap justify-center gap-1.5" aria-hidden="true">{Array.from({ length: count }, (_, index) => children(index))}</div>
}

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
  const bacWater = products.find((entry) => entry.slug === 'bac-water')
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
        className={cn('relative z-[1] grid items-center gap-4', includesKit && 'lg:grid-cols-[minmax(0,1.08fr)_minmax(12rem,0.92fr)]')}
      >
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

        {includesKit ? (
          <div className={cn('grid grid-cols-2 gap-2 rounded-[1.25rem] border p-3 backdrop-blur-md', theme === 'dark' ? 'border-white/12 bg-[#06131f]/78' : 'border-slate-900/10 bg-white/85')}>
            <div className={cn('col-span-2 flex min-h-20 items-center gap-3 rounded-xl p-3', theme === 'dark' ? 'bg-white/[0.07]' : 'bg-teal-50')}>
              {bacWater ? <ProductImage product={bacWater} alt="" width={96} height={96} sizes="72px" className="size-16 shrink-0 object-contain" /> : <Droplet className="size-8 shrink-0 text-teal-600" aria-hidden="true" />}
              <span className="text-xs font-semibold leading-5">{kit.bacWaterLabel}</span>
            </div>
            <div className={cn('rounded-xl p-3 text-center', theme === 'dark' ? 'bg-white/[0.07]' : 'bg-slate-50')}>
              <VisualCount count={kit.syringeCount}>{(index) => <Syringe key={index} size={16} className="text-teal-500" />}</VisualCount>
              <p className="mt-2 text-[0.65rem] font-semibold leading-4">{t('visualSyringes', { count: kit.syringeCount, gauge: kit.syringeGauge })}</p>
            </div>
            <div className={cn('rounded-xl p-3 text-center', theme === 'dark' ? 'bg-white/[0.07]' : 'bg-slate-50')}>
              <VisualCount count={kit.prepPadCount}>{(index) => <Bandage key={index} size={14} className="text-teal-500" />}</VisualCount>
              <p className="mt-2 text-[0.65rem] font-semibold leading-4">{t('visualPrepPads', { count: kit.prepPadCount })}</p>
            </div>
            {kit.premiumPackaging ? <div className={cn('col-span-2 flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-semibold', theme === 'dark' ? 'bg-white/[0.07]' : 'bg-slate-50')}><Box size={17} className="text-teal-500" aria-hidden="true" />{t('visualPackaging')}</div> : null}
          </div>
        ) : null}
      </motion.div>
      <figcaption className={cn('relative z-[1] mx-auto mt-4 rounded-full border px-4 py-2 text-center text-[0.68rem] font-bold uppercase tracking-[0.14em] backdrop-blur', theme === 'dark' ? 'border-white/15 bg-[#071724]/75 text-teal-100' : 'border-slate-900/10 bg-white/85 text-teal-800')}>
        {visualLabel}
      </figcaption>
    </figure>
  )
}
