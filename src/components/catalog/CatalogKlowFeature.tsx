import { ArrowRight, Check } from 'lucide-react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { ProductImage } from '../ProductImage'
import { Reveal } from '../Reveal'
import { getPriceLabel } from './catalogHelpers'
// KLOW composition, rendered as text chips. The blend's copper-peptide (GHK-Cu)
// component is its signature "glow" element and drives the product image, so the
// feature never reuses the Wolverine Stack (BPC-157 + TB-500) artwork.
const COMPOSITION = ['GHK-Cu', 'BPC-157', 'TB-500', 'KPV'] as const

export function CatalogKlowFeature() {
  const { t } = useTranslation('catalog')
  const { path, locale } = useLocale()

  const baseProduct = products.find((product) => product.slug === 'klow')
  if (!baseProduct) return null
  const product = getLocalizedProduct(baseProduct, locale)

  return (
    <Reveal className="mt-8 overflow-hidden rounded-[1.75rem] border border-teal-700/15 bg-[linear-gradient(135deg,#f2fbf8_0%,#ffffff_48%,#eefaf6_100%)] shadow-[0_20px_60px_rgba(7,23,36,0.08)]">
      <div className="grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1.1fr_0.9fr] md:gap-8 lg:gap-10 lg:p-9">
        {/* Copy (first on mobile) */}
        <div className="order-1">
          <span className="inline-flex items-center rounded-full border border-teal-700/20 bg-teal-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
            {t('klowEyebrow')}
          </span>
          <h2 className="mt-4 text-[clamp(2rem,1.4rem+2vw,2.75rem)] font-semibold leading-[1] tracking-[-0.05em] text-[#071724]">
            {t('klowTitle')}
          </h2>
          <p className="mt-3 max-w-md text-base leading-7 text-slate-600 sm:text-lg">{t('klowTagline')}</p>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('klowCompositionLabel')}</p>
            <p className="mt-2 text-sm font-semibold text-teal-900">
              {COMPOSITION.join(' · ')}
            </p>
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {product.catalogHighlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2 text-sm leading-5 text-slate-700">
                <Check size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={path(`/products/${product.slug}`)}
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#071724] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(7,23,36,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {t('klowCta')}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              {getPriceLabel(product, t)}
            </span>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">{t('klowCompliance')}</p>
        </div>

        {/* Visual */}
        <div className="order-2 relative mx-auto flex w-full max-w-[18rem] items-center justify-center md:max-w-[22rem]">
          <div className="relative aspect-square w-full">
            <div
              className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(118,228,211,0.4),transparent_64%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-7 rounded-[1.75rem] border border-white/70 bg-white/55 shadow-[0_24px_60px_rgba(7,23,36,0.12)] backdrop-blur-xl"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center p-7">
              <ProductImage
                product={product}
                alt={t('klowVisualAlt')}
                sizes="(min-width: 1024px) 28vw, 70vw"
                className="max-h-full w-auto object-contain drop-shadow-[0_22px_44px_rgba(7,23,36,0.2)]"
              />
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
