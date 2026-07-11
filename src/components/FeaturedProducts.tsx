import { ArrowRight, FlaskConical } from 'lucide-react'
import { bestSellers, categoryVisuals, products, type Product } from '../data/products'
import { buildSrcSet, stemOf } from '../lib/responsiveImages'
import { cn } from '../lib/utils'
import { AddToCartButton } from './cart/AddToCartButton'
import { CTA } from './CTA'
import { Reveal } from './Reveal'

const productImages = import.meta.glob('../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const PRODUCT_IMAGE_BASE_PATH = '../assets/images/products/'
const PRODUCT_IMAGE_WIDTHS = [720, 1000, 1254]
const FLAGSHIP_IMAGE_SIZES = '(min-width: 1280px) 60vw, (min-width: 1024px) 58vw, 100vw'
const COLLECTION_IMAGE_SIZES = '(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw'

const refinedDescriptions: Partial<Record<string, string>> = {
  'ghk-cu': 'A copper peptide selection for skin and tissue research.',
  'wolverine-stack': 'A focused recovery stack for repair-pathway research.',
  'nad-plus': 'A cellular health staple for longevity-focused protocols.',
}

function getProductImageName(product: Product) {
  return productImages[`${PRODUCT_IMAGE_BASE_PATH}${product.image}`]
    ? product.image
    : categoryVisuals[product.category] ?? product.image
}

function getPriceLabel(product: Product) {
  const prices = product.variants.map((variant) => variant.price).filter((price) => price > 0)

  if (!prices.length) return 'Quote'

  const price = `$${Math.min(...prices).toLocaleString()}`
  return product.variants.length > 1 ? `From ${price}` : price
}

function getProductDescription(product: Product) {
  return refinedDescriptions[product.slug] || product.catalogTagline || product.shortDescription || product.description
}

function ProductImage({
  product,
  variant = 'collection',
}: {
  product: Product
  variant?: 'flagship' | 'collection'
}) {
  const imageName = getProductImageName(product)
  const imageSrc = productImages[`${PRODUCT_IMAGE_BASE_PATH}${imageName}`]
  const imageStem = stemOf(imageName)
  const avifSrcSet = buildSrcSet(productImages, PRODUCT_IMAGE_BASE_PATH, imageStem, 'avif', PRODUCT_IMAGE_WIDTHS)
  const webpSrcSet = buildSrcSet(productImages, PRODUCT_IMAGE_BASE_PATH, imageStem, 'webp', PRODUCT_IMAGE_WIDTHS)
  const isFlagship = variant === 'flagship'
  const moleculePositions = isFlagship
    ? [
        'left-[13%] top-[22%] size-2 animate-pulse',
        'left-[26%] top-[68%] size-1.5 animate-bounce [animation-duration:5.2s]',
        'right-[21%] top-[18%] size-2.5 animate-pulse [animation-delay:700ms]',
        'right-[13%] bottom-[28%] size-1.5 animate-bounce [animation-duration:6.1s]',
        'left-[48%] top-[13%] size-1 animate-pulse [animation-delay:1200ms]',
      ]
    : [
        'left-[18%] top-[23%] size-1.5 animate-pulse',
        'right-[19%] top-[21%] size-1 animate-pulse [animation-delay:800ms]',
        'left-[30%] bottom-[27%] size-1 animate-bounce [animation-duration:5.4s]',
      ]

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-[radial-gradient(circle_at_48%_34%,rgba(255,255,255,0.98),rgba(237,245,243,0.9)_32%,rgba(219,232,229,0.72)_58%,rgba(7,23,36,0.08)_100%)] transition duration-700 ease-out group-hover:bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,1),rgba(232,247,242,0.96)_34%,rgba(201,230,224,0.8)_62%,rgba(7,23,36,0.1)_100%)] group-active:bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,1),rgba(232,247,242,0.96)_34%,rgba(201,230,224,0.8)_62%,rgba(7,23,36,0.1)_100%)]',
        isFlagship ? 'min-h-[30rem] lg:min-h-[43rem]' : 'aspect-[5/7]',
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.88),transparent_34%,rgba(118,228,211,0.08)_58%,transparent_78%)]" aria-hidden="true" />
      <div className="absolute left-[10%] top-[12%] h-24 w-40 rounded-full bg-white/60 blur-3xl transition duration-700 group-hover:scale-110 group-hover:bg-white/80 group-active:scale-110 group-active:bg-white/80" aria-hidden="true" />
      <div className="absolute right-[10%] top-[18%] h-28 w-28 rounded-full bg-teal-200/22 blur-3xl transition duration-700 group-hover:scale-125 group-hover:bg-emerald-200/34" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/0 blur-3xl transition duration-700 group-hover:bg-emerald-200/24 group-active:bg-emerald-200/24" aria-hidden="true" />
      <div className="absolute inset-x-[20%] bottom-[13%] h-14 rounded-full bg-[#071724]/12 blur-3xl transition duration-700 group-hover:bg-[#071724]/16" aria-hidden="true" />
      <div className="absolute inset-x-[25%] bottom-[11%] h-px bg-white/82 shadow-[0_12px_30px_rgba(7,23,36,0.16)]" aria-hidden="true" />
      {moleculePositions.map((className) => (
        <span
          key={className}
          className={cn('absolute rounded-full bg-teal-300/60 shadow-[0_0_22px_rgba(45,212,191,0.46)]', className)}
          aria-hidden="true"
        />
      ))}
      <div className="absolute left-[16%] top-[31%] h-px w-20 rotate-[-25deg] bg-white/45" aria-hidden="true" />
      <div className="absolute right-[17%] top-[36%] h-px w-24 rotate-[22deg] bg-white/38" aria-hidden="true" />
      <div className="absolute left-6 top-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500/55 sm:left-8 sm:top-8">
        Encore Bio Labs
      </div>
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt=""
            aria-hidden="true"
            width={isFlagship ? 900 : 620}
            height={isFlagship ? 820 : 520}
            loading="lazy"
            decoding="async"
            className={cn(
              'absolute left-1/2 h-[28%] w-[70%] -translate-x-1/2 scale-y-[-1] object-contain opacity-[0.16] blur-[1.5px] saturate-[0.72] transition duration-700 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.34),transparent_72%)] group-hover:opacity-[0.22] group-hover:blur-[1px]',
              isFlagship ? 'bottom-[6%]' : 'bottom-[7%]',
            )}
          />
          <picture>
            {avifSrcSet ? (
              <source
                type="image/avif"
                srcSet={avifSrcSet}
                sizes={isFlagship ? FLAGSHIP_IMAGE_SIZES : COLLECTION_IMAGE_SIZES}
              />
            ) : null}
            {webpSrcSet ? (
              <source
                type="image/webp"
                srcSet={webpSrcSet}
                sizes={isFlagship ? FLAGSHIP_IMAGE_SIZES : COLLECTION_IMAGE_SIZES}
              />
            ) : null}
            <img
              src={imageSrc}
              alt={`${product.name} research compound packaging`}
              width={isFlagship ? 900 : 620}
              height={isFlagship ? 820 : 520}
              loading={isFlagship ? 'eager' : 'lazy'}
              decoding="async"
              className={cn(
                'absolute left-1/2 top-1/2 z-10 h-[78%] w-[84%] -translate-x-1/2 -translate-y-1/2 object-contain object-center opacity-95 drop-shadow-[0_32px_54px_rgba(7,23,36,0.22)] saturate-[0.94] transition duration-700 ease-out [mask-image:radial-gradient(ellipse_at_center,black_58%,rgba(0,0,0,0.82)_74%,transparent_100%)] group-hover:scale-[1.04] group-hover:drop-shadow-[0_42px_68px_rgba(7,23,36,0.28)] group-active:scale-[1.03]',
                isFlagship ? 'h-[86%] w-[90%]' : '',
              )}
            />
          </picture>
        </>
      ) : null}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0)_0_50%,rgba(255,255,255,0.22)_75%,rgba(255,255,255,0.9)_100%)]"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/94 to-transparent" aria-hidden="true" />
    </div>
  )
}

