import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { localizeResearchArea } from '../../data/categoryTranslations'
import { getResearchAreaBySlug } from '../../data/products'
import type { Locale } from '../../i18n/config'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { MetabolicWeightManagementCategoryPage } from './MetabolicWeightManagementCategoryPage'

function renderPage(locale: Locale) {
  const sourceArea = getResearchAreaBySlug('metabolic-weight-management')
  if (!sourceArea) throw new Error('Metabolic category is missing')
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath="/categories/metabolic-weight-management">
      <MetabolicWeightManagementCategoryPage area={localizeResearchArea(sourceArea, locale)} />
    </LocaleProvider>,
  )
}

describe('MetabolicWeightManagementCategoryPage', () => {
  it('renders the shared Retatrutide-led decision path with data-derived products and pricing', () => {
    const html = renderPage('en')
    expect(html).toContain('Metabolic research, led by Retatrutide.')
    expect(html).toContain('Flagship quick selection')
    expect(html).toContain('Start with the pathway, not the jargon.')
    expect(html).toContain('Tesamorelin')
    expect(html).toContain('MOTS-C')
    expect(html).toContain('AOD-9604')
    expect(html).toContain('CJC-1295 + Ipamorelin')
    expect(html).toContain('/products/retatrutide#retatrutide-purchase')
    expect(html).toContain('$89')
    expect(html).toContain('$169')
    expect(html).not.toContain('What is this category?')
    expect(html).not.toContain('guaranteed purity')
    expect(html).not.toContain('category-metabolic-weight-management.png')
  })

  it('renders the complete Spanish conversion path without English shell copy', () => {
    const html = renderPage('es')
    expect(html).toContain('Investigación metabólica, liderada por Retatrutide.')
    expect(html).toContain('Comienza con la vía, no con la jerga.')
    expect(html).toContain('Investigación de grasa abdominal')
    expect(html).toContain('Investigación de metabolismo y grasa')
    expect(html).toContain('Investigación de quema de grasa')
    expect(html).toContain('Investigación de hormona de crecimiento')
    expect(html).toContain('Productos claros. Límites definidos.')
    expect(html).toContain('/es/products/retatrutide')
    expect(html).not.toContain('Choose Options')
    expect(html).not.toContain('Research Details')
    expect(html).not.toContain('Documentation by request')
  })
})
