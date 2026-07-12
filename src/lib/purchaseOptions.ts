export const COMPLETE_KIT_DEFAULT_PREMIUM = 10

import type { Product, ProductVariant } from '../data/products'

export type PurchaseOptionId = 'vial-only' | 'complete-kit' | 'multipack'

export type PurchaseSelection = {
  optionId: PurchaseOptionId
  packSize: number
  includeKit: boolean
}

export type PurchaseQuote = PurchaseSelection & {
  sku: string
  purchaseType: string
  kitIncluded: boolean
  unitPrice: number
  linePrice: number
  savings: number
  savingsPercent: number
  pricePerMeasure?: number
}

export const DEFAULT_PURCHASE_SELECTION: PurchaseSelection = {
  optionId: 'complete-kit',
  packSize: 1,
  includeKit: true,
}

export const multipackDiscounts: Record<number, number> = { 2: 0.05, 3: 0.08, 5: 0.12 }

export function roundMultipackProductTotal(product: Product, value: number) {
  return product.purchaseRules.productType === 'research-vial' ? Math.round(value) : Math.round(value * 100) / 100
}

export function money(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`
}

export function unitMoney(value: number) {
  if (value >= 1) return money(value)
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
}

export function getKitPremium(product: Product) {
  return product.purchaseRules.kitPremium ?? COMPLETE_KIT_DEFAULT_PREMIUM
}

export function isProductPurchasable(product: Product) {
  return product.stockStatus !== 'Unavailable' && product.variants.some((variant) => variant.price > 0)
}

export function getDefaultPurchaseSelection(product: Product): PurchaseSelection {
  return product.purchaseRules.kitEligible
    ? DEFAULT_PURCHASE_SELECTION
    : { optionId: 'vial-only', packSize: 1, includeKit: false }
}

export function normalizePurchaseSelection(product: Product, selection: PurchaseSelection): PurchaseSelection {
  if (selection.optionId === 'complete-kit' && !product.purchaseRules.kitEligible) {
    return { optionId: 'vial-only', packSize: 1, includeKit: false }
  }

  if (selection.optionId === 'multipack' && !product.purchaseRules.multipackEligible) {
    return { optionId: 'vial-only', packSize: 1, includeKit: false }
  }

  if (selection.optionId === 'multipack') {
    const allowed = product.purchaseRules.multipackQuantities
    const packSize = allowed.includes(selection.packSize) ? selection.packSize : Math.min(...allowed)
    return {
      optionId: 'multipack',
      packSize: Number.isFinite(packSize) ? packSize : 1,
      includeKit: product.purchaseRules.kitEligible && selection.includeKit,
    }
  }

  return selection.optionId === 'complete-kit'
    ? { optionId: 'complete-kit', packSize: 1, includeKit: true }
    : { optionId: 'vial-only', packSize: 1, includeKit: false }
}

export function changePurchaseOption(product: Product, current: PurchaseSelection, optionId: PurchaseOptionId) {
  const smallestPack = product.purchaseRules.multipackQuantities.length
    ? Math.min(...product.purchaseRules.multipackQuantities)
    : 1
  return normalizePurchaseSelection(product, {
    optionId,
    packSize: optionId === 'multipack' && current.optionId === 'multipack' ? current.packSize : smallestPack,
    // Moving away from Complete Kit is deliberate; multipack kit inclusion is
    // always an explicit checkbox choice.
    includeKit: optionId === 'complete-kit',
  })
}

export function quotePurchase(product: Product, variant: ProductVariant, selection: PurchaseSelection): PurchaseQuote {
  const normalized = normalizePurchaseSelection(product, selection)
  const isPack = normalized.optionId === 'multipack'
  const packSize = normalized.packSize
  const discount = isPack ? multipackDiscounts[packSize] ?? 0 : 0
  const rawDiscountedVials = variant.price * packSize * (1 - discount)
  const discountedVials = isPack ? roundMultipackProductTotal(product, rawDiscountedVials) : rawDiscountedVials
  const kitIncluded = normalized.includeKit
  const linePrice = discountedVials + (kitIncluded ? getKitPremium(product) : 0)
  const savings = variant.price * packSize - discountedVials
  const unitPrice = discountedVials / packSize
  return {
    ...normalized,
    packSize,
    sku: `${variant.sku ?? product.slug}-${normalized.optionId}-${packSize}${kitIncluded ? '-KIT' : ''}`.toUpperCase(),
    purchaseType: normalized.optionId === 'complete-kit' ? 'Encore Complete Kit' : isPack ? 'Multi-Vial Research Pack' : product.purchaseRules.productType === 'research-vial' ? 'Vial Only' : 'Product Only',
    kitIncluded,
    unitPrice,
    linePrice,
    savings,
    savingsPercent: discount * 100,
    pricePerMeasure: variant.strength ? discountedVials / (variant.strength * packSize) : undefined,
  }
}

export function getRetatrutideVariantBadge(product: Product, variant: ProductVariant) {
  if (product.slug !== 'retatrutide') return undefined
  const measurable = product.variants.filter((entry) => entry.strength && entry.price > 0)
  if (variant === measurable[0]) return 'Starter'
  if (variant.strength === 20) return 'Most Popular'
  if (variant.strength === 30) return 'Best Value'
  return undefined
}
