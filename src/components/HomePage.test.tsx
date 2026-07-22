import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CartProvider } from '../context/CartContext'
import type { Locale } from '../i18n/config'
import { LocaleProvider } from '../i18n/LocaleContext'
import { homepage as homepageEn } from '../locales/en/homepage'
import { homepage as homepageEs } from '../locales/es/homepage'
import { HomePage } from './HomePage'

function renderPage(locale: Locale) {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/">
      <CartProvider>
        <HomePage />
      </CartProvider>
    </LocaleProvider>,
  )
}

describe('HomePage conversion content', () => {
  it('uses clear English CTAs and only marks best sellers with real COAs', () => {
    const html = renderPage('en')
    expect(html).toContain('Browse Catalog')
    // The video is the hero canvas itself, not a bordered or rounded media card.
    expect(html).toContain('home-hero-video-canvas')
    expect(html).toContain('home-hero-scrim')
    expect(html).not.toContain('home-hero-video-stage')
    expect(html).not.toContain('home-hero-video-media')
    expect(html).toContain('preload="metadata"')
    expect(html.match(/On-file COA/g)).toHaveLength(3)
  })

  it('ships matching Spanish CTAs and verified COA chips', () => {
    const html = renderPage('es')
    expect(html).toContain('Ver catálogo')
    expect(html.match(/COA disponible/g)).toHaveLength(3)
  })

  it('keeps the compact trust and conversion copy aligned across locales', () => {
    expect(homepageEn.trustCompleteKits).toBe('Premium Complete Kits')
    expect(homepageEn.trustFastSupport).toBe('Fast Human Support')
    expect(homepageEs.trustCompleteKits).toBe('Kits completos premium')
    expect(homepageEs.trustFastSupport).toBe('Atención humana rápida')
    expect(homepageEn.processTitle).toContain('Three clear steps')
    expect(homepageEs.processTitle).toContain('Tres pasos claros')
    expect(Object.keys(homepageEs)).toEqual(Object.keys(homepageEn))
  })
})
