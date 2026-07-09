import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileText,
  FlaskConical,
  PackageCheck,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Timer,
  Truck,
  UserCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'
import heroVideoPoster from '../assets/images/hero/hero-video-poster.jpg'
import heroVideo from '../assets/videos/encore-hero.mp4'
import labImage from '../assets/images/hero/encore-kit-hero.png'
import { products, researchAreas, type Product } from '../data/products'
import { faqLibrary } from '../data/faq'
import { CTA } from './CTA'
import { FAQAccordion } from './content/EditorialModules'
import { FinalCTA } from './FinalCTA'
import { WhyEncore } from './WhyEncore'

const categoryImages = import.meta.glob('../assets/images/products/category-*.{png,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

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

const bestSellerSlugs = ['retatrutide', 'tesamorelin', 'mots-c', 'kisspeptin']

const categorySummaries: Record<string, string> = {
  'metabolic-weight-management': 'Metabolic signaling and body-composition research pathways.',
  'recovery-regeneration': 'Repair signaling, matrix biology, and recovery-focused research.',
  'longevity-cellular-health': 'Cellular resilience, redox balance, and mitochondrial biology.',
  'cognitive-performance': 'Neuropeptide and performance-adjacent research context.',
  'hormone-wellness': 'Endocrine and reproductive-axis signaling research.',
}

const qualityCards = [
  {
    icon: FileText,
    title: 'Third-Party Documentation',
    body: 'Documentation can be requested for identity, purity, and lot-level review.',
  },
  {
    icon: ShieldCheck,
    title: 'Premium Manufacturing',
    body: 'Products are organized around consistent sourcing and quality expectations.',
  },
  {
    icon: Snowflake,
    title: 'Cold Chain Handling',
    body: 'Temperature-aware fulfillment supports sensitive research materials in transit.',
  },
  {
    icon: ClipboardCheck,
    title: 'Complete Research Kits',
    body: 'Kit-aware presentation helps teams coordinate handling and receiving workflows.',
  },
  {
    icon: Truck,
    title: 'Fast Fulfillment',
    body: 'Clear logistics support local delivery, U.S. shipping, and Mexico coordination.',
  },
  {
    icon: UserCheck,
    title: 'Responsive Support',
    body: 'A person reviews requests, documentation needs, and procurement questions.',
  },
]

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

const previewFaqs = faqLibrary.flatMap((group) => group.items).slice(0, 5)

function getProductImage(product: Product) {
  return productImages[`../assets/images/products/${product.image}`]
}

function getStartingPrice(product: Product) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)
  const startingPrice = prices.length ? Math.min(...prices) : undefined
  return startingPrice ? `$${startingPrice.toLocaleString()}` : 'Quote'
}

function getProductLine(product: Product) {
  return product.shortDescription || product.description
}

