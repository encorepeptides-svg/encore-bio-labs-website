import { ArrowRight } from 'lucide-react'
import { products } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { ProductImage } from '../ProductImage'
import { Reveal } from '../Reveal'
import { getProductStrengths } from './catalogHelpers'

function ReceptorDiagram({ labels }: { labels: [string, string, string] }) {
  // Restrained "triple agonist" schematic: one molecule, three receptor nodes.
  const nodes = [
    { x: 190, y: 42, label: labels[0] },
    { x: 336, y: 210, label: labels[1] },
    { x: 44, y: 210, label: labels[2] },
  ]
  return (
    <svg viewBox="0 0 380 260" className="h-full w-full" role="img" aria-label={labels.join(' · ')}>
      <g stroke="rgba(118,228,211,0.5)" strokeWidth="1.5">
        {nodes.map((node) => (
          <line key={node.label} x1="190" y1="140" x2={node.x} y2={node.y} />
        ))}
      </g>
      <circle cx="190" cy="140" r="24" fill="rgba(20,184,166,0.9)" />
      <circle cx="190" cy="140" r="34" fill="none" stroke="rgba(118,228,211,0.45)" strokeWidth="1.5" />
      {nodes.map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="9" fill="#76e4d3" />
          <circle cx={node.x} cy={node.y} r="16" fill="none" stroke="rgba(118,228,211,0.35)" strokeWidth="1.5" />
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
  const strengths = getProductStrengths(baseProduct)

  const receptors: [string, string, string] = [
    t('retaReceptorGip'),
    t('retaReceptorGlp1'),
    t('retaReceptorGlucagon'),
  ]

  return (
    <Reveal className="relative mt-8 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#071724_0%,#0c2b33_58%,#0a1f2c_100%)] shadow-[0_24px_80px_rgba(7,23,36,0.32)]">
      <div className="molecule-field opacity-[0.16]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[-6rem] top-[-6rem] size-[24rem] rounded-full bg-teal-500/20 blur-3xl" aria-hidden="true" />

      <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,52%)_minmax(0,48%)] md:items-center md:gap-8 lg:p-9">
          {/* Text column (first on mobile) */}
          <div className="order-1">
            <span className="inline-flex items-center rounded-full border border-teal-300/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-teal-200 backdrop-blur-sm">
              {t('retaEyebrow')}
            </span>
            <h2 className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-teal-300/80">{t('retaTitle')}</h2>

            <blockquote className="mt-3 max-w-xl text-[clamp(1.8rem,1.1rem+2.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-white">
              {t('retaPullQuote')}
            </blockquote>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{t('retaBody')}</p>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300/70">{t('retaReceptorsLabel')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {receptors.map((receptor) => (
                  <span
                    key={receptor}
                    className="inline-flex items-center rounded-full border border-teal-300/25 bg-teal-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-teal-100"
                  >
                    {receptor}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300/70">{t('retaStrengthsLabel')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {strengths.map((strength) => (
                  <span
                    key={strength}
                    className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={path(`/products/${product.slug}`)}
                className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-teal-400 px-7 py-3.5 text-sm font-semibold text-[#071724] shadow-[0_18px_44px_rgba(20,184,166,0.25)] transition duration-300 hover:-translate-y-0.5 hover:bg-teal-300"
              >
                {t('retaPrimaryCta')}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href={path(`/products/${product.slug}#retatrutide-purchase`)}
                className="inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white/12"
              >
                {t('retaSecondaryCta')}
              </a>
            </div>

            <p className="mt-6 text-xs leading-5 text-slate-400">{t('retaCompliance')}</p>
          </div>

          {/* Visual column */}
          <div className="order-2 relative mx-auto flex w-full max-w-[26rem] flex-col items-center gap-3">
            <div className="relative aspect-[3/2] w-full">
              <div
                className="absolute inset-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_50%_40%,rgba(118,228,211,0.28),transparent_66%)]"
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <ProductImage
                  product={product}
                  alt={t('retaVisualAlt')}
                  sizes="(min-width: 1024px) 30vw, 78vw"
                  className="max-h-full w-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.4)]"
                />
              </div>
            </div>
            <div className="w-full max-w-[20rem] rounded-2xl border border-white/12 bg-white/5 p-3.5 backdrop-blur-sm">
              <ReceptorDiagram labels={receptors} />
            </div>
          </div>
        </div>
      </Reveal>
  )
}
