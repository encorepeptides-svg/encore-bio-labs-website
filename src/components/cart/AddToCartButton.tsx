import { ShoppingCart } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Product, ProductVariant } from '../../data/products'
import { useCart } from '../../context/useCart'
import { cn } from '../../lib/utils'

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
  children = 'Add to Cart',
  className,
  tone = 'dark',
}: AddToCartButtonProps) {
  const { addToCart } = useCart()

  return (
    <button
      type="button"
      onClick={() => addToCart(product, variant, quantity)}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition',
        tone === 'dark'
          ? 'bg-[#071724] text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)] hover:bg-teal-700'
          : 'border border-slate-900/10 bg-white text-[#071724] hover:bg-teal-50',
        className,
      )}
    >
      <ShoppingCart size={16} aria-hidden="true" />
      {children}
    </button>
  )
}

export function VariantAddToCartPanel({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0])

  return (
    <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 shadow-[0_18px_50px_rgba(7,23,36,0.08)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Select option
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
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
              {variant.price > 0 ? ` · $${variant.price.toLocaleString()}` : ''}
            </button>
          )
        })}
      </div>
      <AddToCartButton product={product} variant={selectedVariant} className="mt-4 w-full">
        Add {selectedVariant.label} to Cart
      </AddToCartButton>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Each strength or format is tracked as its own cart SKU.
      </p>
    </div>
  )
}
