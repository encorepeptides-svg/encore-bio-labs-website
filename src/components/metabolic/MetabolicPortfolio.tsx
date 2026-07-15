import { ArrowRight, BadgeCheck, Check, ShieldCheck } from 'lucide-react'
import { coaBySlug } from '../../data/coa'
import { products, type Product } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { getPriceLabel, getStrengthSummary } from '../catalog/catalogHelpers'
import { ProductImage } from '../ProductImage'

type PortfolioMode = 'category' | 'product'
const secondarySlugs = ['tesamorelin', 'mots-c', 'aod-9604', 'cjc1295-ipamorelin'] as const

const productCopyKeys: Record<(typeof secondarySlugs)[number], { pathway: string; focus: string }> = {
  tesamorelin: { pathway: 'portfolioTesamorelinPathway', focus: 'portfolioTesamorelinFocus' },
  'mots-c': { pathway: 'portfolioMotsCPathway', focus: 'portfolioMotsCFocus' },
  'aod-9604': { pathway: 'portfolioAodPathway', focus: 'portfolioAodFocus' },
  'cjc1295-ipamorelin': { pathway: 'portfolioCjcPathway', focus: 'portfolioCjcFocus' },
}

function productBySlug(slug: string, locale: 'en' | 'es') {
  const product = products.find((entry) => entry.slug === slug)
  return product ? getLocalizedProduct(product, locale) : null
}

function DocumentationStatus({ product }: { product: Product }) {
  const { t } = useTranslation('retatrutideCategory')
  const hasCoa = Boolean(coaBySlug[product.slug])
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${hasCoa ? 'text-teal-700' : 'text-slate-500'}`}>
      {hasCoa ? <BadgeCheck size={14} aria-hidden="true" /> : <ShieldCheck size={14} aria-hidden="true" />}
      {t(hasCoa ? 'portfolioCoaOnFile' : 'portfolioDocsOnRequest')}
    </span>
  )
}

function PortfolioCard({ product, compact }: { product: Product; compact: boolean }) {
  const { path } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const copy = productCopyKeys[product.slug as keyof typeof productCopyKeys]

  return (
    <article className={`group relative grid h-full overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_18px_55px_rgba(7,23,36,0.07)] transition duration-300 hover:-translate-y-1 hover:border-teal-400/70 hover:shadow-[0_28px_75px_rgba(7,23,36,0.12)] ${compact ? '' : 'grid-cols-[0.36fr_0.64fr] sm:grid-cols-[0.42fr_0.58fr]'}`}>
      <a href={path(`/products/${product.slug}`)} className={`relative block overflow-hidden bg-[radial-gradient(circle_at_50%_28%,rgba(45,212,191,0.25),transparent_38%),linear-gradient(145deg,#f0f8f6,#e1ebea)] ${compact ? 'aspect-[4/3]' : 'min-h-full'}`} aria-label={product.name}>
        <ProductImage product={product} alt={t('portfolioImageAlt', { product: product.name })} sizes={compact ? '(min-width: 1280px) 20vw, 50vw' : '(min-width: 1024px) 21vw, 36vw'} className={`absolute inset-0 size-full object-contain drop-shadow-[0_22px_30px_rgba(7,23,36,0.2)] transition duration-500 group-hover:scale-[1.045] ${compact ? 'p-5' : 'p-2 sm:p-5'}`} />
      </a>

      <div className="flex min-w-0 flex-col p-5 sm:p-7">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.17em] text-teal-700">{copy ? t(copy.pathway) : ''}</p>
        <h3 className={`mt-2 font-semibold tracking-[-0.05em] text-[#071724] ${compact ? 'text-2xl' : 'text-3xl'}`}>{product.name}</h3>
        <ul className="mt-5 grid gap-2.5" aria-label={t('portfolioHighlightsLabel')}>
          {product.catalogHighlights.slice(0, 3).map((highlight) => <li key={highlight} className="flex items-start gap-2.5 text-sm font-semibold leading-5 text-slate-700"><span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800"><Check size={12} strokeWidth={3} aria-hidden="true" /></span>{highlight}</li>)}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-900/8 pt-4">
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">{getStrengthSummary(product, t)}</span>
          <DocumentationStatus product={product} />
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          <div><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-slate-400">{t('portfolioStartingPrice')}</p><p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{getPriceLabel(product, t)}</p></div>
          <a href={path(`/products/${product.slug}`)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">{t('portfolioViewProduct')}<ArrowRight size={15} aria-hidden="true" /></a>
        </div>
      </div>
    </article>
  )
}

export function MetabolicPortfolio({ mode = 'category' }: { mode?: PortfolioMode }) {
  const { locale } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const secondaryProducts = secondarySlugs.map((slug) => productBySlug(slug, locale)).filter((product): product is Product => Boolean(product))
  const productMode = mode === 'product'

  return (
    <section id="other-metabolic-pathways" className={`scroll-mt-24 px-5 sm:px-8 ${productMode ? 'bg-[#edf5f4] py-16 sm:py-20 lg:py-24' : 'bg-[#F8FAFC] py-16 sm:py-20 lg:py-24'}`}>
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{t(productMode ? 'crossSellEyebrow' : 'portfolioEyebrow')}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] text-[#071724] sm:text-5xl">{t(productMode ? 'crossSellTitle' : 'portfolioTitle')}</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{t(productMode ? 'crossSellDescription' : 'portfolioDescription')}</p>
          </div>
          {!productMode ? <p className="max-w-sm border-l-2 border-teal-400 pl-4 text-sm font-semibold leading-6 text-slate-600">{t('portfolioSupportingNote')}</p> : null}
        </div>

        <div className={`mt-10 grid gap-5 ${productMode ? 'md:grid-cols-2 xl:grid-cols-4' : 'lg:grid-cols-2'}`}>
          {secondaryProducts.map((product) => <PortfolioCard key={product.slug} product={product} compact={productMode} />)}
        </div>
      </div>
    </section>
  )
}
