import { useEffect, useMemo, useState } from 'react'
import { searchProducts } from '../../data/productSearch'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { CatalogHelpCallout } from './CatalogHelpCallout'
import { CatalogHero } from './CatalogHero'
import { CatalogKlowFeature } from './CatalogKlowFeature'
import { CatalogRetatrutideFeature } from './CatalogRetatrutideFeature'
import { CatalogTrustStrip } from './CatalogTrustStrip'
import { CategoryNav } from './CategoryNav'
import { ProductCard } from './ProductCard'
import { catalogUrl, readCatalogState, type CatalogSearchState } from './catalogState'
import {
  accessoryFilter,
  catalogSectionId,
  categoryFilters,
  getCatalogFilter,
  getCatalogFilterDescription,
  getCatalogFilterLabel,
  legacyCatalogAnchorAliases,
  type CatalogFilter,
} from './catalogHelpers'

function useDebouncedValue(value: string, delay = 220) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

// Grid sections, in order: the five research categories followed by the
// accessories section. The accessory section is intentionally absent from the
// category selector but still renders its products (e.g. BAC Water).
const gridSections = [...categoryFilters, accessoryFilter] as const

export function CatalogPage() {
  const { t } = useTranslation('catalog')
  const { locale } = useLocale()
  const [catalogState, setCatalogState] = useState<CatalogSearchState>(() => readCatalogState(typeof window === 'undefined' ? '' : window.location.search))
  const [sortOrder, setSortOrder] = useState('featured')
  const { search: searchTerm, category: selectedCategory } = catalogState
  const debouncedSearchTerm = useDebouncedValue(searchTerm)

  function setSearchTerm(value: string) {
    setCatalogState((state) => ({ ...state, search: value }))
  }

  function setSelectedCategory(value: Exclude<CatalogFilter, 'Essentials'>) {
    setCatalogState((state) => ({ ...state, category: value }))
  }

  useEffect(() => {
    function handlePopState() {
      setCatalogState(readCatalogState(window.location.search))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const nextUrl = catalogUrl(window.location.pathname, window.location.search, catalogState, window.location.hash)
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (nextUrl !== currentUrl) window.history.replaceState({}, '', nextUrl)
  }, [catalogState, searchTerm, selectedCategory])

  // Preserve old in-page deep links after the taxonomy change (e.g. the removed
  // "Skin & Regenerative Research" anchor now resolves to Recovery & Regeneration).
  useEffect(() => {
    const resolveLegacyHash = () => {
      const id = window.location.hash.replace(/^#/, '')
      const target = legacyCatalogAnchorAliases[id]
      if (target) {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    resolveLegacyHash()
    window.addEventListener('hashchange', resolveLegacyHash)
    return () => window.removeEventListener('hashchange', resolveLegacyHash)
  }, [])

  const filteredProducts = useMemo(() => {
    const matches = searchProducts(debouncedSearchTerm, locale, selectedCategory).map((result) => result.product)
    if (sortOrder === 'featured') return matches

    return [...matches].sort((a, b) => {
      const priceA = Math.min(...a.variants.map((variant) => variant.price).filter((price) => price > 0))
      const priceB = Math.min(...b.variants.map((variant) => variant.price).filter((price) => price > 0))
      if (sortOrder === 'price-low') return priceA - priceB
      if (sortOrder === 'price-high') return priceB - priceA
      return a.name.localeCompare(b.name, locale)
    })
  }, [debouncedSearchTerm, locale, selectedCategory, sortOrder])

  const productsByCategory = useMemo(() => {
    return gridSections.map((tab) => ({
      tab,
      products: filteredProducts.filter((product) => getCatalogFilter(product) === tab && (selectedCategory === 'All' || selectedCategory === tab)),
    }))
  }, [filteredProducts, selectedCategory])

  const hasActiveFilters = Boolean(searchTerm.trim()) || selectedCategory !== 'All'

  function clearFilters() {
    setCatalogState({ search: '', category: 'All' })
  }

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <CatalogHero />

      <CategoryNav
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        productCount={filteredProducts.length}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <section id="catalog-products" className="scroll-mt-28 px-5 py-10 sm:px-8 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          {hasActiveFilters ? (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/65 px-4 py-3 text-sm text-teal-950">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {searchTerm.trim() ? <span>{t('activeSearchSummary', { query: searchTerm.trim() })}</span> : null}
                {selectedCategory !== 'All' ? <span>{t('activeCategorySummary', { category: getCatalogFilterLabel(selectedCategory, t) })}</span> : null}
              </div>
              <button type="button" onClick={clearFilters} className="shrink-0 rounded-full border border-teal-200 bg-white px-3.5 py-1.5 text-xs font-bold text-teal-900 transition hover:border-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{t('clearFilters')}</button>
            </div>
          ) : null}

          {filteredProducts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
              <p className="text-lg font-semibold text-[#071724]">{t('noResultsTitle')}</p>
              <p className="mt-2 text-sm text-slate-600">{t('noResultsBody')}</p>
              <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-[#071724] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{t('clearSearch')}</button>
            </div>
          ) : null}

          {/* Category sections stay mounted (visibility toggled, not removed) so the
              sticky nav's IntersectionObserver never ends up watching detached nodes
              after a search narrows and then clears the result set. */}
          {productsByCategory.map((group) => {
            const description = getCatalogFilterDescription(group.tab, t)
            const showRetatrutideFeature = group.tab === 'Metabolic Research'
              && sortOrder === 'featured'
              && group.products.some((product) => product.slug === 'retatrutide')
            const productsForGrid = showRetatrutideFeature
              ? group.products.filter((product) => product.slug !== 'retatrutide')
              : group.products
            return (
              <div
                key={group.tab}
                id={catalogSectionId(group.tab)}
                className={`scroll-mt-32 pt-14 first:pt-0 ${group.products.length === 0 ? 'hidden' : ''}`}
              >
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724] sm:text-3xl">
                  {getCatalogFilterLabel(group.tab, t)}
                </h2>
                {description ? (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
                ) : null}
                {showRetatrutideFeature ? <CatalogRetatrutideFeature /> : null}

                {productsForGrid.length ? (
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
                    {productsForGrid.map((product) => (
                      <ProductCard key={product.slug} product={product} />
                    ))}
                  </div>
                ) : null}

                {/* Compact in-grid featured treatments, integrated into their category. */}
                {group.tab === 'Recovery & Regeneration' ? <CatalogKlowFeature /> : null}
              </div>
            )
          })}
        </div>
      </section>

      <CatalogTrustStrip />

      <section className="px-5 pb-12 sm:px-8">
        <div className="mx-auto max-w-[88rem] rounded-[1.5rem] border border-slate-900/8 bg-white/70 px-6 py-6 text-center shadow-[0_14px_40px_rgba(7,23,36,0.05)] backdrop-blur-sm">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">{t('closingTitle')}</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('closingBody')}</p>
        </div>
      </section>

      <CatalogHelpCallout />
    </main>
  )
}
