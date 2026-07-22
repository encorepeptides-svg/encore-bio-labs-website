import { describe, expect, it } from 'vitest'
import { products } from './products'

describe('product catalog integrity', () => {
  it('has unique slugs and valid confirmed or explicitly pending variant pricing', () => {
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length)
    for (const product of products) {
      expect(product.variants.length).toBeGreaterThan(0)
      for (const variant of product.variants) {
        expect(variant.price > 0 || (variant.price === 0 && variant.priceNeedsConfirmation === true)).toBe(true)
      }
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
    expect(products.reduce((count, product) => count + product.variants.length, 0)).toBe(30)
    const skus = products.flatMap((product) => product.variants.map((variant) => variant.sku))
    expect(skus.every(Boolean)).toBe(true)
    expect(new Set(skus).size).toBe(skus.length)
  })

  it('defines the requested confirmed NAD+ and GHK-Cu strength pricing', () => {
    const nad = products.find((product) => product.slug === 'nad-plus')!
    const ghkCu = products.find((product) => product.slug === 'ghk-cu')!
    expect(nad.variants).toEqual([
      expect.objectContaining({ sku: 'NAD-500MG', label: '500 mg', strength: 500, unitType: 'mg', price: 65 }),
      expect.objectContaining({ sku: 'NAD-1000MG', label: '1000 mg', strength: 1000, unitType: 'mg', price: 95 }),
    ])
    expect(ghkCu.variants).toEqual([
      expect.objectContaining({ sku: 'GHK-CU-50MG', label: '50 mg', strength: 50, unitType: 'mg', price: 50 }),
      expect.objectContaining({ sku: 'GHK-CU-100MG', label: '100 mg', strength: 100, unitType: 'mg', price: 70 }),
    ])
  })

  it('uses the requested prices and strengths for each updated single-variant product', () => {
    const expected = {
      'wolverine-stack': { label: 'BPC-157 + TB-500', price: 95 },
      tesamorelin: { label: '10 mg', price: 75 },
      'mots-c': { label: '10 mg', price: 45 },
      dsip: { label: '10 mg', price: 40 },
    }
    for (const [slug, variant] of Object.entries(expected)) {
      expect(products.find((product) => product.slug === slug)?.variants).toEqual([
        expect.objectContaining(variant),
      ])
    }
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
