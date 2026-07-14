import { categoryVisuals, products, type Product } from '../../data/products'
import { getProductHeroImage } from '../../data/productMedia'

/**
 * The five approved catalog research categories, in the approved display order.
 * These drive the category selector, the in-grid section order, and section
 * anchors. 'All' is a selector-only value used to clear search / jump to the top.
 */
export const filterTabs = [
  'All',
  'Metabolic Research',
  'Recovery & Regeneration',
  'Hormone & Wellness',
  'Cellular Energy & Longevity',
  'Cognitive Research',
] as const

/**
 * Non-peptide accessories (BAC Water) are not one of the five research
 * categories, so they render in a trailing grid section but are intentionally
 * kept out of the category selector.
 */
export const accessoryFilter = 'Essentials' as const

export type CatalogFilter = (typeof filterTabs)[number] | typeof accessoryFilter

/** The five research categories, in order — the grid sections above accessories. */
export const categoryFilters = filterTabs.filter((tab) => tab !== 'All') as Exclude<CatalogFilter, 'All' | 'Essentials'>[]

/**
 * Maps a product to its primary catalog section. Taxonomy notes:
 * - The copper peptides (GHK-Cu, AHK-Cu) and the KLOW blend all belong to
 *   Recovery & Regeneration — the former "Skin & Regenerative Research" section
 *   was merged here and no longer exists.
 * - IGF1-LR3 follows its product.category (Hormone & Wellness).
 * - BAC Water is the only accessory and maps to the trailing Essentials section.
 */
export function getCatalogFilter(product: Product): CatalogFilter {
  if (product.slug === 'ghk-cu' || product.slug === 'ahk-cu' || product.slug === 'klow') {
    return 'Recovery & Regeneration'
  }

  if (product.slug === 'bac-water') {
    return accessoryFilter
  }

  if (product.category === 'Metabolic & Weight Management') {
    return 'Metabolic Research'
  }

  if (product.category === 'Recovery & Regeneration') {
    return 'Recovery & Regeneration'
  }

  if (product.category === 'Cognitive & Performance') {
    return 'Cognitive Research'
  }

  if (product.category === 'Longevity & Cellular Health') {
    return 'Cellular Energy & Longevity'
  }

  if (product.category === 'Hormone & Wellness') {
    return 'Hormone & Wellness'
  }

  return accessoryFilter
}

/** Live product count per catalog section, derived from product data (never hardcoded). */
export function getCategoryCount(filter: CatalogFilter): number {
  if (filter === 'All') return products.length
  return products.filter((product) => getCatalogFilter(product) === filter).length
}

/**
 * Ordered, de-duplicated list of measured strengths for a product (e.g.
 * ["10 mg", "15 mg", …]). Pulled live from variants so features never
 * hardcode strengths. Falls back to variant labels when unmeasured.
 */
export function getProductStrengths(product: Product): string[] {
  const measured = product.variants.filter(
    (variant) => variant.strength && variant.unitType && variant.unitType !== 'other',
  )

  const source = measured.length ? measured : product.variants
  const seen = new Set<string>()
  const strengths: string[] = []

  for (const variant of source) {
    const label =
      variant.strength && variant.unitType && variant.unitType !== 'other'
        ? `${variant.strength} ${variant.unitType}`
        : variant.label
    if (!seen.has(label)) {
      seen.add(label)
      strengths.push(label)
    }
  }

  return strengths
}

export function catalogSectionId(filter: CatalogFilter) {
  return `category-${filter.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}

const filterLabelKeys: Record<CatalogFilter, string> = {
  All: 'categoryAll',
  'Metabolic Research': 'categoryWeightManagement',
  'Recovery & Regeneration': 'categoryRecoveryRegeneration',
  'Hormone & Wellness': 'categoryHormoneWellness',
  'Cellular Energy & Longevity': 'categoryCellularEnergyLongevity',
  'Cognitive Research': 'categoryCognitivePerformance',
  Essentials: 'categoryEssentials',
}

const filterDescriptionKeys: Partial<Record<CatalogFilter, string>> = {
  'Metabolic Research': 'categoryDescWeightManagement',
  'Recovery & Regeneration': 'categoryDescRecoveryRegeneration',
  'Hormone & Wellness': 'categoryDescHormoneWellness',
  'Cellular Energy & Longevity': 'categoryDescCellularEnergyLongevity',
  'Cognitive Research': 'categoryDescCognitivePerformance',
  Essentials: 'categoryDescEssentials',
}

/**
 * Legacy in-page anchors that external links may still point at, mapped to the
 * current section ids. Consumed by CatalogPage to preserve deep links after the
 * taxonomy change (e.g. old "Skin & Regenerative Research" → Recovery).
 */
export const legacyCatalogAnchorAliases: Record<string, string> = {
  'category-weight-management': catalogSectionId('Metabolic Research'),
  'category-skin-regenerative-research': catalogSectionId('Recovery & Regeneration'),
  'category-cellular-energy-longevity-research': catalogSectionId('Cellular Energy & Longevity'),
  'category-cognitive-performance': catalogSectionId('Cognitive Research'),
}

/** Translated display label for a catalog filter/category. The filter value itself stays a stable English key (used for ids, routing, and `key` props). */
export function getCatalogFilterLabel(filter: CatalogFilter, t: (key: string) => string) {
  return t(filterLabelKeys[filter])
}

/** Translated one-line research-framed description for a catalog section, or empty string when none. */
export function getCatalogFilterDescription(filter: CatalogFilter, t: (key: string) => string) {
  const key = filterDescriptionKeys[filter]
  return key ? t(key) : ''
}

export function getProductImageName(product: Product) {
  return getProductHeroImage(product.slug, product.image) || categoryVisuals[product.category]
}

export function getPriceLabel(product: Product, t?: (key: string) => string) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)

  if (!prices.length) return t ? t('quote') : 'Quote'

  const lowestPrice = Math.min(...prices)
  const price = `$${lowestPrice.toLocaleString()}`

  if (product.variants.length <= 1) return price
  return t ? `${t('from')} ${price}` : `From ${price}`
}

export function getStrengthSummary(product: Product, t?: (key: string, vars?: Record<string, string | number>) => string) {
  const measured = product.variants.filter(
    (variant) => variant.strength && variant.unitType && variant.unitType !== 'other',
  )
  const units = new Set(measured.map((variant) => variant.unitType))

  if (measured.length >= 2 && units.size === 1) {
    const strengths = measured.map((variant) => variant.strength as number)
    return `${Math.min(...strengths)}–${Math.max(...strengths)} ${measured[0].unitType}`
  }

  if (product.variants.length === 1) {
    return product.variants[0].label
  }

  return t ? t('optionsCount', { count: product.variants.length }) : `${product.variants.length} options`
}
