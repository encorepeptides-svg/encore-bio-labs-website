import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { changePurchaseOption, getDefaultPurchaseSelection, getKitPremium, getRetatrutideVariantBadge, isProductPurchasable, normalizePurchaseSelection, quotePurchase, unitMoney } from './purchaseOptions'

const retatrutide = products.find((product) => product.slug === 'retatrutide')!
const tenMg = retatrutide.variants.find((variant) => variant.label === '10 mg')!

describe('purchase option pricing', () => {
  it('validates every active Retatrutide strength, label, SKU, and price path', () => {
    const expected = [
      { label: '10 mg', strength: 10, base: 89, badge: 'Starter' },
      { label: '15 mg', strength: 15, base: 109, badge: undefined },
      { label: '20 mg', strength: 20, base: 129, badge: 'Most Popular' },
      { label: '25 mg', strength: 25, base: 149, badge: undefined },
      { label: '30 mg', strength: 30, base: 169, badge: 'Best Value' },
    ]

    for (const row of expected) {
      const variant = retatrutide.variants.find((entry) => entry.label === row.label)!
      const vial = quotePurchase(retatrutide, variant, { optionId: 'vial-only', packSize: 1, includeKit: false })
      const kit = quotePurchase(retatrutide, variant, { optionId: 'complete-kit', packSize: 1, includeKit: true })
      const two = quotePurchase(retatrutide, variant, { optionId: 'multipack', packSize: 2, includeKit: false })
      const three = quotePurchase(retatrutide, variant, { optionId: 'multipack', packSize: 3, includeKit: false })
      const five = quotePurchase(retatrutide, variant, { optionId: 'multipack', packSize: 5, includeKit: false })
      expect(variant).toMatchObject({ price: row.base, strength: row.strength, unitType: 'mg', sku: `RETATRUTIDE-${row.strength}MG` })
      expect(getRetatrutideVariantBadge(retatrutide, variant)).toBe(row.badge)
      expect(vial.linePrice).toBe(row.base)
      expect(kit.linePrice).toBe(row.base + 10)
      expect(kit.pricePerMeasure).toBe(row.base / row.strength)
      expect(two.linePrice).toBe(Math.round(row.base * 2 * 0.95))
      expect(three.linePrice).toBe(Math.round(row.base * 3 * 0.92))
      expect(five.linePrice).toBe(Math.round(row.base * 5 * 0.88))
      expect(kit.sku).toBe(`RETATRUTIDE-${row.strength}MG-COMPLETE-KIT-1-KIT`)
    }
  })

  it('defaults kit-eligible products to one Complete Kit', () => {
    const quote = quotePurchase(retatrutide, tenMg, getDefaultPurchaseSelection(retatrutide))
    expect(quote.purchaseType).toBe('Encore Complete Kit')
    expect(quote.kitIncluded).toBe(true)
    expect(quote.linePrice).toBe(tenMg.price + getKitPremium(retatrutide))
    expect(quote.pricePerMeasure).toBe(8.9)
  })

  it('applies 8% to three vials and charges only one optional kit', () => {
    const quote = quotePurchase(retatrutide, tenMg, { optionId: 'multipack', packSize: 3, includeKit: true })
    expect(quote.unitPrice).toBe(82)
    expect(quote.savings).toBe(21)
    expect(quote.linePrice).toBe(256)
    expect(quote.kitIncluded).toBe(true)
  })

  it('applies 12% to five vials without a kit when declined', () => {
    const quote = quotePurchase(retatrutide, tenMg, { optionId: 'multipack', packSize: 5, includeKit: false })
    expect(quote.linePrice).toBe(392)
    expect(quote.savings).toBe(53)
    expect(quote.kitIncluded).toBe(false)
  })

  it('uses total measured amount for blends and IU-based packages', () => {
    const blend = products.find((product) => product.slug === 'cjc1295-ipamorelin')!
    const blendQuote = quotePurchase(blend, blend.variants[0], { optionId: 'vial-only', packSize: 1, includeKit: false })
    expect(blend.variants[0].strength).toBe(10)
    expect(blendQuote.pricePerMeasure).toBe(6.5)

    const hgh = products.find((product) => product.slug === 'hgh-191aa')!
    const hghQuote = quotePurchase(hgh, hgh.variants[0], { optionId: 'vial-only', packSize: 1, includeKit: false })
    expect(hgh.variants[0].strength).toBe(60)
    expect(hghQuote.pricePerMeasure).toBe(2.25)

    const hcg = products.find((product) => product.slug === 'hcg')!
    const hcgKit = quotePurchase(hcg, hcg.variants[0], { optionId: 'complete-kit', packSize: 1, includeKit: true })
    expect(hcgKit.pricePerMeasure).toBe(0.013)
    expect(unitMoney(hcgKit.pricePerMeasure!)).toBe('$0.013')
  })

  it('supports mL price-per-unit calculations', () => {
    const variant = { sku: 'ML-TEST-10', label: '10 mL', format: 'Ready-to-use format', price: 50, strength: 10, unitType: 'mL' as const }
    const product = { ...retatrutide, variants: [variant], purchaseRules: { ...retatrutide.purchaseRules, productType: 'ready-to-use' as const, kitEligible: false } }
    expect(quotePurchase(product, variant, { optionId: 'vial-only', packSize: 1, includeKit: false }).pricePerMeasure).toBe(5)
  })

  it('recognizes a temporarily unavailable product without deleting its price', () => {
    const unavailable = { ...retatrutide, stockStatus: 'Unavailable' as const }
    expect(isProductPurchasable(unavailable)).toBe(false)
    expect(unavailable.variants[0].price).toBe(89)
  })

  it('normalizes purchase-option switching and invalid combinations', () => {
    const vial = normalizePurchaseSelection(retatrutide, { optionId: 'vial-only', packSize: 5, includeKit: true })
    const kit = normalizePurchaseSelection(retatrutide, { optionId: 'complete-kit', packSize: 5, includeKit: false })
    const pack = normalizePurchaseSelection(retatrutide, { optionId: 'multipack', packSize: 4, includeKit: true })
    expect(vial).toEqual({ optionId: 'vial-only', packSize: 1, includeKit: false })
    expect(kit).toEqual({ optionId: 'complete-kit', packSize: 1, includeKit: true })
    expect(pack).toEqual({ optionId: 'multipack', packSize: 2, includeKit: true })
    expect(changePurchaseOption(retatrutide, kit, 'multipack'))
      .toEqual({ optionId: 'multipack', packSize: 2, includeKit: false })

    const accessory = products.find((product) => product.slug === 'klow')!
    expect(normalizePurchaseSelection(accessory, { optionId: 'complete-kit', packSize: 1, includeKit: true }))
      .toEqual({ optionId: 'vial-only', packSize: 1, includeKit: false })
    expect(normalizePurchaseSelection(accessory, { optionId: 'multipack', packSize: 5, includeKit: false }))
      .toEqual({ optionId: 'vial-only', packSize: 1, includeKit: false })
  })

  it('keeps standalone BAC Water at $11.99 with no kit or multipack', () => {
    const bacWater = products.find((product) => product.slug === 'bac-water')!
    const quote = quotePurchase(bacWater, bacWater.variants[0], { optionId: 'vial-only', packSize: 1, includeKit: false })
    expect(quote).toMatchObject({ purchaseType: 'Product Only', linePrice: 11.99, kitIncluded: false, packSize: 1 })
    expect(quote.pricePerMeasure).toBeCloseTo(1.199)
    expect(normalizePurchaseSelection(bacWater, { optionId: 'complete-kit', packSize: 1, includeKit: true }))
      .toEqual({ optionId: 'vial-only', packSize: 1, includeKit: false })
  })
})
