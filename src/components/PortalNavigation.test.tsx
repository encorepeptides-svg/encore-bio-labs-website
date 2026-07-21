// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CartProvider } from '../context/CartContext'
import { LocaleProvider } from '../i18n/LocaleContext'
import { createMemoryStorage } from '../test/memoryStorage'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

describe('client and administrator navigation', () => {
  let roots: Root[] = []

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    for (const root of roots) act(() => root.unmount())
    roots = []
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  function renderShell(locale: 'en' | 'es', component: 'navbar' | 'footer') {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    roots.push(root)
    act(() => {
      root.render(
        <LocaleProvider locale={locale} logicalPath="/">
          {component === 'navbar' ? <CartProvider><Navbar /></CartProvider> : <Footer />}
        </LocaleProvider>,
      )
    })
    return container
  }

  it('shows a prominent client login on desktop and in the opened mobile menu without an admin link', () => {
    const container = renderShell('en', 'navbar')
    const desktopLogin = container.querySelector<HTMLAnchorElement>('a[href="/client-login"]')
    expect(desktopLogin?.textContent).toContain('Client Login')
    expect(container.querySelector('a[href="/admin"]')).toBeNull()

    const menuButton = container.querySelector<HTMLButtonElement>('button[aria-controls="mobile-menu"]')!
    act(() => menuButton.click())
    const mobileMenu = container.querySelector('[role="dialog"]')
    expect(mobileMenu?.querySelector<HTMLAnchorElement>('a[href="/client-login"]')?.textContent).toContain('Client Login')
    expect(mobileMenu?.querySelector('a[href="/admin"]')).toBeNull()
  })

  it('keeps the admin link as the final footer link and localizes both destinations in Spanish', () => {
    const englishFooter = renderShell('en', 'footer')
    const englishLinks = englishFooter.querySelectorAll<HTMLAnchorElement>('footer a')
    expect(englishLinks.item(englishLinks.length - 1).href).toMatch(/\/admin$/)
    expect(englishLinks.item(englishLinks.length - 1).textContent).toContain('Admin Access')

    const spanishFooter = renderShell('es', 'footer')
    expect(spanishFooter.querySelector<HTMLAnchorElement>('a[href="/es/client-login"]')?.textContent).toContain('Portal de clientes')
    const spanishLinks = spanishFooter.querySelectorAll<HTMLAnchorElement>('footer a')
    expect(spanishLinks.item(spanishLinks.length - 1).getAttribute('href')).toBe('/es/admin')
    expect(spanishLinks.item(spanishLinks.length - 1).textContent).toContain('Acceso administrativo')
  })
})
