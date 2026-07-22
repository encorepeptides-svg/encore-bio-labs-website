import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Check,
  FileCheck2,
  FlaskConical,
  Layers3,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import transformationVideo from '../../assets/videos/encore-hero.mp4'
import transformationPoster from '../../assets/images/hero/hero-video-poster.jpg'
import { getCategoryExperience, type CategoryExperienceConfig } from '../../data/categoryExperience'
import { coaBySlug } from '../../data/coa'
import { getLocalizedProduct, localizedFormatLabel } from '../../data/productTranslations'
import { products, type CategoryContent, type Product, type ResearchArea } from '../../data/products'
import { SITE_ORIGIN } from '../../i18n/config'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { money } from '../../lib/purchaseOptions'
import { getCatalogFilter } from '../catalog/catalogHelpers'
import { ProductImage } from '../ProductImage'
import { CategoryBreadcrumb } from './CategoryPageSections'

const trustIcons = [PackageCheck, FileCheck2, ShieldCheck]

function productPurchasePath(product: Product) {
  const anchor = product.slug === 'retatrutide' ? 'retatrutide-purchase' : `purchase-options-${product.slug}`
  return `/products/${product.slug}#${anchor}`
}

function getStartingPrice(product: Product) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)
  return prices.length ? Math.min(...prices) : null
}

function getVariantSummary(product: Product, locale: 'en' | 'es', optionsLabel: (count: number) => string) {
  if (product.variants.length === 1) {
    const variant = product.variants[0]
    return `${variant.label} · ${localizedFormatLabel(variant.format, locale)}`
  }
  return `${product.variants.map((variant) => variant.label).join(' · ')} · ${optionsLabel(product.variants.length)}`
}

function CategoryStructuredData({ area, categoryProducts }: { area: ResearchArea; categoryProducts: Product[] }) {
  const { locale, path } = useLocale()

  useEffect(() => {
    const id = `category-structured-data-${area.slug}`
    document.getElementById(id)?.remove()
    const pageUrl = `${SITE_ORIGIN}${path(`/categories/${area.slug}`)}`
    const script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': pageUrl,
          url: pageUrl,
          name: area.name,
          description: area.description,
          inLanguage: locale,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: categoryProducts.map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: product.name,
              url: `${SITE_ORIGIN}${path(`/products/${product.slug}`)}`,
            })),
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: locale === 'es' ? 'Inicio' : 'Home', item: `${SITE_ORIGIN}${path('/')}` },
            { '@type': 'ListItem', position: 2, name: area.name, item: pageUrl },
          ],
        },
      ],
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [area.description, area.name, area.slug, categoryProducts, locale, path])

  return null
}

