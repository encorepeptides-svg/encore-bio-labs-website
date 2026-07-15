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
  it('renders sourced trial context, disclosures, and no fabricated documents', () => {
    const html = renderPage('en')
    expect(html).toContain('What the TRIUMPH-1 Sponsor Reported')
    expect(html).toContain('2,339')
    expect(html).toContain('28.3%')
    expect(html).toContain('They are not Encore customer outcomes')
    expect(html).toContain('Batch-specific documentation is available')
    expect(html).not.toContain('guaranteed purity')
    expect(html).not.toContain('Before and after')
  })

  it('renders the full Spanish decision path without English fallback copy', () => {
    const html = renderPage('es')
    expect(html).toContain('Retatrutide y la próxima frontera de la investigación metabólica')
    expect(html).toContain('Por qué los investigadores siguen de cerca un agonista triple')
    expect(html).toContain('Lo que reportó el patrocinador de TRIUMPH-1')
    expect(html).toContain('Ve más allá del titular')
    expect(html).toContain('/es/products/retatrutide')
    expect(html).not.toContain('Explore the Research')
    expect(html).not.toContain('Go Deeper Than the Headline')
  })
})
