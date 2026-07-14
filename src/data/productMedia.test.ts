import { describe, expect, it } from 'vitest'
import { productMediaBySlug } from './productMedia'
import { products } from './products'

describe('product media manifest', () => {
  it('covers every canonical product exactly once', () => {
    const productSlugs = products.map((product) => product.slug)
    expect(Object.keys(productMediaBySlug).sort()).toEqual([...productSlugs].sort())
  })

  it('keeps the known corrected image assignments product-specific', () => {
    expect(productMediaBySlug['thymosin-alpha-1'].hero.src).toBe('thymosin-alpha-1.png')
    expect(productMediaBySlug['bac-water'].hero.src).toBe('bac-water.png')
    expect(productMediaBySlug.ss31.hero.src).toBe('ss31.png')
    expect(productMediaBySlug.kisspeptin.hero.src).toBe('kisspeptin.png')
    expect(productMediaBySlug['pt-141'].hero.src).toBe('pt-141.png')
    expect(productMediaBySlug['thymosin-alpha-1'].hero.src).not.toBe(productMediaBySlug.ss31.hero.src)
  })

  it('declares stable dimensions and contain behavior for each hero', () => {
    for (const media of Object.values(productMediaBySlug)) {
      expect(media.hero.width).toBe(1254)
      expect(media.hero.height).toBe(1254)
      expect(media.hero.fit).toBe('contain')
      expect(media.hero.alt).not.toMatch(/\.png|\.webp|filename/i)
    }
  })
})
