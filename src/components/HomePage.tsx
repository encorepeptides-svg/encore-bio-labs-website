import {
  BadgeCheck,
  Beaker,
  MessageCircle,
  PackageCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { lazy, Suspense, useState } from 'react'
import { coaBySlug } from '../data/coa'
import { products, type Product } from '../data/products'
import { getLocalizedProduct, localizedCategoryLabel } from '../data/productTranslations'
import { cn } from '../lib/utils'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { AddToCartButton } from './cart/AddToCartButton'
import { CTA } from './CTA'
import { ProductLabVisual } from './product/ProductLabVisual'
import { ResearchProfilePrompt } from './ResearchProfilePrompt'
import heroVideo from '../assets/videos/encore-hero.mp4'
import heroVideoPoster from '../assets/images/hero/hero-video-poster.jpg'

const bestSellerSlugs = ['retatrutide', 'ghk-cu', 'nad-plus', 'tesamorelin']

const HomeBelowFold = lazy(() =>
  import('./home/HomeBelowFold').then((module) => ({ default: module.HomeBelowFold })),
)

function getResearchOptionPrice(product: Product, t: (key: string, vars?: Record<string, string | number>) => string) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)
  const startingPrice = prices.length ? Math.min(...prices) : undefined
  return startingPrice ? t('researchOptionsFrom', { price: `$${startingPrice.toLocaleString()}` }) : t('availabilityByRequest')
}

function getProductLine(product: Product, locale: 'en' | 'es') {
  // In Spanish, catalogTagline is localized for every product while shortDescription
  // is only translated for a few, so fall back through it to avoid English leaking.
  if (locale === 'es') return product.catalogTagline || product.shortDescription || product.description
  return product.shortDescription || product.description
}

function FeaturedBestSellerCard({ product: baseProduct }: { product: Product }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('homepage')
  const { t: catalogT } = useTranslation('catalog')
  const product = getLocalizedProduct(baseProduct, locale)
  const hasCoa = Boolean(coaBySlug[product.slug])
  const firstAvailableVariant = product.variants.find((variant) => product.stockStatus !== 'Unavailable' && variant.price > 0)
  const [selectedVariant, setSelectedVariant] = useState(firstAvailableVariant)

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_24px_80px_rgba(7,23,36,0.08)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_34px_110px_rgba(20,184,166,0.16)]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="order-2 flex flex-col justify-center gap-5 p-6 sm:p-8 lg:order-1 lg:p-10 xl:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-700/20 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
              <Star size={13} aria-hidden="true" />
              {t('featuredBestseller')}
            </span>
            {hasCoa ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                <BadgeCheck size={14} aria-hidden="true" />
                {catalogT('onFileCoa')}
              </span>
            ) : null}
          </div>
          <h3 className="text-[clamp(1.85rem,1.1rem+3vw,3rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#071724]">
            {product.name}
          </h3>
          <p className="max-w-lg text-base leading-7 text-slate-600">{getProductLine(product, locale)}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('availableStrengths')}
            </p>
            <div role="group" className="mt-3 flex flex-wrap gap-2" aria-label={t('availableStrengthsAria', { product: product.name })}>
              {product.variants.map((variant, index) => {
                const available = product.stockStatus !== 'Unavailable' && variant.price > 0
                const selected = selectedVariant === variant
                const unavailableId = `featured-variant-${product.slug}-${index}-status`

                return (
                  <button
                    key={`${variant.label}-${variant.format}`}
                    type="button"
                    disabled={!available}
                    aria-pressed={selected}
                    aria-describedby={!available ? unavailableId : undefined}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      'inline-flex flex-col rounded-xl border px-3 py-2 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-45',
                      selected
                        ? 'border-teal-700 bg-teal-50 text-teal-900 shadow-[0_0_0_1px_rgba(15,118,110,.12)]'
                        : 'border-slate-900/10 bg-[#f5f5f2] text-slate-600 hover:border-teal-600/40 hover:bg-teal-50',
                    )}
                  >
                    <span className="font-semibold">{variant.label}</span>
                    <span className="mt-0.5 text-[0.68rem]">{available ? `$${variant.price.toLocaleString()}` : t('variantUnavailable')}</span>
                    {!available ? <span id={unavailableId} className="sr-only">{t('variantUnavailableDescription', { variant: variant.label })}</span> : null}
                  </button>
                )
              })}
            </div>
          </div>
          {selectedVariant ? (
            <div className="grid gap-1 rounded-2xl border border-slate-900/10 bg-[#f7faf9] p-4 text-sm sm:grid-cols-2" aria-live="polite">
              <p className="text-slate-600"><span className="font-semibold text-[#071724]">{t('selectedPrice')}:</span> ${selectedVariant.price.toLocaleString()}</p>
              <p className="break-all text-slate-600"><span className="font-semibold text-[#071724]">{t('variantReference')}:</span> {selectedVariant.sku ?? selectedVariant.label}</p>
            </div>
          ) : (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">{getResearchOptionPrice(product, t)}</p>
          )}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            {selectedVariant ? (
              <AddToCartButton product={product} variant={selectedVariant} className="min-h-12 px-6">
                {t('addVariantToCart', { variant: selectedVariant.label })}
              </AddToCartButton>
            ) : null}
            <a
              href={path(`/products/${product.slug}`)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 py-3 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
            >
              {t('viewResearchDetails')}
            </a>
          </div>
        </div>

        <a
          href={path(`/products/${product.slug}`)}
          aria-label={t('viewProduct', { product: product.name })}
          className="relative order-1 block overflow-hidden bg-[#dfe8e7] lg:order-2"
        >
          <div className="relative flex aspect-[4/3] w-full items-center justify-center p-3 sm:aspect-[16/10] sm:p-5 lg:aspect-auto lg:h-full lg:min-h-[clamp(22rem,15rem+18vw,34rem)] lg:p-5">
            <ProductLabVisual
              product={product}
              alt={t('productImageAlt', { product: product.name })}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="[&_.ph-product]:!h-[96%] [&_.ph-product]:!w-[92%]"
              priority
            />
          </div>
        </a>
      </div>
    </article>
  )
}

