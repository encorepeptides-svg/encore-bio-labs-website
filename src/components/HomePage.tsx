import {
  ArrowRight,
  BadgeCheck,
  FileText,
  FlaskConical,
  PackageCheck,
  Snowflake,
  Sparkles,
  Star,
  Timer,
  Truck,
  UserCheck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import heroVideoPoster from '../assets/images/hero/hero-video-poster.jpg'
import heroVideo from '../assets/videos/encore-hero.mp4'
import { products, type Product } from '../data/products'
import { faqLibrary } from '../data/faq'
import { cn } from '../lib/utils'
import { CategoryShowcase } from './home/CategoryShowcase'
import { AddToCartButton } from './cart/AddToCartButton'
import { CTA } from './CTA'
import { FAQAccordion } from './content/EditorialModules'
import { EncoreCompleteKit } from './EncoreCompleteKit'
import { FinalCTA } from './FinalCTA'
import { ResearchProfilePrompt } from './ResearchProfilePrompt'

const productImages = import.meta.glob('../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const trustItems = [
  { icon: FlaskConical, label: 'Research Use Only' },
  { icon: Snowflake, label: 'Cold Chain Shipping' },
  { icon: PackageCheck, label: 'Premium Packaging' },
  { icon: Timer, label: 'Fast Fulfillment' },
  { icon: FileText, label: 'Documentation Available' },
]

const bestSellerSlugs = ['retatrutide', 'ghk-cu', 'nad-plus', 'tesamorelin']

const processSteps = [
  {
    icon: FlaskConical,
    title: 'Manufactured',
    body: 'Research compounds are sourced and organized for laboratory applications.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified',
    body: 'Documentation and product context are prepared for qualified review.',
  },
  {
    icon: PackageCheck,
    title: 'Packaged',
    body: 'Materials are presented with premium packaging and handling awareness.',
  },
  {
    icon: Truck,
    title: 'Delivered',
    body: 'Fulfillment is coordinated for speed, clarity, and receiving workflows.',
  },
]

const whyChooseCards = [
  {
    icon: FlaskConical,
    title: 'Curated Research Catalog',
    body: 'Carefully organized collections that make product discovery easier.',
  },
  {
    icon: FileText,
    title: 'Documentation Available',
    body: 'Identity and purity documentation is available for eligible research products.',
  },
  {
    icon: PackageCheck,
    title: 'Complete Research Kits',
    body: 'Select products include appropriately measured supporting materials for research planning.',
  },
  {
    icon: UserCheck,
    title: 'Responsive Human Support',
    body: 'Our team replies directly to questions before or after your inquiry.',
  },
]

const previewFaqs = faqLibrary.flatMap((group) => group.items).slice(0, 5)

function getProductImage(product: Product) {
  return productImages[`../assets/images/products/${product.image}`]
}

function getResearchOptionPrice(product: Product) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)
  const startingPrice = prices.length ? Math.min(...prices) : undefined
  return startingPrice ? `Research options from $${startingPrice.toLocaleString()}` : 'Availability by request'
}

function getProductLine(product: Product) {
  return product.shortDescription || product.description
}

function FeaturedBestSellerCard({ product }: { product: Product }) {
  const imageSrc = getProductImage(product)

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_24px_80px_rgba(7,23,36,0.08)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_34px_110px_rgba(20,184,166,0.16)]">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="order-2 flex flex-col justify-center gap-5 p-6 sm:p-8 lg:order-1 lg:p-10 xl:p-12">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-700/20 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            <Star size={13} aria-hidden="true" />
            Featured Bestseller
          </span>
          <h3 className="text-[clamp(1.85rem,1.1rem+3vw,3rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#071724]">
            {product.name}
          </h3>
          <p className="max-w-lg text-base leading-7 text-slate-600">{getProductLine(product)}</p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Available strengths and pricing
            </p>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${product.name} available strengths`}>
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
            {getResearchOptionPrice(product)}
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <AddToCartButton product={product} className="min-h-12 px-6">
              Add {product.variants[0]?.label ?? 'Option'} to Cart
            </AddToCartButton>
            <a
              href={`/products/${product.slug}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 py-3 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
            >
              View Research Details
            </a>
          </div>
          <a
            href="/intake"
            className="w-fit text-xs font-semibold text-slate-500 transition hover:text-teal-700"
          >
            Get personalized guidance
          </a>
        </div>

        <a
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="relative order-1 block overflow-hidden bg-[#dfe8e7] lg:order-2"
        >
          <div className="relative flex aspect-[4/3] w-full items-center justify-center p-6 sm:aspect-[16/10] sm:p-10 lg:aspect-auto lg:h-full lg:min-h-[clamp(16rem,10rem+18vw,24rem)] lg:p-10">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`${product.name} research compound packaging`}
                loading="eager"
                decoding="async"
                className="h-full w-full object-contain drop-shadow-[0_28px_48px_rgba(7,23,36,0.18)] transition duration-500 motion-safe:group-hover:scale-[1.03]"
              />
            ) : null}
          </div>
        </a>
      </div>
    </article>
  )
}

