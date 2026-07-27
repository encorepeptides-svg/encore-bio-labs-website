import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CartProvider } from '../../context/CartContext'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import type { Locale } from '../../i18n/config'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { ProductPage } from './ProductPage'

function renderPage(locale: Locale) {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/products/retatrutide">
      <CartProvider>
        <ProductPage slug="retatrutide" />
      </CartProvider>
    </LocaleProvider>,
  )
}

describe('RetatrutideProductPage', () => {
  it('restores the flagship visual research and conversion journey', () => {
    const html = renderPage('en')
    expect(html).toContain('Retatrutide')
    expect(html).toContain('synthetic peptide studied as a triple agonist')
    expect(html).not.toContain('Three metabolic pathways. One advanced research molecule.')
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
    expect(html).toContain('agonista triple de los receptores GLP-1, GIP y glucagón')
    expect(html).not.toContain('Tres vías metabólicas. Una molécula de investigación avanzada.')
    expect(html).toContain('Los investigadores están estudiando más que la pérdida de peso.')
    expect(html).toContain('Glucosa y A1C')
    expect(html).toContain('Marcadores cardiometabólicos')
    expect(html).toContain('Una línea de investigación. Múltiples resultados conectados.')
    expect(html).toContain('Lo que reportó el patrocinador de TRIUMPH-1')
    expect(html).toContain('Preguntas frecuentes')
  })

  it('keeps the original canonical Retatrutide copy in both languages', () => {
    const product = products.find((entry) => entry.slug === 'retatrutide')
    if (!product) throw new Error('Retatrutide is missing')

    expect(product.description).toContain('triple agonist at the GLP-1, GIP, and glucagon receptors')
    expect(product.shortDescription).toContain('triple agonist at the GLP-1, GIP, and glucagon receptors')

    const spanishProduct = getLocalizedProduct(product, 'es')
    expect(spanishProduct.description).toBe('Una entrada del catálogo de investigación organizada para comparar variantes, solicitar el COA y facilitar una revisión centrada en la documentación.')
    expect(spanishProduct.shortDescription).toContain('agonista triple de los receptores GLP-1, GIP y glucagón')
  })
})