function HeroMedia({ config, categoryProducts, areaName }: { config: CategoryExperienceConfig; categoryProducts: Product[]; areaName: string }) {
  const { t } = useTranslation('categoryPage')
  const [playVideo, setPlayVideo] = useState(false)
  const visualProducts = config.heroProductSlugs
    .map((slug) => categoryProducts.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))

  useEffect(() => {
    if (config.heroMedia !== 'metabolic-video' || typeof window === 'undefined') return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
    setPlayVideo(!reducedMotion && !saveData)
  }, [config.heroMedia])

  if (config.heroMedia === 'metabolic-video') {
    return (
      <div className="absolute inset-0" aria-label={t('metabolicHeroMediaAlt')}>
        <img src={transformationPoster} alt="" width="1920" height="1080" loading="eager" decoding="async" className="size-full object-cover object-[66%_center] sm:object-center" />
        {playVideo ? (
          <video autoPlay muted loop playsInline preload="metadata" poster={transformationPoster} aria-hidden="true" className="absolute inset-0 size-full object-cover object-[66%_center] sm:object-center">
            <source src={transformationVideo} type="video/mp4" />
          </video>
        ) : null}
      </div>
    )
  }

  return (
    <div className="relative min-h-[23rem] w-full sm:min-h-[29rem] lg:min-h-[38rem]" aria-label={t('categoryProductArrangementAlt', { category: areaName })}>
      <div className="absolute inset-[8%_0_0_8%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.25),rgba(56,189,248,0.08)_42%,transparent_70%)] blur-2xl" />
      {visualProducts.map((product, index) => {
        const positions = [
          'bottom-[-3%] right-[5%] z-20 h-[96%] w-[86%]',
          'bottom-[1%] right-[-6%] z-10 h-[58%] w-[48%] opacity-90',
          'bottom-[3%] left-[-7%] z-0 h-[48%] w-[42%] opacity-80',
        ]
        return (
          <ProductImage
            key={product.slug}
            product={product}
            alt={t('productImageAlt', { product: product.name })}
            loading={index === 0 ? 'eager' : 'lazy'}
            sizes={index === 0 ? '(min-width: 1024px) 46vw, 90vw' : '(min-width: 1024px) 18vw, 35vw'}
            className={`absolute object-contain drop-shadow-[0_36px_42px_rgba(0,0,0,0.42)] ${positions[index] ?? positions[2]}`}
          />
        )
      })}
      <p className="absolute bottom-3 right-3 z-30 rounded-full border border-white/12 bg-[#071724]/65 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-300 backdrop-blur">
        {t('categoryPreview')}
      </p>
    </div>
  )
}

function CategoryHero({ area, content, config, categoryProducts }: { area: ResearchArea; content: CategoryContent; config: CategoryExperienceConfig; categoryProducts: Product[] }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const flagship = config.flagshipSlug ? categoryProducts.find((product) => product.slug === config.flagshipSlug) : undefined
  const primaryHref = flagship ? path(productPurchasePath(flagship)) : '#category-portfolio'

  return (
    <section className="relative isolate min-h-[calc(100svh-9rem)] overflow-hidden bg-[#030b18] px-5 pb-14 pt-8 text-white sm:px-8 lg:flex lg:items-center lg:py-14">
      <div className="absolute inset-0 -z-20">
        <HeroMedia config={config} categoryProducts={categoryProducts} areaName={area.name} />
      </div>
      <div className={`absolute inset-0 -z-10 ${config.heroMedia === 'metabolic-video' ? 'bg-[linear-gradient(90deg,rgba(3,11,24,0.96)_0%,rgba(3,11,24,0.88)_38%,rgba(3,11,24,0.3)_72%,rgba(3,11,24,0.12)_100%)]' : 'bg-[linear-gradient(90deg,#030b18_0%,rgba(3,11,24,0.97)_46%,rgba(3,11,24,0.44)_72%,rgba(3,11,24,0.08)_100%)]'} `} />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,11,24,0.02)_0%,rgba(3,11,24,0.14)_62%,#030b18_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_46%,rgba(45,212,191,0.16),transparent_34%)]" />

      <div className="relative mx-auto grid w-full max-w-[88rem] gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-center">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-full border border-teal-200/25 bg-teal-200/10 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-teal-100">{content.eyebrow}</p>
          <h1 className="mt-6 text-[clamp(2.75rem,7.3vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white">{content.headline}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{content.subheadline}</p>
          <div className="mt-8 flex flex-col gap-3 pr-12 sm:flex-row sm:flex-wrap sm:pr-0">
            <a href={primaryHref} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-7 py-3.5 text-sm font-bold text-[#071724] shadow-[0_18px_44px_rgba(45,212,191,0.25)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/40">
              {flagship ? t('chooseFlagship', { product: flagship.name }) : t('viewCategoryProducts')}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a href="#category-pathways" className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 bg-white/8 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">
              {t('comparePathways')}
            </a>
          </div>
          <p className="mt-7 max-w-2xl border-l-2 border-teal-300/60 pl-4 text-xs font-semibold leading-6 text-slate-300 sm:text-sm">{content.disclaimer}</p>
        </div>
        <div className="hidden min-h-[30rem] lg:block" aria-hidden="true" />
      </div>
      <a href="#category-start" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 transition hover:text-white lg:inline-flex">
        {t('startHere')}<ArrowDown size={15} aria-hidden="true" />
      </a>
    </section>
  )
}

