import { FileText, Search, ShieldCheck, SlidersHorizontal, Snowflake, Sparkles, Truck, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { brandText } from '../../../config/brandText'
import { categoryVisuals, products, type Product, type PurityGrade, type StockStatus } from '../../data/products'
import { buildSrcSet, stemOf } from '../../lib/responsiveImages'
import { AddToCartButton } from '../cart/AddToCartButton'
import { CTA } from '../CTA'
import { Reveal } from '../Reveal'
import { SectionHeader } from '../SectionHeader'

const productImages = import.meta.glob('../../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const CATALOG_IMAGE_BASE_PATH = '../../assets/images/products/'
const CATALOG_IMAGE_WIDTHS = [720, 1000, 1254]
const CATALOG_CARD_SIZES = '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'

const filterTabs = [
  'All',
  'Weight Management',
  'Recovery & Regeneration',
  'Cognitive & Performance',
  'Longevity',
  'Hormone & Wellness',
  'Skin & Regenerative Research',
  'Essentials',
] as const

type CatalogFilter = (typeof filterTabs)[number]

const purityGradeOptions: PurityGrade[] = ['>=98%', 'Analytical Grade', 'Research Grade']
const stockStatusOptions: StockStatus[] = ['In Stock', 'Limited Stock', 'On Request']

const filterDescriptions: Record<CatalogFilter, string> = {
  All: 'Every product in one place, no research area left out.',
  'Weight Management': 'Incretin-receptor and GH-axis compounds studied in metabolic research.',
  'Recovery & Regeneration': 'Repair-signaling and matrix-remodeling peptides, reviewed together.',
  'Cognitive & Performance': 'Neurobiology and human-performance-adjacent research compounds.',
  Longevity: 'Cellular resilience, redox biology, and healthy-aging research.',
  'Hormone & Wellness': 'Endocrine-axis compounds spanning reproductive and sleep-related signaling.',
  'Skin & Regenerative Research': 'Copper-peptide compounds studied for matrix and dermal research.',
  Essentials: 'Supporting kit and logistics entries that round out a research order.',
}

function getCatalogFilter(product: Product): CatalogFilter {
  if (product.slug === 'ghk-cu' || product.slug === 'ahk-cu') {
    return 'Skin & Regenerative Research'
  }

  if (product.slug === 'klow') {
    return 'Essentials'
  }

  if (product.category === 'Metabolic & Weight Management') {
    return 'Weight Management'
  }

  if (product.category === 'Recovery & Regeneration') {
    return 'Recovery & Regeneration'
  }

  if (product.category === 'Cognitive & Performance') {
    return 'Cognitive & Performance'
  }

  if (product.category === 'Longevity & Cellular Health') {
    return 'Longevity'
  }

  if (product.category === 'Hormone & Wellness') {
    return 'Hormone & Wellness'
  }

  return 'Essentials'
}

function getProductImageName(product: Product) {
  return product.image || categoryVisuals[product.category]
}

function getProductImage(product: Product) {
  return productImages[`../../assets/images/products/${getProductImageName(product)}`]
}

function useDebouncedValue(value: string, delay = 220) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay)

    return () => window.clearTimeout(timeoutId)
  }, [delay, value])

  return debouncedValue
}

function getPriceLabel(product: Product) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)

  if (!prices.length) return 'Quote'

  const lowestPrice = Math.min(...prices)
  const price = `$${lowestPrice.toLocaleString()}`

  return product.variants.length > 1 ? `Starting at ${price}` : price
}

