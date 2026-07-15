import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CartProvider } from '../../context/CartContext'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import type { Locale } from '../../i18n/config'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { RetatrutideProductPage } from './RetatrutideProductPage'

function renderPage(locale: Locale) {
  const product = products.find((entry) => entry.slug === 'retatrutide')
  if (!product) throw new Error('Retatrutide is missing')
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/products/retatrutide">
      <CartProvider>
        <RetatrutideProductPage product={getLocalizedProduct(product, locale)} />
      </CartProvider>
    </LocaleProvider>,
  )
}

describe('RetatrutideProductPage', () => {
  it('restores the flagship visual research and conversion journey', () => {
    const html = renderPage('en')
    expect(html).toContain("Encore&#x27;s Flagship")
    expect(html).toContain('28.3%')
    expect(html).toContain('24.1 cm')
    expect(html).toContain('Waist Reduction Research Journey')
    expect(html).toContain('Glucose &amp; A1C')
    expect(html).toContain('Cardiometabolic Markers')
    expect(html).toContain('Knee Pain &amp; Mobility')
    expect(html).toContain('Sleep Apnea Research')
    expect(html).toContain('One pathway of research. Multiple connected outcomes.')
    expect(html).toContain('What the TRIUMPH-1 Sponsor Reported')
    expect(html).toContain('Complete Kit Included')
    expect(html).toContain('Frequently asked questions')
    expect(html).toContain('Other metabolic research pathways')
  })

  it('restores the same flagship journey in Spanish', () => {
    const html = renderPage('es')
    expect(html).toContain('Producto insignia de Encore')
    expect(html).toContain('Los investigadores están estudiando más que la pérdida de peso.')
    expect(html).toContain('Glucosa y A1C')
    expect(html).toContain('Marcadores cardiometabólicos')
    expect(html).toContain('Una línea de investigación. Múltiples resultados conectados.')
    expect(html).toContain('Lo que reportó el patrocinador de TRIUMPH-1')
    expect(html).toContain('Preguntas frecuentes')
  })
})
