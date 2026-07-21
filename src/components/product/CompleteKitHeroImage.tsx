import completeKitAvif1280 from '../../assets/images/products/complete-kit-product-hero-1280.avif'
import completeKitAvif1672 from '../../assets/images/products/complete-kit-product-hero-1672.avif'
import completeKitAvif768 from '../../assets/images/products/complete-kit-product-hero-768.avif'
import completeKitWebp1280 from '../../assets/images/products/complete-kit-product-hero-1280.webp'
import completeKitWebp1672 from '../../assets/images/products/complete-kit-product-hero-1672.webp'
import completeKitWebp768 from '../../assets/images/products/complete-kit-product-hero-768.webp'
import { cn } from '../../lib/utils'

export function CompleteKitHeroImage({
  alt,
  className,
  sizes = '(min-width: 1024px) 44vw, 100vw',
  priority = false,
}: {
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={`${completeKitAvif768} 768w, ${completeKitAvif1280} 1280w, ${completeKitAvif1672} 1672w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${completeKitWebp768} 768w, ${completeKitWebp1280} 1280w, ${completeKitWebp1672} 1672w`} sizes={sizes} />
      <img
        src={completeKitWebp1672}
        alt={alt}
        width="1672"
        height="941"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('h-auto max-w-full', className)}
      />
    </picture>
  )
}
