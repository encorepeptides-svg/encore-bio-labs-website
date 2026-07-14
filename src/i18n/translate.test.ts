import { describe, expect, it, vi } from 'vitest'
import { translate } from './translate'

describe('translate()', () => {
  it('produces different navigation labels for English and Spanish', () => {
    const enLabel = translate('en', 'navigation', 'catalog')
    const esLabel = translate('es', 'navigation', 'catalog')
    expect(enLabel).toBe('Catalog')
    expect(esLabel).toBe('Catálogo')
    expect(enLabel).not.toBe(esLabel)
  })

  it('interpolates {vars} into the template', () => {
    expect(translate('en', 'navigation', 'cartWithItems', { count: 3 })).toBe('Open cart with 3 items')
  })

  it('returns the raw key as a safe fallback when a key exists in neither locale, instead of crashing or rendering undefined', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(translate('es', 'navigation', '__does_not_exist__')).toBe('__does_not_exist__')
    expect(translate('en', 'navigation', '__does_not_exist__')).toBe('__does_not_exist__')
    warnSpy.mockRestore()
  })

  it('logs a dev-only warning when a key is missing, without throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => translate('es', 'navigation', '__another_missing_key__')).not.toThrow()
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
