type ResponsiveImageProps = {
  avifSrcSet?: string
  webpSrcSet?: string
  sizes?: string
  src: string
  alt: string
  width?: string | number
  height?: string | number
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  className?: string
}

/**
 * Serves AVIF/WebP responsive sources with the original image as the final
 * fallback. Browsers only fetch the one source they select, so keeping the
 * original as the <img> fallback costs nothing for modern browsers while
 * staying maximally compatible.
 */
export function ResponsiveImage({
  avifSrcSet,
  webpSrcSet,
  sizes,
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  className,
}: ResponsiveImageProps) {
  return (
    <picture>
      {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
      {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} /> : null}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        className={className}
      />
    </picture>
  )
}
