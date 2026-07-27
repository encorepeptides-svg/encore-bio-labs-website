// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CartContext, type CartContextValue } from '../../context/cartStore'
import { LocaleProvider } from '../../i18n/LocaleContext'
import type { CartItem } from '../../lib/cart'
import { createMemoryStorage } from '../../test/memoryStorage'
import { CheckoutPage } from './CheckoutPage'

const item: CartItem = {
  id: 'bpc-157-5-mg-vial-only',
  productSlug: 'bpc-157',
  productName: 'BPC-157',
  variantLabel: '5 mg',
  variantFormat: 'vial',
  image: '/products/bpc-157.webp',
  unitPrice: 49,
  sku: 'BPC-5MG-VIAL-ONLY-1',
  optionId: 'vial-only',
  purchaseType: 'Vial Only',
  kitIncluded: false,
  packSize: 1,
  savings: 0,
  linePrice: 49,
  quantity: 1,
}

function cartValue(items: CartItem[]): CartContextValue {
  const subtotal = items.reduce((total, entry) => total + entry.linePrice * entry.quantity, 0)
  const itemCount = items.reduce((total, entry) => total + entry.quantity, 0)
  return {
    items,
    isOpen: false,
    itemCount,
    subtotal,
    totals: { subtotal, shipping: 0, tax: 0, discount: 0, total: subtotal },
    openCart: vi.fn(),
    closeCart: vi.fn(),
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    calculateSubtotal: () => subtotal,
    calculateTotal: () => ({ subtotal, shipping: 0, tax: 0, discount: 0, total: subtotal }),
  }
}

describe('checkout acknowledgment flow', () => {
  let root: Root | null = null
  let container: HTMLDivElement

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    vi.stubGlobal('sessionStorage', createMemoryStorage())
    window.history.replaceState({}, '', '/checkout')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    if (root) act(() => root?.unmount())
    root = null
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  function render(items: CartItem[]) {
    act(() => {
      root?.render(
        <LocaleProvider locale="en" logicalPath="/checkout">
          <CartContext.Provider value={cartValue(items)}>
            <CheckoutPage />
          </CartContext.Provider>
        </LocaleProvider>,
      )
    })
  }

  it('keeps the real final checkout action disabled until all five boxes are selected', () => {
    render([item])
    const finalAction = container.querySelector<HTMLButtonElement>(
      'button[aria-describedby="checkout-acknowledgment-status"]',
    )!
    const boxes = Array.from(container.querySelectorAll<HTMLInputElement>(
      'input[id^="checkout-acknowledgment-"]',
    ))

    expect(boxes).toHaveLength(5)
    expect(finalAction.disabled).toBe(true)
    for (const box of boxes) act(() => box.click())
    expect(finalAction.disabled).toBe(false)
  })

  it('clears all five boxes when the cart contents change', () => {
    render([item])
    for (const box of container.querySelectorAll<HTMLInputElement>(
      'input[id^="checkout-acknowledgment-"]',
    )) {
      act(() => box.click())
    }
    expect(container.querySelector<HTMLButtonElement>(
      'button[aria-describedby="checkout-acknowledgment-status"]',
    )?.disabled).toBe(false)

    render([{ ...item, quantity: 2 }])

    expect(Array.from(container.querySelectorAll<HTMLInputElement>(
      'input[id^="checkout-acknowledgment-"]',
    )).every((box) => !box.checked)).toBe(true)
    expect(container.querySelector<HTMLButtonElement>(
      'button[aria-describedby="checkout-acknowledgment-status"]',
    )?.disabled).toBe(true)
  })
})