function ProductStatus({ product }: { product: Product }) {
  const { t } = useTranslation('categoryPage')
  const hasCoa = Boolean(coaBySlug[product.slug])
  return (
    <div className="flex flex-wrap gap-2">
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${product.purchaseRules.kitEligible ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-600'}`}>
        {product.purchaseRules.kitEligible ? <PackageCheck size={14} aria-hidden="true" /> : <Layers3 size={14} aria-hidden="true" />}
        {t(product.purchaseRules.kitEligible ? 'completeKitEligible' : 'productOnly')}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        {hasCoa ? <BadgeCheck size={14} className="text-teal-700" aria-hidden="true" /> : <FileCheck2 size={14} aria-hidden="true" />}
        {t(hasCoa ? 'verifiedRecordAvailable' : 'documentationByRequest')}
      </span>
    </div>
  )
}

function FlagshipModule({ product }: { product: Product }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const price = getStartingPrice(product)

  return (
    <section id="category-start" className="scroll-mt-24 bg-[linear-gradient(180deg,#030b18_0%,#071724_6rem,#F8FAFC_17rem)] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-[88rem] overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white shadow-[0_28px_90px_rgba(7,23,36,0.13)] lg:grid-cols-[0.7fr_1.3fr] lg:items-stretch">
        <div className="relative min-h-[21rem] overflow-hidden bg-[radial-gradient(circle_at_50%_36%,rgba(45,212,191,0.24),transparent_45%),linear-gradient(145deg,#eef8f6,#dce9e8)] sm:min-h-[28rem]">
          <ProductImage product={product} alt={t('flagshipImageAlt', { product: product.name })} loading="eager" sizes="(min-width: 1024px) 36vw, 90vw" className="absolute inset-0 size-full object-contain p-7 drop-shadow-[0_30px_38px_rgba(7,23,36,0.24)] sm:p-10" />
        </div>
        <div className="flex flex-col border-t border-slate-900/10 p-6 sm:p-9 lg:border-l lg:border-t-0 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('flagshipEyebrow')}</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">{product.name}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{product.description}</p>
            </div>
            {price !== null ? <p className="text-sm font-semibold text-slate-500">{t('startingAt')} <strong className="ml-1 text-3xl text-[#071724]">{money(price)}</strong></p> : null}
          </div>
          <div className="mt-7"><ProductStatus product={product} /></div>
          <div className={`mt-8 grid gap-3 ${product.variants.length > 3 ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5' : 'sm:grid-cols-2'}`}>
            {product.variants.map((variant) => (
              <a key={variant.sku} href={path(productPurchasePath(product))} className="min-h-20 rounded-2xl border border-slate-900/10 bg-[#F8FAFC] px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:bg-white hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
                <span className="block text-sm font-bold text-[#071724]">{variant.label}</span>
                <span className="mt-1 block text-sm font-semibold text-teal-700">{money(variant.price)}</span>
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-900/10 pt-6 sm:flex-row sm:items-center">
            <a href={path(productPurchasePath(product))} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#071724] px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700">
              {t('chooseOptions')}<ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href={path(`/products/${product.slug}`)} className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/12 px-6 py-3 text-sm font-bold text-[#071724] transition hover:border-teal-500 hover:text-teal-800">
              {t('researchDetails')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickProductSelector({ categoryProducts }: { categoryProducts: Product[] }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  return (
    <section id="category-start" className="scroll-mt-24 bg-[linear-gradient(180deg,#030b18_0%,#071724_6rem,#F8FAFC_17rem)] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-[0_28px_90px_rgba(7,23,36,0.13)] sm:p-9 lg:p-12">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('quickSelectorEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('quickSelectorTitle')}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{t('quickSelectorBody')}</p>
        </div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categoryProducts.map((product) => {
            const price = getStartingPrice(product)
            return (
              <a key={product.slug} href={`#category-product-${product.slug}`} className="group relative min-h-48 overflow-hidden rounded-2xl border border-slate-900/10 bg-[radial-gradient(circle_at_50%_25%,rgba(45,212,191,0.2),transparent_38%),#F8FAFC] p-4 transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
                <ProductImage product={product} alt={t('productImageAlt', { product: product.name })} sizes="(min-width: 1024px) 14vw, 40vw" className="mx-auto h-28 w-full object-contain drop-shadow-[0_16px_20px_rgba(7,23,36,0.18)] transition duration-500 group-hover:scale-105" />
                <span className="mt-2 block text-sm font-bold text-[#071724]">{product.name}</span>
                {price !== null ? <span className="mt-1 block text-sm font-semibold text-teal-700">{t('fromPrice', { price: money(price) })}</span> : null}
              </a>
            )
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <a href={path('/intake')} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#071724] underline decoration-teal-400 underline-offset-4">{t('findMatchShort')}<ArrowRight size={14} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  )
}

function PathwaySelector({ content, config, categoryProducts }: { content: CategoryContent; config: CategoryExperienceConfig; categoryProducts: Product[] }) {
  const { t } = useTranslation('categoryPage')
  return (
    <section id="category-pathways" className="scroll-mt-24 bg-[#F8FAFC] px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('pathwayEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('pathwayTitle')}</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">{t('pathwayBody')}</p>
        </div>
        <div className={`mt-9 grid gap-px overflow-hidden border border-slate-900/10 bg-slate-900/10 ${config.pathways.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {config.pathways.map((pathway, index) => {
            const theme = content.themes[pathway.themeIndex]
            const linkedProducts = pathway.productSlugs.map((slug) => categoryProducts.find((product) => product.slug === slug)).filter((product): product is Product => Boolean(product))
            if (!theme) return null
            return (
              <article key={`${pathway.themeIndex}-${index}`} className="flex min-h-64 flex-col bg-white p-6 sm:p-7">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#071724] text-sm font-bold text-white">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[#071724]">{theme.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{theme.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {linkedProducts.map((product) => <a key={product.slug} href={`#category-product-${product.slug}`} className="inline-flex min-h-9 items-center rounded-full bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800 transition hover:bg-teal-100">{product.name}</a>)}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, note }: { product: Product; note?: string }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const price = getStartingPrice(product)
  const variantSummary = getVariantSummary(product, locale, (count) => t(count === 1 ? 'optionCount' : 'optionsCount', { count }))

  return (
    <article id={`category-product-${product.slug}`} className="group scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_20px_56px_rgba(7,23,36,0.07)] transition duration-300 hover:-translate-y-1 hover:border-teal-400/70 hover:shadow-[0_28px_78px_rgba(7,23,36,0.12)]">
      <div className="grid h-full sm:grid-cols-[0.42fr_0.58fr]">
        <a href={path(`/products/${product.slug}`)} className="relative block min-h-64 overflow-hidden bg-[radial-gradient(circle_at_50%_28%,rgba(45,212,191,0.24),transparent_42%),linear-gradient(145deg,#eff8f6,#dfeae9)]" aria-label={t('researchDetailsFor', { product: product.name })}>
          <ProductImage product={product} alt={t('productImageAlt', { product: product.name })} sizes="(min-width: 1024px) 23vw, 50vw" className="absolute inset-0 size-full object-contain p-5 drop-shadow-[0_22px_30px_rgba(7,23,36,0.2)] transition duration-500 group-hover:scale-[1.045]" />
        </a>
        <div className="flex min-w-0 flex-col p-5 sm:p-7">
          {note ? <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-teal-700">{note}</p> : null}
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-2xl font-semibold tracking-[-0.05em] text-[#071724]">{product.name}</h3>
            {price !== null ? <strong className="text-2xl tracking-[-0.04em] text-teal-800">{product.variants.length > 1 ? t('fromPrice', { price: money(price) }) : money(price)}</strong> : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
          <ul className="mt-5 grid gap-2" aria-label={t('researchHighlights')}>
            {product.catalogHighlights.slice(0, 2).map((highlight) => <li key={highlight} className="flex items-start gap-2 text-sm font-semibold leading-5 text-slate-700"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800"><Check size={12} strokeWidth={3} aria-hidden="true" /></span>{highlight}</li>)}
          </ul>
          <p className="mt-5 text-xs font-semibold leading-5 text-slate-500">{variantSummary}</p>
          <div className="mt-4"><ProductStatus product={product} /></div>
          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
            <a href={path(productPurchasePath(product))} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-teal-700">{t('chooseOptions')}<ArrowRight size={15} aria-hidden="true" /></a>
            <a href={path(`/products/${product.slug}`)} className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-900/12 px-5 py-2.5 text-sm font-bold text-[#071724] transition hover:border-teal-500 hover:text-teal-800">{t('researchDetails')}</a>
          </div>
        </div>
      </div>
    </article>
  )
}

function ProductPortfolio({ areaName, content, config, categoryProducts, accessories }: { areaName: string; content: CategoryContent; config: CategoryExperienceConfig; categoryProducts: Product[]; accessories: Product[] }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const portfolioProducts = config.flagshipSlug ? categoryProducts.filter((product) => product.slug !== config.flagshipSlug) : categoryProducts

  return (
    <section id="category-portfolio" className="scroll-mt-24 bg-[#edf5f4] px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('portfolioEyebrow')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('portfolioTitle', { category: areaName })}</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">{t('portfolioBody')}</p>
          </div>
          <a href={path('/intake')} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-900/12 bg-white px-6 py-3 text-sm font-bold text-[#071724] transition hover:border-teal-500 hover:text-teal-800">{t('findMatchShort')}<ArrowRight size={15} aria-hidden="true" /></a>
        </div>
        <div className="mt-10 grid gap-5 xl:grid-cols-2">
          {portfolioProducts.map((product) => <ProductCard key={product.slug} product={product} note={content.comparisonNotes[product.slug]} />)}
        </div>
        {accessories.length ? (
          <div className="mt-8 flex flex-col gap-5 border border-slate-900/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700"><FlaskConical size={22} aria-hidden="true" /></span>
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t('accessoryEyebrow')}</p><h3 className="mt-1 text-xl font-semibold text-[#071724]">{accessories.map((product) => product.name).join(', ')}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{t('accessoryBody')}</p></div>
            </div>
            <a href={path(`/products/${accessories[0].slug}`)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white">{t('viewAccessory')}<ArrowRight size={15} aria-hidden="true" /></a>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function TrustAndFAQ({ content }: { content: CategoryContent }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const trustItems = [
    { title: t('trustKitTitle'), body: t('trustKitBody') },
    { title: t('trustDocsTitle'), body: t('trustDocsBody') },
    { title: t('trustSupportTitle'), body: t('trustSupportBody') },
  ]

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('trustEyebrow')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('trustTitle')}</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">{content.overview}</p>
            <details className="group mt-6 border-y border-slate-900/10 py-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#071724] focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{t('researchContext')}<span className="text-teal-700 transition group-open:rotate-45">+</span></summary>
              <p className="pb-2 pt-3 text-sm leading-7 text-slate-600">{content.whyStudied}</p>
            </details>
          </div>
          <div className="grid gap-px overflow-hidden border border-slate-900/10 bg-slate-900/10 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {trustItems.map((item, index) => {
              const Icon = trustIcons[index]
              return <article key={item.title} className="bg-[#F8FAFC] p-6 sm:p-7"><Icon size={23} className="text-teal-700" aria-hidden="true" /><h3 className="mt-5 text-lg font-semibold text-[#071724]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p></article>
            })}
          </div>
        </div>

        <div className="mt-14 border-t border-slate-900/10 pt-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('faqEyebrow')}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-4xl">{t('faqTitle')}</h2></div><a href={path('/research')} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#071724] underline decoration-teal-400 underline-offset-4">{t('researchLibrary')}<ArrowRight size={14} aria-hidden="true" /></a></div>
          <div className="mt-7 divide-y divide-slate-900/10 border-y border-slate-900/10">
            {content.faqs.slice(0, 3).map((item) => <details key={item.question} className="group"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-left text-base font-bold text-[#071724] focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{item.question}<span className="shrink-0 text-xl text-teal-700 transition group-open:rotate-45">+</span></summary><p className="max-w-4xl pb-6 pr-10 text-sm leading-7 text-slate-600">{item.answer}</p></details>)}
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ area, config, categoryProducts }: { area: ResearchArea; config: CategoryExperienceConfig; categoryProducts: Product[] }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const flagship = config.flagshipSlug ? categoryProducts.find((product) => product.slug === config.flagshipSlug) : undefined
  const filter = getCatalogFilter(categoryProducts[0])
  const catalogHref = `${path('/catalog')}?category=${encodeURIComponent(filter)}`
  return (
    <section className="bg-[#071724] px-5 pb-32 pt-16 text-white sm:px-8 sm:pb-20 lg:py-24">
      <div className="mx-auto grid max-w-[88rem] gap-8 border border-white/12 bg-[radial-gradient(circle_at_88%_20%,rgba(45,212,191,0.22),transparent_34%),rgba(255,255,255,0.05)] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
        <div><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-200"><Sparkles size={14} aria-hidden="true" />{t('finalEyebrow')}</p><h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">{t('finalTitle', { category: area.name })}</h2><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t('finalBody')}</p></div>
        <div className="flex flex-col gap-3">
          <a href={flagship ? path(productPurchasePath(flagship)) : '#category-portfolio'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] transition hover:bg-white">{flagship ? t('chooseFlagship', { product: flagship.name }) : t('viewCategoryProducts')}<ArrowRight size={16} aria-hidden="true" /></a>
          <a href={catalogHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/14"><FlaskConical size={16} aria-hidden="true" />{t('browseFilteredCatalog')}</a>
        </div>
      </div>
    </section>
  )
}

export function PremiumCategoryPage({ area, content }: { area: ResearchArea; content: CategoryContent }) {
  const { locale } = useLocale()
  const config = getCategoryExperience(area.slug)
  const categoryProducts = useMemo(() => config?.productSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
    .map((product) => getLocalizedProduct(product, locale)) ?? [], [config, locale])
  const accessories = useMemo(() => config?.accessorySlugs
    ?.map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
    .map((product) => getLocalizedProduct(product, locale)) ?? [], [config, locale])

  if (!config || !categoryProducts.length) return null
  const flagship = config.flagshipSlug ? categoryProducts.find((product) => product.slug === config.flagshipSlug) : undefined

  return (
    <main id="main-content" className="overflow-x-clip bg-[#F8FAFC]">
      <CategoryStructuredData area={area} categoryProducts={categoryProducts} />
      <CategoryBreadcrumb area={area} />
      <CategoryHero area={area} content={content} config={config} categoryProducts={categoryProducts} />
      {flagship ? <FlagshipModule product={flagship} /> : <QuickProductSelector categoryProducts={categoryProducts} />}
      <PathwaySelector content={content} config={config} categoryProducts={categoryProducts} />
      <ProductPortfolio areaName={area.name} content={content} config={config} categoryProducts={categoryProducts} accessories={accessories} />
      <TrustAndFAQ content={content} />
      <FinalCTA area={area} config={config} categoryProducts={categoryProducts} />
    </main>
  )
}
