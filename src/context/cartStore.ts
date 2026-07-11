import { createContext } from 'react'
import type { Product, ProductVariant } from '../data/products'
import type { CartItem, CartItemId, CartTotals } from '../lib/cart'

export type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  itemCount: number
  subtotal: number
  totals: CartTotals
  openCart: () => void
  closeCart: () => void
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeFromCart: (itemId: CartItemId) => void
  updateQuantity: (itemId: CartItemId, quantity: number) => void
  clearCart: () => void
  calculateSubtotal: () => number
  calculateTotal: () => CartTotals
}

export const CartContext = createContext<CartContextValue | null>(null)
