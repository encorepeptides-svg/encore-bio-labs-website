import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUp, CornerDownLeft, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getLocalizedProduct } from '../../data/productTranslations'
import { searchProducts } from '../../data/productSearch'
import { stripLocalePrefix } from '../../i18n/config'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { getCatalogFilter, getCatalogFilterLabel, getPriceLabel } from '../catalog/catalogHelpers'
import { catalogUrl, readCatalogState } from '../catalog/catalogState'
import { ProductImage } from '../ProductImage'

function useDebouncedValue(value: string, delay = 180) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim()
  if (!trimmed) return text
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'))
  return parts.map((part, index) =>
    part.toLocaleLowerCase() === trimmed.toLocaleLowerCase() ? <mark key={`${part}-${index}`} className="rounded bg-teal-100 px-0.5 text-[#071724]">{part}</mark> : part,
  )
}

type ProductSearchProps = {
  open: boolean
  onClose: () => void
}

export function ProductSearch({ open, onClose }: ProductSearchProps) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('search')
  const { t: tCatalog } = useTranslation('catalog')
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebouncedValue(query)
  const allResults = useMemo(() => (debouncedQuery.trim() ? searchProducts(debouncedQuery, locale) : []), [debouncedQuery, locale])
  const visibleResults = allResults.slice(0, 6)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setActiveIndex(0)
      return
    }

    const currentParams = new URLSearchParams(window.location.search)
    setQuery(currentParams.get('q') ?? currentParams.get('search') ?? '')
    setActiveIndex(0)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleGlobalEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', handleGlobalEscape)
    return () => window.removeEventListener('keydown', handleGlobalEscape)
  }, [onClose, open])

  useEffect(() => {
    if (activeIndex >= visibleResults.length) setActiveIndex(Math.max(visibleResults.length - 1, 0))
  }, [activeIndex, visibleResults.length])

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    } else if (event.key === 'ArrowDown' && visibleResults.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % visibleResults.length)
    } else if (event.key === 'ArrowUp' && visibleResults.length) {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + visibleResults.length) % visibleResults.length)
    }
  }

  function submitSearch(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return

    const state = readCatalogState(window.location.search)
    const target = catalogUrl(path('/catalog'), window.location.search, { search: trimmed, category: state.category })
    const logicalPath = stripLocalePrefix(window.location.pathname).path.replace(/\/$/, '') || '/'

    onClose()
    if (logicalPath === '/catalog') {
      window.history.pushState({}, '', target)
      window.dispatchEvent(new PopStateEvent('popstate'))
      window.requestAnimationFrame(() => document.getElementById('catalog-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else {
      window.location.assign(target)
    }
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('input, button:not([disabled]), a[href]'))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] bg-[#071724]/35 p-3 backdrop-blur-sm sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-search-title"
            onKeyDown={handleDialogKeyDown}
            className="mx-auto mt-14 max-h-[calc(100vh-5rem)] max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#f7faf9] shadow-[0_30px_90px_rgba(7,23,36,0.28)] sm:mt-20"
            initial={{ opacity: 0, y: -12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between border-b border-slate-900/8 px-5 py-4 sm:px-6">
              <div>
                <h2 id="product-search-title" className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{t('dialogTitle')}</h2>
                <p className="mt-1 text-sm text-slate-600">{t('resultsLabel')}</p>
              </div>
              <button type="button" onClick={onClose} aria-label={t('closeSearch')} className="inline-flex size-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-[#071724] transition hover:border-teal-300 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form
                role="search"
                className="relative"
                onSubmit={(event) => {
                  event.preventDefault()
                  submitSearch(query)
                }}
              >
                <label htmlFor="global-product-search" className="sr-only">{t('placeholder')}</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-700" />
                    <input
                      ref={inputRef}
                      id="global-product-search"
                      type="search"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value)
                        setActiveIndex(0)
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={t('placeholder')}
                      aria-label={t('placeholder')}
                      aria-controls={debouncedQuery.trim() ? 'global-product-search-results' : undefined}
                      aria-activedescendant={visibleResults[activeIndex] ? `search-result-${visibleResults[activeIndex].product.slug}` : undefined}
                      className="h-14 w-full rounded-2xl border border-slate-900/12 bg-white pl-12 pr-4 text-base font-medium text-[#071724] outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                    />
                  </div>
                  <button type="submit" className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-2xl bg-[#071724] px-6 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                    {t('searchAction')}
                  </button>
                </div>
              </form>

              <p className="sr-only">{t('keyboardHint')}</p>

              {debouncedQuery.trim() === '' ? (
                <div className="px-2 py-12 text-center sm:py-16">
                  <p className="text-sm text-slate-600">{t('initialPrompt')}</p>
                  <a href={path('/catalog')} onClick={onClose} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-[#071724]">
                    {t('browseCatalog')} <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </div>
              ) : allResults.length === 0 ? (
                <div className="px-2 py-12 text-center sm:py-16">
                  <p className="text-base font-semibold text-[#071724]">{t('noResults')}</p>
                  <button type="button" onClick={() => setQuery('')} className="mt-5 text-sm font-bold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:text-[#071724]">{t('clearSearch')}</button>
                </div>
              ) : (
                <div className="mt-4" id="global-product-search-results" role="listbox" aria-label={t('resultsLabel')}>
                  <p className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {t(allResults.length === 1 ? 'resultCountOne' : 'resultCountOther', { count: allResults.length })}
                  </p>
                  <div className="max-h-[min(52vh,32rem)] space-y-2 overflow-y-auto pr-1">
                    {visibleResults.map((result, index) => {
                      const product = getLocalizedProduct(result.product, locale)
                      const category = getCatalogFilter(result.product)
                      const active = index === activeIndex

                      return (
                        <a
                          key={product.slug}
                          id={`search-result-${product.slug}`}
                          href={path(`/products/${product.slug}`)}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={onClose}
                          className={`flex items-center gap-3 rounded-2xl border p-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:gap-4 sm:p-4 ${active ? 'border-teal-300 bg-white shadow-[0_12px_28px_rgba(20,184,166,0.12)]' : 'border-slate-900/8 bg-white/60 hover:border-teal-200 hover:bg-white'}`}
                        >
                          <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#ffffff,#e4eeee)] sm:size-[4.5rem]">
                            <ProductImage product={product} alt="" width={96} height={72} sizes="96px" className="h-full w-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-semibold tracking-[-0.02em] text-[#071724]">{highlightMatch(product.name, query)}</h3>
                            <p className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.1em] text-teal-700">{getCatalogFilterLabel(category, tCatalog)}</p>
                            <div className="mt-1.5 hidden gap-1.5 overflow-hidden sm:flex">
                              {product.catalogHighlights.slice(0, 3).map((highlight) => <span key={highlight} className="truncate rounded-full bg-slate-100 px-2 py-0.5 text-[0.68rem] font-medium text-slate-600">{highlight}</span>)}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-slate-500">{t('startingPriceLabel')}</p>
                            <p className="mt-0.5 text-sm font-bold text-[#071724]">{getPriceLabel(product, tCatalog)}</p>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                  {allResults.length > visibleResults.length ? <a href={`${path('/catalog')}?q=${encodeURIComponent(query.trim())}`} onClick={onClose} className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-sm font-bold text-teal-900 transition hover:border-teal-400 hover:bg-teal-50">{t('viewAll')} <ArrowRight size={15} aria-hidden="true" /></a> : null}
                </div>
              )}

              <div className="mt-5 hidden items-center justify-center gap-4 text-xs font-medium text-slate-500 sm:flex" aria-hidden="true">
                <span className="inline-flex items-center gap-1"><ArrowUp size={13} /> <ArrowDown size={13} /> {t('keyboardNavigate')}</span>
                <span className="inline-flex items-center gap-1"><CornerDownLeft size={13} /> {t('keyboardOpen')}</span>
                <span>Esc {t('keyboardClose')}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
