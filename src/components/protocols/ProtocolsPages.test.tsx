// @vitest-environment jsdom
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CartContext, type CartContextValue } from '../../context/cartStore'
import type { Product, ProductVariant } from '../../data/products'
import { getConfiguredProtocolSubtotal, getProtocolBySlug } from '../../data/protocols'
import type { Locale } from '../../i18n/config'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { ProtocolDetailPage } from './ProtocolDetailPage'
import { ProtocolsHubPage } from './ProtocolsHubPage'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function emptyCartValue(onAdd?: (product: Product, variant: ProductVariant, quantity: number) => void): CartContextValue {
  return {
    items: [], isOpen: false, itemCount: 0, subtotal: 0,
    totals: { subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0 },
    openCart() {}, closeCart() {}, removeFromCart() {}, updateQuantity() {}, clearCart() {},
    addToCart(product, variant, quantity = 1) { onAdd?.(product, variant, quantity) },
    calculateSubtotal: () => 0,
    calculateTotal: () => ({ subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0 }),
  }
}

function renderHub(locale: Locale) {
  return renderToStaticMarkup(<LocaleProvider locale={locale} logicalPath="/protocols"><ProtocolsHubPage /></LocaleProvider>)
}

function renderDetail(slug: string, locale: Locale) {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath={`/protocols/${slug}`}>
      <CartContext.Provider value={emptyCartValue()}><ProtocolDetailPage slug={slug} /></CartContext.Provider>
    </LocaleProvider>,
  )
}

describe('Protocols storefront pages', () => {
  it('renders the grouped English hub with current product prices and localized routes', () => {
    const html = renderHub('en')
    expect(html).toContain('Compare complete research pathways')
    expect(html).toContain('Metabolic &amp; Weight Management')
    expect(html.match(/2 protocols/g)).toHaveLength(5)
    expect(html).toContain('/protocols/cellular-energy-research')
    expect(html).toContain('Current catalog subtotal')
  })

  it('renders equivalent Spanish hub copy and prefixed protocol links', () => {
    const html = renderHub('es')
    expect(html).toContain('Compara vías completas de investigación')
    expect(html).toContain('Metabolismo y control de peso')
    expect(html).toContain('/es/protocols/cellular-energy-research')
    expect(html).not.toContain('View protocol')
    expect(html).not.toContain("What's included")
  })

  it('uses a shared detail template with live variants, cart CTA, calculator, FAQ, and substantiated COA links', () => {
    const html = renderDetail('cellular-energy-research', 'en')
    expect(html).toContain('Cellular Energy Research Set')
    expect(html).toContain('$259')
    expect(html).not.toContain('NAD-500MG')
    expect(html).toContain('500 mg')
    expect(html).toContain('1000 mg')
    expect(html).toContain('Add complete set to cart')
    expect(html).toContain('How much to draw')
    expect(html).toContain('View NAD+ COA')
    expect(html.match(/<details/g)).toHaveLength(6)
  })

  it('derives configured subtotals from current variants instead of protocol copy', () => {
    const protocol = getProtocolBySlug('cellular-energy-research')!
    expect(getConfiguredProtocolSubtotal(protocol)).toBe(259)
    expect(getConfiguredProtocolSubtotal(protocol, { 'nad-plus': '1000 mg' })).toBe(289)
  })

  it('carries a changed variant and every component into the existing cart API', () => {
    const added: Array<{ product: Product; variant: ProductVariant; quantity: number }> = []
    const cartValue = emptyCartValue((product, variant, quantity) => added.push({ product, variant, quantity }))
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => root.render(
      <LocaleProvider locale="en" logicalPath="/protocols/cellular-energy-research">
        <CartContext.Provider value={cartValue}><ProtocolDetailPage slug="cellular-energy-research" /></CartContext.Provider>
      </LocaleProvider>,
    ))

    const variantSelect = container.querySelector<HTMLSelectElement>('select')!
    act(() => {
      variantSelect.value = '1000 mg'
      variantSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const addButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Add complete set to cart'))!
    act(() => addButton.click())

    expect(added.map(({ product, variant, quantity }) => [product.slug, variant.sku, quantity])).toEqual([
      ['nad-plus', 'NAD-1000MG', 1],
      ['ss31', 'SS31-10MG', 1],
      ['mots-c', 'MOTS-C-10MG', 1],
    ])
    act(() => root.unmount())
    container.remove()
  })
})
