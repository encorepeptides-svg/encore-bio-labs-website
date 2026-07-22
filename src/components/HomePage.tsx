import {
  ArrowRight,
  BadgeCheck,
  FileText,
  FlaskConical,
  PackageCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { coaBySlug } from '../data/coa'
import { products, type Product } from '../data/products'
import { getLocalizedProduct, localizedCategoryLabel } from '../data/productTranslations'
import { cn } from '../lib/utils'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { AddToCartButton } from './cart/AddToCartButton'
import { CTA } from './CTA'
import { ProductLabVisual } from './product/ProductLabVisual'
import heroVideo from '../assets/videos/encore-hero.mp4'
import heroVideoPoster from '../assets/images/hero/hero-video-poster.jpg'

const bestSellerSlugs = ['retatrutide', 'ghk-cu', 'nad-plus', 'tesamorelin']

const trustIcons = [FlaskConical, Truck, Sparkles, PackageCheck, FileText]

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
            <ul className="mt-3 flex flex-wrap gap-2" aria-label={t('availableStrengthsAria', { product: product.name })}>
              {product.variants.map((variant) => (
                <li key={`${variant.label}-${variant.format}`}>
                  <span className="inline-flex rounded-full border border-slate-900/10 bg-[#f5f5f2] px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {variant.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            {getResearchOptionPrice(product, t)}
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <AddToCartButton product={product} className="min-h-12 px-6">
              {t('addVariantToCart', { variant: product.variants[0]?.label ?? '' })}
            </AddToCartButton>
            <a
              href={path(`/products/${product.slug}`)}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 py-3 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
            >
              {t('viewResearchDetails')}
            </a>
          </div>
          <a
            href={path('/intake')}
            className="w-fit text-xs font-semibold text-slate-500 transition hover:text-teal-700"
          >
            {t('getPersonalizedGuidance')}
          </a>
        </div>

        <a
          href={path(`/products/${product.slug}`)}
          aria-label={t('viewProduct', { product: product.name })}
          className="relative order-1 block overflow-hidden bg-[#dfe8e7] lg:order-2"
        >
          <div className="relative flex aspect-[4/3] w-full items-center justify-center p-6 sm:aspect-[16/10] sm:p-10 lg:aspect-auto lg:h-full lg:min-h-[clamp(16rem,10rem+18vw,24rem)] lg:p-10">
            <ProductLabVisual
              product={product}
              alt={t('productImageAlt', { product: product.name })}
              sizes="(min-width: 1024px) 45vw, 100vw"
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
        className="relative block aspect-[4/3] overflow-hidden bg-[#dfe8e7]"
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

      <div className="flex flex-1 flex-col p-5 sm:p-6">
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
        <p className="mt-3 text-sm leading-6 text-slate-600">{getProductLine(product, locale)}</p>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <AddToCartButton product={product} className="min-h-11 px-4 py-2.5">
            {t('addToCart')}
          </AddToCartButton>
          <a
            href={path(`/products/${product.slug}`)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
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
  const { path, locale } = useLocale()
  const { t } = useTranslation('homepage')
  const heroTitleLines = t('heroTitle').split('\n')
  const trustItems = [
    { icon: trustIcons[0], label: t('trustResearchUseOnly') },
    { icon: trustIcons[1], label: t('trustHandling') },
    { icon: trustIcons[2], label: t('trustPackaging') },
    { icon: trustIcons[3], label: t('trustFulfillment') },
    { icon: trustIcons[4], label: t('trustDocumentation') },
  ]
  const bestSellerProducts = bestSellerSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
  const heroProduct = bestSellerProducts.find((product) => product.slug === 'retatrutide')
  const supportingProducts = bestSellerProducts.filter((product) => product.slug !== 'retatrutide')
  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <section className="relative isolate overflow-hidden bg-[#030b18] px-5 pb-6 pt-6 text-white sm:px-8 sm:pb-8 sm:pt-10 lg:pb-10 lg:pt-12">
        {heroProduct ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 opacity-90">
            <ProductLabVisual
              product={heroProduct}
              alt=""
              sizes="100vw"
              priority
            />
          </div>
        ) : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,11,24,1)_0%,rgba(3,11,24,0.97)_37%,rgba(3,11,24,0.66)_65%,rgba(3,11,24,0.24)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_73%_42%,rgba(40,224,193,0.14),transparent_30rem),linear-gradient(180deg,rgba(3,11,24,0.12)_0%,rgba(3,11,24,0.1)_68%,rgba(3,11,24,0.92)_100%)]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

        <div className="relative mx-auto grid max-w-[88rem] gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)] md:items-center lg:min-h-[clamp(35rem,calc(100svh-14rem),47rem)] lg:gap-14">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: 'easeOut' }}
            className="relative z-10 min-w-0 max-w-[52rem]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-100/10 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.19em] text-teal-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:px-4 sm:py-2 sm:text-xs">
              <Sparkles size={15} aria-hidden="true" className="text-[#28e0c1]" />
              {t('heroEyebrow')}
            </div>
            <h1
              className={`mt-5 max-w-full font-semibold leading-[0.91] tracking-[-0.065em] text-white sm:mt-7 ${
                locale === 'es'
                  ? 'text-[clamp(2.75rem,12.4vw,3.45rem)] sm:text-[clamp(3.35rem,7vw,4.4rem)] lg:text-[clamp(4.4rem,5.8vw,6.2rem)]'
                  : 'text-[clamp(2.9rem,13vw,3.7rem)] sm:text-[clamp(3.6rem,7.5vw,4.8rem)] lg:text-[clamp(4.75rem,6.1vw,6.6rem)]'
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

            <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:flex sm:gap-4">
              <CTA
                href="/intake"
                className="min-h-12 w-full bg-[#28e0c1] px-4 text-[#071724] shadow-[0_16px_48px_rgba(40,224,193,0.28)] hover:bg-white sm:min-h-14 sm:w-auto sm:px-7"
              >
                {t('startYourResearch')}
              </CTA>
              <CTA
                href="/catalog"
                tone="ghost"
                className="min-h-12 w-full border-white/20 bg-white/[0.07] px-4 text-white shadow-none backdrop-blur-xl hover:border-white/35 hover:bg-white/[0.13] sm:min-h-14 sm:w-auto sm:px-7"
              >
                {t('browseCatalog')}
              </CTA>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-300 sm:mt-6 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-xl">
                <FlaskConical size={15} aria-hidden="true" className="text-[#28e0c1]" />
                {t('trustResearchUseOnly')}
              </span>
              <span className="inline-flex items-center gap-2">
                <FileText size={15} aria-hidden="true" className="text-[#28e0c1]" />
                {t('trustDocumentation')}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98, x: 20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.6, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.06 }}
            className="relative z-0 min-h-[27rem] md:min-h-[32rem] lg:min-h-[41rem]"
          >
            {/* Immersive transformation loop, embedded into the hero: no card,
                no border — the edges fade into the surrounding dark scene. */}
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={heroVideoPoster}
              aria-hidden="true"
              tabIndex={-1}
              onCanPlay={(event) => {
                void event.currentTarget.play().catch(() => undefined)
              }}
              className="hero-transformation-video absolute inset-0 h-full w-full object-cover object-center"
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          </motion.div>
        </div>

        <div id="trust-strip" className="relative mx-auto mt-7 grid max-w-[88rem] scroll-mt-20 gap-2 rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-2 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:grid-cols-2 lg:mt-9 lg:grid-cols-5">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-[1.1rem] border border-white/[0.06] bg-black/15 px-4 py-3">
              <item.icon size={17} aria-hidden="true" className="shrink-0 text-[#28e0c1]" />
              <span className="text-sm font-semibold text-slate-200">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="best-sellers" className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{t('bestSellersEyebrow')}</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">
                {t('bestSellersTitle')}
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                {t('bestSellersSubtitle')}
              </p>
            </div>
            <CTA href="/catalog" tone="ghost">
              {t('browseCatalog')}
            </CTA>
          </div>

          <div className="mt-10 flex flex-col gap-6 lg:gap-8">
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

      <a
        href={path('/intake')}
        className="fixed bottom-5 left-5 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/55 bg-[#071724] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(7,23,36,0.26)] transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-[#f5f5f2] sm:bottom-6 sm:left-6 lg:hidden"
      >
        {t('startYourResearch')}
        <ArrowRight size={15} aria-hidden="true" />
      </a>
    </main>
  )
}
