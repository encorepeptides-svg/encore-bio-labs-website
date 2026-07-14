import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  categoryVisuals,
  getResearchAreaBySlug,
  products,
  type CategoryContent,
  type Product,
  type ResearchArea,
} from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { localizeResearchArea } from '../../data/categoryTranslations'
import { contentTypeLabels, researchArticles } from '../../data/research'
import { buildSrcSet, stemOf } from '../../lib/responsiveImages'
import { CTA } from '../CTA'
import { ProductImage } from '../ProductImage'
import { Reveal } from '../Reveal'
import { SectionHeader } from '../SectionHeader'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import {
  CategoryEducationSection,
  FAQAccordion,
  InternalLinkGrid,
  ProductComparisonTable,
  ProductDiscoveryCTA,
  RelatedArticlesSection,
  ResearchOverviewSection,
  ResearchUseOnlyBanner,
} from '../content/EditorialModules'

// Category hero images and product card images live in the same directory,
// so both lookups share this one glob instead of duplicating it.
const productImages = import.meta.glob('../../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const CATEGORY_IMAGE_BASE_PATH = '../../assets/images/products/'
const IMAGE_WIDTHS = [720, 1000, 1254]
const HERO_IMAGE_SIZES = '(min-width: 640px) 576px, 100vw'
const CARD_IMAGE_SIZES = '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'

function getCategoryImageName(area: ResearchArea) {
  return categoryVisuals[area.name] ?? area.image
}

function getCategoryImage(area: ResearchArea) {
  return productImages[`../../assets/images/products/${getCategoryImageName(area)}`]
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-[88rem]">
        <SectionHeader align="left" eyebrow={eyebrow} title={title} description={description ?? ''} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

export function CategoryBreadcrumb({ area }: { area: ResearchArea }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  return (
    <div className="px-5 pt-6 sm:px-8">
      <div className="mx-auto flex max-w-[88rem] items-center gap-2 text-sm text-slate-500">
        <a href={path('/')} className="font-medium transition hover:text-[#071724]">
          {t('home')}
        </a>
        <span aria-hidden="true">/</span>
        <a href={path('/#products')} className="font-medium transition hover:text-[#071724]">
          {t('categories')}
        </a>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-[#071724]">{area.name}</span>
      </div>
    </div>
  )
}

export function CategoryHero({ area, content }: { area: ResearchArea; content: CategoryContent }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  const imageSrc = getCategoryImage(area)
  const imageStem = stemOf(getCategoryImageName(area))
  const avifSrcSet = buildSrcSet(productImages, CATEGORY_IMAGE_BASE_PATH, imageStem, 'avif', IMAGE_WIDTHS)
  const webpSrcSet = buildSrcSet(productImages, CATEGORY_IMAGE_BASE_PATH, imageStem, 'webp', IMAGE_WIDTHS)

  return (
    <section className="relative overflow-hidden bg-[var(--bg)] px-5 pb-14 pt-8 sm:px-8 lg:pb-20 lg:pt-10">
      <div className="molecule-field opacity-[0.12]" />
      <div className="pointer-events-none absolute right-0 top-14 size-80 rounded-full bg-[var(--teal)]/12 blur-3xl" />

      <div className="relative mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
        <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
          <p
            className="inline-flex rounded-full border px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: `color-mix(in srgb, ${area.accent} 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${area.accent} 14%, white)`,
              color: `color-mix(in srgb, ${area.accent} 70%, #071724)`,
            }}
          >
            {content.eyebrow}
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#071724] sm:text-5xl lg:text-6xl">
            {content.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{content.subheadline}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CTA href="#featured-in-category" className="bg-[#071724] hover:bg-[#102a3d]">
              {t('viewProducts', { name: area.name })}
            </CTA>
            <CTA href={path('/intake')} tone="ghost">
              {t('findMatch')}
            </CTA>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_32px_110px_rgba(26,35,64,0.14)]"
        >
          {imageSrc ? (
            <picture>
              {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={HERO_IMAGE_SIZES} /> : null}
              {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={HERO_IMAGE_SIZES} /> : null}
              <img
                src={imageSrc}
                alt={area.name}
                width="800"
                height="600"
                className="aspect-[4/3] w-full object-cover"
              />
            </picture>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              {area.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071724]/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}

export function CategoryOverview({ content }: { content: CategoryContent }) {
  const { t } = useTranslation('categoryPage')
  return (
    <ResearchOverviewSection
      eyebrow={t('overview')}
      title={t('whatCategory')}
      body={content.overview}
      facts={[
        { label: t('positioning'), value: t('researchOnly'), note: t('noClaims') },
        { label: t('pageModel'), value: t('educationFirst'), note: t('contextNote') },
        { label: t('reviewPath'), value: t('humanReviewed'), note: t('intakeNote') },
      ]}
    />
  )
}

export function WhyStudied({ content }: { content: CategoryContent }) {
  const { t } = useTranslation('categoryPage')
  return (
    <ResearchOverviewSection
      eyebrow={t('researchContext')}
      title={t('whyStudied')}
      body={content.whyStudied}
    />
  )
}

export function KeyThemes({ content }: { content: CategoryContent }) {
  const { t } = useTranslation('categoryPage')
  return (
    <CategoryEducationSection
      eyebrow={t('keyThemes')}
      title={t('mechanisms')}
      items={content.themes}
    />
  )
}

export function CategoryFeaturedProducts({ area }: { area: ResearchArea }) {
  const { t } = useTranslation('categoryPage')
  const { locale, path } = useLocale()
  const sourceArea = getResearchAreaBySlug(area.slug) ?? area
  const categoryProducts = products.filter((product) => product.category === sourceArea.name)

  if (!categoryProducts.length) return null

  return (
    <SectionShell
      id="featured-in-category"
      eyebrow={t('featured')}
      title={t('catalogEntries', { name: area.name })}
      description={t('productContext')}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categoryProducts.map((product, index) => {
          const displayProduct = getLocalizedProduct(product, locale)

          return (
            <Reveal
              as="article"
              key={product.slug}
              delay={index * 0.05}
              className="group overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_48px_rgba(7,23,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
            >
              <a href={path(`/products/${product.slug}`)} className="flex h-full flex-col">
                <div className="relative h-40 overflow-hidden bg-[radial-gradient(circle_at_50%_20%,rgba(118,228,211,0.2),transparent_36%),linear-gradient(135deg,#ffffff,#e7eeee)]">
                  <ProductImage
                    product={product}
                    alt={t('productImageAlt', { product: displayProduct.name })}
                    sizes={CARD_IMAGE_SIZES}
                    width={480}
                    height={360}
                    className="absolute inset-0 h-full w-full object-contain object-center p-3"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#071724]">{displayProduct.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 line-clamp-3">
                    {displayProduct.shortDescription}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                    {t('viewProduct')}
                    <ArrowRight size={15} aria-hidden="true" className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            </Reveal>
          )
        })}
      </div>
    </SectionShell>
  )
}

export function CategoryComparisonTable({ area, content }: { area: ResearchArea; content: CategoryContent }) {
  const { t } = useTranslation('categoryPage')
  const { locale, path } = useLocale()
  const sourceArea = getResearchAreaBySlug(area.slug) ?? area
  const categoryProducts = products.filter((product) => product.category === sourceArea.name)

  if (!categoryProducts.length) return null

  function getComparisonPrice(product: Product) {
    const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)

    return prices.length ? `From $${Math.min(...prices)}` : t('byReview')
  }

  return (
    <ProductComparisonTable
      eyebrow={t('comparison')}
      title={t('differences')}
      description={t('comparisonNote')}
      rows={categoryProducts.map((product) => {
        const displayProduct = getLocalizedProduct(product, locale)
        return {
          product: product.name,
          href: path(`/products/${product.slug}`),
          focus: displayProduct.shortDescription,
          format: product.variants[0]?.format ?? t('vialFormat'),
          price: getComparisonPrice(product),
          note: content.comparisonNotes[product.slug] ?? t('productContext'),
        }
      })}
      showFocus
    />
  )
}

export function CategoryFAQSection({ area, content }: { area: ResearchArea; content: CategoryContent }) {
  const { t } = useTranslation('categoryPage')
  return <FAQAccordion eyebrow={t('commonQuestions')} title={t('researchQuestions', { name: area.name })} items={content.faqs} />
}

export function CategoryResearchLinks({ area }: { area: ResearchArea }) {
  const { locale, path } = useLocale()
  const articles = researchArticles.filter((article) => article.categorySlug === area.slug).slice(0, 3)

  if (!articles.length) return null

  return (
    <RelatedArticlesSection
      articles={articles.map((article) => ({
        label: locale === 'es' ? 'Artículo de investigación' : contentTypeLabels[article.contentType],
        title: locale === 'es' ? `Investigación: ${article.title}` : article.title,
        href: path(article.href),
        description: locale === 'es' ? 'Consulta el contexto y las limitaciones de la literatura disponible.' : article.description,
      }))}
    />
  )
}

export function RelatedCategories({ content }: { content: CategoryContent }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('categoryPage')
  const related = content.relatedCategorySlugs
    .map((slug) => getResearchAreaBySlug(slug))
    .filter((area): area is ResearchArea => Boolean(area))

  if (!related.length) return null

  return (
    <InternalLinkGrid
      eyebrow={t('relatedTopics')}
      title={t('adjacent')}
      links={related.map((area) => ({
        label: t('researchCategory'),
        title: localizeResearchArea(area, locale).name,
        href: path(`/categories/${area.slug}`),
        description: localizeResearchArea(area, locale).description,
      }))}
    />
  )
}

export function CategoryDisclaimer({ content }: { content: CategoryContent }) {
  return <ResearchUseOnlyBanner body={content.disclaimer} />
}

export function CategoryFinalCTA({ area }: { area: ResearchArea }) {
  const { path } = useLocale()
  const { t } = useTranslation('categoryPage')
  return (
    <ProductDiscoveryCTA
      title={t('ready', { name: area.name.toLowerCase() })}
      body={t('readyBody')}
      primaryLabel={t('exploreProducts', { name: area.name })}
      primaryHref="#featured-in-category"
      secondaryLabel={t('findMatchShort')}
      secondaryHref={path('/intake')}
    />
  )
}
