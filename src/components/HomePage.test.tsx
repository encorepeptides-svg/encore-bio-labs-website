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
    expect(html).toContain('Find My Product')
    expect(html).toContain('Browse Catalog')
    expect(html).toContain('The 1 mL BAC Water presentation shown here')
    expect(html).toContain('Encore Bio Labs 1 mL BAC Water vial on a bright molecular laboratory background')
    expect(html.match(/On-file COA/g)).toHaveLength(3)
  })

  it('ships matching Spanish CTAs and verified COA chips', () => {
    const html = renderPage('es')
    expect(html).toContain('Encontrar mi producto')
    expect(html).toContain('Ver catálogo')
    expect(html).toContain('La presentación de agua BAC de 1 mL que se muestra')
    expect(html).toContain('Vial de agua BAC Encore Bio Labs de 1 mL sobre un fondo molecular de laboratorio')
    expect(html.match(/COA disponible/g)).toHaveLength(3)
  })

  it('keeps concrete Why Encore benefits aligned across locales', () => {
    expect(homepageEn.whyCard1Title).toBe('Complete Kits, One Box')
    expect(homepageEn.whyCard4Title).toBe('Real Humans, Fast Replies')
    expect(homepageEs.whyCard1Title).toBe('Kit completo en una caja')
    expect(homepageEs.whyCard4Title).toBe('Personas reales, respuesta rápida')
    expect(Object.keys(homepageEs)).toEqual(Object.keys(homepageEn))
  })
})
