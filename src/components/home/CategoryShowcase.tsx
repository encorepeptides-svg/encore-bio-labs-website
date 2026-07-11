import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { ResearchArea } from '../../data/products'
import { products, researchAreas } from '../../data/products'

type ResearchCategoryCard = {
  slug: string
  title: string
  description: string
  image: string
  imageAlt: string
  imagePosition: CategoryImagePosition
  featured?: boolean
}

type CategoryImagePosition = {
  desktop: string
  tablet: string
  mobile: string
}

const categoryImages = import.meta.glob('../../assets/catalog-categories/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const CATEGORY_IMAGE_BASE_PATH = '../../assets/catalog-categories/'
const FEATURED_IMAGE_SIZES = '(min-width: 1280px) 42vw, 100vw'
const SUPPORTING_IMAGE_SIZES = '(min-width: 1280px) 28vw, (min-width: 700px) 50vw, 100vw'

const categoryCards: ResearchCategoryCard[] = [
  {
    slug: 'metabolic-weight-management',
    title: 'Metabolic & Weight Management',
    description:
      'Explore compounds associated with metabolic signaling, energy regulation, and body-composition research.',
    image: 'metabolic-weight-management.webp',
    imageAlt: 'Couple walking outside a wellness retreat with an Encore Bio Labs vial nearby',
    imagePosition: {
      desktop: '50% 56%',
      tablet: '50% 43%',
      mobile: '50% 55%',
    },
    featured: true,
  },
  {
    slug: 'recovery-regeneration',
    title: 'Recovery & Regeneration',
    description: 'Compounds studied in tissue repair, connective-tissue signaling, and recovery research.',
    image: 'recovery-regeneration.webp',
    imageAlt: 'Couple in a recovery space stretching beside an Encore Bio Labs vial',
    imagePosition: {
      desktop: '62% 55%',
      tablet: '60% 54%',
      mobile: '60% 54%',
    },
  },
  {
    slug: 'longevity-cellular-health',
    title: 'Longevity & Cellular Health',
    description: 'Research focused on cellular resilience, mitochondrial function, and healthy-aging pathways.',
    image: 'longevity-cellular-health.webp',
    imageAlt: 'Couple relaxing outdoors with an Encore Bio Labs vial on the table',
    imagePosition: {
      desktop: '55% 55%',
      tablet: '55% 54%',
      mobile: '55% 54%',
    },
  },
  {
    slug: 'cognitive-performance',
    title: 'Cognitive & Performance',
    description: 'Explore compounds associated with focus, cognition, neurological signaling, and performance.',
    image: 'cognitive-performance.webp',
    imageAlt: 'Couple reviewing notes on a laptop with an Encore Bio Labs vial on the table',
    imagePosition: {
      desktop: '58% 56%',
      tablet: '57% 54%',
      mobile: '56% 54%',
    },
  },
  {
    slug: 'hormone-wellness',
    title: 'Hormone & Wellness',
    description: 'Research involving endocrine signaling, hormone-adjacent compounds, and wellness pathways.',
    image: 'hormone-wellness.webp',
    imageAlt: 'Couple in a wellness kitchen with an Encore Bio Labs vial near the foreground',
    imagePosition: {
      desktop: '54% 56%',
      tablet: '53% 55%',
      mobile: '52% 55%',
    },
  },
]

const categoryCardBySlug = categoryCards.reduce<Record<string, ResearchCategoryCard>>((cards, card) => {
  cards[card.slug] = card
  return cards
}, {})

function getProductCount(area: ResearchArea) {
  return products.filter((product) => product.category === area.name).length
}

function getImageSources(image: string) {
  return categoryImages[`${CATEGORY_IMAGE_BASE_PATH}${image}`]
}

function CategoryCard({ area, featured = false }: { area: ResearchArea; featured?: boolean }) {
  const copy = categoryCardBySlug[area.slug]
  const imageSrc = getImageSources(copy.image)
  const count = getProductCount(area)
  const countLabel = `${count} ${count === 1 ? 'product' : 'products'}`
  const imageStyle = {
    '--category-image-position-desktop': copy.imagePosition.desktop,
    '--category-image-position-tablet': copy.imagePosition.tablet,
    '--category-image-position-mobile': copy.imagePosition.mobile,
  } as CSSProperties

  if (featured) {
    return (
      <a
        href={`/categories/${area.slug}`}
        className="group relative isolate flex h-[clamp(430px,115vw,540px)] flex-col overflow-hidden rounded-[28px] border border-slate-900/10 bg-[#071724] shadow-[0_22px_70px_rgba(7,23,36,0.12)] transition-all duration-[360ms] hover:shadow-[0_30px_90px_rgba(7,23,36,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 focus-visible:ring-offset-2 motion-safe:hover:-translate-y-1 md:h-[520px] xl:h-[clamp(620px,48vw,680px)]"
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={copy.imageAlt}
            decoding="async"
            sizes={FEATURED_IMAGE_SIZES}
            style={imageStyle}
            className="category-showcase-image absolute inset-0 h-full w-full object-cover opacity-95 transition duration-[360ms] motion-safe:group-hover:scale-[1.025]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,19,31,0.04)_0%,rgba(5,19,31,0.08)_34%,rgba(5,19,31,0.88)_100%)] transition-opacity duration-[360ms] group-hover:opacity-95" />

        <div className="relative z-10 mt-auto flex max-w-xl flex-col items-start gap-4 p-6 sm:p-8 xl:p-9">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200 ring-1 ring-white/20 backdrop-blur-sm">
            FEATURED RESEARCH AREA
          </span>
          <h3 className="text-3xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-4xl lg:text-[2.8rem]">
            {copy.title}
          </h3>
          <p className="max-w-md text-sm leading-6 text-white/82 sm:text-base sm:leading-7">{copy.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="text-sm font-medium text-white/72">{countLabel}</span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-[360ms] group-hover:bg-white/20">
              Explore Category
              <ArrowUpRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-[360ms] motion-safe:group-hover:translate-x-[3px] motion-safe:group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a
      href={`/categories/${area.slug}`}
      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-slate-900/10 bg-white shadow-[0_16px_50px_rgba(7,23,36,0.07)] transition-all duration-[360ms] hover:shadow-[0_24px_68px_rgba(7,23,36,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 focus-visible:ring-offset-2 motion-safe:hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#dfe8e7] xl:aspect-[16/8.6]">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={copy.imageAlt}
            loading="lazy"
            decoding="async"
            sizes={SUPPORTING_IMAGE_SIZES}
            style={imageStyle}
            className="category-showcase-image absolute inset-0 h-full w-full object-cover transition duration-[360ms] motion-safe:group-hover:scale-[1.03]"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-white p-[clamp(18px,2vw,26px)] xl:gap-2.5 xl:p-[clamp(16px,1.55vw,22px)]">
        <h3 className="text-xl font-semibold leading-tight tracking-[-0.025em] text-[#071724] sm:text-2xl xl:text-[clamp(1.1rem,1.55vw,1.45rem)]">
          {copy.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600 xl:leading-5">
          {copy.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <span className="text-sm font-medium text-slate-500">{countLabel}</span>
          <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal-800">
            Explore Category
            <ArrowUpRight
              size={13}
              aria-hidden="true"
              className="transition-transform duration-[360ms] motion-safe:group-hover:translate-x-[3px] motion-safe:group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </div>
    </a>
  )
}

export function CategoryShowcase() {
  const visibleAreas = categoryCards
    .map((card) => researchAreas.find((area) => area.slug === card.slug))
    .filter((area): area is ResearchArea => Boolean(area))
  const [featuredArea, ...compactAreas] = visibleAreas

  return (
    <section id="products" className="bg-[#f5f5f2] px-5 py-[clamp(72px,9vw,128px)] sm:px-8">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid max-w-5xl items-end gap-6 lg:grid-cols-[minmax(0,680px)_auto] lg:gap-x-12">
          <div className="max-w-[680px]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">EXPLORE BY RESEARCH AREA</p>
            <h2 className="mt-4 max-w-[680px] text-[clamp(2.4rem,4.5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#071724]">
              Find the research category that matches your focus.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore Encore Bio Labs across metabolic, recovery, longevity, cognitive, and hormone-focused research
              areas.
            </p>
          </div>
          <a
            href="/catalog"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-1 text-sm font-semibold text-teal-800 transition duration-[360ms] hover:text-teal-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
          >
            View Full Catalog
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-[360ms] motion-safe:group-hover:translate-x-[3px] motion-safe:group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="mt-[clamp(32px,5vw,60px)] grid gap-[clamp(16px,2vw,24px)] xl:grid-cols-12 xl:items-stretch">
          <div className="xl:col-span-5">
            <CategoryCard area={featuredArea} featured />
          </div>
          <div className="grid gap-[clamp(16px,2vw,24px)] min-[700px]:grid-cols-2 xl:col-span-7 xl:h-[clamp(620px,48vw,680px)] xl:grid-rows-2">
            {compactAreas.map((area) => (
              <CategoryCard key={area.slug} area={area} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
