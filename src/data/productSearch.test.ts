import { describe, expect, it } from 'vitest'
import { normalizeSearchText, searchProducts } from './productSearch'

describe('bilingual product search', () => {
  it('normalizes punctuation, spacing, and accents', () => {
    expect(normalizeSearchText('IGF-1 LR3')).toBe(normalizeSearchText('igf1 lr3'))
    expect(normalizeSearchText('Agua bacteriostática')).toBe('aguabacteriostatica')
  })

  it('matches the approved English aliases', () => {
    expect(searchProducts('IGF1-LR3').map(({ product }) => product.slug)).toContain('igf1-lr3')
    expect(searchProducts('NAD+').map(({ product }) => product.slug)).toContain('nad-plus')
    expect(searchProducts('BPC-157 + TB-500').map(({ product }) => product.slug)).toContain('wolverine-stack')
  })

  it('matches Spanish aliases without duplicating catalog records', () => {
    const results = searchProducts('Agua bacteriostática', 'es')
    expect(results.map(({ product }) => product.slug)).toEqual(['bac-water'])
    expect(searchProducts('GHK CU', 'es').map(({ product }) => product.slug)).toContain('ghk-cu')
  })

  it('combines a category filter with a query', () => {
    const results = searchProducts('research', 'en', 'Cellular Energy & Longevity')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(({ product }) => product.slug !== 'retatrutide')).toBe(true)
  })

  it('returns every product once for an empty query', () => {
    const results = searchProducts('')
    expect(new Set(results.map(({ product }) => product.slug)).size).toBe(results.length)
    expect(results.length).toBeGreaterThan(10)
  })
})
