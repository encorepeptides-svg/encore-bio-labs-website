// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { applyDocumentMetadata } from './applyMetadata'
import { pageMetadata } from './metadata'

describe('applyDocumentMetadata', () => {
  beforeEach(() => {
    // Mirror the static tags index.html always ships with — applyDocumentMetadata
    // updates these in place rather than creating them for meta[name=...] tags.
    document.head.innerHTML = `
      <meta name="description" content="" />
      <meta name="twitter:title" content="" />
      <meta name="twitter:description" content="" />
    `
    document.documentElement.lang = ''
  })

  it('sets <html lang> to match the active locale', () => {
    applyDocumentMetadata('/catalog', 'en', pageMetadata['/catalog'].en)
    expect(document.documentElement.lang).toBe('en')

    applyDocumentMetadata('/catalog', 'es', pageMetadata['/catalog'].es)
    expect(document.documentElement.lang).toBe('es')
  })

  it('renders distinct English metadata on the English route', () => {
    const meta = pageMetadata['/catalog'].en
    applyDocumentMetadata('/catalog', 'en', meta)
    expect(document.title).toBe(meta.title)
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(meta.description)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://encorebiolabs.com/catalog')
  })

  it('renders distinct Spanish metadata on the Spanish route, with a /es canonical URL', () => {
    const meta = pageMetadata['/catalog'].es
    applyDocumentMetadata('/catalog', 'es', meta)
    expect(document.title).toBe(meta.title)
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(meta.description)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://encorebiolabs.com/es/catalog')
  })

  it('English and Spanish titles/descriptions are never identical placeholders', () => {
    for (const [route, meta] of Object.entries(pageMetadata)) {
      expect(meta.en.title, `${route} en title`).not.toBe(meta.es.title)
      expect(meta.en.description, `${route} en description`).not.toBe(meta.es.description)
    }
  })

  it('emits hreflang alternates for en, es, and x-default', () => {
    applyDocumentMetadata('/catalog', 'en', pageMetadata['/catalog'].en)
    expect(document.querySelector('link[rel="alternate"][hreflang="en"]')?.getAttribute('href')).toBe('https://encorebiolabs.com/catalog')
    expect(document.querySelector('link[rel="alternate"][hreflang="es"]')?.getAttribute('href')).toBe('https://encorebiolabs.com/es/catalog')
    expect(document.querySelector('link[rel="alternate"][hreflang="x-default"]')?.getAttribute('href')).toBe('https://encorebiolabs.com/catalog')
  })

  it('localizes Open Graph and Twitter tags', () => {
    const meta = pageMetadata['/catalog'].es
    applyDocumentMetadata('/catalog', 'es', meta)
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(meta.title)
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('es_MX')
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(meta.title)
  })
})
