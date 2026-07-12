import { describe, expect, it } from 'vitest'
import { products } from './products'

describe('product catalog integrity', () => {
  it('has unique slugs and valid variant pricing', () => {
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length)
    for (const product of products) {
      expect(product.variants.length).toBeGreaterThan(0)
      for (const variant of product.variants) expect(variant.price).toBeGreaterThan(0)
    }
  })

  it('contains only valid, non-self related product links', () => {
    const slugs = new Set(products.map((product) => product.slug))
    for (const product of products) {
      expect(product.relatedProducts).not.toContain(product.slug)
      for (const relatedSlug of product.relatedProducts) expect(slugs.has(relatedSlug)).toBe(true)
    }
  })

  it('parses thousands-separated strengths correctly (e.g. "10,000 IU")', () => {
    const hcg = products.find((product) => product.slug === 'hcg')!
    expect(hcg.variants[0].strength).toBe(10000)
    expect(hcg.variants[0].unitType).toBe('IU')
  })

  it('never derives a zero or negative strength from a labeled variant', () => {
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.strength !== undefined) expect(variant.strength).toBeGreaterThan(0)
      }
    }
  })

  it('contains the complete active catalog with unique variant SKUs', () => {
    expect(products).toHaveLength(24)
    expect(products.reduce((count, product) => count + product.variants.length, 0)).toBe(28)
    const skus = products.flatMap((product) => product.variants.map((variant) => variant.sku))
    expect(skus.every(Boolean)).toBe(true)
    expect(new Set(skus).size).toBe(skus.length)
  })

  it('keeps accessories and ready-to-use formats out of irrelevant kit flows', () => {
    const klow = products.find((product) => product.slug === 'klow')!
    const cerebrolysin = products.find((product) => product.slug === 'cerebrolysin')!
    const bacWater = products.find((product) => product.slug === 'bac-water')!
    expect(klow.purchaseRules).toMatchObject({ productType: 'accessory', kitEligible: false, multipackEligible: false })
    expect(cerebrolysin.purchaseRules).toMatchObject({ productType: 'ready-to-use', kitEligible: false, multipackEligible: true })
    expect(bacWater.purchaseRules).toMatchObject({ productType: 'accessory', kitEligible: false, multipackEligible: false })
    expect(bacWater.variants).toEqual([
      expect.objectContaining({ sku: 'BACWATER-10ML', label: '10 mL', price: 11.99, strength: 10, unitType: 'mL' }),
    ])
  })
})