function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const imageSrc = getProductImage(product)

  return (
    <article
      className={`group overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_24px_80px_rgba(7,23,36,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_110px_rgba(20,184,166,0.16)] ${
        featured ? 'lg:col-span-2 lg:grid lg:grid-cols-[1.05fr_0.95fr]' : ''
      }`}
    >
      <a href={`/products/${product.slug}`} className="block">
        <div className={`relative overflow-hidden bg-[#dfe8e7] ${featured ? 'min-h-[24rem] lg:h-full' : 'h-56'}`}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              loading={featured ? 'eager' : 'lazy'}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover opacity-95 transition duration-500 group-hover:scale-[1.035]"
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0)_0_42%,rgba(255,255,255,0.32)_76%,rgba(255,255,255,0.92)_100%)]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/78 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#071724] backdrop-blur-xl">
            {featured ? 'Main best seller' : product.category}
          </div>
        </div>
      </a>

      <div className="flex min-h-full flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          Starting at {getStartingPrice(product)}
        </p>
        <h3 className={`${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'} mt-3 font-semibold tracking-[-0.045em] text-[#071724]`}>
          {product.name}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{getProductLine(product)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {product.variants.map((variant) => (
            <span
              key={`${variant.label}-${variant.format}`}
              className="rounded-full border border-slate-900/10 bg-[#f5f5f2] px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              {variant.label}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
          <a
            href={`/products/${product.slug}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#071724] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            View Product
            <ArrowRight size={15} aria-hidden="true" />
          </a>
          <a
            href="/intake"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
          >
            Order Now
          </a>
        </div>
      </div>
    </article>
  )
}

export function AlternateHomePage() {
  const bestSellerProducts = bestSellerSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
  const heroProduct = bestSellerProducts.find((product) => product.slug === 'retatrutide')
  const supportingProducts = bestSellerProducts.filter((product) => product.slug !== 'retatrutide')

  return (
    <main id="main-content" className="bg-[#f5f5f2]">
      <section className="relative overflow-hidden px-5 pb-12 pt-8 sm:px-8 lg:py-14">
        <div className="molecule-field opacity-[0.18]" aria-hidden="true" />
        <div className="pointer-events-none absolute left-[-10rem] top-[-10rem] size-[32rem] rounded-full bg-white/82 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] size-[34rem] rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-[88rem] gap-9 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative z-10"
          >
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/62 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-2xl transition hover:bg-white"
            >
              View Original Homepage
            </a>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/62 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-2xl">
              <Sparkles size={16} aria-hidden="true" className="text-teal-700" />
              Encore Bio Labs Home V2
            </div>
            <h1 className="mt-7 max-w-4xl text-[3rem] font-semibold leading-[0.95] tracking-[-0.055em] text-[#071724] sm:text-6xl lg:text-6xl xl:text-7xl">
              Advanced Research Compounds. Premium Quality. Exceptional Support.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
              Designed for laboratories and qualified research applications.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTA href="#best-sellers" className="w-full sm:w-auto">
                Shop Best Sellers
              </CTA>
              <CTA href="/catalog" tone="ghost" className="w-full sm:w-auto">
                Browse Catalog
              </CTA>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.12 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-[#071724] p-3 shadow-[0_34px_110px_rgba(7,23,36,0.24)] sm:p-4">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={heroVideoPoster}
                aria-hidden="true"
                className="aspect-[4/5] w-full rounded-[1.45rem] object-cover sm:aspect-[16/13] lg:aspect-[5/6] xl:aspect-[16/13]"
                onCanPlay={(event) => {
                  void event.currentTarget.play().catch(() => undefined)
                }}
              >
                <source src={heroVideo} type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-3 rounded-[1.45rem] bg-[linear-gradient(180deg,rgba(7,23,36,0.03),rgba(7,23,36,0.64))] sm:inset-4" />
              <div className="absolute bottom-7 left-7 right-7 rounded-[1.25rem] border border-white/15 bg-white/12 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">Motion catalog preview</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em]">Floating vial animation with premium laboratory context.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-12 sm:px-8">
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
                Single product cards with variants grouped together, pricing surfaced early, and a direct path to request support.
              </p>
            </div>
            <CTA href="/catalog" tone="ghost">
              Browse Catalog
            </CTA>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {heroProduct ? <ProductCard product={heroProduct} featured /> : null}
            <div className="grid gap-5">
              {supportingProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Product Categories</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">
              Shop by research category.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {researchAreas.map((area) => {
              const imageSrc = categoryImages[`../assets/images/products/${area.image}`]

              return (
                <a
                  key={area.slug}
                  href={`/categories/${area.slug}`}
                  className="group overflow-hidden rounded-[1.35rem] border border-slate-900/10 bg-white shadow-[0_20px_58px_rgba(7,23,36,0.07)] transition duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-40 overflow-hidden bg-[#e2eceb]">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover opacity-95 transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.84))]" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#071724]">{area.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {categorySummaries[area.slug] ?? 'Focused research compounds organized by pathway.'}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      <WhyEncore />

      <section id="quality" className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Quality & Documentation</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">
              Quality signals made easy to review.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              All overlapping quality, testing, documentation, support, and fulfillment proof points are consolidated here for faster evaluation.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {qualityCards.map((card) => (
              <article key={card.title} className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
                  <card.icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[#071724]">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:py-14">
        <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(7,23,36,0.08)]">
          <img
            src={labImage}
            alt="Encore Bio Labs pharmaceutical packaging and documentation"
            loading="lazy"
            decoding="async"
            className="h-[26rem] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96),rgba(255,255,255,0.72)_42%,rgba(255,255,255,0.12))]" />
          <div className="absolute inset-0 flex items-center px-6 sm:px-10">
            <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#071724] sm:text-5xl">
              The pursuit of quality begins long before your order ships.
            </h2>
          </div>
        </div>
      </section>

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
    </main>
  )
}
