import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product, ProductVariant } from '../data/products'
import {
  calculateItemCount,
  calculateSubtotal,
  calculateTotal,
  createCartItem,
  normalizeQuantity,
  parseStoredCart,
  type CartItem,
  type CartItemId,
} from '../lib/cart'
import type { PurchaseSelection } from '../lib/purchaseOptions'
import { isProductPurchasable } from '../lib/purchaseOptions'
import { CartContext, type CartContextValue } from './cartStore'

const CART_STORAGE_KEY = 'encore-bio-labs-cart-v1'

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart())
  const [isOpen, setIsOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    let active = true

    void import('../data/products').then(({ products }) => {
      if (!active) return
      setItems((current) => current.flatMap((storedItem) => {
        const product = products.find((entry) => entry.slug === storedItem.productSlug)
        const variant = product?.variants.find(
          (entry) => entry.label === storedItem.variantLabel && entry.format === storedItem.variantFormat,
        )
        const selection: PurchaseSelection = {
          optionId: storedItem.optionId ?? (storedItem.purchaseType === 'Encore Complete Kit' ? 'complete-kit' : storedItem.purchaseType === 'Multi-Vial Research Pack' ? 'multipack' : 'vial-only'),
          packSize: storedItem.packSize || 1,
          includeKit: storedItem.kitIncluded,
        }
        return product && variant && isProductPurchasable(product) ? [createCartItem(product, variant, storedItem.quantity, selection)] : []
      }))
    })

    return () => {
      active = false
    }
  }, [])

  const addToCart = useCallback((product: Product, variant: ProductVariant, quantity = 1, selection?: PurchaseSelection) => {
    if (!isProductPurchasable(product) || variant.price <= 0) {
      setAnnouncement(`${product.name} is not currently available to add to cart.`)
      return
    }
    const nextItem = createCartItem(product, variant, quantity, selection)

    setItems((current) => {
      const existing = current.find((item) => item.id === nextItem.id)
      if (!existing) return [...current, nextItem]

      return current.map((item) =>
        item.id === nextItem.id
          ? { ...item, quantity: normalizeQuantity(item.quantity + nextItem.quantity) }
          : item,
      )
    })
    setIsOpen(true)
    setAnnouncement(`${product.name} ${variant.label}, ${nextItem.purchaseType}, added to cart.`)
  }, [])

  const removeFromCart = useCallback((itemId: CartItemId) => {
    const removed = items.find((item) => item.id === itemId)
    if (removed) setAnnouncement(`${removed.productName} ${removed.variantLabel} removed from cart.`)
    setItems((current) => current.filter((item) => item.id !== itemId))
  }, [items])

  const updateQuantity = useCallback((itemId: CartItemId, quantity: number) => {
    const item = items.find((entry) => entry.id === itemId)
    const nextQuantity = normalizeQuantity(quantity)
    if (item) setAnnouncement(`${item.productName} ${item.variantLabel} quantity updated to ${nextQuantity}.`)
    setItems((current) => current.map((entry) => entry.id === itemId ? { ...entry, quantity: nextQuantity } : entry))
  }, [items])

  const clearCart = useCallback(() => {
    setItems([])
    setAnnouncement('Cart cleared.')
  }, [])
  const subtotal = useMemo(() => calculateSubtotal(items), [items])
  const itemCount = useMemo(() => calculateItemCount(items), [items])
  const totals = useMemo(() => calculateTotal(items), [items])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      itemCount,
      subtotal,
      totals,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      calculateSubtotal: () => calculateSubtotal(items),
      calculateTotal: () => calculateTotal(items),
    }),
    [addToCart, clearCart, itemCount, isOpen, items, removeFromCart, subtotal, totals, updateQuantity],
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
    </CartContext.Provider>
  )
}
