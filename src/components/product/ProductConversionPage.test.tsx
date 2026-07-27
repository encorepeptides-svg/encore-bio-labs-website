import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CartProvider } from '../../context/CartContext'
import { getProductConversionContent, isConversionProductSlug, productConversionContent, type ConversionProductSlug } from '../../data/productConversionContent'
import { productConversionProfiles } from '../../data/productConversionProfiles'
import { productTrendCards } from '../../data/productTrendContent'
import { getLocalizedProduct } from '../../data/productTranslations'
import { products } from '../../data/products'
import type { Locale } from '../../i18n/config'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { ProductConversionPage } from './ProductConversionPage'

function renderConversionProduct(slug: ConversionProductSlug, locale: Locale) {
  const product = products.find((entry) => entry.slug === slug)
  if (!product) throw new Error(`${slug} is missing`)
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} logicalPath={`/products/${slug}`}>
      <CartProvider>
        <ProductConversionPage
          product={getLocalizedProduct(product, locale)}
          content={getProductConversionContent(slug, locale)}
        />
      </CartProvider>
    </LocaleProvider>,
  )
}

describe('product conversion pages', () => {
  it('keeps every pilot content block complete and bilingual', () => {
    for (const entry of Object.values(productConversionContent)) {
      for (const locale of ['en', 'es'] as const) {
        const copy = entry.locales[locale]
        expect(copy.hero.headline.length).toBeGreaterThan(20)
        expect(copy.interests.cards).toHaveLength(3)
        expect(copy.evidence.rows).toHaveLength(4)
        expect(copy.evidence.sources).toHaveLength(2)
        expect(copy.evidence.sources.every((source) => source.href.startsWith('https://'))).toBe(true)
        expect(copy.faq.items.length).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('renders the requested conversion hierarchy and canonical Retatrutide prices', () => {
    const html = renderConversionProduct('retatrutide', 'en')
    const sectionIds = ['product-purchase', 'product-interest-heading', 'product-evidence', 'product-research-overview-heading', 'product-formats-heading', 'product-documentation-heading', 'product-faq-retatrutide', 'product-final-cta-retatrutide']
    const positions = sectionIds.map((id) => html.indexOf(`id="${id}"`))

    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    expect(html).toContain('Three metabolic pathways. One advanced research molecule.')
    expect(html).toContain('Advanced human trials')
    expect(html).toContain('$89')
    expect(html).toContain('$99')
    expect(html).toContain('$169')
    expect(html).toContain('$179')
    expect(html).toContain('aria-describedby="evidence-badge-description-retatrutide"')
    expect(html).toContain('data-theme="dark"')
  })

  it('renders evidence-aware Wolverine Stack content and exact format totals', () => {
    const html = renderConversionProduct('wolverine-stack', 'en')
    expect(html).toContain('Two recovery research paths, organized in one complete format.')
    expect(html).toContain('Combination not clinically studied')
    expect(html).toContain('Mostly lab or animal evidence')
    expect(html).toContain('$95')
    expect(html).toContain('$105')
    expect(html).toContain('data-theme="lab"')
  })

  it('renders NAD+ evidence boundaries and canonical strength totals', () => {
    const html = renderConversionProduct('nad-plus', 'en')
    expect(html).toContain('Study one of the cell’s most important energy-transfer systems.')
    expect(html).toContain('Strong basic biology; weak direct-vial human outcome evidence.')
    expect(html).toContain('Why NAD+ gets so much attention.')
    expect(html).toContain('It carries cellular energy')
    expect(html).toContain('500 mg')
    expect(html).toContain('$65')
    expect(html).toContain('$75')
    expect(html).toContain('1000 mg')
    expect(html).toContain('$95')
    expect(html).toContain('$105')
    expect(html).toContain('data-theme="lab"')
  })

  it('renders equivalent Spanish content and localized internal routes', () => {
    for (const slug of ['retatrutide', 'wolverine-stack', 'nad-plus'] as const) {
      const html = renderConversionProduct(slug, 'es')
      expect(html).toContain('Solo para uso en investigación')
      expect(html).toContain('/es/quality')
      expect(html).toContain('/es/contact')
      expect(html).toContain('Resumen de evidencia')
      if (slug === 'nad-plus') expect(html).toContain('Por qué NAD+ genera tanta atención.')
    }
  })

  it('covers every canonical product while keeping Retatrutide on its custom content record', () => {
    expect(products.every((product) => isConversionProductSlug(product.slug))).toBe(true)
    expect(Object.keys(productConversionProfiles)).toHaveLength(products.length - 3)

    const retatrutide = getProductConversionContent('retatrutide', 'en')
    expect(retatrutide.localeContent.hero.headline).toBe('Three metabolic pathways. One advanced research molecule.')
    expect(retatrutide.visualVariant).toBe('metabolic')
  })

  it('builds complete bilingual evidence-aware content for every remaining product', () => {
    for (const slug of Object.keys(productConversionProfiles) as Array<keyof typeof productConversionProfiles>) {
      for (const locale of ['en', 'es'] as const) {
        const content = getProductConversionContent(slug, locale)
        const copy = content.localeContent
        expect(copy.hero.headline.length, `${slug}-${locale}`).toBeGreaterThan(25)
        expect(copy.interests.cards, `${slug}-${locale}`).toHaveLength(3)
        expect(copy.evidence.rows, `${slug}-${locale}`).toHaveLength(4)
        expect(copy.evidence.sources, `${slug}-${locale}`).toHaveLength(2)
        expect(copy.evidence.sources.every((source) => source.href.startsWith('https://')), `${slug}-${locale}`).toBe(true)
        expect(copy.faq.items, `${slug}-${locale}`).toHaveLength(4)
      }
    }
  })

  it('renders representative metabolic, cognitive, hormone, recovery, and accessory pages in the clean-pharma system', () => {
    const examples = [
      ['tesamorelin', 'A focused way to study abdominal-fat and growth-hormone signaling.'],
      ['cerebrolysin', 'A long clinical-research history, presented with its mixed results intact.'],
      ['kisspeptin', 'Follow how reproductive signals communicate from brain to hormone release.'],
      ['ghk-cu', 'Copper-peptide research focused on skin structure and cellular remodeling.'],
      ['bac-water', 'A clearly labeled laboratory accessory for documented workflows.'],
    ] as const

    for (const [slug, headline] of examples) {
      const html = renderConversionProduct(slug, 'en')
      expect(html).toContain(headline)
      expect(html).toContain('data-theme="lab"')
      expect(html).toContain('data-product-visual-system="nad-clean-pharma"')
      expect(html).toContain('data-research-presentation="nad-spotlight"')
      expect(html).toContain('data-highlight-presentation="product-highlights"')
      expect(html).toContain('ph-variant-longevity')
      expect(html).toContain(`id="product-faq-${slug}"`)
    }
  })

  it('uses the NAD+ clean-pharma presentation for every product except Retatrutide', () => {
    for (const product of products) {
      const html = renderConversionProduct(product.slug as ConversionProductSlug, 'en')

      if (product.slug === 'retatrutide') {
        expect(html).toContain('data-product-visual-system="retatrutide-original"')
        expect(html).not.toContain('data-research-presentation="nad-spotlight"')
        expect(html).not.toContain('data-highlight-presentation="product-highlights"')
        expect(html).toContain('ph-variant-metabolic')
        continue
      }

      expect(html, product.slug).toContain('data-product-visual-system="nad-clean-pharma"')
      expect(html, product.slug).toContain('data-research-presentation="nad-spotlight"')
      expect(html, product.slug).toContain('data-highlight-presentation="product-highlights"')
      expect(html, product.slug).toContain('ph-variant-longevity')
    }
  })

  it('provides three bilingual, product-specific highlights for every non-Retatrutide product', () => {
    expect(Object.keys(productTrendCards)).toHaveLength(products.length - 1)
    const englishContent = new Set<string>()
    const spanishContent = new Set<string>()

    for (const [slug, localizedCards] of Object.entries(productTrendCards)) {
      for (const locale of ['en', 'es'] as const) {
        const cards = localizedCards[locale]
        const combinedCopy = cards.map((card) => `${card.title} ${card.body}`).join(' ')

        expect(cards, `${slug}-${locale}`).toHaveLength(3)
        expect(cards.every((card) => card.title.length > 8 && card.body.length > 35), `${slug}-${locale}`).toBe(true)
        expect(combinedCopy, `${slug}-${locale}`).not.toMatch(/tested on animals|animal results showed|probado en animales|resultados en animales/i)
        expect(combinedCopy, `${slug}-${locale}`).not.toMatch(/\b(?:guaranteed|cures?|treats?)\b|garantizad[oa]s?|cura enfermedades|trata enfermedades/i)
        expect(combinedCopy, `${slug}-${locale}`).not.toMatch(/common reason people are curious|people often mention|easy-to-understand angle|razón común por la que|las personas suelen mencionar|ángulo fácil de entender/i)

        if (locale === 'en') englishContent.add(combinedCopy)
        else spanishContent.add(combinedCopy)
      }
    }

    expect(englishContent.size).toBe(products.length - 1)
    expect(spanishContent.size).toBe(products.length - 1)

    const aodEnglish = renderConversionProduct('aod-9604', 'en')
    const aodSpanish = renderConversionProduct('aod-9604', 'es')
    expect(aodEnglish).toContain('Designed around fat metabolism')
    expect(aodEnglish).toContain('Why AOD-9604 gets attention.')
    expect(aodEnglish).not.toContain('Instagram')
    expect(aodEnglish).not.toContain('TikTok')
    expect(aodSpanish).toContain('Diseñado en torno al metabolismo de la grasa')

    const nadEnglish = renderConversionProduct('nad-plus', 'en')
    expect(nadEnglish).toContain('It carries cellular energy')
    expect(nadEnglish).toContain('The NAD+/NADH cycle moves electrons')
  })

  it('renders unique Spanish research highlights for remaining products', () => {
    const cerebrolysin = renderConversionProduct('cerebrolysin', 'es')
    const bacWater = renderConversionProduct('bac-water', 'es')
    expect(cerebrolysin).toContain('Una mezcla, no una sola molécula')
    expect(cerebrolysin).toContain('Evidencia humana relevante pero inconsistente')
    expect(bacWater).toContain('Agua estéril con conservante')
    expect(bacWater).toContain('/es/quality')
  })
})
