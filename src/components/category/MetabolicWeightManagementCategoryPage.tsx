import { ArrowRight, BadgeCheck, FileCheck2, FlaskConical, ShieldCheck } from 'lucide-react'
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

      <section className="relative overflow-hidden bg-[#030b18] px-5 pb-16 pt-10 text-white sm:px-8 sm:pb-20 lg:min-h-[calc(100svh-9rem)] lg:flex lg:items-center lg:py-16">
        <picture>
          <source type="image/avif" srcSet={`${heroArtworkAvif768} 768w, ${heroArtworkAvif1586} 1586w`} sizes="100vw" />
          <source type="image/webp" srcSet={`${heroArtworkWebp768} 768w, ${heroArtworkWebp1586} 1586w`} sizes="100vw" />
          <img src={heroArtworkWebp1586} alt="" width="1586" height="1024" fetchPriority="high" className="absolute inset-0 size-full object-cover object-[68%_center] opacity-60" />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#030b18_0%,rgba(3,11,24,0.98)_38%,rgba(3,11,24,0.62)_70%,rgba(3,11,24,0.25)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_46%,rgba(34,211,238,0.18),transparent_28%)]" />

        <div className="relative mx-auto grid w-full max-w-[88rem] gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="inline-flex rounded-full border border-teal-200/25 bg-teal-200/10 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-teal-100">{t('heroEyebrow')}</p>
            <h1 className="mt-6 text-[clamp(3rem,7.3vw,6.7rem)] font-semibold leading-[0.87] tracking-[-0.07em] text-white">{t('heroTitle')}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{t('heroDescription')}</p>

            <div className="mt-7 flex flex-wrap gap-2 pr-12 sm:pr-0">
              <span className="rounded-full border border-teal-200/20 bg-white/8 px-3 py-2 text-xs font-bold text-teal-100">GIP</span>
              <span className="rounded-full border border-teal-200/20 bg-white/8 px-3 py-2 text-xs font-bold text-teal-100">GLP-1</span>
              <span className="rounded-full border border-teal-200/20 bg-white/8 px-3 py-2 text-xs font-bold text-teal-100">{t('glucagonTitle')}</span>
              <span className="rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-2 text-xs font-bold text-amber-50">{t('statusBadge')}</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 pr-12 sm:flex-row sm:flex-wrap sm:pr-0">
              <a href={purchaseHref} onClick={() => track('retatrutide_category_purchase_click', { locale })} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-7 py-3.5 text-sm font-bold text-[#071724] shadow-[0_18px_44px_rgba(45,212,191,0.25)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/40">{t('categoryPrimaryCta')}<ArrowRight size={17} aria-hidden="true" /></a>
              <a href="#other-metabolic-pathways" className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 bg-white/8 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">{t('categorySecondaryCta')}</a>
            </div>
            <p className="mt-7 max-w-2xl border-l-2 border-teal-300/60 pl-4 text-xs font-semibold leading-6 text-slate-300 sm:text-sm">{t('researchUseNotice')}</p>
          </div>

          <div className="relative mx-auto w-full max-w-[38rem]">
            <div className="absolute inset-[8%] rounded-full bg-teal-300/15 blur-3xl" aria-hidden="true" />
            <div className="relative aspect-square">
              <ProductImage product={product} alt={t('categoryProductImageAlt')} loading="eager" sizes="(min-width: 1024px) 42vw, 90vw" className="size-full object-contain drop-shadow-[0_38px_46px_rgba(0,0,0,0.5)]" />
            </div>

            <div className="relative -mt-10 border border-white/15 bg-[#071724]/88 p-5 shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
              <div className="flex items-end justify-between gap-5"><div><p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-teal-200">{t('quickSelectEyebrow')}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Retatrutide</h2></div><p className="text-right text-sm text-slate-300">{t('portfolioFrom')} <strong className="block text-2xl text-white">{money(lowestPrice)}</strong></p></div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {product.variants.map((variant) => <a key={variant.sku} href={purchaseHref} className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 transition hover:border-teal-200/50 hover:bg-teal-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"><span className="block text-sm font-bold text-white">{variant.label}</span><span className="mt-1 block text-xs font-semibold text-teal-200">{money(variant.price)}</span></a>)}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300"><ShieldCheck size={15} aria-hidden="true" />{t('documentationByRequest')}</span><a href={researchHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal-200 underline-offset-4 hover:underline">{t('categoryResearchCta')}<ArrowRight size={15} aria-hidden="true" /></a></div>
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
