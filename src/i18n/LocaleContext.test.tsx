// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageSelector } from '../components/LanguageSelector'
import { createMemoryStorage } from '../test/memoryStorage'
import { LOCALE_STORAGE_KEY } from './config'
import { LocaleProvider } from './LocaleContext'

function renderSelector(variant: 'nav' | 'mobile' | 'footer', logicalPath: string) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => {
    root.render(
      <LocaleProvider locale="en" logicalPath={logicalPath}>
        <LanguageSelector variant={variant} />
      </LocaleProvider>,
    )
  })
  return { container, root }
}

describe('language switching via the selector', () => {
  let assignSpy: ReturnType<typeof vi.fn>
  let roots: Root[] = []

  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    assignSpy = vi.fn()
    // jsdom's real Location#assign isn't configurable enough for vi.spyOn to wrap
    // directly, so replace window.location wholesale with a spyable stand-in.
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: assignSpy, search: '', hash: '' },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    for (const root of roots) act(() => root.unmount())
    roots = []
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('persists the chosen language and preserves the current route (desktop nav variant)', () => {
    const { container, root } = renderSelector('nav', '/products/retatrutide')
    roots.push(root)
    const esButton = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'ES')!
    act(() => esButton.click())

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es')
    expect(assignSpy).toHaveBeenCalledWith(expect.stringContaining('/es/products/retatrutide'))
  })

  it('the mobile selector switches language the same way as desktop, without redirecting home', () => {
    const { container, root } = renderSelector('mobile', '/catalog')
    roots.push(root)
    const esButton = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'ES')!
    act(() => esButton.click())

    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('es')
    const target = assignSpy.mock.calls[0]?.[0] as string
    expect(target).toContain('/es/catalog')
    expect(target).not.toBe('/es')
    expect(target).not.toBe('/')
  })

  it('marks the active language with aria-current for accessibility', () => {
    const { container, root } = renderSelector('footer', '/')
    roots.push(root)
    const enButton = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'EN')!
    const esButton = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'ES')!
    expect(enButton.getAttribute('aria-current')).toBe('true')
    expect(esButton.getAttribute('aria-current')).toBeNull()
  })
})
