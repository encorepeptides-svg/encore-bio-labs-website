import {
  ArrowRight,
  BadgeCheck,
  FileText,
  FlaskConical,
  PackageCheck,
  Sparkles,
  Star,
  Truck,
  UserCheck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import heroVideoPoster from '../assets/images/hero/hero-video-poster.jpg'
import heroVideo from '../assets/videos/encore-hero.mp4'
import { products, type Product } from '../data/products'
import { faqLibrary } from '../data/faq'
import { getLocalizedFaqGroup } from '../data/faqTranslations'
import { getLocalizedProduct, localizedCategoryLabel } from '../data/productTranslations'
import { cn } from '../lib/utils'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { CategoryShowcase } from './home/CategoryShowcase'
import { TestimonialsSection } from './social-proof/TestimonialsSection'
import { TransformationSection } from './social-proof/TransformationSection'
import { AddToCartButton } from './cart/AddToCartButton'
import { CTA } from './CTA'
import { FAQAccordion } from './content/EditorialModules'
import { EncoreCompleteKit } from './EncoreCompleteKit'
import { FinalCTA } from './FinalCTA'
import { ResearchProfilePrompt } from './ResearchProfilePrompt'
import { ProductImage } from './ProductImage'

const bestSellerSlugs = ['retatrutide', 'ghk-cu', 'nad-plus', 'tesamorelin']

const trustIcons = [FlaskConical, Truck, Sparkles, PackageCheck, FileText]
const processIcons = [FlaskConical, BadgeCheck, PackageCheck, Truck]
const whyChooseIcons = [FlaskConical, FileText, PackageCheck, UserCheck]

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
  const product = getLocalizedProduct(baseProduct, locale)

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_24px_80px_rgba(7,23,36,0.08)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_34px_110px_rgba(20,184,166,0.16)]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="order-2 flex flex-col justify-center gap-5 p-6 sm:p-8 lg:order-1 lg:p-10 xl:p-12">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-700/20 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            <Star size={13} aria-hidden="true" />
            {t('featuredBestseller')}
          </span>
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
            <ProductImage
              product={product}
              alt={t('productImageAlt', { product: product.name })}
              sizes="(min-width: 1024px) 45vw, 100vw"
              loading="eager"
              className="h-full w-full object-contain drop-shadow-[0_28px_48px_rgba(7,23,36,0.18)] transition duration-500 motion-safe:group-hover:scale-[1.03]"
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
  const product = getLocalizedProduct(baseProduct, locale)

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
        <ProductImage
          product={product}
          alt={t('productImageAlt', { product: product.name })}
          sizes="(min-width: 1024px) 30vw, 100vw"
          className="absolute inset-0 h-full w-full object-contain object-center opacity-95 transition duration-500 motion-safe:group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0)_0_42%,rgba(255,255,255,0.32)_76%,rgba(255,255,255,0.92)_100%)]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/78 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#071724] backdrop-blur-xl">
          {localizedCategoryLabel(baseProduct.category, locale)}
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          {getResearchOptionPrice(product, t)}
        </p>
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