function SecondaryBestSellerCard({ product: baseProduct, className }: { product: Product; className?: string }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('homepage')
  const { t: catalogT } = useTranslation('catalog')
  const product = getLocalizedProduct(baseProduct, locale)
  const hasCoa = Boolean(coaBySlug[product.slug])

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_54px_rgba(7,23,36,0.07)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_28px_84px_rgba(20,184,166,0.14)]',
        className,
      )}
    >
      <a
        href={path(`/products/${product.slug}`)}
        aria-label={t('viewProduct', { product: product.name })}
        className="relative block aspect-[16/10] overflow-hidden bg-[#dfe8e7]"
      >
        <ProductLabVisual
          product={product}
          alt={t('productImageAlt', { product: product.name })}
          sizes="(min-width: 1024px) 30vw, 100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0)_0_42%,rgba(255,255,255,0.32)_76%,rgba(255,255,255,0.92)_100%)]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/78 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#071724] backdrop-blur-xl">
          {localizedCategoryLabel(baseProduct.category, locale)}
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            {getResearchOptionPrice(product, t)}
          </p>
          {hasCoa ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-teal-700">
              <BadgeCheck size={14} aria-hidden="true" />
              {catalogT('onFileCoa')}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#071724]">{product.name}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{getProductLine(product, locale)}</p>
        <div className="mt-auto pt-5">
          <a
            href={path(`/products/${product.slug}`)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
          >
            {t('viewResearchDetails')}
          </a>
        </div>
      </div>
    </article>
  )
}

