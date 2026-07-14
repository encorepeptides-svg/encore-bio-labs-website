import { describe, expect, it } from 'vitest'
import { getLocalizedProduct } from '../../data/productTranslations'
import { products } from '../../data/products'
import { getCatalogFilter } from './catalogHelpers'

function wordCount(value: string) {
  return value.match(/[\p{L}\p{N}]+(?:[+–/-][\p{L}\p{N}]+)*/gu)?.length ?? 0
}

describe('catalog editorial requirements', () => {
  it.each(['en', 'es'] as const)('keeps every %s product-card description within the approved range', (locale) => {
    for (const product of products) {
      const localized = getLocalizedProduct(product, locale)
      expect(localized.catalogTagline, product.slug).toMatch(/[.!?].+[.!?]$/)
      expect(wordCount(localized.catalogTagline), product.slug).toBeGreaterThanOrEqual(14)
      expect(wordCount(localized.catalogTagline), product.slug).toBeLessThanOrEqual(28)
    }
  })

  const filterOf = (slug: string) => getCatalogFilter(products.find((product) => product.slug === slug)!)

  it('maps every product to one of the five research categories (or the accessory section)', () => {
    const allowed = new Set([
      'Metabolic Research',
      'Recovery & Regeneration',
      'Hormone & Wellness',
      'Cellular Energy & Longevity',
      'Cognitive Research',
      'Essentials',
    ])
    for (const product of products) {
      expect(allowed.has(getCatalogFilter(product)), product.slug).toBe(true)
    }
  })

  it('applies the approved category migration (no Skin category remains)', () => {
    // Former "Skin & Regenerative Research" products are merged into Recovery.
    expect(filterOf('klow')).toBe('Recovery & Regeneration')
    expect(filterOf('wolverine-stack')).toBe('Recovery & Regeneration')
    expect(filterOf('ghk-cu')).toBe('Recovery & Regeneration')
    expect(filterOf('ahk-cu')).toBe('Recovery & Regeneration')
    // Explicit prompt mappings.
    expect(filterOf('igf1-lr3')).toBe('Hormone & Wellness')
    expect(filterOf('nad-plus')).toBe('Cellular Energy & Longevity')
    expect(filterOf('retatrutide')).toBe('Metabolic Research')
    // No product may resolve to any removed skin category.
    for (const product of products) {
      expect(getCatalogFilter(product)).not.toMatch(/skin/i)
    }
  })

  it('renames the IGF product to its approved display name and category', () => {
    const igf = products.find((product) => product.slug === 'igf1-lr3')!
    expect(igf.name).toBe('IGF1-LR3')
    expect(igf.category).toBe('Hormone & Wellness')
  })

  it.each(['en', 'es'] as const)('gives every %s product exactly three research highlights', (locale) => {
    for (const product of products) {
      const localized = getLocalizedProduct(product, locale)
      expect(localized.catalogHighlights, product.slug).toHaveLength(3)
      for (const highlight of localized.catalogHighlights) {
        expect(highlight.trim().length, product.slug).toBeGreaterThan(0)
      }
      // Distinct within a card.
      expect(new Set(localized.catalogHighlights).size, product.slug).toBe(3)
    }
  })

  it.each(['en', 'es'] as const)('uses compliant Retatrutide terminology in %s', (locale) => {
    const retatrutide = getLocalizedProduct(products.find((product) => product.slug === 'retatrutide')!, locale)
    expect(retatrutide.catalogTagline).not.toMatch(/GLP-3/i)
    expect(retatrutide.catalogTagline).toMatch(/GIP/)
    expect(retatrutide.catalogTagline).toMatch(/GLP-1/)
    expect(retatrutide.catalogTagline).toMatch(locale === 'en' ? /glucagon/i : /glucagón/i)
  })
})
