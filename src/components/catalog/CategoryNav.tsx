import { Activity, Brain, Droplets, LayoutGrid, Search, Sparkles, X, Zap, type LucideIcon } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'
import {
  catalogSectionId,
  categoryFilters,
  getCatalogFilterLabel,
  getCategoryCount,
  type CatalogFilter,
} from './catalogHelpers'

type CategoryNavProps = {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  selectedCategory: Exclude<CatalogFilter, 'Essentials'>
  onCategoryChange: (value: Exclude<CatalogFilter, 'Essentials'>) => void
  productCount: number
  sortOrder: string
  onSortOrderChange: (value: string) => void
}

const categoryIcons: Record<(typeof categoryFilters)[number], LucideIcon> = {
  'Metabolic Research': Activity,
  'Recovery & Regeneration': Sparkles,
  'Hormone & Wellness': Droplets,
  'Cellular Energy & Longevity': Zap,
  'Cognitive Research': Brain,
}

export function CategoryNav({ searchTerm, onSearchTermChange, selectedCategory, onCategoryChange, productCount, sortOrder, onSortOrderChange }: CategoryNavProps) {
  const { t } = useTranslation('catalog')

  return (
    <div id="catalog-categories" className="sticky top-0 z-30 scroll-mt-24 border-y border-slate-900/8 bg-[#F8FAFC]/95 px-5 py-3 backdrop-blur-xl sm:px-8 lg:top-20">
      <div className="catalog-controls mx-auto grid max-w-[88rem] gap-3 lg:grid-cols-[minmax(280px,1fr)_auto] lg:items-center lg:gap-x-5 lg:gap-y-3">
        <div className="relative w-full">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <label htmlFor="catalog-search" className="sr-only">{t('searchAriaLabel')}</label>
          <input
            id="catalog-search"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAriaLabel')}
            className="h-11 w-full rounded-full border border-slate-900/10 bg-white pl-9 pr-11 text-sm font-medium text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => onSearchTermChange('')}
              aria-label={t('clearSearch')}
              className="absolute right-1.5 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-teal-50 hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <X size={15} aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav
          aria-label={t('selectorLabel')}
          className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] lg:col-span-2 lg:row-start-2 lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0"
        >
          <button
            type="button"
            aria-pressed={selectedCategory === 'All'}
            onClick={() => {
              onCategoryChange('All')
              document.getElementById('catalog-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`group flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
              selectedCategory === 'All'
                ? 'border-[#071724] bg-[#071724] text-white shadow-[0_10px_24px_rgba(7,23,36,0.16)]'
                : 'border-slate-900/10 bg-white text-slate-700 hover:border-teal-300 hover:text-[#071724]'
            }`}
          >
            <LayoutGrid size={15} aria-hidden="true" className={selectedCategory === 'All' ? 'text-teal-300' : 'text-teal-600'} />
            <span>{getCatalogFilterLabel('All', t)}</span>
            <span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${selectedCategory === 'All' ? 'bg-white/15 text-white' : 'bg-teal-50 text-teal-800'}`}>{getCategoryCount('All')}</span>
          </button>
          {categoryFilters.map((tab) => {
            const active = selectedCategory === tab
            const Icon = categoryIcons[tab]
            const count = getCategoryCount(tab)

            return (
              <button
                key={tab}
                type="button"
                aria-pressed={selectedCategory === tab}
                onClick={() => {
                  onCategoryChange(tab)
                  document.getElementById(catalogSectionId(tab))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`group flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                  active
                    ? 'border-[#071724] bg-[#071724] text-white shadow-[0_10px_24px_rgba(7,23,36,0.16)]'
                    : 'border-slate-900/10 bg-white text-slate-700 hover:border-teal-300 hover:text-[#071724]'
                }`}
              >
                <Icon size={15} aria-hidden="true" className={active ? 'text-teal-300' : 'text-teal-600'} />
                <span>{getCatalogFilterLabel(tab, t)}</span>
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    active ? 'bg-white/15 text-white' : 'bg-teal-50 text-teal-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </nav>
        <div className="flex items-center justify-between gap-3 lg:col-start-2 lg:row-start-1 lg:justify-end">
          <span aria-live="polite" className="shrink-0 text-xs font-semibold text-slate-500">
            {t(productCount === 1 ? 'productCountOne' : 'productCountOther', { count: productCount })}
          </span>
          <label htmlFor="catalog-sort" className="sr-only">{t('sortLabel')}</label>
          <select
            id="catalog-sort"
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value)}
            className="h-10 rounded-full border border-slate-900/10 bg-white px-4 text-xs font-semibold text-[#071724] outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
          >
            <option value="featured">{t('sortFeatured')}</option>
            <option value="price-low">{t('sortPriceLow')}</option>
            <option value="price-high">{t('sortPriceHigh')}</option>
            <option value="name">{t('sortName')}</option>
          </select>
        </div>
      </div>
    </div>
  )
}
