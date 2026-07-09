import { ClipboardCheck, FileText, PackageCheck } from 'lucide-react'
import { bestSellers, categoryVisuals, products, type Product } from '../data/products'
import { buildSrcSet, stemOf } from '../lib/responsiveImages'
import { CTA } from './CTA'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const productImages = import.meta.glob('../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const PRODUCT_IMAGE_BASE_PATH = '../assets/images/products/'
const PRODUCT_IMAGE_WIDTHS = [720, 1000, 1254]
const LARGE_IMAGE_SIZES = '(min-width: 1024px) 55vw, 100vw'
const SMALL_IMAGE_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

function ProductImage({ product, large = false }: { product: Product; large?: boolean }) {
  const imageName = categoryVisuals[product.category] ?? product.image
  const imageSrc = productImages[`../assets/images/products/${imageName}`]
  const imageStem = stemOf(imageName)
  const avifSrcSet = buildSrcSet(productImages, PRODUCT_IMAGE_BASE_PATH, imageStem, 'avif', PRODUCT_IMAGE_WIDTHS)
  const webpSrcSet = buildSrcSet(productImages, PRODUCT_IMAGE_BASE_PATH, imageStem, 'webp', PRODUCT_IMAGE_WIDTHS)
  const sizes = large ? LARGE_IMAGE_SIZES : SMALL_IMAGE_SIZES

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_20%,rgba(118,228,211,0.24),transparent_36%),linear-gradient(135deg,#ffffff,#e7eeee)] ${
        large ? 'min-h-[24rem] sm:min-h-[30rem]' : 'h-48'
      }`}
    >
      {imageSrc ? (
        <picture>
          {avifSrcSet ? <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} /> : null}
          {webpSrcSet ? <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} /> : null}
          <img
            src={imageSrc}
            alt={product.name}
            width="520"
            height="520"
            loading={large ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-95 saturate-[0.94]"
          />
        </picture>
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0)_0_46%,rgba(255,255,255,0.26)_74%,rgba(255,255,255,0.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent" />
      <div className="absolute inset-x-8 bottom-8 h-12 rounded-full bg-teal-400/18 blur-2xl" />
    </div>
  )
}

function SecondaryProduct({ product }: { product: Product }) {
  return (
    <Reveal
      as="article"
      className="group rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_44px_rgba(7,23,36,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_76px_rgba(20,184,166,0.16)]"
    >
      <a href={`/products/${product.slug}`} className="grid h-full gap-4 p-4 sm:grid-cols-[0.8fr_1fr] lg:grid-cols-1">
        <ProductImage product={product} />
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            {product.category}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
            {product.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600 lg:line-clamp-2">
            {product.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <span
                key={`${variant.label}-${variant.format}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
              >
                {variant.label}
              </span>
            ))}
          </div>
          {product.variants.length > 1 ? (
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Available: {product.variants.map((variant) => variant.label).join(', ')}
            </p>
          ) : null}
          <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#071724] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(7,23,36,0.18)] transition duration-300 group-hover:bg-teal-700">
            View Product
          </span>
        </div>
      </a>
    </Reveal>
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
    <section id="featured-products" className="px-5 py-14 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[88rem]">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeader
            align="left"
            eyebrow="Best Sellers"
            title="What researchers ask about most."
            description="Retatrutide leads the list — one of the most requested entries in the catalog, presented here for research context only."
          />
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <CTA href="/products/retatrutide" className="w-full sm:w-auto">
              Study Retatrutide
            </CTA>
            <CTA href="/intake" tone="ghost" className="w-full sm:w-auto">
              Start Your Research Profile
            </CTA>
          </div>
        </div>

        <div className="mt-10 grid gap-6">
          <Reveal
            as="article"
            className="group overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white shadow-[0_30px_100px_rgba(7,23,36,0.13)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_38px_120px_rgba(20,184,166,0.16)]"
          >
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative">
                <a href={`/products/${heroProduct.slug}`} aria-label={`View ${heroProduct.name}`}>
                  <ProductImage product={heroProduct} large />
                </a>
                <div className="absolute left-5 top-5 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#071724] shadow-sm backdrop-blur-xl">
                  Featured best seller
                </div>
                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/50 bg-white/82 p-4 shadow-[0_18px_44px_rgba(7,23,36,0.12)] backdrop-blur-xl sm:right-auto sm:w-72">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                    Research-use only
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Studied for triple-receptor GLP-1, GIP, and glucagon signaling context.
                  </p>
                </div>
              </div>

              <div className="flex flex-col p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                  Main featured best seller
                </p>
                <h3 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">
                  {heroProduct.name}
                </h3>
                <p className="mt-5 text-base leading-7 text-slate-600">
                  {heroProduct.description}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Presented for research use only — no dosing guidance, treatment claims, or
                  outcome promises.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    { icon: ClipboardCheck, label: 'Variants grouped', note: 'One product page' },
                    { icon: FileText, label: 'Records by request', note: 'Documentation context' },
                    { icon: PackageCheck, label: 'RUO handling', note: 'Research labeling' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-900/10 bg-[#f5f5f2] p-3"
                    >
                      <item.icon size={18} aria-hidden="true" className="text-teal-700" />
                      <p className="mt-3 text-sm font-semibold text-[#071724]">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {heroProduct.variants.map((variant) => (
                    <span
                      key={`${variant.label}-${variant.format}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                    >
                      {variant.label} · {variant.format}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Available: {heroProduct.variants.map((variant) => variant.label).join(', ')}
                </p>

                <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row">
                  <CTA href={`/products/${heroProduct.slug}`} className="w-full sm:w-auto">
                    View Retatrutide
                  </CTA>
                  <CTA href="/intake" tone="ghost" className="w-full sm:w-auto">
                    Request Documentation
                  </CTA>
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                  Secondary Best Sellers
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                  Three more commonly reviewed entries.
                </h3>
              </div>
              <a href="/#products" className="text-sm font-semibold text-slate-600 transition hover:text-[#071724]">
                Browse all categories
              </a>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {supportingProducts.map((product) => (
                <SecondaryProduct key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
