import { FileCheck2, Headphones, PackageCheck, Tags } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../../data/products'
import type { ProductConversionLocaleContent } from '../../data/productConversionContent'
import { getDefaultPurchaseSelection, type PurchaseSelection } from '../../lib/purchaseOptions'
import { cn } from '../../lib/utils'
import { ProductConfigurationVisual } from './ProductConfigurationVisual'
import { PurchaseSelector } from './PurchaseSelector'

const trustIcons = [FileCheck2, Tags, PackageCheck, Headphones]

export function ProductPurchaseExperience({
  product,
  copy,
}: {
  product: Product
  copy: ProductConversionLocaleContent
}) {
  const [selectedSku, setSelectedSku] = useState(product.variants[0]?.sku)
  const [selection, setSelection] = useState<PurchaseSelection>(() => getDefaultPurchaseSelection(product))
  const variant = product.variants.find((entry) => entry.sku === selectedSku) ?? product.variants[0]
  const isCleanPharma = product.slug !== 'retatrutide'

  return (
    <section id="product-purchase" className="scroll-mt-20 bg-[#f4f7f6] px-5 py-12 sm:px-8 sm:py-16 lg:py-20" aria-labelledby={`purchase-heading-${product.slug}`}>
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{copy.purchase.eyebrow}</p>
          <h2 id={`purchase-heading-${product.slug}`} className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl lg:text-5xl">
            {copy.purchase.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">{copy.purchase.body}</p>
        </div>

        <div className={cn(
          'grid',
          isCleanPharma
            ? 'items-start gap-5 sm:gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8'
            : 'overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white shadow-[0_30px_90px_rgba(7,23,36,0.1)] lg:grid-cols-[1.06fr_0.94fr]',
        )}>
          <div className={cn(
            'relative overflow-hidden',
            isCleanPharma
              ? 'rounded-[2rem] border border-slate-900/10 bg-[radial-gradient(circle_at_50%_32%,rgba(132,230,213,0.34),transparent_42%),linear-gradient(145deg,#ffffff_0%,#eef7f4_58%,#f8faf9_100%)] p-3 shadow-[0_24px_70px_rgba(7,23,36,0.08)] sm:p-5 lg:sticky lg:top-28 lg:p-6'
              : 'bg-[radial-gradient(circle_at_50%_28%,rgba(40,224,193,0.18),transparent_36%),linear-gradient(155deg,#06131f,#0a2631)] p-3 sm:p-5 lg:p-7',
          )}>
            {isCleanPharma ? (
              <div className="pointer-events-none absolute inset-x-[16%] top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden="true" />
            ) : null}
            <ProductConfigurationVisual
              product={product}
              variant={variant}
              selection={selection}
              theme={isCleanPharma ? 'light' : 'dark'}
              className={isCleanPharma ? 'min-h-[21rem] sm:min-h-[26rem] lg:min-h-[30rem]' : 'min-h-[24rem] sm:min-h-[31rem]'}
            />
          </div>
          <div className={cn(isCleanPharma ? 'min-w-0' : 'flex items-center p-4 sm:p-7 lg:p-8')}>
            <PurchaseSelector
              product={product}
              compact={isCleanPharma}
              selectedVariant={variant}
              selectedPurchase={selection}
              onVariantChange={(nextVariant) => setSelectedSku(nextVariant.sku)}
              onPurchaseChange={setSelection}
            />
          </div>
        </div>

        <ul className="mt-5 grid overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_16px_44px_rgba(7,23,36,0.05)] sm:grid-cols-2 lg:grid-cols-4" aria-label={copy.purchase.eyebrow}>
          {copy.trustItems.map((item, index) => {
            const Icon = trustIcons[index] ?? FileCheck2
            return (
              <li key={item} className="flex min-h-20 items-center gap-3 border-b border-slate-900/10 px-4 py-4 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold leading-5 text-[#071724]">{item}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