function FlagshipProduct({ product }: { product: Product }) {
  return (
    <Reveal
      as="article"
      className="group overflow-hidden rounded-[2rem] border border-white/70 bg-[#f6f7f4] shadow-[0_44px_140px_rgba(7,23,36,0.15)] transition duration-700 ease-out hover:-translate-y-1 hover:bg-[#fbfbf7] hover:shadow-[0_56px_160px_rgba(7,23,36,0.2)]"
    >
      <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]">
        <a
          href={`/products/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="relative isolate block overflow-hidden bg-[#e8eeeb]"
        >
          <ProductImage product={product} variant="flagship" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f6f7f4] to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f6f7f4] to-transparent" aria-hidden="true" />
        </a>

        <div className="relative flex min-h-full flex-col justify-center bg-[#f6f7f4] p-8 transition duration-700 group-hover:bg-[#fbfbf7] sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-y-10 left-0 w-px bg-gradient-to-b from-transparent via-slate-900/10 to-transparent" />
          <div className="relative max-w-lg">
            <span className="inline-flex rounded-full border border-slate-900/10 bg-white/70 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur-xl">
              Flagship Collection
            </span>
            <h3 className="mt-10 text-6xl font-bold leading-[0.84] tracking-[-0.065em] text-[#071724] sm:text-7xl lg:text-[5.75rem]">
              RETATRUTIDE
            </h3>
            <p className="mt-8 max-w-sm line-clamp-2 text-sm leading-6 text-slate-500">
              Triple-receptor incretin research entry presented as Encore's signature flagship.
            </p>

            <p className="mt-10 text-2xl font-semibold tracking-[-0.025em] text-emerald-700">
              Starting at $140
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <AddToCartButton product={product} className="min-h-14 w-full px-7 text-base sm:w-auto">
                Add to Cart
              </AddToCartButton>
              <CTA href={`/products/${product.slug}`} className="min-h-14 w-full px-7 text-base transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(7,23,36,0.24)] sm:w-auto">
                View Product
              </CTA>
              <CTA
                href={`/products/${product.slug}#product-specs`}
                tone="ghost"
                className="min-h-14 w-full bg-white/62 px-7 text-base transition duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_44px_rgba(7,23,36,0.12)] sm:w-auto"
              >
                Compare Protocols
              </CTA>
            </div>
            <a
              href="/intake"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-teal-700"
            >
              Need Help Choosing?
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function CollectionProduct({ product, index }: { product: Product; index: number }) {
  return (
    <Reveal
      as="article"
      delay={index * 0.06}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_90px_rgba(7,23,36,0.08)] transition duration-700 ease-out hover:-translate-y-3 hover:bg-[#fffefb] hover:shadow-[0_48px_140px_rgba(7,23,36,0.18)]"
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(16,185,129,0),transparent_42%)] opacity-0 transition duration-700 group-hover:bg-[radial-gradient(circle_at_50%_18%,rgba(16,185,129,0.12),transparent_46%)] group-hover:opacity-100" aria-hidden="true" />
      <a
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="relative isolate block overflow-hidden bg-[#eef3f0]"
      >
        <ProductImage product={product} />
      </a>
      <div className="flex flex-1 flex-col p-9 sm:p-10">
        <h3 className="text-4xl font-bold tracking-[-0.055em] text-[#071724]">
          {product.name}
        </h3>

        <p className="mt-6 line-clamp-2 text-sm leading-6 text-slate-500">
          {getProductDescription(product)}
        </p>

        <div className="mt-9 flex items-center justify-between gap-4">
          <p className="text-xl font-semibold tracking-[-0.02em] text-emerald-700">{getPriceLabel(product)}</p>
        </div>

        <a
          href={`/products/${product.slug}`}
          className="relative z-20 mt-10 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#071724] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_44px_rgba(7,23,36,0.18)] transition duration-500 ease-out hover:-translate-y-1 hover:bg-teal-800 hover:shadow-[0_24px_58px_rgba(7,23,36,0.25)]"
        >
          <span>View Product</span>
          <ArrowRight size={18} aria-hidden="true" className="transition group-hover:translate-x-1" />
        </a>
        <AddToCartButton product={product} tone="light" className="relative z-20 mt-3 min-h-12 w-full">
          Add to Cart
        </AddToCartButton>
      </div>
    </Reveal>
  )
}

