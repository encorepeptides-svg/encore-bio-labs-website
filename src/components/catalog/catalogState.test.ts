import { describe, expect, it } from 'vitest'
import { catalogUrl, readCatalogState, serializeCatalogState } from './catalogState'
import { getCategoryCount } from './catalogHelpers'

describe('catalog URL state', () => {
  it('reads the canonical q parameter and accepts legacy search links', () => {
    expect(readCatalogState('?q=nad%2B&category=Cellular%20Energy%20%26%20Longevity')).toEqual({
      search: 'nad+',
      category: 'Cellular Energy & Longevity',
    })
    expect(readCatalogState('?search=retatrutide').search).toBe('retatrutide')
  })

  it('serializes one category and a trimmed query without stale search parameters', () => {
    expect(serializeCatalogState('?search=old&category=Metabolic%20Research', {
      search: '  nad+  ',
      category: 'Cellular Energy & Longevity',
    })).toBe('category=Cellular+Energy+%26+Longevity&q=nad%2B')
  })

  it('builds a localized catalog URL while preserving the selected category', () => {
    expect(catalogUrl('/es/catalog', '?category=Metabolic+Research', {
      search: 'nad',
      category: 'Metabolic Research',
    })).toBe('/es/catalog?category=Metabolic+Research&q=nad')
  })

  it('keeps one active category while combining category and search state', () => {
    const state = readCatalogState('?q=nad&category=Cellular%20Energy%20%26%20Longevity')
    expect(state.category).toBe('Cellular Energy & Longevity')
    expect(state.search).toBe('nad')
    expect(serializeCatalogState('', state)).toBe('q=nad&category=Cellular+Energy+%26+Longevity')
  })

  it('derives the All count from the canonical product records', () => {
    expect(getCategoryCount('All')).toBeGreaterThan(20)
  })
})