function SecondaryBestSellerCard({ product, className }: { product: Product; className?: string }) {
  const imageSrc = getProductImage(product)

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_54px_rgba(7,23,36,0.07)] transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[0_28px_84px_rgba(20,184,166,0.14)]',
        className,
      )}
    >
      <a
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[#dfe8e7]"
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${product.name} research compound packaging`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain object-center opacity-95 transition duration-500 motion-safe:group-hover:scale-[1.035]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0)_0_42%,rgba(255,255,255,0.32)_76%,rgba(255,255,255,0.92)_100%)]" />
        <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/78 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#071724] backdrop-blur-xl">
          {product.category}
        </div>
      </a>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          {getResearchOptionPrice(product)}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-[#071724]">{product.name}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{getProductLine(product)}</p>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <AddToCartButton product={product} className="min-h-11 px-4 py-2.5">
            Add to Cart
          </AddToCartButton>
          <a
            href={`/products/${product.slug}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
          >
            View Research Details
          </a>
        </div>
      </div>
    </article>
  )
}

function CompactWhyChooseEncore() {
  return (
    <section id="why-encore" className="px-5 py-14 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Why Encore</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-4xl">
            Research Support Built Around Clarity
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
  const bestSellerProducts = bestSellerSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
  const heroProduct = bestSellerProducts.find((product) => product.slug === 'retatrutide')
  const supportingProducts = bestSellerProducts.filter((product) => product.slug !== 'retatrutide')

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

        <div className="relative mx-auto grid max-w-[88rem] gap-12 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.65, ease: 'easeOut' }}
            className="relative z-10 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/15 bg-white/68 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_34px_rgba(7,23,36,0.05)] backdrop-blur-2xl">
              <Sparkles size={16} aria-hidden="true" className="text-teal-700" />
              Premium research wellness support
            </div>
            <h1 className="mt-8 max-w-[46rem] text-[clamp(2.75rem,10vw,4.4rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#071724] lg:text-[clamp(4rem,5vw,5.4rem)]">
              Premium research compounds, handled with calm precision.
            </h1>
            <p className="mt-7 max-w-[35rem] text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
              Answer a few questions and we'll recommend the most appropriate research products
              for your goals.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
              <CTA href="/intake" className="min-h-14 w-full px-7 sm:w-auto">
                Start Your Research
              </CTA>
              <CTA href="/catalog" tone="ghost" className="min-h-14 w-full border-slate-900/15 bg-white/42 px-7 sm:w-auto">
                Browse Catalog
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
                  PRECISION MEETS PROGRESS
                </p>
                <p className="mt-2 max-w-sm text-sm font-semibold leading-5 tracking-normal sm:text-base sm:leading-6">
                  Advanced research compounds for metabolic wellness exploration.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <a
          href="#trust-strip"
          aria-label="Scroll to learn more"
          className="home-scroll-cue absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-500 transition hover:text-[#071724] lg:flex"
        >
          <span>Explore</span>
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Best Sellers</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">
                Frequently requested research compounds.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Start with the products researchers turn to most, spanning several of our
                frequently requested categories.
              </p>
            </div>
            <CTA href="/catalog" tone="ghost">
              Browse Catalog
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

      <section id="how-it-works" className="bg-[#071724] px-5 py-16 text-white sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">Research Process</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">
              From manufacturing to delivery.
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

      <FAQAccordion
        eyebrow="FAQ Preview"
        title="Five answers before you browse deeper."
        items={previewFaqs}
        cta={{ label: 'View All FAQs', href: '/faq' }}
      />

      <FinalCTA />

      <a
        href="/intake"
        className="fixed bottom-5 left-5 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/55 bg-[#071724] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(7,23,36,0.26)] transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-[#f5f5f2] sm:bottom-6 sm:left-6 lg:hidden"
      >
        Start Your Research
        <ArrowRight size={15} aria-hidden="true" />
      </a>
    </main>
  )
}
