import { describe, expect, it } from 'vitest'
import { products } from './products'
import { getLocalizedProduct } from './productTranslations'

describe('getLocalizedProduct', () => {
  it('never changes variant pricing, SKUs, or CAS numbers between English and Spanish', () => {
    for (const product of products) {
      const localized = getLocalizedProduct(product, 'es')
      expect(localized.variants, `${product.slug} variants`).toEqual(product.variants)
      expect(localized.casNumber, `${product.slug} casNumber`).toBe(product.casNumber)
    }
  })

  it('returns the same object reference for English (no unnecessary copy/drift)', () => {
    const retatrutide = products.find((product) => product.slug === 'retatrutide')!
    expect(getLocalizedProduct(retatrutide, 'en')).toBe(retatrutide)
  })

  it('does not translate the scientific compound name', () => {
    const retatrutide = products.find((product) => product.slug === 'retatrutide')!
    const localized = getLocalizedProduct(retatrutide, 'es')
    expect(localized.name).toBe('Retatrutide')
  })

  it('translates descriptive copy for the flagship product while keeping variant pricing intact', () => {
    const retatrutide = products.find((product) => product.slug === 'retatrutide')!
    const localized = getLocalizedProduct(retatrutide, 'es')
    expect(localized.description).not.toBe(retatrutide.description)
    expect(localized.variants.map((v) => v.price)).toEqual(retatrutide.variants.map((v) => v.price))
  })
})
