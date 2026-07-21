import type { Product } from '../../data/products'
import { getProductCutout } from '../../data/productCutouts'
import { ProductImage } from '../ProductImage'
import { ProductHero } from './ProductHero'

type ProductLabVisualProps = {
  product: Pick<Product, 'slug' | 'image' | 'heroImage'>
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

/** The shared clean-laboratory treatment used by product pages and product features. */
export function ProductLabVisual({
  product,
  alt,
  className = '',
  sizes,
  priority = false,
}: ProductLabVisualProps) {
  const cutout = getProductCutout(product)

  if (!cutout) {
    return (
      <div className={`product-lab-fallback ${className}`}>
        <ProductImage
          product={product}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          className="size-full object-contain p-4"
        />
      </div>
    )
  }

  return (
    <ProductHero
      imageSrc={cutout}
      imageAlt={alt}
      theme="lab"
      density="low"
      priority={priority}
      sizes={sizes}
      className={`product-hero--embedded ${className}`}
    />
  )
}
