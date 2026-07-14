import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product, ProductVariant } from '../data/products'
import {
  calculateItemCount,
  calculateSubtotal,
  calculateTotal,
  createCartItem,
  normalizeQuantity,
  parseStoredCart,
  reconcileCartItems,
  type CartItem,
  type CartItemId,
} from '../lib/cart'
import { isProductPurchasable, type PurchaseSelection } from '../lib/purchaseOptions'
import { useTranslation } from '../i18n/LocaleContext'
import { purchaseTypeLabel } from '../i18n/displayLabels'
import { CartContext, type CartContextValue } from './cartStore'

const CART_STORAGE_KEY = 'encore-bio-labs-cart-v1'

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('cart')
  const { t: tCommon } = useTranslation('common')
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
      setItems((current) => reconcileCartItems(current, products))
    })

    return () => {
      active = false
    }
  }, [])

  const addToCart = useCallback((product: Product, variant: ProductVariant, quantity = 1, selection?: PurchaseSelection) => {
    if (!isProductPurchasable(product) || variant.price <= 0) {
      setAnnouncement(t('unavailableAnnouncement', { product: product.name }))
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
    setAnnouncement(t('addedAnnouncement', { product: product.name, variant: variant.label, purchaseType: purchaseTypeLabel(tCommon, nextItem.purchaseType) }))
  }, [t, tCommon])

  const removeFromCart = useCallback((itemId: CartItemId) => {
    const removed = items.find((item) => item.id === itemId)
    if (removed) setAnnouncement(t('removedAnnouncement', { product: removed.productName, variant: removed.variantLabel }))
    setItems((current) => current.filter((item) => item.id !== itemId))
  }, [items, t])

  const updateQuantity = useCallback((itemId: CartItemId, quantity: number) => {
    const item = items.find((entry) => entry.id === itemId)
    const nextQuantity = normalizeQuantity(quantity)
    if (item) setAnnouncement(t('quantityUpdatedAnnouncement', { product: item.productName, variant: item.variantLabel, quantity: nextQuantity }))
    setItems((current) => current.map((entry) => entry.id === itemId ? { ...entry, quantity: nextQuantity } : entry))
  }, [items, t])

  const clearCart = useCallback(() => {
    setItems([])
    setAnnouncement(t('clearedAnnouncement'))
  }, [t])
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
