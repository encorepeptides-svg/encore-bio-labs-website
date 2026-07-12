import { describe, expect, it } from 'vitest'
import { products } from './products'

describe('product catalog integrity', () => {
  it('has unique slugs and valid variant pricing', () => {
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length)
    for (const product of products) {
      expect(product.variants.length).toBeGreaterThan(0)
      for (const variant of product.variants) expect(variant.price).toBeGreaterThanOrEqual(0)
    }
  })

  it('contains only valid, non-self related product links', () => {
    const slugs = new Set(products.map((product) => product.slug))
    for (const product of products) {
      expect(product.relatedProducts).not.toContain(product.slug)
      for (const relatedSlug of product.relatedProducts) expect(slugs.has(relatedSlug)).toBe(true)
    }
  })
})