function ProductCard({ product }: { product: Product }) {
  const imageSrc = getProductImage(product)
  const imageStem = stemOf(getProductImageName(product))
  const avifSrcSet = buildSrcSet(productImages, CATALOG_IMAGE_BASE_PATH, imageStem, 'avif', CATALOG_IMAGE_WIDTHS)
  const webpSrcSet = buildSrcSet(productImages, CATALOG_IMAGE_BASE_PATH, imageStem, 'webp', CATALOG_IMAGE_WIDTHS)
  const variantCount = product.variants.length
  const catalogFilter = getCatalogFilter(product)

  return (
    <Reveal
      as="article"
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_50px_rgba(7,23,36,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_82px_rgba(20,184,166,0.16)]"
    >
      <a
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(118,228,211,0.2),transparent_34%),linear-gradient(135deg,#ffffff,#e7eeee)]"
        aria-label={`View ${product.name}`}
      >
        <div className="aspect-[4/3]">
          {imageSrc ? (
            <picture>
              {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={CATALOG_CARD_SIZES} /> : null}
              {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={CATALOG_CARD_SIZES} /> : null}
              <img
                src={imageSrc}
                alt={`${product.name} research compound packaging`}
                width="640"
                height="480"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain object-center opacity-95 saturate-[0.94] transition duration-500 group-hover:scale-[1.03]"
              />
            </picture>
          ) : null}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0)_0_46%,rgba(255,255,255,0.28)_76%,rgba(255,255,255,0.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/82 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm backdrop-blur-xl">
          {catalogFilter}
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              Research-use only
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
              {product.name}
            </h2>
          </div>
          {variantCount > 1 ? (
            <span className="shrink-0 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              {variantCount} options
            </span>
          ) : null}
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {product.catalogTagline}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
            CAS {product.casNumber}
          </span>
          <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-slate-600">
            {product.purityGrade}
          </span>
          <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-slate-600">
            {product.stockStatus}
          </span>
          {product.variants.slice(0, 3).map((variant) => (
            <span
              key={`${product.slug}-${variant.label}-${variant.format}`}
              className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {variant.label}
            </span>
          ))}
          {product.variants.length > 3 ? (
            <span className="rounded-full border border-slate-200 bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-slate-600">
              +{product.variants.length - 3} more
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-6">
          <p className="text-lg font-semibold tracking-[-0.02em] text-[#071724]">
            {getPriceLabel(product)}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Catalog pricing is shown for research-use inquiry context only.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} className="flex-1">
              Add to Cart
            </AddToCartButton>
            <a
              href={`/products/${product.slug}`}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#071724]"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

const qualityCards = [
  {
    icon: FileText,
    title: 'Identity & Purity Documentation',
    body: 'Identity, purity, and batch-level records are available on request.',
  },
  {
    icon: ShieldCheck,
    title: 'Premium Manufacturing',
    body: 'Sourcing and manufacturing follow consistent quality expectations.',
  },
  {
    icon: Snowflake,
    title: 'Cold Chain Handling',
    body: 'Temperature-aware fulfillment protects sensitive materials in transit.',
  },
  {
    icon: Truck,
    title: 'Fast Fulfillment',
    body: 'Clear logistics support local delivery, U.S. shipping, and Mexico coordination.',
  },
]

const encoreDifferenceBullets = [
  'Catalog entries are grouped by product, not duplicated by strength.',
  'Research-use positioning stays clear across product pages.',
  'Support is available for documentation and procurement questions.',
]

function CatalogTrustSection() {
  return (
    <section className="px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[88rem]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#f5f5f2] p-5 shadow-[0_24px_80px_rgba(7,23,36,0.08)] sm:p-7 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Why Encore
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[#071724] sm:text-4xl">
                We built the catalog we wished existed.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                Search once, compare clearly, and keep every product in research-use context,
                with documentation pathways that are easy to request.
              </p>

              <div className="mt-6 grid gap-3">
                {encoreDifferenceBullets.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                      <ShieldCheck size={13} aria-hidden="true" />
                    </span>
                    <p className="text-sm leading-6 text-slate-600">{point}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2 rounded-[1.25rem] border border-slate-900/10 bg-white/70 p-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-2 text-teal-800">
                  <ShieldCheck size={14} aria-hidden="true" />
                  {brandText.researchUseLabel}
                </span>
                <span className="rounded-full bg-[#f8fafc] px-3 py-2">{brandText.documentationLabel}</span>
                <span className="rounded-full bg-[#f8fafc] px-3 py-2">{brandText.notMedicalAdviceLabel}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="/quality"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-800 transition hover:gap-3"
                >
                  See our quality standards
                </a>
                <a
                  href="/about"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 transition hover:gap-3 hover:text-[#071724]"
                >
                  About Encore Bio Labs
                </a>
              </div>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2">
              {qualityCards.map((card) => (
                <Reveal
                  as="article"
                  key={card.title}
                  className="rounded-[1.25rem] border border-slate-900/10 bg-white p-4 shadow-[0_14px_36px_rgba(7,23,36,0.06)]"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                    <card.icon size={16} aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold tracking-[-0.02em] text-[#071724]">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600">{card.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CatalogPage() {
  const [activeFilter, setActiveFilter] = useState<CatalogFilter>('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [casNumber, setCasNumber] = useState('')
  const [purityGrade, setPurityGrade] = useState<PurityGrade | 'All'>('All')
  const [stockStatus, setStockStatus] = useState<StockStatus | 'All'>('All')

  const debouncedSearchTerm = useDebouncedValue(searchTerm)
  const debouncedCasNumber = useDebouncedValue(casNumber)

  const searchResultSlugs = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase()

    if (normalizedSearch.length === 0) {
      return null
    }

    const nameMatches = products.filter((product) =>
      [product.name, product.category, product.shortDescription, product.description]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    )
    const casMatches = products.filter((product) => product.casNumber.toLowerCase().includes(normalizedSearch))

    return new Set([...nameMatches, ...casMatches].map((product) => product.slug))
  }, [debouncedSearchTerm])

  const filteredProducts = useMemo(() => {
    const normalizedCasNumber = debouncedCasNumber.trim().toLowerCase()

    return products.filter((product) => {
      const matchesFilter = activeFilter === 'All' || getCatalogFilter(product) === activeFilter
      const matchesSearch = !searchResultSlugs || searchResultSlugs.has(product.slug)
      const matchesCas =
        normalizedCasNumber.length === 0 || product.casNumber.toLowerCase().includes(normalizedCasNumber)
      const matchesPurityGrade = purityGrade === 'All' || product.purityGrade === purityGrade
      const matchesStockStatus = stockStatus === 'All' || product.stockStatus === stockStatus

      return matchesFilter && matchesSearch && matchesCas && matchesPurityGrade && matchesStockStatus
    })
  }, [activeFilter, debouncedCasNumber, purityGrade, searchResultSlugs, stockStatus])

  const activeFilterBadges = [
    activeFilter !== 'All'
      ? { label: `Category: ${activeFilter}`, onClear: () => setActiveFilter('All') }
      : null,
    searchTerm.trim()
      ? { label: `Search: ${searchTerm.trim()}`, onClear: () => setSearchTerm('') }
      : null,
    casNumber.trim()
      ? { label: `CAS: ${casNumber.trim()}`, onClear: () => setCasNumber('') }
      : null,
    purityGrade !== 'All'
      ? { label: `Purity: ${purityGrade}`, onClear: () => setPurityGrade('All') }
      : null,
    stockStatus !== 'All'
      ? { label: `Stock: ${stockStatus}`, onClear: () => setStockStatus('All') }
      : null,
  ].filter((badge): badge is { label: string; onClear: () => void } => Boolean(badge))

  const multiVariantCount = products.filter((product) => product.variants.length > 1).length

  return (
    <main id="main-content" className="bg-[#F8FAFC]">
      <section className="px-5 pb-12 pt-8 sm:px-8 lg:pb-16">
        <div className="mx-auto max-w-[88rem]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#eef4f4] p-6 shadow-[0_30px_100px_rgba(7,23,36,0.12)] sm:p-8 lg:p-10">
            <div className="molecule-field opacity-[0.2]" aria-hidden="true" />
            <div className="pointer-events-none absolute right-[-10rem] top-[-10rem] size-[28rem] rounded-full bg-teal-200/35 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-12rem] left-[-8rem] size-[26rem] rounded-full bg-white/90 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/62 px-3 py-2 text-sm font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
                  <Sparkles size={16} aria-hidden="true" className="text-teal-700" />
                  Research-use-only catalog
                </div>
                <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#071724] sm:text-5xl lg:text-6xl">
                  A cleaner way to explore research compounds.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  Browse every Encore Bio Labs product once, with variants grouped under the
                  product they belong to. This catalog is educational and documentation-forward,
                  not a source of dosing guidance, treatment instructions, or outcome promises.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <CTA href="#catalog-products">Browse Products</CTA>
                  <CTA href="/intake" tone="ghost">
                    Find My Match
                  </CTA>
                </div>
              </div>

              <div className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-[0_22px_70px_rgba(7,23,36,0.08)] backdrop-blur-2xl sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: 'Products', value: products.length.toString() },
                  { label: 'Multi-option entries', value: multiVariantCount.toString() },
                  { label: 'Use classification', value: 'RUO' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-900/10 bg-white/75 p-4">
                    <p className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CatalogTrustSection />

      <section id="catalog-products" className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-[88rem]">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <SectionHeader
              align="left"
              eyebrow="Product Catalog"
              title="Every product, grouped cleanly."
              description="Use the filters or search to scan the catalog. Strengths and vial-size options stay inside one product card so entries are not duplicated."
            />

            <div className="grid gap-3">
              <div className="relative">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products, CAS numbers, or research areas"
                  aria-label="Search products and CAS numbers"
                  className="h-13 w-full rounded-full border border-slate-900/10 bg-white px-11 py-3 text-sm font-medium text-[#071724] shadow-[0_16px_44px_rgba(7,23,36,0.07)] outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="search"
                  value={casNumber}
                  onChange={(event) => setCasNumber(event.target.value)}
                  placeholder="CAS Number"
                  aria-label="Filter by CAS number"
                  className="h-12 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724] shadow-[0_12px_32px_rgba(7,23,36,0.06)] outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                />

                <select
                  value={purityGrade}
                  onChange={(event) => setPurityGrade(event.target.value as PurityGrade | 'All')}
                  aria-label="Filter by purity grade"
                  className="h-12 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724] shadow-[0_12px_32px_rgba(7,23,36,0.06)] outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="All">All purity grades</option>
                  {purityGradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>

                <select
                  value={stockStatus}
                  onChange={(event) => setStockStatus(event.target.value as StockStatus | 'All')}
                  aria-label="Filter by stock status"
                  className="h-12 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724] shadow-[0_12px_32px_rgba(7,23,36,0.06)] outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="All">All stock statuses</option>
                  {stockStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 overflow-x-auto pb-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600 shadow-sm">
              <SlidersHorizontal size={17} aria-hidden="true" />
            </span>
            {filterTabs.map((tab) => {
              const active = activeFilter === tab

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  title={filterDescriptions[tab]}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'border-[#071724] bg-[#071724] text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)]'
                      : 'border-slate-900/10 bg-white text-slate-600 hover:border-teal-200 hover:text-[#071724]'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">{filterDescriptions[activeFilter]}</p>

          {activeFilterBadges.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Active catalog filters">
              {activeFilterBadges.map((badge) => (
                <button
                  key={badge.label}
                  type="button"
                  onClick={badge.onClear}
                  className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-2 text-xs font-semibold text-[#071724] shadow-sm transition hover:border-teal-200 hover:bg-teal-50"
                  aria-label={`Clear ${badge.label}`}
                >
                  {badge.label}
                  <X size={14} aria-hidden="true" className="text-slate-400" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col items-start gap-4 rounded-[1.5rem] border border-teal-700/15 bg-[linear-gradient(120deg,#eefaf7,#f5f5f2)] p-5 shadow-[0_16px_44px_rgba(7,23,36,0.06)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-base font-semibold tracking-[-0.02em] text-[#071724] sm:text-lg">
                {activeFilter === 'All' ? 'Need help deciding?' : `Comparing ${activeFilter} options?`}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {activeFilter === 'All'
                  ? 'Our Research Match recommends products based on your research goals.'
                  : 'Our Research Match can narrow it down further based on your specific research goals.'}
              </p>
            </div>
            <CTA href="/intake" className="shrink-0">
              Find My Match
            </CTA>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-8 rounded-[1.5rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_18px_50px_rgba(7,23,36,0.06)]">
              <p className="text-lg font-semibold text-[#071724]">No products match that search.</p>
              <p className="mt-2 text-sm text-slate-600">Try another term or switch back to All.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 lg:py-16">
        <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#071724,#0d3144)] px-6 py-14 text-center text-white shadow-[0_34px_110px_rgba(7,23,36,0.22)] sm:px-10 sm:py-16">
          <div className="molecule-field opacity-[0.1]" aria-hidden="true" />
          <div className="pointer-events-none absolute left-1/2 top-0 size-64 -translate-x-1/2 rounded-full bg-teal-300/16 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">
              Need help narrowing the catalog?
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Start with the product page, or ask for a human review.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300">
              Product pages explain identity, format, research context, and documentation pathways
              without turning the catalog into a treatment or dosing guide.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CTA href="/intake" tone="light">
                Find My Match
              </CTA>
              <CTA href="/research" tone="ghost" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                Visit Research Library
              </CTA>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
