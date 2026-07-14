import { Star } from 'lucide-react'
import { products, type Product } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { ProductImage } from '../ProductImage'
import { Reveal } from '../Reveal'
import { getPriceLabel } from './catalogHelpers'

const bestSellerSlugs = ['retatrutide', 'ghk-cu', 'nad-plus', 'tesamorelin', 'wolverine-stack']

function FeaturedCard({ product: baseProduct }: { product: Product }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('catalog')
  const product = getLocalizedProduct(baseProduct, locale)

  return (
    <Reveal
      as="article"
      className="group overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_24px_80px_rgba(7,23,36,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_110px_rgba(20,184,166,0.16)]"
    >
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="order-2 flex flex-col justify-center gap-5 p-6 sm:p-8 lg:order-1 lg:p-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-700/20 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            <Star size={13} aria-hidden="true" />
            {t('featuredBestseller')}
          </span>
          <h3 className="text-[clamp(1.85rem,1.1rem+3vw,2.75rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#071724]">
            {product.name}
          </h3>
          <p className="max-w-lg text-base leading-7 text-slate-600">{product.catalogTagline}</p>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            {getPriceLabel(product, t)}
          </p>
          <a
            href={path(`/products/${product.slug}`)}
            className="inline-flex w-fit min-h-12 items-center justify-center rounded-full bg-[#071724] px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {t('viewOptions')}
          </a>
        </div>

        <a
          href={path(`/products/${product.slug}`)}
          aria-label={product.name}
          className="relative order-1 block overflow-hidden bg-[#dfe8e7] lg:order-2"
        >
          <div className="relative flex aspect-[4/3] w-full items-center justify-center p-6 sm:aspect-[16/10] sm:p-10 lg:aspect-auto lg:h-full lg:min-h-[18rem] lg:p-10">
            <ProductImage
              product={product}
              alt={t('productVisualAlt', { product: product.name })}
              loading="eager"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-full w-full object-contain drop-shadow-[0_28px_48px_rgba(7,23,36,0.18)] transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </a>
      </div>
    </Reveal>
  )
}

function SecondaryCard({ product: baseProduct }: { product: Product }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('catalog')
  const product = getLocalizedProduct(baseProduct, locale)

  return (
    <Reveal
      as="article"
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_54px_rgba(7,23,36,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_84px_rgba(20,184,166,0.14)]"
    >
      <a
        href={path(`/products/${product.slug}`)}
        aria-label={product.name}
        className="relative block aspect-[4/3] overflow-hidden bg-[#dfe8e7]"
      >
        <ProductImage
          product={product}
          alt={t('productVisualAlt', { product: product.name })}
          sizes="(min-width: 1024px) 24vw, 100vw"
          className="absolute inset-0 h-full w-full object-contain object-center opacity-95 transition duration-500 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0)_0_42%,rgba(255,255,255,0.32)_76%,rgba(255,255,255,0.92)_100%)]" />
      </a>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-[#071724]">{product.name}</h3>
        <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{product.catalogTagline}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-sm font-semibold text-teal-700">{getPriceLabel(product, t)}</p>
          <a
            href={path(`/products/${product.slug}`)}
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2 text-sm font-semibold text-[#071724] transition hover:bg-teal-50"
          >
            {t('view')}
          </a>
        </div>
      </div>
    </Reveal>
  )
}

export function CatalogBestSellers() {
  const { t } = useTranslation('catalog')
  const bestSellerProducts = bestSellerSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product))
  const heroProduct = bestSellerProducts.find((product) => product.slug === 'retatrutide')
  const supportingProducts = bestSellerProducts.filter((product) => product.slug !== 'retatrutide')

  return (
    <section id="best-sellers" className="scroll-mt-36 px-5 py-10 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-[88rem]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{t('bestSellersEyebrow')}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#071724] sm:text-4xl">
          {t('bestSellersTitle')}
        </h2>

        <div className="mt-8 flex flex-col gap-5">
          {heroProduct ? <FeaturedCard product={heroProduct} /> : null}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {supportingProducts.map((product) => (
              <SecondaryCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
