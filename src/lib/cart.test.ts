import { describe, expect, it } from 'vitest'
import { createCartItem, createCartItemId, parseStoredCart } from './cart'
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
})
