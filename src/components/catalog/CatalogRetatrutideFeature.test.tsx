// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '../../context/CartContext'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { CatalogRetatrutideFeature } from './CatalogRetatrutideFeature'
import { createMemoryStorage } from '../../test/memoryStorage'

describe('CatalogRetatrutideFeature variant selection', () => {
  let root: Root | null = null
  let container: HTMLDivElement

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
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

  it.each(['en', 'es'] as const)('updates price, SKU and cart contents for the selected variant in %s', (locale) => {
    act(() => {
      root?.render(
        <LocaleProvider locale={locale} logicalPath="/catalog">
          <CartProvider>
            <CatalogRetatrutideFeature />
          </CartProvider>
        </LocaleProvider>,
      )
    })

    const variantButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('25 mg'))
    expect(variantButton).toBeTruthy()
    act(() => variantButton?.click())

    expect(variantButton?.getAttribute('aria-pressed')).toBe('true')
    expect(container.textContent).toContain('$149')
    expect(container.textContent).toContain('RETATRUTIDE-25MG')

    const addButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('25 mg') && button.textContent?.toLowerCase().includes(locale === 'es' ? 'carrito' : 'cart'))
    expect(addButton).toBeTruthy()
    act(() => addButton?.click())

    const stored = JSON.parse(window.localStorage.getItem('encore-bio-labs-cart-v1') ?? '[]') as Array<{ variantLabel?: string; unitPrice?: number }>
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ variantLabel: '25 mg', unitPrice: 149 })
  })
})
