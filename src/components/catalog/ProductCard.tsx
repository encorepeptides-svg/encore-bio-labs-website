import { BadgeCheck, Check, ShieldCheck } from 'lucide-react'
import { coaBySlug } from '../../data/coa'
import { type Product } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { ProductImage } from '../ProductImage'
import { Reveal } from '../Reveal'
import { getProductCutout } from '../../data/productCutouts'
import { getPriceLabel, getStrengthSummary } from './catalogHelpers'

export function ProductCard({ product: baseProduct }: { product: Product }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('catalog')
  const product = getLocalizedProduct(baseProduct, locale)
  const coa = coaBySlug[product.slug]
  const cutout = getProductCutout(baseProduct)

  return (
    <Reveal
      as="article"
      data-product-slug={product.slug}
      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_50px_rgba(7,23,36,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_82px_rgba(20,184,166,0.16)]"
    >
      <a
        href={path(`/products/${product.slug}`)}
        className="relative block overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(118,228,211,0.2),transparent_34%),linear-gradient(135deg,#ffffff,#e7eeee)]"
        aria-label={product.name}
      >
        <div className="aspect-[4/3]">
          {cutout ? (
            <img
              src={cutout}
              alt={t('productVisualAlt', { product: product.name })}
              width={640}
              height={480}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain object-center p-3 drop-shadow-[0_18px_24px_rgba(20,50,55,0.16)] transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <ProductImage
              product={product}
              alt={t('productVisualAlt', { product: product.name })}
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              width={640}
              height={480}
              className="h-full w-full object-contain object-center opacity-95 saturate-[0.94] transition duration-500 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0)_0_46%,rgba(255,255,255,0.28)_76%,rgba(255,255,255,0.92)_100%)]" />
      </a>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-semibold tracking-[-0.035em] text-[#071724]">{product.name}</h3>

        <p className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-teal-700">{t('researchHighlightsLabel')}</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {product.catalogHighlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2 text-sm leading-5 text-slate-700">
              <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
            {getStrengthSummary(product, t)}
          </span>
          {coa ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-teal-700">
              <BadgeCheck size={14} aria-hidden="true" />
              {t('onFileCoa')}
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
              <ShieldCheck size={14} aria-hidden="true" />
              {t('docsOnRequest')}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p className="text-lg font-semibold tracking-[-0.02em] text-[#071724]">{getPriceLabel(product, t)}</p>
          <a
            href={path(`/products/${product.slug}`)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[#071724] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {t('order')}
          </a>
        </div>
      </div>
    </Reveal>
  )
}
