import type { Product, ProductVariant } from '../data/products'
import { getProductHeroImage } from '../data/productMedia'
import { getDefaultPurchaseSelection, quotePurchase, type PurchaseOptionId, type PurchaseSelection } from './purchaseOptions'

export type CartItemId = string

export type CartSku = {
  productSlug: string
  productName: string
  variantLabel: string
  variantFormat: string
}

export type CartItem = CartSku & {
  id: CartItemId
  image: string
  unitPrice: number
  sku: string
  optionId: PurchaseOptionId
  purchaseType: string
  kitIncluded: boolean
  packSize: number
  savings: number
  linePrice: number
  quantity: number
  category?: string
  bacWaterAmount?: string
  inventoryStatus?: 'in-stock' | 'limited' | 'on-request' | 'unavailable'
}

export type CartAdjustment = {
  label: string
  amount: number
}

export type CartTotals = {
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
}

export type ShippingCalculationInput = {
  subtotal: number
  itemCount: number
  destinationCountry?: string
  destinationState?: string
}

export type TaxCalculationInput = ShippingCalculationInput & {
  shipping: number
}

export type DiscountCalculationInput = ShippingCalculationInput & {
  code?: string
}

export type SubscriptionCalculationInput = {
  subtotal: number
  enabled?: boolean
}

export function createCartItemId(productSlug: string, variant: Pick<ProductVariant, 'label' | 'format'>, selection?: PurchaseSelection): CartItemId {
  return [productSlug, variant.label, variant.format, selection?.optionId, selection?.packSize, selection?.includeKit]
    .join('__')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function createCartItem(product: Product, variant: ProductVariant, quantity = 1, selection = getDefaultPurchaseSelection(product)): CartItem {
  const quote = quotePurchase(product, variant, selection)
  return {
    id: createCartItemId(product.slug, variant, quote),
    productSlug: product.slug,
    productName: product.name,
    variantLabel: variant.label,
    variantFormat: variant.format,
    image: getProductHeroImage(product.slug, product.image) ?? product.image,
    unitPrice: quote.unitPrice,
    sku: quote.sku,
    optionId: quote.optionId,
    purchaseType: quote.purchaseType,
    kitIncluded: quote.kitIncluded,
    packSize: quote.packSize,
    savings: quote.savings,
    linePrice: quote.linePrice,
    quantity: normalizeQuantity(quantity),
    category: product.category,
    bacWaterAmount: product.bacWaterAmount,
    inventoryStatus: product.stockStatus === 'Unavailable' ? 'unavailable' : product.stockStatus === 'Limited Stock' ? 'limited' : product.stockStatus === 'In Stock' ? 'in-stock' : 'on-request',
  }
}

export function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1
  return Math.max(1, Math.min(99, Math.floor(quantity)))
}

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((candidate) => {
      if (!candidate || typeof candidate !== 'object') return []
      const item = candidate as Partial<CartItem>
      if (
        typeof item.id !== 'string' ||
        typeof item.productSlug !== 'string' ||
        typeof item.productName !== 'string' ||
        typeof item.variantLabel !== 'string' ||
        typeof item.variantFormat !== 'string' ||
        typeof item.image !== 'string' ||
        typeof item.unitPrice !== 'number' ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0
      ) return []
      return [{
        ...item,
        sku: typeof item.sku === 'string' ? item.sku : item.id,
        optionId: item.optionId === 'complete-kit' || item.optionId === 'multipack' ? item.optionId : 'vial-only',
        purchaseType: typeof item.purchaseType === 'string' ? item.purchaseType : 'Vial Only',
        kitIncluded: Boolean(item.kitIncluded),
        packSize: typeof item.packSize === 'number' && Number.isFinite(item.packSize) && item.packSize > 0 ? Math.floor(item.packSize) : 1,
        savings: typeof item.savings === 'number' && Number.isFinite(item.savings) && item.savings >= 0 ? item.savings : 0,
        linePrice: typeof item.linePrice === 'number' && Number.isFinite(item.linePrice) && item.linePrice >= 0 ? item.linePrice : item.unitPrice,
        quantity: normalizeQuantity(Number(item.quantity)),
      } as CartItem]
    })
  } catch {
    return []
  }
}

export function reconcileCartItems(storedItems: CartItem[], catalog: Product[]) {
  return storedItems.flatMap((storedItem) => {
    const product = catalog.find((entry) => entry.slug === storedItem.productSlug)
    const variant = product?.variants.find(
      (entry) => entry.label === storedItem.variantLabel && entry.format === storedItem.variantFormat,
    )
    if (!product || !variant || product.stockStatus === 'Unavailable' || variant.price <= 0) return []

    const selection: PurchaseSelection = {
      optionId: storedItem.optionId ?? (storedItem.purchaseType === 'Encore Complete Kit' ? 'complete-kit' : storedItem.purchaseType === 'Multi-Vial Research Pack' ? 'multipack' : 'vial-only'),
      packSize: storedItem.packSize || 1,
      includeKit: storedItem.kitIncluded,
    }
    return [createCartItem(product, variant, storedItem.quantity, selection)]
  })
}

export function calculateSubtotal(items: CartItem[]) {
  return items.reduce((subtotal, item) => subtotal + item.linePrice * item.quantity, 0)
}

export function calculateItemCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.packSize * item.quantity, 0)
}

export function calculateShipping(input: ShippingCalculationInput) {
  if (!input.itemCount || input.subtotal <= 0) return 0
  if (input.destinationCountry === 'MX') return 15
  return 0
}

export function calculateTax(_input: TaxCalculationInput) {
  return 0
}

export function calculateDiscount(_input: DiscountCalculationInput): CartAdjustment {
  return { label: 'Discount', amount: 0 }
}

export function calculateSubscriptionAdjustment(_input: SubscriptionCalculationInput): CartAdjustment {
  return { label: 'Subscription', amount: 0 }
}

export function calculateTotal(items: CartItem[], input: Omit<ShippingCalculationInput, 'subtotal' | 'itemCount'> = {}): CartTotals {
  const subtotal = calculateSubtotal(items)
  const itemCount = calculateItemCount(items)
  const shipping = calculateShipping({ ...input, subtotal, itemCount })
  const tax = calculateTax({ ...input, subtotal, itemCount, shipping })
  const discount = calculateDiscount({ ...input, subtotal, itemCount }).amount
  const subscription = calculateSubscriptionAdjustment({ subtotal }).amount
  const total = Math.max(0, subtotal + shipping + tax - discount - subscription)

  return { subtotal, shipping, tax, discount: discount + subscription, total }
}

export function formatCartCurrency(value: number) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100
  return `$${rounded.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}
