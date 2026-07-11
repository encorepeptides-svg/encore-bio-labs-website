import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product, ProductVariant } from '../data/products'
import {
  calculateItemCount,
  calculateSubtotal,
  calculateTotal,
  createCartItem,
  normalizeQuantity,
  type CartItem,
  type CartItemId,
} from '../lib/cart'
import { CartContext, type CartContextValue } from './cartStore'

const CART_STORAGE_KEY = 'encore-bio-labs-cart-v1'

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = useCallback((product: Product, variant: ProductVariant, quantity = 1) => {
    const nextItem = createCartItem(product, variant, quantity)

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
  }, [])

  const removeFromCart = useCallback((itemId: CartItemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: CartItemId, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, quantity: normalizeQuantity(quantity) } : item)),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