export function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  const { locale } = useLocale()
  const { t } = useTranslation('homepage')
  const heroTitleLines = t('heroTitle').split('\n')
  const bestSellerProducts = bestSellerSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
  const heroProduct = bestSellerProducts.find((product) => product.slug === 'retatrutide')
  const supportingProducts = bestSellerProducts.filter((product) => product.slug !== 'retatrutide')
  const heroTrustItems = [
    { icon: Beaker, label: t('heroTrustCompounds') },
    { icon: PackageCheck, label: t('heroTrustKits') },
    { icon: SlidersHorizontal, label: t('heroTrustStrengths') },
    { icon: MessageCircle, label: t('heroTrustSupport') },
  ]
  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <section className="home-hero relative isolate overflow-hidden bg-[#030b18] px-5 text-white sm:px-8">
        <div aria-hidden="true" className="home-hero-video-canvas pointer-events-none absolute inset-0 -z-30">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroVideoPoster}
            tabIndex={-1}
            onCanPlay={(event) => {
              void event.currentTarget.play().catch(() => undefined)
            }}
            className="hero-transformation-video size-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </div>
        <div aria-hidden="true" className="home-hero-scrim pointer-events-none absolute inset-0 -z-20" />
        <div aria-hidden="true" className="home-hero-atmosphere pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_right,black,transparent_62%)]" />

        <div className="relative mx-auto flex min-h-[clamp(35rem,calc(100svh-12rem),46rem)] max-w-[88rem] items-center py-10 sm:py-12 lg:py-14">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: 'easeOut' }}
            className="relative z-10 min-w-0 max-w-[46rem] md:w-[57%] lg:w-[52%]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-100/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.19em] text-teal-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:px-4 sm:py-2 sm:text-xs">
              <Sparkles size={15} aria-hidden="true" className="text-[#28e0c1]" />
              {t('heroEyebrow')}
            </div>
            <h1
              className={`mt-5 max-w-full font-semibold leading-[0.91] tracking-[-0.065em] text-white sm:mt-7 ${
                locale === 'es'
                  ? 'text-[clamp(2.65rem,11.5vw,3.35rem)] sm:text-[clamp(3.15rem,6.4vw,4.15rem)] lg:text-[clamp(3.65rem,4.45vw,4.85rem)]'
                  : 'text-[clamp(2.75rem,12vw,3.5rem)] sm:text-[clamp(3.3rem,6.7vw,4.4rem)] lg:text-[clamp(3.8rem,4.65vw,5.05rem)]'
              }`}
            >
              {heroTitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-[42rem] text-base leading-7 text-slate-300 sm:mt-7 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
              {t('heroSubtitle')}
            </p>

            <ul className="mt-7 grid grid-cols-2 border-y border-white/15 py-4 sm:grid-cols-4 sm:py-5" aria-label={t('heroTrustLabel')}>
              {heroTrustItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <li
                    key={item.label}
                    className={`flex min-w-0 items-start gap-2.5 px-3 py-2 text-[0.68rem] font-semibold leading-4 text-slate-200 sm:px-3.5 sm:py-0 ${
                      index % 2 === 1 ? 'border-l border-white/10' : ''
                    } ${index > 1 ? 'border-t border-white/10 pt-4 sm:border-t-0 sm:pt-0' : ''} ${index > 0 ? 'sm:border-l sm:border-white/10' : ''}`}
                  >
                    <Icon size={16} strokeWidth={1.6} aria-hidden="true" className="mt-0.5 shrink-0 text-[#28e0c1]" />
                    <span>{item.label}</span>
                  </li>
                )
              })}
            </ul>

            <div className="mt-7 sm:mt-8">
              <CTA
                href="/catalog"
                className="min-h-12 w-full bg-[#28e0c1] px-5 text-[#071724] shadow-[0_16px_48px_rgba(40,224,193,0.28)] hover:bg-white sm:min-h-14 sm:w-auto sm:px-8"
              >
                {t('browseCatalog')}
              </CTA>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intake invite directly below the hero so the research profile is
          impossible to miss — above the product grid, not buried down-page. */}
      <ResearchProfilePrompt />

      <section id="best-sellers" className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="mx-auto max-w-[88rem]">
          <div className="home-section-banner relative overflow-hidden rounded-[1.5rem] border border-teal-900/10 bg-white px-6 py-6 shadow-[0_18px_56px_rgba(7,23,36,0.07)] sm:px-8 sm:py-7">
            <div className="molecule-field opacity-[0.08]" aria-hidden="true" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('bestSellersEyebrow')}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">
                {t('bestSellersTitle')}
              </h2>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-5 lg:gap-6">
            {heroProduct ? <FeaturedBestSellerCard product={heroProduct} /> : null}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {supportingProducts.map((product, index) => (
                <SecondaryBestSellerCard
                  key={product.slug}
                  product={product}
                  className={
                    index === supportingProducts.length - 1
                      ? 'md:col-span-2 md:mx-auto md:w-full md:max-w-md lg:col-span-1 lg:mx-0 lg:max-w-none'
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-48" aria-hidden="true" />}>
        <HomeBelowFold />
      </Suspense>
    </main>
  )
}
