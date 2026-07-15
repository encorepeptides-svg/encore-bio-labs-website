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
  it('renders a Retatrutide-led portfolio hub without duplicating the product research explorer', () => {
    const html = renderPage('en')
    expect(html).toContain('Metabolic research, led by Retatrutide.')
    expect(html).toContain('One category. Five materially different research approaches.')
    expect(html).toContain('Tesamorelin')
    expect(html).toContain('MOTS-C')
    expect(html).toContain('AOD-9604')
    expect(html).toContain('CJC-1295 + Ipamorelin')
    expect(html).toContain('Belly-fat reduction research')
    expect(html).toContain('Metabolism &amp; fat-loss research')
    expect(html).toContain('Fat-burning research')
    expect(html).toContain('Growth-hormone boost research')
    expect(html).toContain('/products/retatrutide#retatrutide-full-research')
    expect(html).not.toContain('What the TRIUMPH-1 Sponsor Reported')
    expect(html).not.toContain('guaranteed purity')
    expect(html).not.toContain('Before and after')
  })

  it('renders the full Spanish decision path without English fallback copy', () => {
    const html = renderPage('es')
    expect(html).toContain('Investigación metabólica, liderada por Retatrutide.')
    expect(html).toContain('Por qué los investigadores siguen de cerca un agonista triple')
    expect(html).toContain('Una categoría. Cinco enfoques de investigación realmente distintos.')
    expect(html).toContain('Investigación de grasa abdominal')
    expect(html).toContain('Investigación de metabolismo y grasa')
    expect(html).toContain('Investigación de quema de grasa')
    expect(html).toContain('Investigación de hormona de crecimiento')
    expect(html).toContain('Productos claros. Registros visibles. Límites definidos.')
    expect(html).toContain('/es/products/retatrutide')
    expect(html).not.toContain('Compare All Compounds')
    expect(html).not.toContain('View product')
  })
})
