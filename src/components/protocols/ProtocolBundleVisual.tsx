import type { ProtocolConfig } from '../../data/protocols'
import { resolveProtocolComponents } from '../../data/protocols'
import { getProductCutout } from '../../data/productCutouts'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { cn } from '../../lib/utils'
import { ProductImage } from '../ProductImage'
import { ProductHero } from '../product/ProductHero'

export function ProtocolBundleVisual({
  protocol,
  alt,
  compact = false,
  priority = false,
  className,
}: {
  protocol: ProtocolConfig
  alt: string
  compact?: boolean
  priority?: boolean
  className?: string
}) {
  const { locale } = useLocale()
  const { t } = useTranslation('protocols')
  const components = resolveProtocolComponents(protocol).map((component) => ({
    ...component,
    product: getLocalizedProduct(component.product, locale),
  }))
  const fallbackImage = getProductCutout(components[0].product) ?? components[0].product.image

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        'relative isolate overflow-hidden bg-[linear-gradient(145deg,#f7fbfa_0%,#edf4f2_48%,#dbe8e5_100%)]',
        compact ? 'aspect-[4/3] rounded-[1.35rem]' : 'min-h-[30rem] rounded-[2rem] sm:min-h-[38rem]',
        className,
      )}
    >
      <ProductHero
        imageSrc={fallbackImage}
        imageAlt=""
        theme="lab"
        density="low"
        priority={priority}
        className="product-hero--embedded"
        stageContent={(
          <div className="absolute inset-0">
            <div className="absolute inset-x-[8%] bottom-[10%] h-[12%] rounded-[50%] bg-[#071724]/20 blur-2xl" aria-hidden="true" />
            <div className={cn('absolute inset-x-[5%] bottom-[8%] flex items-end justify-center', components.length === 2 ? '-space-x-[6%]' : '-space-x-[12%]')}>
              {components.map(({ product }, index) => (
                <div
                  key={product.slug}
                  className={cn(
                    'relative aspect-square shrink-0 transition-transform duration-500',
                    compact ? (components.length === 2 ? 'w-[48%]' : 'w-[38%]') : (components.length === 2 ? 'w-[52%] max-w-[25rem]' : 'w-[39%] max-w-[19rem]'),
                    index % 3 === 0 ? '-translate-y-[2%] -rotate-[2deg]' : index % 3 === 1 ? 'translate-y-[4%] rotate-[2deg]' : '-translate-y-[1%] rotate-[1deg]',
                  )}
                >
                  <ProductImage
                    product={product}
                    alt=""
                    loading={priority && index === 0 ? 'eager' : 'lazy'}
                    sizes={compact ? '(min-width: 1024px) 18vw, 42vw' : '(min-width: 1024px) 22vw, 45vw'}
                    className="size-full object-contain drop-shadow-[0_28px_28px_rgba(7,23,36,0.28)]"
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-x-[12%] bottom-[5%] h-px bg-gradient-to-r from-transparent via-teal-900/20 to-transparent" aria-hidden="true" />
          </div>
        )}
      />
      <div className="absolute right-[6%] top-[7%] rounded-full border border-white/80 bg-white/78 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-teal-900 shadow-sm backdrop-blur" aria-hidden="true">
        {t('ruo')}
      </div>
    </div>
  )
}
