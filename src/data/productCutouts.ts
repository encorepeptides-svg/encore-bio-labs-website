import type { Product } from './products'
import { getProductMedia } from './productMedia'

// Web-optimized transparent product cutouts promoted from the QA-approved
// full-res masters (src/assets/images/products/cutouts/). Keyed by the product's
// hero image filename so shared artwork resolves too (e.g. wolverine-stack ->
// bpc-157-tb-500, klow -> ghk-cu).
const cutoutUrls = import.meta.glob('../assets/images/products/cutouts/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** The transparent cutout URL for a product, or undefined if none is promoted. */
export function getProductCutout(product: Pick<Product, 'slug' | 'image' | 'heroImage'>): string | undefined {
  // Try candidate image names in priority order and return the first that has a
  // promoted cutout. Using the canonical product art (getProductMedia) before a
  // localized/category override means products like bac-water — whose `image`
  // points at a category-fallback asset — still resolve to their own vial cutout.
  const localizedImageOverride = product.image !== product.heroImage ? product.image : undefined
  const candidates = [
    product.slug === 'klow' ? 'klow-es.png' : undefined,
    getProductMedia(product.slug)?.hero.src,
    localizedImageOverride,
    product.heroImage,
  ]
  for (const candidate of candidates) {
    if (!candidate) continue
    const stem = candidate.replace(/\.[a-z0-9]+$/i, '')
    const key = Object.keys(cutoutUrls).find((assetPath) => assetPath.endsWith(`/cutouts/${stem}.webp`))
    if (key) return cutoutUrls[key]
  }
  return undefined
}
