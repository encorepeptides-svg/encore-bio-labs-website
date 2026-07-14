import { describe, expect, it } from 'vitest'
import { isSpanishLanguageTag, localizePath, stripLocalePrefix } from './config'

describe('isSpanishLanguageTag', () => {
  it('recognizes es, es-MX, es-419, and es-US as Spanish', () => {
    expect(isSpanishLanguageTag('es')).toBe(true)
    expect(isSpanishLanguageTag('es-MX')).toBe(true)
    expect(isSpanishLanguageTag('es-419')).toBe(true)
    expect(isSpanishLanguageTag('es-US')).toBe(true)
  })

  it('does not treat English or unrelated tags as Spanish', () => {
    expect(isSpanishLanguageTag('en')).toBe(false)
    expect(isSpanishLanguageTag('en-US')).toBe(false)
    expect(isSpanishLanguageTag('pt-BR')).toBe(false)
  })
})

describe('stripLocalePrefix', () => {
  it('strips a /es prefix to recover the logical path', () => {
    expect(stripLocalePrefix('/es/products/retatrutide')).toEqual({ locale: 'es', path: '/products/retatrutide' })
  })

  it('maps bare /es to the logical homepage', () => {
    expect(stripLocalePrefix('/es')).toEqual({ locale: 'es', path: '/' })
  })

  it('treats unprefixed paths as English', () => {
    expect(stripLocalePrefix('/products/retatrutide')).toEqual({ locale: 'en', path: '/products/retatrutide' })
  })
})

describe('localizePath (language switching preserves the route)', () => {
  it('prefixes a logical path with /es for Spanish', () => {
    expect(localizePath('/products/retatrutide', 'es')).toBe('/es/products/retatrutide')
  })

  it('never sends a non-homepage route back to the homepage when switching locale', () => {
    expect(localizePath('/checkout', 'es')).toBe('/es/checkout')
    expect(localizePath('/checkout', 'es')).not.toBe('/es')
    expect(localizePath('/catalog', 'en')).toBe('/catalog')
  })

  it('maps the homepage to /es, not /es/', () => {
    expect(localizePath('/', 'es')).toBe('/es')
    expect(localizePath('/', 'en')).toBe('/')
  })

  it('preserves hash fragments across a locale switch', () => {
    expect(localizePath('/about#research-use-only', 'es')).toBe('/es/about#research-use-only')
  })

  it('leaves external, hash-only, mailto, and tel links untouched', () => {
    expect(localizePath('https://wa.me/19153595448', 'es')).toBe('https://wa.me/19153595448')
    expect(localizePath('#top', 'es')).toBe('#top')
    expect(localizePath('mailto:hello@encorebiolabs.com', 'es')).toBe('mailto:hello@encorebiolabs.com')
    expect(localizePath('tel:19153595448', 'es')).toBe('tel:19153595448')
  })
})
