import type { Product, ProductVariant } from '../data/products'

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
  quantity: number
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

export function createCartItemId(productSlug: string, variant: Pick<ProductVariant, 'label' | 'format'>): CartItemId {
  return [productSlug, variant.label, variant.format]
    .join('__')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function createCartItem(product: Product, variant: ProductVariant, quantity = 1): CartItem {
  return {
    id: createCartItemId(product.slug, variant),
    productSlug: product.slug,
    productName: product.name,
    variantLabel: variant.label,
    variantFormat: variant.format,
    image: product.image,
    unitPrice: variant.price,
    quantity: normalizeQuantity(quantity),
    inventoryStatus: product.stockStatus === 'Limited Stock' ? 'limited' : product.stockStatus === 'On Request' ? 'on-request' : 'in-stock',
  }
}

export function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 1
  return Math.max(1, Math.min(99, Math.floor(quantity)))
}

export function calculateSubtotal(items: CartItem[]) {
  return items.reduce((subtotal, item) => subtotal + item.unitPrice * item.quantity, 0)
}

export function calculateItemCount(items: CartItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0)
}

export function calculateShipping(input: ShippingCalculationInput) {
  if (!input.itemCount || input.subtotal <= 0) return 0
  if (input.destinationCountry === 'MX') return 20
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
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
