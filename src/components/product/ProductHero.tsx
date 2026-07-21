import { useEffect, useRef, type ReactNode } from 'react'
import './ProductHero.css'

export type ProductHeroDensity = 'low' | 'medium' | 'high'

export type ProductHeroProps = {
  /** Transparent product cutout (no baked background or shadow). */
  imageSrc: string
  imageAlt: string
  /** Brand/product accent used for every generated light layer. */
  accent?: string
  density?: ProductHeroDensity
  /** True only for the first, above-the-fold hero — drives LCP treatment. */
  priority?: boolean
  imageWidth?: number
  imageHeight?: number
  srcSet?: string
  sizes?: string
  className?: string
  /** Optional hero copy rendered over a readable scrim. */
  children?: ReactNode
}

const FOREGROUND_PARTICLES: Record<ProductHeroDensity, number> = { low: 4, medium: 7, high: 11 }

const MolecularField = () => (
  <svg className="ph-molecular" viewBox="0 0 400 400" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
    <g fill="none" stroke="rgba(150,220,225,0.7)" strokeWidth="1">
      <circle cx="90" cy="110" r="5" fill="rgba(150,220,225,0.7)" />
      <circle cx="150" cy="80" r="5" fill="rgba(150,220,225,0.7)" />
      <circle cx="150" cy="150" r="5" fill="rgba(150,220,225,0.7)" />
      <circle cx="210" cy="120" r="5" fill="rgba(150,220,225,0.7)" />
      <path d="M90 110 L150 80 L210 120 L150 150 Z M150 80 L150 150" />
      <circle cx="300" cy="260" r="5" fill="rgba(150,220,225,0.7)" />
      <circle cx="340" cy="300" r="5" fill="rgba(150,220,225,0.7)" />
      <circle cx="280" cy="320" r="5" fill="rgba(150,220,225,0.7)" />
      <path d="M300 260 L340 300 L280 320 Z" />
      <circle cx="70" cy="320" r="4" fill="rgba(150,220,225,0.6)" />
      <circle cx="120" cy="300" r="4" fill="rgba(150,220,225,0.6)" />
      <path d="M70 320 L120 300" />
    </g>
  </svg>
)

export function ProductHero({
  imageSrc,
  imageAlt,
  accent = '#28e0c1',
  density = 'medium',
  priority = false,
  imageWidth = 1254,
  imageHeight = 1254,
  srcSet,
  sizes = '(min-width: 1024px) 45vw, 92vw',
  className = '',
  children,
}: ProductHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  // Subtle, capped scroll parallax. Minimal JS — the only thing CSS can't read.
  // Disabled entirely for reduced-motion users.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      const viewport = window.innerHeight || 1
      // -1..1 as the hero passes through the viewport.
      const progress = (rect.top + rect.height / 2 - viewport / 2) / viewport
      const capped = Math.max(-1, Math.min(1, progress))
      root.style.setProperty('--ph-scroll', `${(capped * 48).toFixed(2)}px`)
    }
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update) }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const particleCount = FOREGROUND_PARTICLES[density]

  return (
    <div ref={rootRef} className={`product-hero ${className}`} style={{ ['--ph-accent' as string]: accent }}>
      {/* Background plane (layers 1–3) */}
      <div className="ph-plane ph-plane--back" aria-hidden="true">
        <div className="ph-gradient" />
        <div className="ph-texture" />
        <MolecularField />
      </div>

      {/* Midground plane (layers 4–6) */}
      <div className="ph-plane ph-plane--mid" aria-hidden="true">
        <div className="ph-ambient"><span /><span /><span /><span /></div>
        <div className="ph-radiallight" />
        <div className="ph-haze"><span /><span /></div>
      </div>

      {/* Product stage (layer 7) */}
      <div className="ph-stage">
        <div className="ph-glow" aria-hidden="true" />
        <img
          className="ph-product"
          src={imageSrc}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          draggable={false}
        />
      </div>

      {/* Foreground light particles (layer 8) */}
      <div className="ph-plane ph-plane--front" aria-hidden="true">
        <div className="ph-particles">
          {Array.from({ length: particleCount }, (_, index) => (
            <span
              key={index}
              style={{
                left: `${8 + (index * 83) % 84}%`,
                top: `${12 + (index * 47) % 74}%`,
                animationDelay: `${-(index * 1.4).toFixed(1)}s`,
                animationDuration: `${8 + (index % 3) * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {children ? <div className="ph-copy">{children}</div> : null}
    </div>
  )
}
