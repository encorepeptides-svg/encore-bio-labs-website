import bacWaterHeroAvif1254 from '../assets/images/products/bac-water-1ml-hero-1254.avif'
import bacWaterHeroAvif768 from '../assets/images/products/bac-water-1ml-hero-768.avif'
import bacWaterHeroWebp1254 from '../assets/images/products/bac-water-1ml-hero-1254.webp'
import bacWaterHeroWebp768 from '../assets/images/products/bac-water-1ml-hero-768.webp'
import { cn } from '../lib/utils'

export function BacWaterHeroImage({
  alt,
  className,
  sizes = '(min-width: 1024px) 42vw, 100vw',
  priority = false,
}: {
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  return (
    <picture className="contents">
      <source type="image/avif" srcSet={`${bacWaterHeroAvif768} 768w, ${bacWaterHeroAvif1254} 1254w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${bacWaterHeroWebp768} 768w, ${bacWaterHeroWebp1254} 1254w`} sizes={sizes} />
      <img
        src={bacWaterHeroWebp1254}
        alt={alt}
        width="1254"
        height="1254"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('h-auto max-w-full', className)}
      />
    </picture>
  )
}
