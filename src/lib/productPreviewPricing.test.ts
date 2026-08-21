import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { formatMoney } from './money'
import { getProductStartingPrice, getProductStartingPriceLabel } from './productPreviewPricing'

describe('product preview pricing', () => {
  it('uses the lowest positive variant price', () => {
    const retatrutide = products.find((product) => product.slug === 'retatrutide')
    expect(retatrutide).toBeDefined()
    expect(getProductStartingPrice(retatrutide!)).toBe(89)
  })

  it('labels single-variant products as starting prices in both languages', () => {
    const singleVariantProduct = products.find((product) => product.variants.length === 1 && product.variants[0].price > 0)
    expect(singleVariantProduct).toBeDefined()
    const price = getProductStartingPrice(singleVariantProduct!)
    expect(price).not.toBeNull()

    expect(getProductStartingPriceLabel(singleVariantProduct!, (_key, vars) => `Starting from ${vars?.price}`)).toBe(`Starting from ${formatMoney(price!)}`)
    expect(getProductStartingPriceLabel(singleVariantProduct!, (_key, vars) => `Desde ${vars?.price}`)).toBe(`Desde ${formatMoney(price!)}`)
  })
})