function MobileFeaturedProduct({ product }: { product: Product }) {
  return (
    <Reveal
      as="article"
      className="group overflow-hidden rounded-[2.25rem] bg-[#f6f7f4] shadow-[0_28px_96px_rgba(7,23,36,0.14)] transition duration-700 active:-translate-y-1 active:bg-[#fbfbf7] active:shadow-[0_34px_110px_rgba(7,23,36,0.17)]"
    >
      <a href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="block">
        <ProductImage product={product} variant="flagship" />
      </a>
      <div className="px-7 pb-9 pt-9">
        <span className="inline-flex rounded-full border border-slate-900/10 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm backdrop-blur-xl">
          Featured Retatrutide
        </span>
        <h3 className="mt-8 text-5xl font-bold leading-[0.86] tracking-[-0.065em] text-[#071724]">
          RETATRUTIDE
        </h3>
        <p className="mt-6 line-clamp-2 text-sm leading-6 text-slate-500">
          Triple-receptor incretin research entry presented as Encore's signature flagship.
        </p>
        <p className="mt-8 text-2xl font-semibold tracking-[-0.025em] text-emerald-700">
          Starting at $140
        </p>
        <div className="mt-8 grid gap-4">
          <AddToCartButton product={product} className="min-h-14 w-full px-7 py-4 text-base">
            Add to Cart
          </AddToCartButton>
          <a
            href={`/products/${product.slug}`}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#071724] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_44px_rgba(7,23,36,0.18)] transition duration-500 active:scale-[0.99] active:bg-teal-900"
          >
            View Product
            <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a
            href={`/products/${product.slug}#product-specs`}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-slate-900/10 bg-white/70 px-7 py-4 text-base font-semibold text-[#071724] shadow-[0_14px_34px_rgba(7,23,36,0.08)] backdrop-blur-xl transition duration-500 active:scale-[0.99] active:bg-white"
          >
            Compare Protocols
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <a
          href="/intake"
          className="mt-5 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-teal-700"
        >
          Need Help Choosing?
        </a>
      </div>
    </Reveal>
  )
}

function MobileBestSellerCard({ product, index }: { product: Product; index: number }) {
  return (
    <article
      className="group w-[calc(100vw-2.5rem)] max-w-[24rem] shrink-0 snap-center overflow-hidden rounded-[2.25rem] bg-white shadow-[0_24px_86px_rgba(7,23,36,0.1)] transition duration-700 active:-translate-y-2 active:bg-[#fffefb] active:shadow-[0_34px_104px_rgba(7,23,36,0.16)]"
      aria-label={`${index + 1} of 3`}
    >
      <a href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="block">
        <ProductImage product={product} />
      </a>
      <div className="px-7 pb-9 pt-9">
        <h3 className="text-4xl font-bold tracking-[-0.055em] text-[#071724]">{product.name}</h3>
        <p className="mt-6 line-clamp-2 text-sm leading-6 text-slate-500">
          {getProductDescription(product)}
        </p>
        <p className="mt-8 text-xl font-semibold tracking-[-0.02em] text-emerald-700">
          {getPriceLabel(product)}
        </p>
        <a
          href={`/products/${product.slug}`}
          className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#071724] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_44px_rgba(7,23,36,0.18)] transition duration-500 active:scale-[0.99] active:bg-teal-900"
        >
          View Product
          <ArrowRight size={18} aria-hidden="true" />
        </a>
        <AddToCartButton product={product} tone="light" className="mt-3 min-h-12 w-full">
          Add to Cart
        </AddToCartButton>
      </div>
    </article>
  )
}

function MobileCollectionHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
          Best Sellers
        </p>
        <p className="text-xs font-semibold text-slate-400">Swipe 01/03</p>
      </div>
      <h3 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-[#071724]">
        Curated collection.
      </h3>
      <p className="mt-5 max-w-[18rem] text-sm leading-6 text-slate-500">
        Three polished selections from Encore's most requested research catalog.
      </p>
    </div>
  )
}