function CompactWhyChooseEncore() {
  const { t } = useTranslation('homepage')
  const whyChooseCards = [
    { icon: whyChooseIcons[0], title: t('whyCard1Title'), body: t('whyCard1Body') },
    { icon: whyChooseIcons[1], title: t('whyCard2Title'), body: t('whyCard2Body') },
    { icon: whyChooseIcons[2], title: t('whyCard3Title'), body: t('whyCard3Body') },
    { icon: whyChooseIcons[3], title: t('whyCard4Title'), body: t('whyCard4Body') },
  ]

  return (
    <section id="why-encore" className="px-5 py-14 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('whyEncoreEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
            {t('whyEncoreTitle')}
          </h2>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseCards.map((card) => (
            <div
              key={card.title}
              className="group flex h-full flex-col items-start gap-3 rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-[0_16px_44px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(20,184,166,0.12)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                <card.icon size={17} aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold tracking-[-0.02em] text-[#071724]">{card.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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
  const processSteps = [
    { icon: processIcons[0], title: t('step1Title'), body: t('step1Body') },
    { icon: processIcons[1], title: t('step2Title'), body: t('step2Body') },
    { icon: processIcons[2], title: t('step3Title'), body: t('step3Body') },
    { icon: processIcons[3], title: t('step4Title'), body: t('step4Body') },
  ]
  const bestSellerProducts = bestSellerSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
  const heroProduct = bestSellerProducts.find((product) => product.slug === 'retatrutide')
  const supportingProducts = bestSellerProducts.filter((product) => product.slug !== 'retatrutide')
  const previewFaqs = faqLibrary.flatMap((group) => getLocalizedFaqGroup(group, locale).items).slice(0, 5)

  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_78%_30%,rgba(46,196,165,0.18),transparent_30rem),radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.9),transparent_28rem),linear-gradient(135deg,#f8faf7_0%,#eef5f2_48%,#f5f5f2_100%)] px-5 pb-16 pt-10 sm:px-8 lg:pb-20 lg:pt-16">
        <div className="molecule-field opacity-[0.12]" aria-hidden="true" />
        <div className="pointer-events-none absolute left-[-12rem] top-[-14rem] size-[34rem] rounded-full bg-white/90 blur-3xl" />
        <div className="pointer-events-none absolute right-[3%] top-[18%] size-[30rem] rounded-full bg-teal-200/28 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-14rem] left-[34%] size-[36rem] rounded-full bg-cyan-100/38 blur-3xl" />
        <span className="hero-particle left-[9%] top-[34%]" aria-hidden="true" />
        <span className="hero-particle hero-particle-delay right-[48%] top-[18%]" aria-hidden="true" />
        <span className="hero-particle hero-particle-slow right-[10%] bottom-[24%]" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-[88rem] gap-12 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.65, ease: 'easeOut' }}
            className="relative z-10 min-w-0 max-w-[48rem]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/15 bg-white/68 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_34px_rgba(7,23,36,0.05)] backdrop-blur-2xl">
              <Sparkles size={16} aria-hidden="true" className="text-teal-700" />
              {t('heroEyebrow')}
            </div>
            <h1
              className={`mt-8 max-w-full font-semibold leading-[1.02] tracking-[-0.045em] text-[#071724] ${
                locale === 'es'
                  ? 'text-[clamp(2.25rem,9.2vw,2.625rem)] sm:text-[clamp(2.75rem,6vw,3.125rem)] lg:text-[clamp(3.25rem,4.1vw,4.125rem)]'
                  : 'text-[clamp(2.375rem,10vw,2.875rem)] sm:text-[clamp(2.875rem,6.5vw,3.375rem)] lg:text-[clamp(3.5rem,4.5vw,4.5rem)]'
              }`}
            >
              {heroTitleLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-[35rem] text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
              {t('heroSubtitle')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
              <CTA href="/intake" className="min-h-14 w-full px-7 sm:w-auto">
                {t('startYourResearch')}
              </CTA>
              <CTA href="/catalog" tone="ghost" className="min-h-14 w-full border-slate-900/15 bg-white/42 px-7 sm:w-auto">
                {t('browseCatalog')}
              </CTA>
            </div>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97, y: 20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.75, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.12 }}
            className="relative"
          >
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
              transition={prefersReducedMotion ? undefined : { duration: 7.5, ease: 'easeInOut', repeat: Infinity }}
              className="home-hero-video-shell relative overflow-hidden rounded-[2rem] border border-white/55 bg-white/18 p-3 shadow-[0_34px_110px_rgba(7,23,36,0.16)] backdrop-blur-2xl sm:p-4"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(118,228,211,0.18),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.12),transparent_42%)]" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[1.35rem] border border-white/15 bg-[#0d2231]">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={heroVideoPoster}
                  aria-hidden="true"
                  className="aspect-square h-full w-full rounded-[inherit] object-cover"
                  onCanPlay={(event) => {
                    void event.currentTarget.play().catch(() => undefined)
                  }}
                >
                  <source src={heroVideo} type="video/mp4" />
                </video>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(115deg,rgba(255,255,255,0.36)_0%,transparent_28%,transparent_62%,rgba(255,255,255,0.18)_100%)]" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(7,23,36,0)_45%,rgba(7,23,36,0.42)_100%)]" aria-hidden="true" />
              <div className="pointer-events-none absolute left-8 top-8 h-px w-1/2 bg-white/58 shadow-[0_0_28px_rgba(255,255,255,0.45)]" aria-hidden="true" />
              <div className="absolute bottom-4 left-4 right-4 rounded-[1.25rem] border border-white/18 bg-white/14 p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_44px_rgba(7,23,36,0.14)] backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-5">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-teal-100 sm:text-xs">
                  {t('precisionMeetsProgress').toUpperCase()}
                </p>
                <p className="mt-2 max-w-sm text-sm font-semibold leading-5 tracking-normal sm:text-base sm:leading-6">
                  {t('heroVideoCaption')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <a
          href="#trust-strip"
          aria-label={t('scrollToLearnMore')}
          className="home-scroll-cue absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-500 transition hover:text-[#071724] lg:flex"
        >
          <span>{t('explore')}</span>
          <span className="relative h-10 w-6 rounded-full border border-slate-900/18 bg-white/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-xl">
            <span className="absolute left-1/2 top-2 size-1.5 -translate-x-1/2 rounded-full bg-teal-700" />
          </span>
        </a>
      </section>

      <section id="trust-strip" className="scroll-mt-20 px-5 pb-12 sm:px-8">
        <div className="mx-auto grid max-w-[88rem] gap-3 rounded-[1.5rem] border border-white/70 bg-white/72 p-3 shadow-[0_18px_54px_rgba(7,23,36,0.06)] backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-5">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-[1.1rem] bg-[#f5f5f2]/80 px-4 py-3">
              <item.icon size={17} aria-hidden="true" className="shrink-0 text-teal-700" />
              <span className="text-sm font-semibold text-slate-700">{item.label}</span>
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

      <CategoryShowcase />

      <section className="px-5 pb-4 sm:px-8">
        <div className="mx-auto max-w-[88rem]">
          <EncoreCompleteKit variant="inline" />
        </div>
      </section>

      <ResearchProfilePrompt />

      <CompactWhyChooseEncore />

      <section id="how-it-works" className="scroll-mt-28 bg-[#071724] px-5 py-16 text-white sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">{t('processEyebrow')}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              {t('processTitle')}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step, index) => (
              <article key={step.title} className="rounded-[1.35rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-300/14 text-teal-100">
                    <step.icon size={19} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.035em]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof. Each renders nothing until approved, publishable records
          exist, so the page flows straight from "how it works" to the FAQ with
          no reserved space while the collections are empty. */}
      <TestimonialsSection />
      <TransformationSection placement="home" />

      <FAQAccordion
        eyebrow={t('faqPreviewEyebrow')}
        title={t('faqPreviewTitle')}
        items={previewFaqs}
        cta={{ label: t('viewAllFaqs'), href: '/faq' }}
      />

      <FinalCTA />

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
