import {
  Activity,
  ArrowRight,
  Atom,
  Beaker,
  Boxes,
  Brain,
  ClipboardCheck,
  Dna,
  FileSearch,
  FileText,
  FlaskConical,
  HeartPulse,
  Lock,
  MapPin,
  Microscope,
  Network,
  PackageCheck,
  ShieldCheck,
  Snowflake,
  Sparkles,
  TestTube2,
  Truck,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { products, type Product } from '../../data/products'
import { contentTypeLabels, researchArticles } from '../../data/research'
import { buildSrcSet, stemOf } from '../../lib/responsiveImages'
import { buildOrderInquiryMessage, buildWhatsAppUrl } from '../../lib/whatsapp'
import { VariantAddToCartPanel } from '../cart/AddToCartButton'
import { CTA } from '../CTA'
import {
  FAQAccordion,
  InternalLinkGrid,
  MechanismOfActionSection,
  ProductDiscoveryCTA,
  RelatedArticlesSection,
  RelatedProductsSection,
  ResearchOverviewSection,
  ResearchUseOnlyBanner,
  TrustAndHandlingSection,
} from '../content/EditorialModules'

const productImages = import.meta.glob('../../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const PRODUCT_IMAGE_BASE_PATH = '../../assets/images/products/'
const PRODUCT_IMAGE_WIDTHS = [720, 1000, 1254, 1400]

function getProductImageSources(imageName: string) {
  const imageStem = stemOf(imageName)
  return {
    avifSrcSet: buildSrcSet(productImages, PRODUCT_IMAGE_BASE_PATH, imageStem, 'avif', PRODUCT_IMAGE_WIDTHS),
    webpSrcSet: buildSrcSet(productImages, PRODUCT_IMAGE_BASE_PATH, imageStem, 'webp', PRODUCT_IMAGE_WIDTHS),
  }
}

function getProductImage(product: Product) {
  return productImages[`../../assets/images/products/${product.heroImage}`]
}

function SectionShell({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[88rem]">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#071724] sm:text-4xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  )
}

export function RetatrutideHeroSection({ product }: { product: Product }) {
  const imageSrc = getProductImage({ ...product, heroImage: product.image })
  const { avifSrcSet, webpSrcSet } = getProductImageSources(product.image)
  const bullets = [
    'GLP-1 + GIP + Glucagon receptor triple agonist',
    'COA available for identity and purity review by request',
    'Same-day dispatch · Cold-chain handling',
  ]
  const trustStats = [
    { value: 'RUO', label: 'Research use' },
    { value: '3', label: 'Receptor targets' },
    { value: '24hr', label: 'Inquiry routing' },
  ]
  const receptorTargets = ['GLP-1', 'GIP', 'GCG']

  return (
    <section className="relative overflow-hidden bg-[var(--bg)] px-5 pb-14 pt-12 sm:px-8 lg:pb-20 lg:pt-16">
      <div className="molecule-field opacity-[0.12]" />
      <div className="pointer-events-none absolute right-0 top-12 size-80 rounded-full bg-[var(--teal)]/12 blur-3xl" />
      <div className="pointer-events-none absolute left-[8%] top-36 size-72 rounded-full bg-white blur-3xl" />

      <div className="relative mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <a
            href="/catalog"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--muted)] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-[var(--navy)]"
          >
            Back to catalog
          </a>
          <p className="inline-flex rounded-full border border-[var(--teal-border)] bg-[var(--teal-light)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
            Triple GLP-1 agonist · Research use only
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-[-0.065em] text-[var(--navy)] sm:text-6xl lg:text-7xl">
            A triple-receptor peptide at the{' '}
            <span className="text-[var(--teal)]">center of GLP-1 research.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Encore Bio Labs supplies research-use-only Retatrutide, studied as a triple agonist
            targeting GLP-1, GIP, and glucagon receptors simultaneously. Identity and purity
            documentation is available for qualified research review.
          </p>

          <div className="mt-7 grid gap-3">
            {bullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[var(--navy)] sm:text-base">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--teal)] text-[0.7rem] text-white">
                  ✓
                </span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTA href="#product-specs" tone="ghost" className="border-[var(--border)] bg-white text-[var(--navy)] hover:bg-[var(--teal-light)]">
              View Research Details
            </CTA>
          </div>
          <div className="mt-6 max-w-xl">
            <VariantAddToCartPanel product={product} />
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-3 overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-white shadow-[0_20px_60px_rgba(26,35,64,0.08)]">
            {trustStats.map((stat) => (
              <div key={stat.label} className="border-r border-[var(--border)] p-4 last:border-r-0 sm:p-5">
                <p className="text-2xl font-semibold tracking-[-0.045em] text-[var(--navy)] sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-[var(--muted)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="group relative mx-auto w-full max-w-2xl transition duration-500 hover:-translate-y-1"
        >
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2.25rem] border border-white bg-white p-4 shadow-[0_32px_110px_rgba(26,35,64,0.14)] sm:min-h-[40rem] sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(46,196,165,0.2),transparent_35%),linear-gradient(145deg,#ffffff,#eef7f6_48%,#f8f9fb)]" />
            <div className="absolute inset-5 rounded-[1.7rem] border border-[var(--border)] bg-white/42" />

            <div className="absolute left-6 top-6 z-10 rounded-full border border-[var(--teal-border)] bg-white/90 px-4 py-2 text-xs font-semibold text-[var(--navy)] shadow-[0_12px_36px_rgba(26,35,64,0.1)] backdrop-blur-xl">
              Documentation ready
            </div>
            <div className="absolute right-6 top-6 z-10 rounded-full border border-[var(--teal-border)] bg-[var(--teal)] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_36px_rgba(46,196,165,0.24)]">
              RUO
            </div>

            <div className="relative min-h-[31rem] overflow-hidden rounded-[1.7rem] sm:min-h-[37rem]">
              {imageSrc ? (
                <picture>
                  {avifSrcSet ? (
                    <source type="image/avif" srcSet={avifSrcSet} sizes="(min-width: 1024px) 45vw, 100vw" />
                  ) : null}
                  {webpSrcSet ? (
                    <source type="image/webp" srcSet={webpSrcSet} sizes="(min-width: 1024px) 45vw, 100vw" />
                  ) : null}
                  <img
                    src={imageSrc}
                    alt={`${product.name} research compound packaging`}
                    width="720"
                    height="720"
                    className="absolute inset-0 h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.025]"
                  />
                </picture>
              ) : (
                <div className="flex min-h-[31rem] w-full items-center justify-center rounded-[2rem] border border-dashed border-[var(--teal-border)] bg-white/60 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)] sm:min-h-[37rem]">
                  Product visual
                </div>
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0)_0_44%,rgba(255,255,255,0.24)_78%,rgba(255,255,255,0.72)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/90 to-transparent" />
            </div>

            <div className="absolute bottom-5 left-5 w-[min(15rem,calc(100%-2.5rem))] rounded-[1.4rem] border border-[var(--border)] bg-white/88 p-4 shadow-[0_20px_58px_rgba(26,35,64,0.14)] backdrop-blur-xl sm:bottom-7 sm:left-7">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Receptor targets
              </p>
              <div className="mt-3 grid gap-2.5">
                {receptorTargets.map((target, index) => (
                  <div key={target} className="grid grid-cols-[3.4rem_1fr] items-center gap-3">
                    <p className="text-sm font-semibold text-[var(--navy)]">{target}</p>
                    <span className="h-2 overflow-hidden rounded-full bg-[var(--teal-light)]">
                      <span
                        className="block h-full rounded-full bg-[var(--teal)]"
                        style={{ width: `${92 - index * 8}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-5 right-5 rounded-[1.4rem] border border-[var(--border)] bg-white/90 p-4 text-right shadow-[0_20px_58px_rgba(26,35,64,0.14)] backdrop-blur-xl sm:bottom-7 sm:right-7">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Mechanism
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--navy)]">
                Triple agonist
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--teal)]">
                GLP-1 · GIP · Glucagon
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function RetatrutideClinicalResearchSection({ product }: { product: Product }) {
  const imageSrc = getProductImage({ ...product, heroImage: product.image })
  const { avifSrcSet, webpSrcSet } = getProductImageSources(product.image)

  return (
    <section
      id="phase-2-data"
      className="relative overflow-hidden bg-[var(--bg)] px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="molecule-field opacity-[0.08]" />
      <div className="pointer-events-none absolute left-[6%] top-16 size-72 rounded-full bg-[var(--teal)]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 right-[8%] size-80 rounded-full bg-cyan-200/24 blur-3xl" />
      <span className="hero-particle left-[12%] top-[22%]" />
      <span className="hero-particle hero-particle-delay right-[16%] top-[18%]" />
      <span className="hero-particle hero-particle-slow bottom-[20%] left-[44%]" />

      <div className="relative mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 lg:order-1"
        >
          <div className="group relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/62 p-3 shadow-[0_34px_120px_rgba(26,35,64,0.12)] backdrop-blur-2xl sm:p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(46,196,165,0.18),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.95),rgba(238,247,246,0.78))]" />
            <div className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-white/38 blur-xl transition duration-1000 group-hover:translate-x-[330%]" />

            <div className="relative min-h-[24rem] overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white sm:min-h-[35rem] lg:min-h-[42rem]">
              {imageSrc ? (
                <picture>
                  {avifSrcSet ? (
                    <source type="image/avif" srcSet={avifSrcSet} sizes="(min-width: 1024px) 50vw, 100vw" />
                  ) : null}
                  {webpSrcSet ? (
                    <source type="image/webp" srcSet={webpSrcSet} sizes="(min-width: 1024px) 50vw, 100vw" />
                  ) : null}
                  <img
                    src={imageSrc}
                    alt={`${product.name} research compound packaging`}
                    width="900"
                    height="720"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-contain object-center transition duration-700 group-hover:scale-[1.025]"
                  />
                </picture>
              ) : (
                <div className="flex min-h-[24rem] items-center justify-center text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)] sm:min-h-[35rem] lg:min-h-[42rem]">
                  Retatrutide visual
                </div>
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0)_0_46%,rgba(255,255,255,0.2)_78%,rgba(255,255,255,0.72)_100%)]" />
              <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/84 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--navy)] shadow-[0_14px_42px_rgba(26,35,64,0.12)] backdrop-blur-xl">
                Phase 2 Research
              </div>
              <div className="absolute bottom-5 left-5 rounded-full border border-[var(--teal-border)] bg-white/84 px-4 py-2 text-xs font-semibold text-[var(--teal)] shadow-[0_14px_42px_rgba(26,35,64,0.1)] backdrop-blur-xl">
                Research Use Only
              </div>
            </div>
          </div>

          <div className="mt-6 lg:hidden">
            <div className="inline-flex max-w-full rounded-full border border-[var(--teal-border)] bg-[var(--teal-light)] px-4 py-2 text-sm font-semibold text-[var(--teal)] shadow-[0_14px_42px_rgba(46,196,165,0.12)]">
              Triple Agonist: GLP-1 • GIP • Glucagon
            </div>
            <div className="mt-5">
              <CTA href="#product-specs" className="w-full bg-[var(--navy)] hover:bg-[var(--navy-deep)] sm:w-auto">
                View Retatrutide
              </CTA>
            </div>
            <p className="mt-5 max-w-xl text-xs leading-6 text-[var(--muted)]">
              Research use only. Not intended for human or animal consumption. Published study
              context is provided for education and is not an individual outcome claim.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="order-1 lg:order-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">
            Published study context
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[var(--navy)] sm:text-5xl lg:text-6xl">
            Retatrutide's published Phase 2 research, in context.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
            Retatrutide is discussed here as a published Phase 2 research compound. Study
            endpoints are presented for population-level context only, not as guidance, treatment
            use, or a projection of individual results.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="mt-8 max-w-xl rounded-[1.8rem] border border-[var(--teal-border)] bg-white/78 p-6 shadow-[0_28px_90px_rgba(46,196,165,0.14)] backdrop-blur-xl sm:p-8"
          >
            <p className="text-[5rem] font-semibold leading-none tracking-[-0.08em] text-[var(--navy)] sm:text-[7rem]">
              P2
              <span className="text-[var(--teal)]">.</span>
            </p>
            <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[var(--navy)]">
              Published Phase 2 endpoint
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              One published research signal, summarized for catalog education only.
            </p>
          </motion.div>

          <div className="mt-5 hidden max-w-full rounded-full border border-[var(--teal-border)] bg-[var(--teal-light)] px-4 py-2 text-sm font-semibold text-[var(--teal)] shadow-[0_14px_42px_rgba(46,196,165,0.12)] lg:inline-flex">
            Triple Agonist: GLP-1 • GIP • Glucagon
          </div>

          <div className="mt-8 hidden lg:block">
            <CTA href="#product-specs" className="bg-[var(--navy)] hover:bg-[var(--navy-deep)]">
              View Retatrutide
            </CTA>
          </div>

          <p className="mt-6 hidden max-w-xl text-xs leading-6 text-[var(--muted)] lg:block">
            Research use only. Not intended for human or animal consumption. Published study
            context is provided for education and is not an individual outcome claim.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

const productFeatureBullets = [
  'Research-use only',
  'Documentation-first quality focus',
  'Same-day El Paso delivery available',
  'Nationwide shipping available',
  'Mexico shipping available +$20',
]

function getProductPriceLabel(product: Product) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)

  return prices.length ? `From $${Math.min(...prices).toLocaleString()}` : 'By review'
}

export function ProductHero({ product }: { product: Product }) {
  const imageSrc = getProductImage(product)
  const { avifSrcSet, webpSrcSet } = getProductImageSources(product.heroImage)
  const heroStats = [
    { value: 'RUO', label: 'Research use' },
    { value: `${product.variants.length}`, label: 'Catalog option' },
    { value: '24hr', label: 'Inquiry routing' },
  ]
  const priceLabel = getProductPriceLabel(product)

  return (
    <section className="relative overflow-hidden bg-[var(--bg)] px-5 pb-14 pt-12 sm:px-8 lg:pb-20 lg:pt-16">
      <div className="molecule-field opacity-[0.14]" />
      <div className="pointer-events-none absolute right-0 top-14 size-80 rounded-full bg-[var(--teal)]/14 blur-3xl" />
      <div className="pointer-events-none absolute left-[8%] bottom-8 size-72 rounded-full bg-white blur-3xl" />
      <span className="hero-particle left-[10%] top-[34%]" />
      <span className="hero-particle hero-particle-delay right-[16%] top-[22%]" />
      <span className="hero-particle hero-particle-slow bottom-[18%] left-[52%]" />

      <div className="relative mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <a
            href="/catalog"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--muted)] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-[var(--navy)]"
          >
            Back to catalog
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex rounded-full border border-[var(--teal-border)] bg-[var(--teal-light)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">
              {product.badge}
            </p>
            <p className="inline-flex rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--navy)]">
              {priceLabel}
            </p>
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[0.96] tracking-[-0.065em] text-[var(--navy)] sm:text-6xl lg:text-7xl">
            {product.name}
          </h1>
          <p className="mt-5 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.045em] text-[var(--navy)] sm:text-3xl">
            {product.headline}
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {product.shortDescription}
          </p>
          <div className="mt-7 grid gap-3">
            {productFeatureBullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[var(--navy)] sm:text-base">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--teal)] text-[0.7rem] text-white">
                  ✓
                </span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTA href="#product-specs" tone="ghost" className="border-[var(--border)] bg-white text-[var(--navy)] hover:bg-[var(--teal-light)]">
              View Research Details
            </CTA>
            <CTA
              href="https://wa.me/19153595448"
              target="_blank"
              rel="noopener noreferrer"
              tone="ghost"
              className="border-[var(--border)] bg-white text-[var(--navy)] hover:bg-[var(--teal-light)]"
            >
              Contact Encore
            </CTA>
          </div>
          <div className="mt-6 max-w-xl">
            <VariantAddToCartPanel product={product} />
          </div>
          <div className="mt-8 grid max-w-2xl grid-cols-3 overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-white shadow-[0_20px_60px_rgba(26,35,64,0.08)]">
            {heroStats.map((stat) => (
              <div key={stat.label} className="border-r border-[var(--border)] p-4 last:border-r-0 sm:p-5">
                <p className="text-2xl font-semibold tracking-[-0.045em] text-[var(--navy)] sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase leading-5 tracking-[0.12em] text-[var(--muted)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="group relative mx-auto w-full max-w-2xl transition duration-500 hover:-translate-y-1"
        >
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2.25rem] border border-white bg-white p-4 shadow-[0_32px_110px_rgba(26,35,64,0.14)] sm:min-h-[40rem] sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(46,196,165,0.2),transparent_35%),linear-gradient(145deg,#ffffff,#eef7f6_48%,#f8f9fb)]" />
            <div className="absolute inset-5 rounded-[1.7rem] border border-[var(--border)] bg-white/42" />
            <div className="absolute left-6 top-6 z-10 rounded-full border border-[var(--teal-border)] bg-white/90 px-4 py-2 text-xs font-semibold text-[var(--navy)] shadow-[0_12px_36px_rgba(26,35,64,0.1)] backdrop-blur-xl">
              Documentation ready
            </div>
            <div className="absolute right-6 top-6 z-10 rounded-full border border-[var(--teal-border)] bg-[var(--teal)] px-4 py-2 text-xs font-semibold text-white shadow-[0_12px_36px_rgba(46,196,165,0.24)]">
              RUO
            </div>
            <div className="relative min-h-[31rem] overflow-hidden rounded-[1.7rem] sm:min-h-[37rem]">
              {imageSrc ? (
                <picture>
                  {avifSrcSet ? (
                    <source type="image/avif" srcSet={avifSrcSet} sizes="(min-width: 1024px) 45vw, 100vw" />
                  ) : null}
                  {webpSrcSet ? (
                    <source type="image/webp" srcSet={webpSrcSet} sizes="(min-width: 1024px) 45vw, 100vw" />
                  ) : null}
                  <img
                    src={imageSrc}
                    alt={`${product.name} research compound packaging`}
                    width="720"
                    height="720"
                    className="absolute inset-0 h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.025]"
                  />
                </picture>
              ) : (
                <div className="flex min-h-[31rem] w-full items-center justify-center rounded-[2rem] border border-dashed border-[var(--teal-border)] bg-white/60 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)] sm:min-h-[37rem]">
                  Product visual
                </div>
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0)_0_44%,rgba(255,255,255,0.24)_78%,rgba(255,255,255,0.72)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/90 to-transparent" />
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.4rem] border border-[var(--border)] bg-white/88 p-4 shadow-[0_20px_58px_rgba(26,35,64,0.14)] backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-auto sm:w-[min(20rem,calc(100%-3.5rem))]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Primary review lens
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--navy)]">
                {product.biologyPoints[0]?.title}
              </p>
              <div className="mt-4 grid gap-2">
                {product.mechanismSteps.slice(0, 3).map((step, index) => (
                  <div key={step} className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
                    <p className="text-xs font-semibold text-[var(--navy)]">Stage {index + 1}</p>
                    <span className="h-2 overflow-hidden rounded-full bg-[var(--teal-light)]">
                      <span className="block h-full rounded-full bg-[var(--teal)]" style={{ width: `${92 - index * 14}%` }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function ResearchProfileCallout({ product }: { product: Product }) {
  return (
    <section className="px-5 pb-10 sm:px-8 lg:pb-14">
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_18px_50px_rgba(26,35,64,0.06)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-base font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-lg">
              Not sure if {product.name} fits your goals?
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
              Complete our Research Match and we'll help you identify products aligned with your objectives.
            </p>
          </div>
          <CTA
            href="/intake"
            className="shrink-0 bg-[var(--navy)] hover:bg-[var(--navy-deep)]"
          >
            Find My Match
          </CTA>
        </div>
      </div>
    </section>
  )
}

const trustStripItems = [
  { icon: MapPin, label: 'Same-day local El Paso delivery' },
  { icon: Truck, label: 'Nationwide shipping' },
  { icon: FlaskConical, label: 'Research-use-only products' },
  { icon: ShieldCheck, label: 'Premium biotech quality standards' },
  { icon: Lock, label: 'Private inquiry · careful packaging' },
]

export function ProductTrustStrip() {
  return (
    <section className="px-5 sm:px-8">
      <div className="mx-auto max-w-[88rem] overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_48px_rgba(7,23,36,0.06)]">
        <div className="grid divide-y divide-slate-900/10 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {trustStripItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--teal-light)] text-[var(--teal)]">
                <item.icon size={16} aria-hidden="true" />
              </span>
              <p className="text-xs font-semibold leading-5 text-[var(--navy)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WhatIsProduct({ product }: { product: Product }) {
  return (
    <ResearchOverviewSection
      eyebrow="Overview"
      title={`What is ${product.name}?`}
      body={product.shortDescription}
      secondaryBody="Presented for research-use context only. This page does not describe treatment use, therapeutic outcomes, diagnosis, dosing guidance, or individual-specific recommendations."
      facts={[
        { label: 'Category', value: product.category },
        { label: 'Format options', value: product.variants.map((variant) => variant.label).join(', ') },
        { label: 'Use classification', value: 'Research use only', note: 'Not intended for human or animal consumption.' },
      ]}
      factTitle={`${product.name} quick facts`}
    />
  )
}

export function PremiumVisualBreak({ product }: { product: Product }) {
  return (
    <section className="relative overflow-hidden bg-[#0d1018] px-5 py-20 text-white sm:px-8 lg:py-28">
      <div className="molecule-field opacity-[0.14]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2ec4a5]/10 blur-3xl" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2ec4a5]/25"
        animate={{ rotate: -360 }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#2ec4a5]">
          {product.name} · Research grade
        </p>
        <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
          Precision research compounds, elevated by premium biotech design.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/58 sm:text-lg">
          Every Encore Bio Labs catalog page is built with the same clinical clarity as the
          product it represents — research use only, documentation-first, and free of guaranteed
          outcome claims.
        </p>
      </div>
    </section>
  )
}

function getIncludedItems(product: Product) {
  const isKit = product.variants.some((variant) => /kit|supply/i.test(variant.format))
  const formatLabel = product.variants[0]?.format ?? 'Vial format'

  const items = [
    { title: formatLabel, description: `Sealed ${formatLabel.toLowerCase()} presentation for ${product.name}.` },
    { title: 'Research-use-only labeling', description: 'Every unit is labeled for research use only, not for human or animal consumption.' },
    { title: 'Product information card', description: 'A concise reference card with format, category, and handling context.' },
    { title: 'Secure packaging', description: 'Protective, discreet packaging built for careful transit and storage.' },
  ]

  if (isKit) {
    items.push({
      title: 'Measured BAC water',
      description: 'Included where applicable on complete research kit formats, alongside documentation and premium packaging.',
    })
  }

  return items
}

export function WhatsIncluded({ product }: { product: Product }) {
  const items = getIncludedItems(product)
  const icons = [PackageCheck, ShieldCheck, FileText, Boxes, Snowflake]

  return (
    <SectionShell eyebrow="What's included" title={`Every ${product.name} order, organized.`}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const Icon = icons[index] ?? PackageCheck

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--teal-light)] text-[var(--teal)]">
                <Icon size={19} aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[var(--navy)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
            </motion.div>
          )
        })}
      </div>
    </SectionShell>
  )
}

export function ProductQualityFocus({ product }: { product: Product }) {
  const storageSpec = product.specs.find((spec) => spec.label === 'Research markers')

  return (
    <TrustAndHandlingSection
      title="Documentation-first standards, applied per product."
      items={[
        {
          title: 'Identity focus',
          description: `Product identity for ${product.name} is supported through documentation available on request.`,
        },
        {
          title: 'Purity focus',
          description: 'Purity documentation and batch-level context are available through the approved inquiry process.',
        },
        {
          title: 'Batch documentation',
          description: 'Lot and batch documentation are organized and ready for qualified review requests.',
        },
        {
          title: 'Storage guidance',
          description: product.reconstitution.overview,
        },
      ]}
      footnote={storageSpec ? 'Storage guidance is educational only and does not replace qualified laboratory oversight.' : undefined}
    />
  )
}

const productHowItWorksSteps = [
  { icon: FileSearch, title: 'Explore the product', copy: 'Review format, category, and research context on this page.' },
  { icon: ClipboardCheck, title: 'Complete intake / contact Encore', copy: 'Start the intake form or reach Encore directly with questions.' },
  { icon: Truck, title: 'Receive local delivery or nationwide shipping', copy: 'Approved orders route to same-day El Paso delivery or nationwide shipping.' },
  { icon: ShieldCheck, title: 'Review research-use-only handling information', copy: 'Confirm storage, labeling, and research-use-only handling before use.' },
]

export function ProductHowItWorksFlow() {
  return (
    <SectionShell eyebrow="How it works" title="From product page to organized fulfillment.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {productHowItWorksSteps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
            className="relative rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
          >
            {index < productHowItWorksSteps.length - 1 ? (
              <ArrowRight
                size={20}
                aria-hidden="true"
                className="absolute -right-5 top-1/2 hidden -translate-y-1/2 text-[var(--teal)] lg:block"
              />
            ) : null}
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#071724] text-white">
                <step.icon size={19} aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                0{index + 1}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-[var(--navy)]">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.copy}</p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}

function AnimatedMetric({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState(value)
  const [hasAnimated, setHasAnimated] = useState(false)
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/)

  useEffect(() => {
    const node = ref.current
    if (!node || !match || hasAnimated) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) return

        setHasAnimated(true)
        const target = Number(match[1])
        const suffix = match[2]
        const duration = 1100
        const start = performance.now()

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - (1 - progress) ** 3
          const next = target * eased
          const formatted = Number.isInteger(target) ? Math.round(next).toString() : next.toFixed(1)
          setDisplayValue(`${formatted}${suffix}`)

          if (progress < 1) requestAnimationFrame(tick)
        }

        requestAnimationFrame(tick)
      },
      { threshold: 0.45 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasAnimated, match, value])

  return <span ref={ref}>{displayValue}</span>
}

export function ProductBenefits({ product }: { product: Product }) {
  const icons = [Activity, Zap, HeartPulse, Brain, Microscope, PackageCheck]

  return (
    <SectionShell eyebrow="Research interest" title="Key research areas for high-signal review.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {product.benefits.map((benefit, index) => {
          const Icon = icons[index] ?? Sparkles

          return (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
              whileHover={{ y: -6 }}
              className="group rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--teal-light)] text-[var(--teal)] transition group-hover:scale-105">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[var(--navy)]">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{benefit.description}</p>
            </motion.div>
          )
        })}
      </div>
    </SectionShell>
  )
}

export function ProductMechanism({ product }: { product: Product }) {
  return (
    <MechanismOfActionSection
      eyebrow="Pathway model"
      title="From product review to pathway-level research context."
      steps={product.mechanismSteps}
    />
  )
}

export function ProductScience({ product }: { product: Product }) {
  return (
    <section id="product-science" className="relative overflow-hidden px-5 py-14 sm:px-8 lg:py-20">
      <div className="molecule-field opacity-[0.12]" />
      <div className="relative mx-auto grid max-w-[88rem] gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 p-6 shadow-[0_28px_90px_rgba(7,23,36,0.1)] backdrop-blur-2xl sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--teal)]">Science section</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[var(--navy)] sm:text-5xl">
            Biology visuals, receptor context, and study-specific interpretation.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            {product.name} is presented through a research-use lens: mechanism mapping, documentation readiness,
            and marker selection before any qualified study-planning review.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {product.scienceStats.map((stat) => (
              <div key={stat.label} className="rounded-[1.35rem] border border-[var(--border)] bg-white p-4">
                <p className="text-4xl font-semibold tracking-[-0.055em] text-[var(--navy)]">
                  <AnimatedMetric value={stat.value} />
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--navy)]">{stat.label}</p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{stat.note}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff,#edf8f6)] shadow-[0_28px_90px_rgba(7,23,36,0.1)]"
        >
          <div className="absolute inset-0 molecule-field opacity-[0.18]" />
          <motion.div
            className="absolute left-1/2 top-1/2 size-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--teal-border)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/60"
            animate={{ rotate: -360 }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          />
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <motion.span
              key={item}
              className="absolute left-1/2 top-1/2 size-4 rounded-full bg-[var(--teal)] shadow-[0_0_32px_rgba(46,196,165,0.48)]"
              style={{ marginLeft: `${Math.cos(item) * 120}px`, marginTop: `${Math.sin(item) * 96}px` }}
              animate={{ y: [0, -12, 0], opacity: [0.62, 1, 0.62] }}
              transition={{ duration: 4 + item * 0.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/70 bg-white/82 p-5 shadow-[0_20px_58px_rgba(26,35,64,0.12)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Research diagram</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--navy)]">
              {product.biologyPoints[0]?.title}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function VisualBiology({ product }: { product: Product }) {
  const icons = [Dna, Atom, Network]

  return (
    <SectionShell eyebrow="Visual biology" title="Cells, molecules, and signaling context in motion.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#ffffff,#edf8f6)] shadow-[0_28px_90px_rgba(7,23,36,0.1)]">
          <div className="absolute inset-0 molecule-field opacity-[0.18]" />
          <motion.div
            className="absolute left-[18%] top-[20%] size-24 rounded-full border border-[var(--teal-border)] bg-white/40"
            animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[18%] top-[26%] size-32 rounded-full border border-slate-300/70 bg-white/44"
            animate={{ y: [0, 16, 0], x: [0, -12, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[18%] left-[36%] size-44 rounded-full border border-[var(--teal-border)] bg-[var(--teal)]/10"
            animate={{ scale: [1, 1.06, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-x-8 bottom-8 rounded-[1.5rem] border border-white/70 bg-white/82 p-5 shadow-[0_20px_58px_rgba(26,35,64,0.12)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Biology model</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--navy)]">
              {product.name} pathway visualization
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {product.biologyPoints.map((point, index) => {
            const Icon = icons[index] ?? Dna

            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
                className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
              >
                <Icon size={22} aria-hidden="true" className="text-[var(--teal)]" />
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.035em] text-[var(--navy)]">{point.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{point.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </SectionShell>
  )
}

export function WhoMayBenefit({ product }: { product: Product }) {
  const icons = [Activity, TestTube2, Sparkles, HeartPulse, Zap, ShieldCheck]

  return (
    <SectionShell eyebrow="Research-fit considerations" title="Common research contexts for qualified review.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {product.benefitAudiences.map((audience, index) => {
          const Icon = icons[index] ?? Activity

          return (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
              className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
            >
              <Icon size={21} aria-hidden="true" className="text-[var(--teal)]" />
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.035em] text-[var(--navy)]">{audience.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{audience.description}</p>
            </motion.div>
          )
        })}
      </div>
      <p className="mt-6 text-center text-sm font-medium text-[var(--muted)]">
        See yourself in more than one of these?{' '}
        <a href="/intake" className="font-semibold text-teal-700 transition hover:text-teal-800">
          Find My Match
        </a>
      </p>
    </SectionShell>
  )
}

export function ProductDifferentiator({ product }: { product: Product }) {
  return (
    <SectionShell eyebrow="What makes it different" title="Generic catalog pages versus targeted peptide research review.">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_24px_72px_rgba(7,23,36,0.08)]">
        <div className="grid bg-[#071724] text-white sm:grid-cols-2">
          <div className="p-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/58">Generic catalog copy</div>
          <div className="p-5 text-sm font-semibold uppercase tracking-[0.18em] text-[#76e4d3]">Targeted peptide research</div>
        </div>
        {product.differentiators.map((row) => (
          <div key={row.standard} className="grid border-b border-slate-900/10 last:border-b-0 sm:grid-cols-2">
            <div className="p-5 text-sm leading-6 text-slate-500">{row.standard}</div>
            <div className="border-t border-slate-900/10 bg-[#F8FAFC] p-5 text-sm font-semibold leading-6 text-[var(--navy)] sm:border-l sm:border-t-0">
              {row.targeted}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

export function ProductGallery({ product }: { product: Product }) {
  const imageSrc = getProductImage({ ...product, heroImage: product.image }) ?? getProductImage(product)
  const primarySources = getProductImageSources(product.image)
  const fallbackSources = getProductImageSources(product.heroImage)
  const avifSrcSet = primarySources.avifSrcSet || fallbackSources.avifSrcSet
  const webpSrcSet = primarySources.webpSrcSet || fallbackSources.webpSrcSet

  return (
    <SectionShell eyebrow="Product gallery" title="Premium vial presentation with molecular context.">
      <div className="grid gap-5 lg:grid-cols-3">
        {product.galleryCaptions.map((caption, index) => (
          <motion.div
            key={caption}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
            className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-4 shadow-[0_24px_72px_rgba(7,23,36,0.08)]"
          >
            <div className="relative min-h-[20rem] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(145deg,#ffffff,#edf8f6)]">
              {imageSrc ? (
                <picture>
                  {avifSrcSet ? (
                    <source type="image/avif" srcSet={avifSrcSet} sizes="(min-width: 1024px) 33vw, 100vw" />
                  ) : null}
                  {webpSrcSet ? (
                    <source type="image/webp" srcSet={webpSrcSet} sizes="(min-width: 1024px) 33vw, 100vw" />
                  ) : null}
                  <img
                    src={imageSrc}
                    alt={caption}
                    width="640"
                    height="640"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.03]"
                  />
                </picture>
              ) : null}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0)_0_46%,rgba(255,255,255,0.28)_76%,rgba(255,255,255,0.9)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent" />
            </div>
            <p className="p-2 pt-5 text-sm font-semibold leading-6 text-[var(--navy)]">{caption}</p>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  )
}

export function ProductOverview({ product }: { product: Product }) {
  return (
    <ResearchOverviewSection
      eyebrow="Product overview"
      title="Research positioning with clean documentation context."
      body={`${product.name} sits within Encore Bio Labs' ${product.category.toLowerCase()} catalog. Researchers may review it for investigational interest, format comparison, documentation planning, and education-led research-product guidance.`}
      secondaryBody="The information on this page is intentionally scoped to research-use context. It does not describe treatment use, therapeutic outcomes, diagnosis, dosing guidance, or individual-specific recommendations."
      facts={[
        {
          label: 'Catalog format',
          value: product.dosage,
          note: 'Variants are grouped under one product page for cleaner review and fewer duplicate catalog entries.',
        },
        { label: 'Category', value: product.category },
        { label: 'Documentation', value: 'Available by request' },
      ]}
    />
  )
}

export function ProductHighlights({ product }: { product: Product }) {
  const icons = [ClipboardCheck, ShieldCheck, FileText, Beaker]

  return (
    <SectionShell eyebrow="Highlights" title="Built for premium research review.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {product.keyHighlights.map((highlight, index) => {
          const Icon = icons[index] ?? ClipboardCheck

          return (
            <div
              key={highlight}
              className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_48px_rgba(7,23,36,0.06)]"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                <Icon size={19} aria-hidden="true" />
              </span>
              <p className="mt-5 text-base font-semibold leading-6 text-[#071724]">{highlight}</p>
            </div>
          )
        })}
      </div>
    </SectionShell>
  )
}

export function ResearchUseDisclaimer({ product }: { product: Product }) {
  return <ResearchUseOnlyBanner title="Research-use disclaimer" body={product.disclaimer} />
}

export function ProductSpecs({ product }: { product: Product }) {
  return (
    <SectionShell id="product-specs" eyebrow="Specs" title="Product specs for catalog review.">
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_24px_72px_rgba(7,23,36,0.08)]">
        {product.specs.map((spec) => (
          <div
            key={spec.label}
            className="grid gap-2 border-b border-slate-900/10 p-5 last:border-b-0 sm:grid-cols-[0.35fr_0.65fr] sm:items-center"
          >
            <p className="text-sm font-semibold text-[#071724]">{spec.label}</p>
            <p className="text-sm leading-6 text-slate-600">{spec.value}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

export function SuggestedResearchProtocol({ product }: { product: Product }) {
  return (
    <SectionShell eyebrow="Research planning" title={product.protocol.title}>
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_70px_rgba(7,23,36,0.07)]">
          <FlaskConical size={26} aria-hidden="true" className="text-teal-700" />
          <p className="mt-5 text-base leading-7 text-slate-600">{product.protocol.notes}</p>
        </div>
        <div className="grid gap-3">
          {product.protocol.steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-[0_14px_38px_rgba(7,23,36,0.05)]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-600">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

export function ReconstitutionGuide({ product }: { product: Product }) {
  return (
    <SectionShell eyebrow="Reconstitution" title="Educational handling and preparation context.">
      <div className="rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_70px_rgba(7,23,36,0.07)] sm:p-8">
        <p className="max-w-4xl text-base leading-7 text-slate-600">{product.reconstitution.overview}</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {product.reconstitution.steps.map((step) => (
            <div key={step} className="rounded-2xl bg-[#F8FAFC] p-4 text-sm leading-6 text-slate-600">
              {step}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}

export function FAQSection({ product }: { product: Product }) {
  return (
    <FAQAccordion
      title={`Common ${product.name} research questions.`}
      items={product.faqs}
      cta={{ label: 'Still have questions? Find My Match', href: '/intake' }}
    />
  )
}

export function ProductResearchLinks({ product }: { product: Product }) {
  const articles = researchArticles.filter((article) => article.href === `/products/${product.slug}`)
  const categoryArticles = researchArticles
    .filter((article) => article.categorySlug === productCategorySlug(product) && article.href !== `/products/${product.slug}`)
    .slice(0, Math.max(0, 3 - articles.length))
  const combined = [...articles, ...categoryArticles].slice(0, 3)

  if (!combined.length) return null

  return (
    <RelatedArticlesSection
      articles={combined.map((article) => ({
        label: contentTypeLabels[article.contentType],
        title: article.title,
        href: article.href,
        description: article.description,
      }))}
    />
  )
}

export function ProductInternalLinks({ product }: { product: Product }) {
  return (
    <InternalLinkGrid
      eyebrow="Helpful Next Steps"
      title={`Keep researching ${product.name} in context`}
      links={[
        {
          label: 'Research Category',
          title: product.category,
          href: `/categories/${productCategorySlug(product)}`,
          description: 'Compare this product with adjacent catalog entries in the same research area.',
        },
        {
          label: 'FAQ',
          title: 'Product handling and storage questions',
          href: '/faq#product-handling',
          description: 'Review handling, storage, documentation, and research-use-only answers before intake.',
        },
        {
          label: 'Research Match',
          title: 'Start a research intake',
          href: '/intake',
          description: 'Share your research interest for human-reviewed category and product follow-up.',
        },
      ]}
    />
  )
}

function productCategorySlug(product: Product) {
  const map: Record<string, string> = {
    'Metabolic & Weight Management': 'metabolic-weight-management',
    'Recovery & Regeneration': 'recovery-regeneration',
    'Longevity & Cellular Health': 'longevity-cellular-health',
    'Cognitive & Performance': 'cognitive-performance',
    'Hormone & Wellness': 'hormone-wellness',
  }
  return map[product.category] ?? 'general'
}

export function RelatedProducts({ product }: { product: Product }) {
  const relatedProducts = product.relatedProducts
    .map((slug) => products.find((relatedProduct) => relatedProduct.slug === slug))
    .filter((relatedProduct): relatedProduct is Product => Boolean(relatedProduct))

  if (!relatedProducts.length) return null

  return (
    <RelatedProductsSection
      products={relatedProducts.map((relatedProduct) => ({
        category: relatedProduct.category,
        name: relatedProduct.name,
        href: `/products/${relatedProduct.slug}`,
        description: relatedProduct.shortDescription,
      }))}
    />
  )
}

export function CTASection({ product }: { product: Product }) {
  return (
    <ProductDiscoveryCTA
      title={`Start a compliant review for ${product.name}.`}
      body="Request screening, product documentation, and catalog guidance through the approved Encore Bio Labs process."
      primaryLabel="Find My Match"
      secondaryLabel="Contact Encore"
      secondaryHref={buildWhatsAppUrl(buildOrderInquiryMessage({ product: product.name }))}
      secondaryTarget="_blank"
      secondaryRel="noopener noreferrer"
    />
  )
}
