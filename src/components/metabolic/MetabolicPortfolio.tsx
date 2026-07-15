import { ArrowRight, BadgeCheck, ShieldCheck } from 'lucide-react'
import { coaBySlug } from '../../data/coa'
import { products, type Product } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { getPriceLabel, getStrengthSummary } from '../catalog/catalogHelpers'
import { ProductImage } from '../ProductImage'

type PortfolioMode = 'category' | 'product'

const secondarySlugs = ['tesamorelin', 'mots-c', 'aod-9604', 'cjc1295-ipamorelin'] as const
const comparisonSlugs = ['retatrutide', ...secondarySlugs] as const

const productCopyKeys: Record<(typeof comparisonSlugs)[number], { pathway: string; focus: string }> = {
  retatrutide: { pathway: 'portfolioRetatrutidePathway', focus: 'portfolioRetatrutideFocus' },
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

function PortfolioCard({ product, featured }: { product: Product; featured: boolean }) {
  const { path } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const copy = productCopyKeys[product.slug as keyof typeof productCopyKeys]

  return (
    <article className={`group relative overflow-hidden border border-slate-900/10 bg-white shadow-[0_24px_70px_rgba(7,23,36,0.08)] ${featured ? 'rounded-[2rem] lg:grid lg:grid-cols-[0.88fr_1.12fr]' : 'rounded-[1.5rem]'}`}>
      <a href={path(`/products/${product.slug}`)} className={`relative block overflow-hidden bg-[radial-gradient(circle_at_50%_24%,rgba(45,212,191,0.23),transparent_38%),linear-gradient(145deg,#eff8f6,#dfe9e9)] ${featured ? 'min-h-64 lg:min-h-full' : 'aspect-[16/10]'}`} aria-label={product.name}>
        <ProductImage
          product={product}
          alt={t('portfolioImageAlt', { product: product.name })}
          sizes={featured ? '(min-width: 1024px) 32vw, 100vw' : '(min-width: 1024px) 38vw, 100vw'}
          className="absolute inset-0 size-full object-contain p-5 drop-shadow-[0_24px_32px_rgba(7,23,36,0.22)] transition duration-500 group-hover:scale-[1.035]"
        />
      </a>

      <div className={featured ? 'flex flex-col p-6 sm:p-8' : 'flex flex-col p-6'}>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-teal-700">{copy ? t(copy.pathway) : ''}</p>
        <h3 className={`mt-3 font-semibold tracking-[-0.05em] text-[#071724] ${featured ? 'text-4xl' : 'text-3xl'}`}>{product.name}</h3>
        <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{product.catalogTagline}</p>
        <p className="mt-5 border-l-2 border-teal-400 pl-3 text-sm font-semibold leading-6 text-slate-700">{copy ? t(copy.focus) : ''}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">{getStrengthSummary(product, t)}</span>
          <DocumentationStatus product={product} />
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-slate-400">{t('portfolioStartingPrice')}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{getPriceLabel(product, t)}</p>
          </div>
          <a href={path(`/products/${product.slug}`)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">
            {t('portfolioViewProduct')}<ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  )
}

function Comparison({ productsToCompare }: { productsToCompare: Product[] }) {
  const { path } = useLocale()
  const { t } = useTranslation('retatrutideCategory')

  return (
    <div id="compare-metabolic-pathways" className="mt-16 scroll-mt-24">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('comparisonEyebrow')}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-4xl">{t('comparisonTitle')}</h3>
        <p className="mt-4 text-base leading-7 text-slate-600">{t('comparisonDescription')}</p>
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_22px_65px_rgba(7,23,36,0.07)] lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{t('comparisonTitle')}</caption>
          <thead className="bg-[#071724] text-white">
            <tr>
              {['comparisonCompound', 'comparisonPathway', 'comparisonFocus', 'comparisonFormat', 'comparisonPrice', 'comparisonDocumentation', 'comparisonAction'].map((key) => (
                <th key={key} scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em]">{t(key)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/8">
            {productsToCompare.map((product) => {
              const copy = productCopyKeys[product.slug as keyof typeof productCopyKeys]
              return (
                <tr key={product.slug} className={product.slug === 'retatrutide' ? 'bg-teal-50/65' : 'bg-white'}>
                  <th scope="row" className="px-5 py-5 font-semibold text-[#071724]">{product.name}</th>
                  <td className="px-5 py-5 text-slate-600">{copy ? t(copy.pathway) : ''}</td>
                  <td className="max-w-xs px-5 py-5 leading-6 text-slate-600">{copy ? t(copy.focus) : ''}</td>
                  <td className="px-5 py-5 text-slate-600">{getStrengthSummary(product, t)}</td>
                  <td className="whitespace-nowrap px-5 py-5 font-semibold text-[#071724]">{getPriceLabel(product, t)}</td>
                  <td className="px-5 py-5"><DocumentationStatus product={product} /></td>
                  <td className="px-5 py-5"><a href={path(`/products/${product.slug}`)} className="font-bold text-teal-800 underline-offset-4 hover:underline">{t('comparisonExplore')}</a></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 lg:hidden">
        {productsToCompare.map((product) => {
          const copy = productCopyKeys[product.slug as keyof typeof productCopyKeys]
          return (
            <article key={product.slug} className={`rounded-[1.5rem] border p-5 shadow-[0_16px_45px_rgba(7,23,36,0.06)] ${product.slug === 'retatrutide' ? 'border-teal-300 bg-teal-50' : 'border-slate-900/10 bg-white'}`}>
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-teal-700">{copy ? t(copy.pathway) : ''}</p><h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{product.name}</h4></div>
                <p className="shrink-0 text-lg font-semibold text-[#071724]">{getPriceLabel(product, t)}</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{copy ? t(copy.focus) : ''}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2"><span className="text-xs font-semibold text-slate-600">{getStrengthSummary(product, t)}</span><DocumentationStatus product={product} /></div>
              <a href={path(`/products/${product.slug}`)} className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-teal-800">{t('comparisonExplore')}<ArrowRight size={15} aria-hidden="true" /></a>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export function MetabolicPortfolio({ mode = 'category' }: { mode?: PortfolioMode }) {
  const { locale } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const secondaryProducts = secondarySlugs.map((slug) => productBySlug(slug, locale)).filter((product): product is Product => Boolean(product))
  const productsToCompare = comparisonSlugs.map((slug) => productBySlug(slug, locale)).filter((product): product is Product => Boolean(product))
  const productMode = mode === 'product'

  return (
    <section id="other-metabolic-pathways" className={`scroll-mt-24 px-5 sm:px-8 ${productMode ? 'bg-[#edf5f4] py-16 sm:py-20 lg:py-24' : 'bg-[#F8FAFC] py-16 sm:py-20 lg:py-24'}`}>
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">{t(productMode ? 'crossSellEyebrow' : 'portfolioEyebrow')}</p>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.03] tracking-[-0.05em] text-[#071724] sm:text-5xl">{t(productMode ? 'crossSellTitle' : 'portfolioTitle')}</h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{t(productMode ? 'crossSellDescription' : 'portfolioDescription')}</p>
        </div>

        <div className={`mt-10 grid gap-6 ${productMode ? 'md:grid-cols-2 xl:grid-cols-4' : 'lg:grid-cols-12'}`}>
          {secondaryProducts.map((product, index) => (
            <div key={product.slug} className={productMode ? '' : index === 0 ? 'lg:col-span-7' : index === 1 ? 'lg:col-span-5' : 'lg:col-span-6'}>
              <PortfolioCard product={product} featured={!productMode && index < 2} />
            </div>
          ))}
        </div>

        {!productMode ? <Comparison productsToCompare={productsToCompare} /> : null}
      </div>
    </section>
  )
}
