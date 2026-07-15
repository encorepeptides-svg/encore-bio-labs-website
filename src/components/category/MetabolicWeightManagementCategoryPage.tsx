import { ArrowDown, ArrowRight, BadgeCheck, FileCheck2, FlaskConical, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import heroArtworkAvif1586 from '../../assets/images/research/retatrutide-triple-pathway-hero-1586.avif'
import heroArtworkAvif768 from '../../assets/images/research/retatrutide-triple-pathway-hero-768.avif'
import heroArtworkWebp1586 from '../../assets/images/research/retatrutide-triple-pathway-hero-1586.webp'
import heroArtworkWebp768 from '../../assets/images/research/retatrutide-triple-pathway-hero-768.webp'
import { products, type ResearchArea } from '../../data/products'
import { getLocalizedProduct } from '../../data/productTranslations'
import { SITE_ORIGIN } from '../../i18n/config'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { track } from '../../lib/analytics'
import { money } from '../../lib/purchaseOptions'
import { MetabolicPortfolio } from '../metabolic/MetabolicPortfolio'
import { ProductImage } from '../ProductImage'
import { RetatrutidePathways } from '../retatrutide/RetatrutidePathways'
import { CategoryBreadcrumb } from './CategoryPageSections'

function StructuredData({ areaName }: { areaName: string }) {
  const { locale, path } = useLocale()

  useEffect(() => {
    const id = 'metabolic-category-structured-data'
    document.getElementById(id)?.remove()
    const url = `${SITE_ORIGIN}${path('/categories/metabolic-weight-management')}`
    const home = `${SITE_ORIGIN}${path('/')}`
    const script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': url,
          url,
          name: locale === 'es' ? 'Investigación metabólica y control de peso' : 'Metabolic and Weight-Management Research',
          description: locale === 'es'
            ? 'Compara Retatrutide, Tesamorelin, MOTS-C, AOD-9604 y CJC-1295 + Ipamorelin por vía de investigación, formato, precio y documentación.'
            : 'Compare Retatrutide, Tesamorelin, MOTS-C, AOD-9604, and CJC-1295 + Ipamorelin by research pathway, format, price, and documentation.',
          inLanguage: locale,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: locale === 'es' ? 'Inicio' : 'Home', item: home },
            { '@type': 'ListItem', position: 2, name: areaName, item: url },
          ],
        },
      ],
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [areaName, locale, path])

  return null
}

