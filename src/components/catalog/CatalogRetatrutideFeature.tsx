import { ArrowRight } from 'lucide-react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { money } from '../../lib/purchaseOptions'
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
  if (!baseProduct) return null
  const product = getLocalizedProduct(baseProduct, locale)
  const purchaseHref = path(`/products/${product.slug}#retatrutide-purchase`)
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

      <div className="relative grid grid-cols-[minmax(0,1fr)_7.75rem] gap-x-4 gap-y-6 p-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:p-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)] lg:gap-x-12 lg:gap-y-7 lg:p-10">
        <div className="col-start-1 row-start-1 self-center">
          <span className="inline-flex items-center rounded-full border border-teal-200/25 bg-white/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-teal-100 backdrop-blur-sm sm:px-4 sm:text-xs">
            {t('retaEyebrow')}
          </span>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,1.45rem+2.3vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
            {t('retaPullQuote')}
          </h2>
        </div>

        <div className="relative col-start-2 row-start-1 self-center lg:row-span-2 lg:row-start-1 lg:self-stretch">
          <div className="relative mx-auto aspect-square w-full max-w-[25rem] lg:h-full lg:min-h-[27rem] lg:aspect-auto">
            <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
              <ProductLabVisual
                product={product}
                alt={t('retaVisualAlt')}
                sizes="(min-width: 1024px) 32vw, 36vw"
                priority
              />
            </div>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#071724]/75 px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-teal-100 backdrop-blur-md sm:text-[0.65rem]">
              {t('retaTitle')}
            </span>
          </div>
        </div>

        <div className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-1">
          <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-lg sm:leading-8">{t('retaBody')}</p>

          <div id="retatrutide-strengths" className="mt-6 scroll-mt-32">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-teal-200/80">{t('retaStrengthsLabel')}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {product.variants.map((variant) => (
                <a
                  key={`${variant.label}-${variant.format}`}
                  href={purchaseHref}
                  className="group rounded-xl border border-white/15 bg-white/[0.07] px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-teal-200/50 hover:bg-teal-300/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
                >
                  <span className="block text-sm font-bold text-white">{variant.label}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-teal-200">{money(variant.price)}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={purchaseHref}
              className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-[#74f0d8] px-7 py-3.5 text-sm font-bold text-[#04141e] shadow-[0_20px_48px_rgba(45,212,191,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/40"
            >
              {t('retaPrimaryCta')}
              <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a
              href={researchHref}
              className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200"
            >
              {t('retaSecondaryCta')}
            </a>
          </div>

          <p className="mt-5 border-l-2 border-teal-300/50 pl-3 text-xs leading-5 text-slate-300">{t('retaCompliance')}</p>
        </div>

        <div className="col-span-2 row-start-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 lg:col-span-1 lg:col-start-2">
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
