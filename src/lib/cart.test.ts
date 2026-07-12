import { describe, expect, it } from 'vitest'
import { calculateSubtotal, calculateTotal, createCartItem, createCartItemId, parseStoredCart } from './cart'
import { products } from '../data/products'

describe('cart hydration and variants', () => {
  it('recovers safely from malformed or invalid storage', () => {
    expect(parseStoredCart('{broken')).toEqual([])
    expect(parseStoredCart(JSON.stringify([{ productSlug: 'retatrutide' }]))).toEqual([])
  })

  it('normalizes stored quantities and keeps valid lines', () => {
    const product = products.find((entry) => entry.slug === 'retatrutide')!
    const item = createCartItem(product, product.variants[0], 500)
    expect(parseStoredCart(JSON.stringify([item]))[0].quantity).toBe(99)
  })

  it('merges identical variants by id but separates different strengths', () => {
    const product = products.find((entry) => entry.slug === 'retatrutide')!
    expect(createCartItemId(product.slug, product.variants[0])).toBe(createCartItemId(product.slug, product.variants[0]))
    expect(createCartItemId(product.slug, product.variants[0])).not.toBe(createCartItemId(product.slug, product.variants[1]))
  })

  it('separates two configurations of the same strength', () => {
    const product = products.find((entry) => entry.slug === 'retatrutide')!
    const variant = product.variants[0]
    const vial = createCartItem(product, variant, 1, { optionId: 'vial-only', packSize: 1, includeKit: false })
    const kit = createCartItem(product, variant, 1, { optionId: 'complete-kit', packSize: 1, includeKit: true })
    const pack = createCartItem(product, variant, 1, { optionId: 'multipack', packSize: 3, includeKit: true })
    expect(new Set([vial.id, kit.id, pack.id]).size).toBe(3)
    expect([vial.optionId, kit.optionId, pack.optionId]).toEqual(['vial-only', 'complete-kit', 'multipack'])
  })

  it('creates accurate cart lines and totals with one kit per multipack', () => {
    const product = products.find((entry) => entry.slug === 'retatrutide')!
    const item = createCartItem(product, product.variants[0], 2, { optionId: 'multipack', packSize: 3, includeKit: true })
    expect(item.packSize).toBe(3)
    expect(item.kitIncluded).toBe(true)
    expect(item.linePrice).toBeCloseTo(368.8)
    expect(item.linePrice - item.unitPrice * item.packSize).toBe(10)
    expect(calculateSubtotal([item])).toBeCloseTo(737.6)
    expect(calculateTotal([item]).total).toBeCloseTo(737.6)
  })

  it('hydrates all purchase fields and rejects corrupt money fields', () => {
    const product = products.find((entry) => entry.slug === 'retatrutide')!
    const item = createCartItem(product, product.variants[0], 1, { optionId: 'multipack', packSize: 5, includeKit: false })
    expect(parseStoredCart(JSON.stringify([item]))[0]).toMatchObject({
      optionId: 'multipack', packSize: 5, kitIncluded: false, linePrice: item.linePrice, savings: item.savings,
    })
    const corrupt = { ...item, linePrice: Number.NaN, savings: -1, packSize: -5 }
    expect(parseStoredCart(JSON.stringify([corrupt]))[0]).toMatchObject({ linePrice: item.unitPrice, savings: 0, packSize: 1 })
  })
})