export function MetabolicWeightManagementCategoryPage({ area }: { area: ResearchArea }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('retatrutideCategory')
  const baseProduct = products.find((product) => product.slug === 'retatrutide')
  const product = baseProduct ? getLocalizedProduct(baseProduct, locale) : null

  if (!product) return null

  const purchaseHref = path('/products/retatrutide#retatrutide-purchase')
  const researchHref = path('/products/retatrutide#retatrutide-full-research')
  const lowestPrice = Math.min(...product.variants.map((variant) => variant.price))

  return (
    <main id="main-content" className="overflow-x-clip bg-[#F8FAFC]">
      <StructuredData areaName={area.name} />
      <CategoryBreadcrumb area={area} />

      <section className="relative min-h-[calc(100svh-9rem)] overflow-hidden bg-[#030b18] px-5 pb-14 pt-8 text-white sm:px-8 lg:flex lg:items-center lg:py-16">
        <picture>
          <source type="image/avif" srcSet={`${heroArtworkAvif768} 768w, ${heroArtworkAvif1586} 1586w`} sizes="100vw" />
          <source type="image/webp" srcSet={`${heroArtworkWebp768} 768w, ${heroArtworkWebp1586} 1586w`} sizes="100vw" />
          <img src={heroArtworkWebp1586} alt={t('heroVisualAlt')} width="1586" height="1024" fetchPriority="high" className="absolute inset-0 size-full object-cover object-[62%_center] opacity-75" />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030b18_0%,rgba(3,11,24,0.96)_34%,rgba(3,11,24,0.52)_62%,rgba(3,11,24,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(34,211,238,0.14),transparent_30%)]" />

        <div className="relative mx-auto grid w-full max-w-[88rem] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-teal-200/25 bg-teal-200/10 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-teal-100">{t('heroEyebrow')}</p>
            <h1 className="mt-6 text-[clamp(2.8rem,7.8vw,6.9rem)] font-semibold leading-[0.88] tracking-[-0.07em] text-white">{t('heroTitle')}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{t('heroDescription')}</p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-100/10 px-4 py-2 text-xs font-bold text-amber-50 sm:text-sm"><ShieldAlert size={16} aria-hidden="true" />{t('statusBadge')}</p>
            <div className="mt-8 flex flex-col gap-3 pr-14 sm:flex-row sm:flex-wrap sm:pr-0">
              <a href={purchaseHref} onClick={() => track('retatrutide_category_purchase_click', { locale })} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-7 py-3.5 text-sm font-bold text-[#071724] shadow-[0_18px_44px_rgba(45,212,191,0.25)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/40">{t('categoryPrimaryCta')}<ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#other-metabolic-pathways" className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 bg-white/8 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">{t('categorySecondaryCta')}</a>
            </div>
            <p className="mt-7 max-w-2xl border-l-2 border-teal-300/60 pl-4 text-xs font-semibold leading-6 text-slate-300 sm:text-sm">{t('researchUseNotice')}</p>
          </div>

          <div className="self-end lg:pb-8">
            <p className="ml-auto max-w-sm rounded-[1.5rem] border border-white/12 bg-black/25 p-5 text-sm font-semibold leading-6 text-slate-100 shadow-[0_22px_64px_rgba(0,0,0,0.2)] backdrop-blur-sm">{t('heroVisualLabel')}</p>
          </div>
        </div>
        <a href="#retatrutide-quick-select" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 transition hover:text-white lg:inline-flex">{t('scrollCue')}<ArrowDown size={15} aria-hidden="true" /></a>
      </section>

      <section id="retatrutide-quick-select" className="scroll-mt-24 bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[88rem] overflow-hidden rounded-[2rem] border border-slate-900/10 bg-[#F8FAFC] shadow-[0_24px_70px_rgba(7,23,36,0.08)] lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div className="relative min-h-[22rem] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.2),transparent_60%)] p-6 sm:p-8 lg:min-h-[32rem]">
            <ProductImage product={product} alt={t('categoryProductImageAlt')} loading="eager" sizes="(min-width: 1024px) 36vw, 90vw" className="absolute inset-0 size-full object-contain p-6 drop-shadow-[0_30px_38px_rgba(7,23,36,0.22)] sm:p-10" />
          </div>
          <div className="border-t border-slate-900/10 p-6 sm:p-9 lg:border-l lg:border-t-0 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('quickSelectEyebrow')}</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
              <div><h2 className="text-4xl font-semibold tracking-[-0.055em] text-[#071724] sm:text-5xl">Retatrutide</h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{t('heroDescription')}</p></div>
              <p className="text-sm font-semibold text-slate-500">{t('portfolioFrom')} <strong className="ml-1 text-3xl text-[#071724]">{money(lowestPrice)}</strong></p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {product.variants.map((variant) => <a key={variant.sku} href={purchaseHref} className="rounded-2xl border border-slate-900/10 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"><span className="block text-sm font-bold text-[#071724]">{variant.label}</span><span className="mt-1 block text-sm font-semibold text-teal-700">{money(variant.price)}</span></a>)}
            </div>
            <div className="mt-8 flex flex-col gap-4 border-t border-slate-900/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ShieldCheck size={17} className="text-teal-700" aria-hidden="true" />{t('documentationByRequest')}</span>
              <a href={researchHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#071724] px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700">{t('categoryResearchCta')}<ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </section>

      <RetatrutidePathways compact />

      <section className="bg-[#071724] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">{t('categoryResearchBridgeEyebrow')}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{t('categoryResearchBridgeTitle')}</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{t('categoryResearchBridgeBody')}</p></div>
          <a href={researchHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-teal-400 px-6 py-3 text-sm font-bold text-[#071724] transition hover:bg-white">{t('categoryResearchCta')}<ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </section>

      <MetabolicPortfolio />

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[88rem]">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('confidenceEyebrow')}</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('confidenceTitle')}</h2><p className="mt-5 text-base leading-7 text-slate-600">{t('confidenceDescription')}</p></div>
          <div className="mt-10 grid gap-px overflow-hidden border border-slate-900/10 bg-slate-900/10 md:grid-cols-3">
            {[
              { icon: BadgeCheck, title: t('confidenceItem1Title'), body: t('confidenceItem1Body') },
              { icon: FileCheck2, title: t('confidenceItem2Title'), body: t('confidenceItem2Body') },
              { icon: ShieldCheck, title: t('confidenceItem3Title'), body: t('confidenceItem3Body') },
            ].map((item) => <article key={item.title} className="bg-[#F8FAFC] p-7 sm:p-8"><item.icon size={24} className="text-teal-700" aria-hidden="true" /><h3 className="mt-5 text-xl font-semibold text-[#071724]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#071724] px-5 pb-32 pt-16 text-white sm:px-8 sm:pb-20 lg:py-24">
        <div className="mx-auto grid max-w-[88rem] gap-8 border border-white/12 bg-[radial-gradient(circle_at_88%_20%,rgba(45,212,191,0.22),transparent_34%),rgba(255,255,255,0.05)] p-7 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{t('categoryFinalEyebrow')}</p><h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">{t('categoryFinalTitle')}</h2><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t('categoryFinalDescription')}</p></div>
          <div className="flex flex-col gap-3"><a href={purchaseHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] transition hover:bg-white">{t('categoryPrimaryCta')}<ArrowRight size={16} aria-hidden="true" /></a><a href={path('/catalog?category=Metabolic%20Research')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/14"><FlaskConical size={16} aria-hidden="true" />{t('categoryBrowseCta')}</a></div>
        </div>
      </section>
    </main>
  )
}
