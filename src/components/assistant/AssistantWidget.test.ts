import { describe, expect, it } from 'vitest'
import { getCurrentProductName } from './productContext'

describe('getCurrentProductName', () => {
  it('resolves product pages in both supported locales', () => {
    expect(getCurrentProductName('/products/retatrutide')).toBe('Retatrutide')
    expect(getCurrentProductName('/es/products/retatrutide')).toBe('Retatrutide')
  })

  it('does not treat non-product or unknown paths as product inquiries', () => {
    expect(getCurrentProductName('/catalog')).toBeUndefined()
    expect(getCurrentProductName('/products/not-a-product')).toBeUndefined()
  })
})
