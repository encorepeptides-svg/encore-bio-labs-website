// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { CatalogRetatrutideFeature } from './CatalogRetatrutideFeature'

describe('CatalogRetatrutideFeature product preview', () => {
  let root: Root | null = null
  let container: HTMLDivElement

  beforeEach(() => {
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

  it.each(['en', 'es'] as const)('shows starting pricing and routes configuration to the product page in %s', (locale) => {
    act(() => {
      root?.render(
        <LocaleProvider locale={locale} logicalPath="/catalog">
          <CatalogRetatrutideFeature />
        </LocaleProvider>,
      )
    })

    expect(container.textContent).toContain(locale === 'es' ? 'Desde USD $89' : 'Starting from $89')
    expect(container.textContent).toContain(locale === 'es' ? 'Ver producto y precios' : 'View Product & Pricing')
    expect(container.textContent).not.toContain(locale === 'es' ? 'Agregar 10 mg al carrito' : 'Add 10 mg to cart')
    expect(container.textContent).not.toContain('RETATRUTIDE-10MG')
    expect(container.querySelectorAll('button')).toHaveLength(0)

    const cardLink = container.querySelector<HTMLAnchorElement>(`a[aria-label][href="${locale === 'es' ? '/es' : ''}/products/retatrutide"]`)
    expect(cardLink?.getAttribute('aria-label')).toBe(locale === 'es' ? 'Ver detalles del producto Retatrutide' : 'View Retatrutide product details')
  })
})
