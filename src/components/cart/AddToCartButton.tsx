import { ShoppingCart } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Product, ProductVariant } from '../../data/products'
import { useCart } from '../../context/useCart'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { cn } from '../../lib/utils'
import { isProductPurchasable } from '../../lib/purchaseOptions'

type AddToCartButtonProps = {
  product: Product
  variant?: ProductVariant
  quantity?: number
  children?: ReactNode
  className?: string
  tone?: 'dark' | 'light'
}

export function AddToCartButton({
  product,
  variant = product.variants[0],
  quantity = 1,
  children,
  className,
  tone = 'dark',
}: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const { path } = useLocale()
  const { t } = useTranslation('common')

  if (!variant || variant.price <= 0 || !isProductPurchasable(product)) {
    return (
      <a
        href={path(`/intake?product=${encodeURIComponent(product.slug)}`)}
        className={cn(
          'inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-[#071724] transition hover:bg-teal-50',
          className,
        )}
      >
        {t('requestAvailability')}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => addToCart(product, variant, quantity, { optionId: 'vial-only', packSize: 1, includeKit: false })}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition',
        tone === 'dark'
          ? 'bg-[#071724] text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)] hover:bg-teal-700'
          : 'border border-slate-900/10 bg-white text-[#071724] hover:bg-teal-50',
        className,
      )}
    >
      <ShoppingCart size={16} aria-hidden="true" />
      {children ?? t('addToCart')}
    </button>
  )
}

export function VariantAddToCartPanel({
  product,
  selectedVariant: controlledVariant,
  onSelectVariant,
}: {
  product: Product
  selectedVariant?: ProductVariant
  onSelectVariant?: (variant: ProductVariant) => void
}) {
  const { t } = useTranslation('common')
  const [internalVariant, setInternalVariant] = useState<ProductVariant>(product.variants[0])
  const selectedVariant = controlledVariant ?? internalVariant
  const setSelectedVariant = onSelectVariant ?? setInternalVariant
  const hasMultipleVariants = product.variants.length > 1

  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 shadow-[0_18px_50px_rgba(7,23,36,0.08)] backdrop-blur-xl">
      {hasMultipleVariants ? (
        <>
          <p id="variant-selector-label" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t('selectOption')}
          </p>
          <div role="group" aria-labelledby="variant-selector-label" className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const selected = selectedVariant.label === variant.label && selectedVariant.format === variant.format

              return (
                <button
                  key={`${variant.label}-${variant.format}`}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-full border px-3 py-2 text-xs font-semibold transition',
                    selected
                      ? 'border-teal-700 bg-teal-50 text-teal-800'
                      : 'border-slate-900/10 bg-white text-slate-600 hover:border-teal-600/40 hover:bg-teal-50',
                  )}
                >
                  {variant.label}
                  {variant.price > 0 ? ` · $${variant.price.toLocaleString()}` : variant.priceNeedsConfirmation ? ` · ${t('quote')}` : ''}
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t('format')}</p>
            <p className="mt-1 text-sm font-semibold text-[#071724]">
              {selectedVariant.label} · {selectedVariant.format}
            </p>
          </div>
          {selectedVariant.price > 0 ? (
            <p className="text-lg font-semibold tracking-[-0.02em] text-[#071724]">
              ${selectedVariant.price.toLocaleString()}
            </p>
          ) : null}
        </div>
      )}
      <AddToCartButton product={product} variant={selectedVariant} className="mt-4 w-full">
        {selectedVariant.price > 0
          ? hasMultipleVariants
            ? t('addVariantToCart', { variant: selectedVariant.label })
            : t('addToCart')
          : t('requestAvailability')}
      </AddToCartButton>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {hasMultipleVariants ? t('eachStrengthShips') : t('oneFormatAvailable')}
      </p>
    </div>
  )
}

export function MobileStickyPurchaseBar({ product, variant }: { product: Product; variant: ProductVariant }) {
  const { t } = useTranslation('common')

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-900/10 bg-white/95 px-4 py-2.5 shadow-[0_-8px_28px_rgba(7,23,36,0.08)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
            {variant.label}
          </p>
          <p className="text-base font-semibold tracking-[-0.02em] text-[#071724]">
            {variant.price > 0 ? `$${variant.price.toLocaleString()}` : t('quote')}
          </p>
        </div>
        <AddToCartButton product={product} variant={variant} className="shrink-0 px-5 py-2.5 text-xs">
          {variant.price > 0 ? t('addToCart') : t('requestAvailability')}
        </AddToCartButton>
      </div>
    </div>
  )
}
