import type { Product } from '../data/products'
import { getProductMedia } from '../data/productMedia'
import { buildSrcSet, stemOf } from '../lib/responsiveImages'

const productImages = import.meta.glob('../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const IMAGE_BASE_PATH = '../assets/images/products/'
const IMAGE_WIDTHS = [720, 1000, 1254, 1400]

type ProductImageProps = {
  product: Pick<Product, 'slug' | 'image' | 'heroImage'>
  alt?: string
  className?: string
  sizes?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
}

/** Shared product-media renderer with one fallback path and responsive sources. */
export function ProductImage({
  product,
  alt,
  className,
  sizes = '(min-width: 1024px) 45vw, 100vw',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
}: ProductImageProps) {
  const media = getProductMedia(product.slug)
  // A locale layer may intentionally override `image` while the canonical
  // `heroImage` still points at the shared media manifest. Honor that explicit
  // override before responsive canonical assets (used by Spanish KLOW artwork).
  const localizedImageOverride = product.image !== product.heroImage ? product.image : undefined
  const imageName = localizedImageOverride ?? media?.hero.src ?? product.heroImage ?? product.image
  const fallbackName = media?.fallback.src ?? 'category-recovery-regeneration.png'
  const resolvedName = productImages[`${IMAGE_BASE_PATH}${imageName}`] ? imageName : fallbackName
  const imageSrc = productImages[`${IMAGE_BASE_PATH}${resolvedName}`]
  const stem = stemOf(resolvedName)
  const avifSrcSet = buildSrcSet(productImages, IMAGE_BASE_PATH, stem, 'avif', IMAGE_WIDTHS)
  const webpSrcSet = buildSrcSet(productImages, IMAGE_BASE_PATH, stem, 'webp', IMAGE_WIDTHS)
  const resolvedAlt = alt ?? media?.hero.alt ?? `${product.slug} research product packaging`
  const dimensions = { width: width ?? media?.hero.width ?? 1254, height: height ?? media?.hero.height ?? 1254 }

  if (!imageSrc) return null

  return (
    <picture className="contents">
      {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
      {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} /> : null}
      <img
        src={imageSrc}
        alt={resolvedAlt}
        width={dimensions.width}
        height={dimensions.height}
        loading={loading}
        decoding={decoding}
        className={className}
      />
    </picture>
  )
}
