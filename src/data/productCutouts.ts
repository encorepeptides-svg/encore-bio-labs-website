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
export function getProductCutout(product: Product): string | undefined {
  const src = getProductMedia(product.slug)?.hero.src
  if (!src) return undefined
  const stem = src.replace(/\.[a-z0-9]+$/i, '')
  const key = Object.keys(cutoutUrls).find((assetPath) => assetPath.endsWith(`/cutouts/${stem}.webp`))
  return key ? cutoutUrls[key] : undefined
}
