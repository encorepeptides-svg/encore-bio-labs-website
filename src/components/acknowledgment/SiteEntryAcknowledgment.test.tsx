// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { createMemoryStorage } from '../../test/memoryStorage'
import {
  createSiteEntryAcknowledgmentRecord,
  SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY,
} from '../../lib/acknowledgmentStorage'
import { AcknowledgmentGate } from './AcknowledgmentGate'
import { AcknowledgmentProvider } from './AcknowledgmentProvider'

describe('site-entry acknowledgment', () => {
  let root: Root | null = null
  let container: HTMLDivElement
  let memoryLocalStorage: Storage

  beforeEach(() => {
    memoryLocalStorage = createMemoryStorage()
    vi.stubGlobal('localStorage', memoryLocalStorage)
    vi.stubGlobal('sessionStorage', createMemoryStorage())
    window.history.replaceState({}, '', '/')
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (root) act(() => root?.unmount())
    root = null
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    vi.unstubAllGlobals()
  })

  function renderGate(locale: 'en' | 'es' = 'en', logicalPath = '/') {
    root = createRoot(container)
    act(() => {
      root?.render(
        <LocaleProvider locale={locale} logicalPath={logicalPath}>
          <AcknowledgmentProvider>
            <AcknowledgmentGate>
              <button type="button" data-protected-action="">Protected action</button>
            </AcknowledgmentGate>
          </AcknowledgmentProvider>
        </LocaleProvider>,
      )
    })
  }

  it('blocks first-time visitors, moves focus into the dialog, and cannot be bypassed', () => {
    renderGate()
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!
    const protectedContent = container.querySelector<HTMLElement>('[data-acknowledgment-protected-content]')!
    const backdrop = dialog.parentElement!

    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(document.activeElement).toBe(dialog)
    expect(protectedContent.hasAttribute('inert')).toBe(true)
    expect(protectedContent.getAttribute('aria-hidden')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')

    act(() => backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    expect(container.querySelector('[role="dialog"]')).toBeTruthy()
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(container.querySelector('[role="dialog"]')).toBeTruthy()
  })

  it('requires the deliberate primary action, persists acceptance, and skips the next visit', () => {
    renderGate()
    const primary = Array.from(container.querySelectorAll('button'))
      .find((button) => button.textContent?.includes('I Understand'))!
    act(() => primary.click())

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(container.querySelector('[data-acknowledgment-protected-content]')?.hasAttribute('inert')).toBe(false)
    expect(JSON.parse(memoryLocalStorage.getItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY)!)).toMatchObject({
      accepted: true,
      version: 'site-entry-ruo-v1',
      locale: 'en',
    })

    act(() => root?.unmount())
    root = null
    container.innerHTML = ''
    renderGate()
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('shows expired acceptance again', () => {
    const expired = createSiteEntryAcknowledgmentRecord(
      'en',
      new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    )
    memoryLocalStorage.setItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY, JSON.stringify(expired))
    renderGate()
    expect(container.querySelector('[role="dialog"]')).toBeTruthy()
  })

  it('leaves essential legal pages readable without recording acceptance', () => {
    root = createRoot(container)
    act(() => {
      root?.render(
        <LocaleProvider locale="en" logicalPath="/legal/research-use-only">
          <AcknowledgmentProvider bypassEntryGate>
            <AcknowledgmentGate>
              <article>Readable policy</article>
            </AcknowledgmentGate>
          </AcknowledgmentProvider>
        </LocaleProvider>,
      )
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(container.textContent).toContain('Readable policy')
    expect(memoryLocalStorage.getItem(SITE_ENTRY_ACKNOWLEDGMENT_STORAGE_KEY)).toBeNull()
  })

  it('localizes all content and policy links on the Spanish route', () => {
    window.history.replaceState({}, '', '/es/catalog')
    renderGate('es', '/catalog')

    expect(container.textContent).toContain('Solo para investigación')
    expect(container.textContent).toContain('Debes tener al menos 18 años')
    expect(container.textContent).toContain('Entiendo — Entrar al sitio')
    expect(container.querySelector<HTMLAnchorElement>('a[href="/es/legal/terms"]')?.target).toBe('_blank')
    expect(container.querySelector('a[href="/es/legal/privacy"]')).toBeTruthy()
    expect(container.querySelector('a[href="/es/legal/research-use-only"]')).toBeTruthy()
    expect(container.querySelector('a[href="/es/access-denied"]')).toBeTruthy()
    expect(container.textContent).toContain(
      'Acepto los Términos, la Política de Privacidad y la Política de Uso Exclusivo para Investigación.',
    )
  })

  it('keeps keyboard focus inside and loops from the final action to the first control', () => {
    renderGate()
    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')!
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ))
    const first = focusable[0]
    const last = focusable.at(-1)!

    act(() => last.focus())
    act(() => dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })))
    expect(document.activeElement).toBe(first)
  })
})
