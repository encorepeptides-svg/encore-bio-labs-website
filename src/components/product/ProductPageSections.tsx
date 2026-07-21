import {
  Activity,
  ArrowRight,
  Atom,
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
  ShoppingCart,
  Sparkles,
  TestTube2,
  Truck,
  Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { products, type Product } from '../../data/products'
import { getLocalizedProduct, localizedCategoryLabel } from '../../data/productTranslations'
import type { ProductResearchContent } from '../../data/productResearchContent'
import { getProductMedia } from '../../data/productMedia'
import { contentTypeLabels, researchArticles } from '../../data/research'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { buildOrderInquiryMessage, buildWhatsAppUrl } from '../../lib/whatsapp'
import { ProductImage } from '../ProductImage'
import { ProductHero as ProductHeroEnvironment } from './ProductHero'
import ghkCuCutout from '../../assets/images/products/hero-demo/ghk-cu-demo.webp'

// Products shipping the Studio hero treatment: high-contrast organized dark hero
// that resolves into the light body. Scoped intentionally small so it can be
// reviewed live on one page before any wider rollout. Each entry needs a
// transparent hero cutout + an accent.
const STUDIO_HERO: Record<string, { cutout: string; accent: string }> = {
  'ghk-cu': { cutout: ghkCuCutout, accent: '#3fe6c9' },
}
import { PurchaseSelector } from './PurchaseSelector'
import { CTA } from '../CTA'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import {
  InternalLinkGrid,
  MechanismOfActionSection,
  ProductDiscoveryCTA,
  RelatedArticlesSection,
  RelatedProductsSection,
  ResearchOverviewSection,
  ResearchUseOnlyBanner,
} from '../content/EditorialModules'

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

const categoryTitleKeyBySlug: Record<string, string> = {
  'metabolic-weight-management': 'metabolicWeightManagementTitle',
  'recovery-regeneration': 'recoveryRegenerationTitle',
  'longevity-cellular-health': 'longevityCellularHealthTitle',
  'cognitive-performance': 'cognitivePerformanceTitle',
  'hormone-wellness': 'hormoneWellnessTitle',
}

export function ProductBreadcrumb({ product, tone = 'light' }: { product: Product; tone?: 'light' | 'dark' }) {
  const { path } = useLocale()
  const { t } = useTranslation('product')
  const { t: tCategories } = useTranslation('categories')
  const categorySlug = productCategorySlug(product)
  const categoryLabel = categoryTitleKeyBySlug[categorySlug] ? tCategories(categoryTitleKeyBySlug[categorySlug]) : product.category
  const dark = tone === 'dark'

  return (
    <nav aria-label={t('breadcrumbLabel')} className={dark ? 'bg-[#030b18] px-5 pt-6 sm:px-8' : 'px-5 pt-6 sm:px-8'}>
      <ol className={`mx-auto flex max-w-[88rem] flex-wrap items-center gap-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        <li>
          <a href={path('/')} className={`font-medium transition ${dark ? 'hover:text-white' : 'hover:text-[#071724]'}`}>
            {t('home')}
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <a href={path('/catalog')} className={`font-medium transition ${dark ? 'hover:text-white' : 'hover:text-[#071724]'}`}>
            {t('catalog')}
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <a
            href={path(`/categories/${categorySlug}`)}
            className={`font-medium transition ${dark ? 'hover:text-white' : 'hover:text-[#071724]'}`}
          >
            {categoryLabel}
          </a>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <span aria-current="page" className={`font-semibold ${dark ? 'text-teal-100' : 'text-[#071724]'}`}>
            {product.name}
          </span>
        </li>
      </ol>
    </nav>
  )
}

function getProductPriceLabel(product: Product, t: (key: string, vars?: Record<string, string | number>) => string) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)

  return prices.length ? t('fromPrice', { price: `$${Math.min(...prices).toLocaleString()}` }) : t('byReview')
}

function plainResearchArea(title: string, locale: 'en' | 'es') {
  const value = title.toLowerCase()
  if (value.includes('fat') || value.includes('adipos')) return locale === 'es' ? 'composición corporal' : 'body composition'
  if (value.includes('metabol') || value.includes('energy') || value.includes('energía')) return locale === 'es' ? 'energía y metabolismo' : 'energy and metabolism'
  if (value.includes('muscle') || value.includes('múscul')) return locale === 'es' ? 'biología muscular' : 'muscle biology'
  if (value.includes('skin') || value.includes('piel')) return locale === 'es' ? 'biología de la piel' : 'skin biology'
  if (value.includes('sleep') || value.includes('sueño')) return locale === 'es' ? 'investigación del sueño' : 'sleep research'
  if (value.includes('cogn') || value.includes('focus')) return locale === 'es' ? 'enfoque y rendimiento mental' : 'focus and mental performance'
  return locale === 'es' ? 'modelos de laboratorio relacionados' : 'related laboratory models'
}

function getPlainProductDescription(product: Product, researchContent: ProductResearchContent | undefined, locale: 'en' | 'es') {
  if (!researchContent) return product.shortDescription
  const areas = [...new Set(researchContent.researchAreas.slice(0, 3).map((area) => plainResearchArea(area.title, locale)))].join(locale === 'es' ? ', ' : ', ')
  return locale === 'es'
    ? `${product.name} es un compuesto de investigación premium estudiado en ${areas}, disponible ahora con documentación a solicitud.`
    : `${product.name} is a premium research compound studied in ${areas}, available now with documentation on request.`
}

export function ProductHero({ product, researchContent }: { product: Product; researchContent?: ProductResearchContent }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('product')
  const productFeatureBullets = product.keyHighlights?.slice(0, 3).length
    ? product.keyHighlights.slice(0, 3)
    : [t('featureBullet1'), t('featureBullet2'), t('featureBullet3')]
  const priceLabel = getProductPriceLabel(product, t)

  const studio = STUDIO_HERO[product.slug]
  if (studio) {
    const lowestPrice = Math.min(...product.variants.map((variant) => variant.price))
    return (
      <>
        <section className="relative isolate overflow-hidden bg-[radial-gradient(120%_90%_at_72%_26%,#0e2c3a_0%,#071a27_42%,#030c15_100%)] px-5 pb-24 pt-8 text-white sm:px-8 lg:pt-12">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:70px_70px] [mask-image:linear-gradient(to_right,black,transparent_72%)]" aria-hidden="true" />
          <div className="mx-auto max-w-[88rem]">
            <a href={path('/catalog')} className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:text-white">
              {t('backToCatalog')}
            </a>

            {/* Row 1: title + description on the left, bigger vial on the right */}
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.08fr]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="inline-flex rounded-full border border-[#3fe6c9]/30 bg-[#3fe6c9]/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#7ef0dd]">{product.badge}</p>
                  <p className="inline-flex rounded-full border border-white/16 bg-white/[0.06] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white">{priceLabel}</p>
                </div>
                <h1 className="mt-6 text-[clamp(3rem,8vw,5.4rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-white">{product.name}</h1>
                <p className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-3xl">{product.headline}</p>
                <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">{getPlainProductDescription(product, researchContent, locale)}</p>
              </div>
              <div className="relative order-first mx-auto w-full max-w-2xl lg:order-none">
                <ProductHeroEnvironment imageSrc={studio.cutout} imageAlt={t('productImageAlt', { product: product.name })} accent={studio.accent} density="low" priority imageWidth={1000} imageHeight={1000} />
                <span className="absolute left-3 top-3 z-10 rounded-full border border-white/14 bg-[#04101a]/55 px-3 py-2 text-[0.62rem] font-semibold text-slate-100 backdrop-blur">{t('documentationByReview')}</span>
                <span className="absolute right-3 top-3 z-10 rounded-full bg-[#3fe6c9] px-3 py-2 text-[0.64rem] font-bold uppercase tracking-[0.08em] text-[#08131a]">RUO</span>
              </div>
            </div>

            {/* Row 2: research bullets, full width */}
            <div className="mt-10 grid gap-2 sm:grid-cols-3">
              {productFeatureBullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3 rounded-[1.1rem] border border-white/[0.09] bg-white/[0.05] px-4 py-3 text-sm font-semibold leading-6 text-slate-100 backdrop-blur-xl">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3fe6c9] text-[0.7rem] text-[#08131a]">✓</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Row 3: horizontal order bar — real stats + configure CTA, no table in the hero */}
            <div className="mt-6 flex flex-col gap-4 rounded-[1.4rem] border border-white/12 bg-white/[0.055] p-5 backdrop-blur-xl sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
                <div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{t('heroStatFrom')}</p><p className="mt-0.5 text-2xl font-semibold tracking-[-0.03em] text-white">${lowestPrice}</p></div>
                <span className="hidden h-8 w-px bg-white/12 sm:block" aria-hidden="true" />
                <div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{t('heroStatStrengths')}</p><p className="mt-0.5 text-2xl font-semibold tracking-[-0.03em] text-white">{product.variants.length}</p></div>
                <span className="hidden h-8 w-px bg-white/12 sm:block" aria-hidden="true" />
                <div><p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{t('heroStatDocs')}</p><p className="mt-0.5 text-base font-semibold text-[#7ef0dd]">{t('heroStatDocsValue')}</p></div>
              </div>
              <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center">
                <CTA href={`#purchase-options-${product.slug}`} className="bg-[#3fe6c9] text-[#08131a] shadow-[0_16px_44px_rgba(63,230,201,0.28)] hover:bg-white">{t('configureOrder')}</CTA>
                <CTA href="https://wa.me/19153595448" target="_blank" rel="noopener noreferrer" tone="ghost" className="border-white/20 bg-white/[0.06] text-white shadow-none hover:border-white/35 hover:bg-white/[0.12]">{t('contactEncoreWhatsapp')}</CTA>
              </div>
            </div>
            <p className="mt-5 border-l-2 border-[#3fe6c9]/60 pl-4 text-sm leading-6 text-slate-300">{t('researchUseOnlyLine')} · <a href={path('/contact')} className="font-semibold text-[#7ef0dd] underline-offset-4 hover:underline">{t('contactQuestion')}</a></p>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-white" aria-hidden="true" />
        </section>

        {/* Full purchase configuration as its own clean light section (keeps the anchor) */}
        <section className="bg-white px-5 py-12 sm:px-8">
          <div className="mx-auto max-w-[88rem]">
            <PurchaseSelector product={product} />
            {product.purchaseRules.kitEligible ? <EncoreCompleteKit variant="reassurance" productName={product.name} bacWaterAmount={product.bacWaterAmount} className="mt-4" /> : null}
          </div>
        </section>
      </>
    )
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#030b18] px-5 pb-16 pt-10 text-white sm:px-8 sm:pt-12 lg:pb-24 lg:pt-16">
      <div className="molecule-field -z-20 opacity-[0.22]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-20 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_right,black,transparent_72%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-10rem] top-[-7rem] -z-10 size-[38rem] rounded-full bg-teal-400/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-14rem] left-[18%] -z-10 size-[42rem] rounded-full bg-cyan-400/8 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,11,24,1)_0%,rgba(3,11,24,.96)_45%,rgba(3,11,24,.72)_70%,rgba(3,11,24,.9)_100%)]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-start lg:gap-14">
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <a
            href={path('/catalog')}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            {t('backToCatalog')}
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <p className="inline-flex rounded-full border border-teal-200/20 bg-teal-100/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-teal-100">
              {product.badge}
            </p>
            <p className="inline-flex rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white">
              {priceLabel}
            </p>
          </div>
          <h1 className="mt-6 text-[clamp(3.35rem,9vw,5.2rem)] font-semibold leading-[0.88] tracking-[-0.075em] text-white lg:text-[clamp(4.4rem,6vw,6.4rem)]">
            {product.name}
          </h1>
          <p className="mt-6 max-w-2xl text-2xl font-semibold leading-tight tracking-[-0.045em] text-white sm:text-3xl">
            {product.headline}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {getPlainProductDescription(product, researchContent, locale)}
          </p>
          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            {productFeatureBullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-3 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.055] px-4 py-3 text-sm font-semibold leading-6 text-slate-100 backdrop-blur-xl">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#28e0c1] text-[0.7rem] text-[#071724]">
                  ✓
                </span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTA href="#product-specs" className="bg-[#28e0c1] text-[#071724] shadow-[0_16px_48px_rgba(40,224,193,0.25)] hover:bg-white">
              {t('viewResearchDetails')}
            </CTA>
            <CTA
              href="https://wa.me/19153595448"
              target="_blank"
              rel="noopener noreferrer"
              tone="ghost"
              className="border-white/20 bg-white/[0.07] text-white shadow-none backdrop-blur-xl hover:border-white/35 hover:bg-white/[0.13]"
            >
              {t('contactEncoreWhatsapp')}
            </CTA>
          </div>
          <div className="mt-7 max-w-2xl"><PurchaseSelector product={product} compact /></div>
          {product.purchaseRules.kitEligible ? (
            <EncoreCompleteKit
              variant="reassurance"
              productName={product.name}
              bacWaterAmount={product.bacWaterAmount}
              className="mt-4 max-w-2xl"
            />
          ) : null}
          <p className="mt-5 border-l-2 border-[#28e0c1]/60 pl-4 text-sm leading-6 text-slate-300">{t('researchUseOnlyLine')} · <a href={path('/contact')} className="font-semibold text-teal-200 underline-offset-4 hover:underline">{t('contactQuestion')}</a></p>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="group relative mx-auto w-full max-w-2xl transition duration-500 hover:-translate-y-1 lg:sticky lg:top-28"
        >
          <div className="relative min-h-[34rem] overflow-hidden rounded-[2.25rem] border border-white/15 bg-[linear-gradient(145deg,rgba(20,184,166,0.18),rgba(3,11,24,0.58)_48%,rgba(255,255,255,0.07))] p-4 shadow-[0_38px_120px_rgba(0,0,0,0.42)] backdrop-blur-sm sm:min-h-[40rem] sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(40,224,193,0.2),transparent_36%),linear-gradient(180deg,transparent_42%,rgba(3,11,24,0.94)_100%)]" />
            <div className="absolute inset-5 rounded-[1.7rem] border border-white/10 bg-black/10" />
            <div className="absolute left-6 top-6 z-10 rounded-full border border-white/15 bg-[#071724]/65 px-4 py-2 text-xs font-semibold text-teal-100 shadow-[0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              {t('documentationByReview')}
            </div>
            <div className="absolute right-6 top-6 z-10 rounded-full border border-teal-100/20 bg-[#28e0c1] px-4 py-2 text-xs font-bold text-[#071724] shadow-[0_12px_36px_rgba(40,224,193,0.22)]">
              RUO
            </div>
            <div className="relative min-h-[31rem] overflow-hidden rounded-[1.7rem] sm:min-h-[37rem]">
              <ProductImage
                product={product}
                alt={t('productImageAlt', { product: product.name })}
                sizes="(min-width: 1024px) 45vw, 100vw"
                loading="eager"
                width={720}
                height={720}
                className="absolute inset-[3%] h-[94%] w-[94%] object-contain object-center drop-shadow-[0_34px_54px_rgba(0,0,0,0.44)] transition duration-700 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0)_0_44%,rgba(3,11,24,0.04)_72%,rgba(3,11,24,0.55)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030b18]/95 to-transparent" />
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.4rem] border border-white/15 bg-[#06131f]/82 p-4 shadow-[0_20px_58px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-auto sm:w-[min(22rem,calc(100%-3.5rem))]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#71f0db]">
                {t('primaryReviewLens')}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
                {product.biologyPoints[0]?.title}
              </p>
              <div className="mt-4 grid gap-2">
                {product.mechanismSteps.slice(0, 3).map((step, index) => (
                  <div key={step} className="grid grid-cols-[5.5rem_1fr] items-center gap-3">
                    <p className="text-xs font-semibold text-slate-300">{t('stage', { number: index + 1 })}</p>
                    <span className="h-2 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-[#28e0c1]" style={{ width: `${92 - index * 14}%` }} />
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
  const { t } = useTranslation('product')
  return (
    <section className="px-5 pb-10 sm:px-8 lg:pb-14">
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-[0_18px_50px_rgba(26,35,64,0.06)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-base font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-lg">
              {t('matchQuestion', { product: product.name })}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
              {t('matchBody')}
            </p>
          </div>
          <CTA
            href="/intake"
            className="shrink-0 bg-[var(--navy)] hover:bg-[var(--navy-deep)]"
          >
            {t('findMyMatch')}
          </CTA>
        </div>
      </div>
    </section>
  )
}

export function ProductTrustStrip() {
  const { t } = useTranslation('product')
  const trustStripItems = [
    { icon: MapPin, label: t('trustDelivery') },
    { icon: Truck, label: t('trustShipping') },
    { icon: FlaskConical, label: t('trustResearchUse') },
    { icon: ShieldCheck, label: t('trustQuality') },
    { icon: Lock, label: t('trustPrivacy') },
  ]
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
  const { t } = useTranslation('product')
  return (
    <ResearchOverviewSection
      eyebrow={t('overviewEyebrow')}
      title={t('whatIsProduct', { product: product.name })}
      body={product.shortDescription}
      secondaryBody={t('overviewCompliance')}
      facts={[
        { label: t('categoryLabel'), value: product.category },
        { label: t('formatOptions'), value: product.variants.map((variant) => variant.label).join(', ') },
        { label: t('useClassification'), value: t('researchUseOnly'), note: t('notForConsumption') },
      ]}
      factTitle={t('quickFacts', { product: product.name })}
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

export function ProductDocumentationRow() {
  const { path } = useLocale()
  const { t } = useTranslation('product')
  return <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-5 pb-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="text-slate-600">{t('documentationTrustLine')}</p><div className="flex flex-wrap gap-4"><a href={path('/quality')} className="font-semibold text-teal-800 underline-offset-4 hover:underline">{t('viewDocumentation')}</a><a href={path('/contact')} className="font-semibold text-teal-800 underline-offset-4 hover:underline">{t('requestBatchInformation')}</a></div></div>
}

export function ProductFaqInvitation({ product }: { product: Product }) {
  const { path } = useLocale()
  const { t } = useTranslation('product')
  return <section className="px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-[88rem] flex-col gap-5 rounded-[1.5rem] border border-slate-900/8 bg-white p-6 shadow-[0_15px_45px_rgba(7,23,36,.05)] sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold tracking-[-.03em] text-[#071724]">{t('faqInvitationTitle', { product: product.name })}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t('faqInvitationBody')}</p></div><a href={path('/faq#product-handling')} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">{t('faqInvitationCta')}</a></div></section>
}

function getProductHowItWorksSteps(kitEligible: boolean, t: (key: string) => string) {
  return [
    { icon: FileSearch, title: t('step1Title'), copy: t('step1Copy') },
    kitEligible
      ? { icon: PackageCheck, title: t('step2KitTitle'), copy: t('step2KitCopy') }
      : { icon: PackageCheck, title: t('step2NoKitTitle'), copy: t('step2NoKitCopy') },
    { icon: ClipboardCheck, title: t('step3Title'), copy: t('step3Copy') },
    { icon: ShieldCheck, title: t('step4Title'), copy: t('step4Copy') },
  ]
}

export function ProductHowItWorksFlow({ product }: { product: Product }) {
  const { t } = useTranslation('product')
  const productHowItWorksSteps = getProductHowItWorksSteps(product.purchaseRules.kitEligible, t)

  return (
    <SectionShell eyebrow={t('howItWorksEyebrow')} title={t('howItWorksTitle')}>
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
  const { t } = useTranslation('product')
  const icons = [Activity, Zap, HeartPulse, Brain, Microscope, PackageCheck]

  return (
    <SectionShell eyebrow={t('researchHighlightsEyebrow')} title={t('researchHighlightsTitle')}>
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
  const { t } = useTranslation('product')
  const media = getProductMedia(product.slug)
  const captions = media?.gallery.length
    ? product.galleryCaptions.slice(0, media.gallery.length)
    : [product.galleryCaptions[0] ?? media?.hero.alt ?? `${product.name} research packaging`]

  return (
    <SectionShell eyebrow={t('productGalleryEyebrow')} title={t('productGalleryTitle')}>
      <div className="grid gap-5 lg:grid-cols-3">
        {captions.map((caption, index) => (
          <motion.div
            key={caption}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
            className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-4 shadow-[0_24px_72px_rgba(7,23,36,0.08)]"
          >
            <div className="relative min-h-[20rem] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(145deg,#ffffff,#edf8f6)]">
              <ProductImage
                product={product}
                alt={t('productImageAlt', { product: product.name })}
                sizes="(min-width: 1024px) 33vw, 100vw"
                width={640}
                height={640}
                className="absolute inset-0 h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.03]"
              />
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
  const { t } = useTranslation('product')
  return (
    <ResearchOverviewSection
      eyebrow={t('productOverviewEyebrow')}
      title={t('productOverviewTitle')}
      body={t('productOverviewBody', { product: product.name, category: product.category.toLowerCase() })}
      secondaryBody={t('productOverviewCompliance')}
      facts={[
        {
          label: t('catalogFormat'),
          value: product.dosage,
          note: t('catalogFormatNote'),
        },
        { label: t('categoryLabel'), value: product.category },
        { label: t('documentation'), value: t('availableByRequest') },
      ]}
    />
  )
}

export function ResearchUseDisclaimer({ product }: { product: Product }) {
  const { locale } = useLocale()
  const { t } = useTranslation('product')
  const { t: tBrand } = useTranslation('brand')
  // product.disclaimer is always the shared brandText.complianceDisclaimer value (see products.ts);
  // route through the brand namespace so it's translated instead of duplicating the override per product.
  const body = product.disclaimer === undefined || locale === 'en' ? product.disclaimer : tBrand('complianceDisclaimer')
  return <ResearchUseOnlyBanner title={t('researchUseDisclaimerTitle')} body={body} />
}

export function ProductSpecs({ product }: { product: Product }) {
  const { t } = useTranslation('product')
  return (
    <SectionShell id="product-specs" eyebrow={t('specsEyebrow')} title={t('specsTitle')}>
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
  const { t } = useTranslation('product')
  return (
    <InternalLinkGrid
      eyebrow={t('nextStepsEyebrow')}
      title={t('nextStepsTitle', { product: product.name })}
      links={[
        {
          label: t('researchCategory'),
          title: product.category,
          href: `/categories/${productCategorySlug(product)}`,
          description: t('categoryLinkBody'),
        },
        {
          label: 'FAQ',
          title: t('handlingQuestions'),
          href: '/faq#product-handling',
          description: t('faqLinkBody'),
        },
        {
          label: t('researchMatch'),
          title: t('startIntake'),
          href: '/intake',
          description: t('intakeLinkBody'),
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
  const { locale } = useLocale()
  const relatedProducts = product.relatedProducts
    .map((slug) => products.find((relatedProduct) => relatedProduct.slug === slug))
    .filter((relatedProduct): relatedProduct is Product => Boolean(relatedProduct))

  if (!relatedProducts.length) return null

  return (
    <RelatedProductsSection
      products={relatedProducts.map((relatedProduct) => {
        const localized = getLocalizedProduct(relatedProduct, locale)
        return {
          category: localizedCategoryLabel(relatedProduct.category, locale),
          name: localized.name,
          href: `/products/${relatedProduct.slug}`,
          description: locale === 'es' ? localized.catalogTagline : localized.shortDescription,
        }
      })}
    />
  )
}

export function FinalPurchaseCTA({ product }: { product: Product }) {
  const { t } = useTranslation('product')
  const priceLabel = getProductPriceLabel(product, t)

  return (
    <section className="px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col items-start gap-5 rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_70px_rgba(7,23,36,0.07)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              {t('readyToOrder', { product: product.name })}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#071724]">{priceLabel}</p>
            <p className="mt-1 text-sm text-slate-500">
              {product.purchaseRules.kitEligible ? t('kitConfigureOptions') : t('configureThenCart')}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href={`#purchase-options-${product.slug}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#071724] px-6 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <ShoppingCart size={16} aria-hidden="true" />
              {t('configureOrder')}
            </a>
            <a
              href="https://wa.me/19153595448"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/10 bg-white px-6 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
            >
              {t('contactSupport')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function CTASection({ product }: { product: Product }) {
  const { t } = useTranslation('product')
  return (
    <ProductDiscoveryCTA
      title={t('discoveryTitle', { product: product.name })}
      body={t('discoveryBody')}
      primaryLabel={t('findMyMatch')}
      secondaryLabel={t('contactEncore')}
      secondaryHref={buildWhatsAppUrl(buildOrderInquiryMessage({ product: product.name }))}
      secondaryTarget="_blank"
      secondaryRel="noopener noreferrer"
    />
  )
}
