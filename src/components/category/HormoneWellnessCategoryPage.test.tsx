import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { localizeResearchArea } from '../../data/categoryTranslations'
import { getResearchAreaBySlug, products } from '../../data/products'
import { LocaleProvider } from '../../i18n/LocaleContext'
import type { Locale } from '../../i18n/config'
import { HormoneWellnessCategoryPage } from './HormoneWellnessCategoryPage'

const productSlugs = ['kisspeptin', 'hcg', 'hgh-191aa', 'igf1-lr3', 'dsip', 'pt-141']

function renderPage(locale: Locale) {
  const sourceArea = getResearchAreaBySlug('hormone-wellness')
  if (!sourceArea) throw new Error('Hormone & Wellness category is missing')

  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/categories/hormone-wellness">
      <HormoneWellnessCategoryPage area={localizeResearchArea(sourceArea, locale)} />
    </LocaleProvider>,
  )
}

describe('HormoneWellnessCategoryPage', () => {
  it('renders all six live catalog products and their data-derived starting prices', () => {
    const html = renderPage('en')

    for (const slug of productSlugs) {
      const product = products.find((entry) => entry.slug === slug)
      expect(product).toBeDefined()
      expect(html).toContain(product?.name)
      expect(html).toContain(`/products/${slug}`)
      expect(html).toContain(`$${Math.min(...(product?.variants.map((variant) => variant.price) ?? []))}`)
    }
  })

  it('keeps the Spanish route localized with the same products and conversion structure', () => {
    const html = renderPage('es')

    expect(html).toContain('Elige la vía. Encuentra el compuesto de investigación correcto.')
    expect(html).toContain('Seis compuestos, organizados claramente')
    expect(html).toContain('Todos los productos de esta categoría se venden exclusivamente para investigación de laboratorio.')
    expect(html).toContain('/es/products/kisspeptin')
    expect(html).not.toContain('Choose Options')
    expect(html).not.toContain('Research Details')
  })
})
