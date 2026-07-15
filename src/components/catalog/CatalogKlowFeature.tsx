import { ArrowRight, Check } from 'lucide-react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { ProductImage } from '../ProductImage'
import { Reveal } from '../Reveal'
import { getPriceLabel } from './catalogHelpers'

const COMPOSITION = ['GHK-Cu', 'BPC-157', 'TB-500', 'KPV'] as const

export function CatalogKlowFeature() {
  const { t } = useTranslation('catalog')
  const { path, locale } = useLocale()

  const baseProduct = products.find((product) => product.slug === 'klow')
  if (!baseProduct) return null
  const product = getLocalizedProduct(baseProduct, locale)
  const benefits = [t('klowBenefitOne'), t('klowBenefitTwo'), t('klowBenefitThree')]

  return (
    <Reveal id="catalog-klow-feature" className="relative mt-8 scroll-mt-32 overflow-hidden rounded-[1.75rem] border border-teal-800/15 bg-[linear-gradient(135deg,#eefaf7_0%,#ffffff_48%,#e7f7f3_100%)] shadow-[0_24px_74px_rgba(7,23,36,0.1)]">
      <div className="pointer-events-none absolute -right-16 -top-20 size-[23rem] rounded-full bg-teal-200/45 blur-3xl" aria-hidden="true" />

      <div className="relative grid grid-cols-[minmax(0,1fr)_8rem] gap-x-4 gap-y-6 p-5 sm:grid-cols-[minmax(0,1fr)_11rem] sm:p-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:gap-x-12 lg:p-10">
        <div className="col-start-1 row-start-1 self-center">
          <span className="inline-flex items-center rounded-full border border-teal-800/20 bg-white/75 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.17em] text-teal-900 shadow-sm backdrop-blur-sm sm:px-4 sm:text-xs">
            {t('klowEyebrow')}
          </span>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.85rem,1.4rem+1.9vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.052em] text-[#071724]">
            {t('klowTitle')}
          </h2>
        </div>

        <div className="relative col-start-2 row-start-1 self-center lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <div className="relative mx-auto aspect-square w-full max-w-[28rem] lg:h-full lg:min-h-[31rem] lg:aspect-auto">
            <div className="absolute inset-0 rounded-[1.4rem] border border-white/80 bg-white/65 shadow-[0_26px_66px_rgba(7,23,36,0.14)] backdrop-blur-xl sm:rounded-[1.8rem]" aria-hidden="true" />
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[1.4rem] sm:rounded-[1.8rem]">
              <ProductImage
                product={product}
                alt={t('klowVisualAlt')}
                sizes="(min-width: 1024px) 36vw, 38vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-1">
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-lg sm:leading-8">{t('klowTagline')}</p>

          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t('klowCompositionLabel')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMPOSITION.map((compound) => (
                <span key={compound} className="rounded-full border border-teal-800/15 bg-white/80 px-3 py-1.5 text-xs font-bold text-teal-900 shadow-sm">
                  {compound}
                </span>
              ))}
            </div>
          </div>

          <ul className="mt-6 grid gap-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 rounded-xl border border-teal-900/8 bg-white/65 px-3.5 py-3 text-sm font-medium leading-5 text-slate-700">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href={path(`/products/${product.slug}`)}
              className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-[#071724] px-7 py-3.5 text-sm font-bold text-white shadow-[0_18px_46px_rgba(7,23,36,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-teal-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
            >
              {t('klowCta')}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <span className="text-base font-bold tracking-[-0.02em] text-teal-800">
              {getPriceLabel(product, t)}
            </span>
          </div>

          <p className="mt-5 border-l-2 border-teal-700/35 pl-3 text-xs leading-5 text-slate-600">{t('klowCompliance')}</p>
        </div>
      </div>
    </Reveal>
  )
}
