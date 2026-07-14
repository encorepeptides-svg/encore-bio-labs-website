import { filterTabs, type CatalogFilter } from './catalogHelpers'

export type CatalogSearchState = {
  search: string
  category: Exclude<CatalogFilter, 'Essentials'>
}

/**
 * The short `q` parameter is canonical. `search` remains readable for old
 * shared links and is removed the next time the catalog state is serialized.
 */
export function readCatalogState(searchParams: string): CatalogSearchState {
  const params = new URLSearchParams(searchParams)
  const rawCategory = params.get('category') as Exclude<CatalogFilter, 'Essentials'> | null
  const category = rawCategory && filterTabs.includes(rawCategory) ? rawCategory : 'All'

  return {
    search: params.get('q') ?? params.get('search') ?? '',
    category,
  }
}

export function serializeCatalogState(existingSearch: string, state: CatalogSearchState) {
  const params = new URLSearchParams(existingSearch)
  const query = state.search.trim()

  params.delete('search')
  if (query) params.set('q', query)
  else params.delete('q')

  if (state.category !== 'All') params.set('category', state.category)
  else params.delete('category')

  return params.toString()
}

export function catalogUrl(pathname: string, existingSearch: string, state: CatalogSearchState, hash = '') {
  const query = serializeCatalogState(existingSearch, state)
  return `${pathname}${query ? `?${query}` : ''}${hash}`
}
