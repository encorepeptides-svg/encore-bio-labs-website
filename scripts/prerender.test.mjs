import { describe, expect, it } from 'vitest'
import { renderDocument, renderSitemap } from './prerender.mjs'

const baseHtml = `<!doctype html><html lang="en"><head><meta name="description" content="home"><meta name="robots" content="index, follow"><meta property="og:title" content="home"><meta property="og:description" content="home"><meta property="og:image" content="https://encorebiolabs.com/og-homepage.png"><meta name="twitter:title" content="home"><meta name="twitter:description" content="home"><meta name="twitter:image" content="https://encorebiolabs.com/og-homepage.png"><title>Home</title></head><body><div id="root"></div></body></html>`

describe('build-time prerendering', () => {
  it('bakes localized metadata, canonical, hreflang, and the www image host into HTML', () => {
    const html = renderDocument(baseHtml, {
      logicalPath: '/products/retatrutide',
      locale: 'es',
      meta: { title: 'Retatrutide Producto de Investigación', description: 'Descripción localizada' },
      imageUrl: 'https://www.encorebiolabs.com/og/products/retatrutide.png',
    })
    expect(html).toContain('<html lang="es"')
    expect(html).toContain('<title>Retatrutide Producto de Investigación</title>')
    expect(html).toContain('content="Descripción localizada"')
    expect(html).toContain('rel="canonical" href="https://www.encorebiolabs.com/es/products/retatrutide"')
    expect(html).toContain('hreflang="en" href="https://www.encorebiolabs.com/products/retatrutide"')
    expect(html).toContain('hreflang="es" href="https://www.encorebiolabs.com/es/products/retatrutide"')
    expect(html).toContain('hreflang="x-default" href="https://www.encorebiolabs.com/products/retatrutide"')
    expect(html).toContain('content="https://www.encorebiolabs.com/og/products/retatrutide.png"')
  })

  it('marks private and 404 shells noindex', () => {
    const html = renderDocument(baseHtml, {
      logicalPath: '/portal',
      locale: 'en',
      meta: { title: 'Private portal', description: 'Private workspace' },
      noindex: true,
    })
    expect(html).toContain('name="robots" content="noindex, nofollow"')
  })

  it('emits both locale URLs without private routes', () => {
    const sitemap = renderSitemap(['/', '/catalog', '/products/retatrutide'])
    expect(sitemap.match(/<loc>/g)).toHaveLength(6)
    expect(sitemap).toContain('<loc>https://www.encorebiolabs.com/catalog</loc>')
    expect(sitemap).toContain('<loc>https://www.encorebiolabs.com/es/catalog</loc>')
    expect(sitemap).not.toContain('/portal')
    expect(sitemap).not.toContain('/admin')
  })
})
