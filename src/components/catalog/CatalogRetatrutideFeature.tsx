import { useState } from 'react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { money } from '../../lib/purchaseOptions'
import { cn } from '../../lib/utils'
import { AddToCartButton } from '../cart/AddToCartButton'
import { ProductLabVisual } from '../product/ProductLabVisual'
import { Reveal } from '../Reveal'

function ReceptorDiagram({ labels }: { labels: [string, string, string] }) {
  const nodes = [
    { x: 190, y: 42, label: labels[0] },
    { x: 336, y: 210, label: labels[1] },
    { x: 44, y: 210, label: labels[2] },
  ]

  return (
    <svg viewBox="0 0 380 260" className="h-full w-full" role="img" aria-label={labels.join(' · ')}>
      <g stroke="rgba(118,228,211,0.42)" strokeWidth="1.5">
        {nodes.map((node) => (
          <line key={node.label} x1="190" y1="140" x2={node.x} y2={node.y} />
        ))}
      </g>
      <circle cx="190" cy="140" r="24" fill="rgba(20,184,166,0.88)" />
      <circle cx="190" cy="140" r="34" fill="none" stroke="rgba(118,228,211,0.38)" strokeWidth="1.5" />
      {nodes.map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="9" fill="#76e4d3" />
          <circle cx={node.x} cy={node.y} r="16" fill="none" stroke="rgba(118,228,211,0.3)" strokeWidth="1.5" />
          <text
            x={node.x}
            y={node.y > 120 ? node.y + 34 : node.y - 20}
            textAnchor="middle"
            className="fill-teal-100"
            style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em' }}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function CatalogRetatrutideFeature() {
  const { t } = useTranslation('catalog')
  const { path, locale } = useLocale()

  const baseProduct = products.find((product) => product.slug === 'retatrutide')
  const product = baseProduct ? getLocalizedProduct(baseProduct, locale) : null
  const firstAvailableVariant = product?.variants.find((variant) => product.stockStatus !== 'Unavailable' && variant.price > 0)
  const [selectedVariant, setSelectedVariant] = useState(firstAvailableVariant)
  if (!product) return null
  const researchHref = path(`/products/${product.slug}#retatrutide-full-research`)
  const receptors: [string, string, string] = [
    t('retaReceptorGip'),
    t('retaReceptorGlp1'),
    t('retaReceptorGlucagon'),
  ]

  return (
    <Reveal id="catalog-retatrutide-feature" className="relative mt-8 scroll-mt-32 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#06151f_0%,#0a2930_58%,#08212a_100%)] shadow-[0_28px_90px_rgba(7,23,36,0.34)]">
      <div className="molecule-field opacity-[0.12]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-[25rem] rounded-full bg-teal-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative grid gap-7 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.98fr)] lg:gap-x-12 lg:gap-y-7 lg:p-10">
        <div className="self-center">
          <span className="inline-flex items-center rounded-full border border-teal-200/25 bg-white/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-teal-100 backdrop-blur-sm sm:px-4 sm:text-xs">
            {t('retaEyebrow')}
          </span>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,1.45rem+2.3vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
            {t('retaPullQuote')}
          </h2>
        </div>

        <div className="relative lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <div className="relative mx-auto h-[18rem] w-full max-w-[38rem] sm:h-[24rem] lg:h-full lg:min-h-[34rem]">
            <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
              <ProductLabVisual
                product={product}
                alt={t('retaVisualAlt')}
                sizes="(min-width: 1024px) 42vw, 92vw"
                className="[&_.ph-product]:!h-[94%] [&_.ph-product]:!w-[88%]"
                priority
              />
            </div>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#071724]/75 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-teal-100 backdrop-blur-md sm:text-[0.65rem]">
              {t('retaTitle')}
            </span>
          </div>
        </div>

        <div className="lg:col-start-1">
          <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-lg sm:leading-8">{t('retaBody')}</p>

          <div id="retatrutide-strengths" className="mt-6 scroll-mt-32">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-200/80">{t('retaStrengthsLabel')}</p>
            <div role="group" aria-label={t('retaStrengthsLabel')} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {product.variants.map((variant, index) => {
                const available = product.stockStatus !== 'Unavailable' && variant.price > 0
                const selected = selectedVariant === variant
                const unavailableId = `retatrutide-variant-${index}-status`

                return (
                  <button
                    key={`${variant.label}-${variant.format}`}
                    type="button"
                    disabled={!available}
                    aria-pressed={selected}
                    aria-describedby={!available ? unavailableId : undefined}
                    onClick={() => setSelectedVariant(variant)}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-45',
                      selected
                        ? 'border-teal-200 bg-teal-300/20 shadow-[0_0_0_1px_rgba(94,234,212,.24)]'
                        : 'border-white/15 bg-white/[0.07] hover:-translate-y-0.5 hover:border-teal-200/50 hover:bg-teal-300/10',
                    )}
                  >
                    <span className="block text-sm font-bold text-white">{variant.label}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-teal-200">{available ? money(variant.price) : t('retaUnavailable')}</span>
                    {!available ? <span id={unavailableId} className="sr-only">{t('retaUnavailableDescription', { variant: variant.label })}</span> : null}
                  </button>
                )
              })}
            </div>
          </div>

          {selectedVariant ? (
            <div className="mt-5 grid gap-2 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm sm:grid-cols-2" aria-live="polite">
              <p className="text-slate-300"><span className="font-semibold text-white">{t('retaSelectedPrice')}:</span> {money(selectedVariant.price)}</p>
              <p className="break-all text-slate-300"><span className="font-semibold text-white">{t('retaVariantReference')}:</span> {selectedVariant.sku ?? selectedVariant.label}</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {selectedVariant ? (
              <AddToCartButton
                product={product}
                variant={selectedVariant}
                className="min-h-13 bg-[#74f0d8] px-7 py-3.5 font-bold text-[#04141e] shadow-[0_20px_48px_rgba(45,212,191,0.3)] hover:bg-white"
              >
                {t('retaAddVariantToCart', { variant: selectedVariant.label })}
              </AddToCartButton>
            ) : null}
            <a
              href={researchHref}
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200"
            >
              {t('retaSecondaryCta')}
            </a>
          </div>

          <p className="mt-5 border-l-2 border-teal-300/50 pl-3 text-xs leading-5 text-slate-300">{t('retaCompliance')}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 lg:col-start-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.17em] text-teal-200/75">{t('retaReceptorsLabel')}</p>
            <div className="flex flex-wrap gap-1.5">
              {receptors.map((receptor) => (
                <span key={receptor} className="rounded-full border border-teal-200/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-teal-100">
                  {receptor}
                </span>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-2 hidden h-32 max-w-[15rem] sm:block">
            <ReceptorDiagram labels={receptors} />
          </div>
        </div>
      </div>
    </Reveal>
  )
}
