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

  it('shows a prominent login on desktop and in the opened mobile menu without an admin link', () => {
    const container = renderShell('en', 'navbar')
    const desktopLogin = container.querySelector<HTMLAnchorElement>('a[href="/client-login"]')
    expect(desktopLogin?.textContent).toContain('Login')
    expect(container.querySelector('a[href="/admin"]')).toBeNull()

    const menuButton = container.querySelector<HTMLButtonElement>('button[aria-controls="mobile-menu"]')!
    act(() => menuButton.click())
    const mobileMenu = container.querySelector('[role="dialog"]')
    expect(mobileMenu?.querySelector<HTMLAnchorElement>('a[href="/client-login"]')?.textContent).toContain('Login')
    expect(mobileMenu?.querySelector('a[href="/admin"]')).toBeNull()
  })

  it('places the distributor portal beside admin access and localizes both destinations in Spanish', () => {
    const englishFooter = renderShell('en', 'footer')
    expect(englishFooter.querySelector<HTMLAnchorElement>('a[href="/distributor"]')?.textContent).toContain('Distributor Portal')
    expect(englishFooter.querySelector<HTMLAnchorElement>('a[href="/admin"]')?.textContent).toContain('Admin Access')

    const spanishFooter = renderShell('es', 'footer')
    expect(spanishFooter.querySelector<HTMLAnchorElement>('a[href="/es/client-login"]')?.textContent).toContain('Portal de clientes')
    expect(spanishFooter.querySelector<HTMLAnchorElement>('a[href="/es/distributor"]')?.textContent).toContain('Portal de distribuidores')
    expect(spanishFooter.querySelector<HTMLAnchorElement>('a[href="/es/admin"]')?.textContent).toContain('Acceso administrativo')
  })
})
