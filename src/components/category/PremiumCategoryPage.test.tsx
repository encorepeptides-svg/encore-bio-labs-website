import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { localizeCategoryContent, localizeResearchArea } from '../../data/categoryTranslations'
import { getCategoryExperience } from '../../data/categoryExperience'
import { categoryContent, getResearchAreaBySlug, products } from '../../data/products'
import type { Locale } from '../../i18n/config'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { PremiumCategoryPage } from './PremiumCategoryPage'

const categorySlugs = [
  'metabolic-weight-management',
  'recovery-regeneration',
  'longevity-cellular-health',
  'cognitive-performance',
  'hormone-wellness',
] as const

function renderCategory(slug: string, locale: Locale) {
  const sourceArea = getResearchAreaBySlug(slug)
  const sourceContent = categoryContent[slug]
  if (!sourceArea || !sourceContent) throw new Error(`Missing category ${slug}`)
  const area = localizeResearchArea(sourceArea, locale)
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath={`/categories/${slug}`}>
      <PremiumCategoryPage area={area} content={localizeCategoryContent(area, sourceContent, locale)} />
    </LocaleProvider>,
  )
}

describe('PremiumCategoryPage', () => {
  it.each(categorySlugs)('uses the same conversion architecture for %s', (slug) => {
    const html = renderCategory(slug, 'en')
    const config = getCategoryExperience(slug)
    expect(config).toBeDefined()
    expect(html).toContain('id="category-start"')
    expect(html).toContain('id="category-pathways"')
    expect(html).toContain('id="category-portfolio"')
    expect(html).toContain('Compare Research Pathways')
    expect(html).toContain('Browse Filtered Catalog')
    expect(html).not.toContain('What is this category?')
    expect(html).not.toMatch(/category-(?:recovery-regeneration|longevity-cellular-health|cognitive-performance|hormone-wellness)\.png/)

    for (const productSlug of config?.productSlugs ?? []) {
      const product = products.find((entry) => entry.slug === productSlug)
      expect(product).toBeDefined()
      expect(html).toContain(product?.name)
      expect(html).toContain(`/products/${productSlug}`)
      expect(html).toContain(`$${Math.min(...(product?.variants.map((variant) => variant.price) ?? []))}`)
    }
  })

  it.each(categorySlugs)('keeps the complete shared shell localized for Spanish %s', (slug) => {
    const html = renderCategory(slug, 'es')
    expect(html).toContain('/es/products/')
    expect(html).toContain('Comparar vías de investigación')
    expect(html).toContain('Ver catálogo filtrado')
    expect(html).toContain('Preguntas frecuentes de la categoría')
    expect(html).not.toContain('Choose Options')
    expect(html).not.toContain('Research Details')
    expect(html).not.toContain('Documentation by request')
    expect(html).not.toContain('Start with the pathway')
  })
})