export function FeaturedProducts() {
  const bestSellerProducts = bestSellers
    .map((item) => products.find((product) => product.slug === item.slug))
    .filter((product): product is Product => Boolean(product))
  const heroProduct = bestSellerProducts.find((product) =>
    bestSellers.find((item) => item.slug === product.slug)?.featured,
  )
  const supportingProducts = bestSellerProducts
    .filter((product) => product.slug !== heroProduct?.slug)
    .slice(0, 3)

  if (!heroProduct) return null

  return (
    <section id="featured-products" className="relative overflow-hidden px-5 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-slate-900/10" aria-hidden="true" />
      <div className="mx-auto max-w-[88rem]">
        <div className="lg:hidden">
          <MobileFeaturedProduct product={heroProduct} />

          {supportingProducts.length ? (
            <div className="mt-16">
              <MobileCollectionHeader />
              <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-10 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {supportingProducts.map((product, index) => (
                  <MobileBestSellerCard key={product.slug} product={product} index={index} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-[2rem] bg-white/64 p-3 shadow-[0_20px_70px_rgba(7,23,36,0.08)] backdrop-blur-xl">
            <CTA href="/catalog" className="min-h-14 w-full px-7 text-base">
              Browse Full Catalog
            </CTA>
            <p className="px-4 pb-2 pt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              COA available / RUO catalog
            </p>
          </div>
        </div>

        <div className="hidden lg:block">
          <FlagshipProduct product={heroProduct} />

          {supportingProducts.length ? (
            <div className="mt-20">
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">
                    Curated Collection
                  </p>
                  <h3 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-[#071724]">
                    Curated best sellers, selected with intention.
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <FlaskConical size={16} aria-hidden="true" className="text-teal-700" />
                  <span>Research-use only</span>
                </div>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {supportingProducts.map((product, index) => (
                  <CollectionProduct key={product.slug} product={product} index={index} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
