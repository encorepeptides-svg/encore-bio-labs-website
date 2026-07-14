// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryStorage } from '../test/memoryStorage'
import { LOCALE_STORAGE_KEY } from './config'
import { browserPrefersSpanish, readSavedLocale, resolveBarePathLocale, saveLocale } from './detectLocale'

describe('locale detection', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to English when nothing is saved and the browser is English', () => {
    vi.stubGlobal('navigator', { language: 'en-US', languages: ['en-US', 'en'] })
    expect(resolveBarePathLocale()).toBe('en')
  })

  it('loads Spanish for a Spanish browser language with no saved preference', () => {
    vi.stubGlobal('navigator', { language: 'es-MX', languages: ['es-MX', 'es'] })
    expect(browserPrefersSpanish()).toBe(true)
    expect(resolveBarePathLocale()).toBe('es')
  })

  it('recognizes es-419 as a Spanish-preferring browser', () => {
    vi.stubGlobal('navigator', { language: 'es-419', languages: ['es-419'] })
    expect(browserPrefersSpanish()).toBe(true)
    expect(resolveBarePathLocale()).toBe('es')
  })

  it('a saved English preference overrides a Spanish-leaning browser', () => {
    vi.stubGlobal('navigator', { language: 'es-MX', languages: ['es-MX'] })
    saveLocale('en')
    expect(resolveBarePathLocale()).toBe('en')
  })

  it('a saved Spanish preference persists across a simulated page refresh', () => {
    saveLocale('es')
    // A refresh only carries localStorage forward — re-read it fresh, as a new pageview would.
    expect(readSavedLocale()).toBe('es')
    expect(resolveBarePathLocale()).toBe('es')
  })

  it('ignores a corrupted or unsupported saved locale value', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'fr')
    expect(readSavedLocale()).toBeNull()
  })
})
