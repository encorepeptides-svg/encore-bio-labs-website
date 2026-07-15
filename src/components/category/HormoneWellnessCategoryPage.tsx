import {
  ArrowRight,
  Check,
  CircleDot,
  GitBranch,
  Layers3,
  MoonStar,
  PackageCheck,
  Waypoints,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { products, type Product, type ResearchArea } from '../../data/products'
import { localizedFormatLabel } from '../../data/productTranslations'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import { ProductImage } from '../ProductImage'
import { FAQAccordion } from '../content/EditorialModules'
import { CategoryBreadcrumb } from './CategoryPageSections'

const HORMONE_PRODUCT_SLUGS = ['kisspeptin', 'hcg', 'hgh-191aa', 'igf1-lr3', 'dsip', 'pt-141'] as const

const hormoneProducts = HORMONE_PRODUCT_SLUGS
  .map((slug) => products.find((product) => product.slug === slug))
  .filter((product): product is Product => Boolean(product))

const pathwayConfigs = [
  {
    key: 'reproductive',
    slugs: ['kisspeptin', 'hcg'],
    icon: GitBranch,
    accent: 'border-rose-200 bg-rose-50 text-rose-900',
    iconAccent: 'bg-rose-100 text-rose-700',
    lineAccent: 'bg-rose-400',
  },
  {
    key: 'growth',
    slugs: ['hgh-191aa', 'igf1-lr3'],
    icon: Layers3,
    accent: 'border-teal-200 bg-teal-50 text-teal-950',
    iconAccent: 'bg-teal-100 text-teal-800',
    lineAccent: 'bg-teal-500',
  },
  {
    key: 'sleep',
    slugs: ['dsip'],
    icon: MoonStar,
    accent: 'border-indigo-200 bg-indigo-50 text-indigo-950',
    iconAccent: 'bg-indigo-100 text-indigo-700',
    lineAccent: 'bg-indigo-400',
  },
  {
    key: 'melanocortin',
    slugs: ['pt-141'],
    icon: Waypoints,
    accent: 'border-amber-200 bg-amber-50 text-amber-950',
    iconAccent: 'bg-amber-100 text-amber-800',
    lineAccent: 'bg-amber-400',
  },
] as const

const statistics = [
  {
    key: 'Who',
    url: 'https://www.who.int/news/item/04-04-2023-1-in-6-people-globally-affected-by-infertility/',
    barClass: 'w-[17.5%]',
  },
  {
    key: 'Cdc',
    url: 'https://www.cdc.gov/nchs/products/databriefs/db559.htm',
    barClass: 'w-[30.5%]',
  },
  {
    key: 'Niddk',
    url: 'https://www.niddk.nih.gov/health-information/urologic-diseases/erectile-dysfunction/definition-facts',
    barClass: 'w-4/5',
  },
] as const

function SectionIntro({ eyebrow, title, description, inverted = false }: { eyebrow: string; title: string; description?: string; inverted?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${inverted ? 'text-teal-200' : 'text-teal-700'}`}>{eyebrow}</p>
      <h2 className={`mt-4 text-3xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-4xl lg:text-5xl ${inverted ? 'text-white' : 'text-[#071724]'}`}>{title}</h2>
      {description ? <p className={`mt-4 max-w-2xl text-base leading-7 sm:text-lg ${inverted ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p> : null}
    </div>
  )
}

function SectionShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`px-5 py-14 sm:px-8 sm:py-16 lg:py-20 ${className}`}><div className="mx-auto max-w-[88rem]">{children}</div></section>
}

function getProduct(slug: string) {
  return hormoneProducts.find((product) => product.slug === slug)
}

export function HormoneWellnessCategoryPage({ area }: { area: ResearchArea }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('hormoneWellness')
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  function getStartingPrice(product: Product) {
    return Math.min(...product.variants.map((variant) => variant.price))
  }

  function getVariantLabel(label: string) {
    if (label === 'Published Format') return t('publishedFormat')
    if (label === '4 × 15 IU vials') return t('fourByFifteenIu')
    return label
  }

  function getFormatSummary(product: Product) {
    return product.variants
      .map((variant) => `${getVariantLabel(variant.label)} · ${localizedFormatLabel(variant.format, locale)}`)
      .join(', ')
  }

  const faqItems = [1, 2, 3, 4, 5].map((index) => ({
    question: t(`faq${index}Question`),
    answer: t(`faq${index}Answer`),
  }))

  return (
    <main id="main-content" className="hormone-wellness-page overflow-x-clip bg-[#F8FAFC]">
      <CategoryBreadcrumb area={area} />

      <section className="relative overflow-hidden bg-[#071724] px-5 pb-14 pt-8 text-white sm:px-8 sm:pb-16 lg:pb-20 lg:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_25%,rgba(45,212,191,0.18),transparent_30%),linear-gradient(135deg,rgba(15,118,110,0.08),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[0.93fr_1.07fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-teal-300/25 bg-teal-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-100">{t('eyebrow')}</p>
            <h1 className="mt-6 max-w-3xl text-[clamp(2.55rem,7vw,5.25rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-white">{t('heroTitle')}</h1>
            <div className="mt-5 grid grid-cols-3 gap-2 md:hidden" aria-label={t('heroVisualLabel')}>
              {hormoneProducts.slice(0, 3).map((product) => (
                <a key={product.slug} href={path(`/products/${product.slug}`)} className="rounded-xl border border-white/12 bg-white p-1.5 text-center">
                  <ProductImage product={product} alt={t('heroProductAlt', { product: product.name })} loading="eager" sizes="30vw" width={160} height={160} className="aspect-square w-full object-contain" />
                  <span className="block truncate pb-1 text-[0.6rem] font-bold text-[#071724]">{product.name}</span>
                </a>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{t('heroDescription')}</p>
            <div className="mt-8 flex flex-col gap-3 pr-16 sm:flex-row sm:flex-wrap sm:pr-0">
              <a href="#hormone-products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] shadow-[0_18px_44px_rgba(45,212,191,0.22)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/40">
                {t('primaryCta')}<ArrowRight size={16} aria-hidden="true" />
              </a>
              <a href={path('/intake')} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">{t('secondaryCta')}</a>
            </div>
            <p className="mt-7 max-w-2xl border-l-2 border-teal-300/60 pl-4 pr-16 text-xs font-semibold leading-6 text-slate-300 sm:pr-0 sm:text-sm">{t('proofLine')}</p>
          </div>

          <div className="relative rounded-[2rem] border border-white/12 bg-white/7 p-4 shadow-[0_32px_100px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-100">{t('heroVisualLabel')}</p>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300"><CircleDot size={13} aria-hidden="true" />6</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {hormoneProducts.map((product) => (
                <a key={product.slug} href={path(`/products/${product.slug}`)} className="group min-w-0 overflow-hidden rounded-2xl border border-white/12 bg-white p-2 text-center shadow-[0_16px_34px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:border-teal-200 sm:p-3">
                  <ProductImage product={product} alt={t('heroProductAlt', { product: product.name })} loading="eager" sizes="(min-width: 1024px) 12vw, 28vw" width={240} height={240} className="mx-auto aspect-square h-auto w-full object-contain" />
                  <span className="mt-1 block truncate text-[0.65rem] font-bold text-[#071724] sm:text-xs">{product.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionShell className="bg-white">
        <SectionIntro eyebrow={t('pathwaysEyebrow')} title={t('pathwaysTitle')} description={t('pathwaysDescription')} />
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {pathwayConfigs.map((pathway) => {
            const Icon = pathway.icon
            const pathwayProducts = pathway.slugs.map(getProduct).filter((product): product is Product => Boolean(product))
            return (
              <article key={pathway.key} className={`group relative overflow-hidden rounded-[1.75rem] border p-5 shadow-[0_18px_45px_rgba(7,23,36,0.06)] sm:p-6 ${pathway.accent}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${pathway.iconAccent}`}><Icon size={21} aria-hidden="true" /></span>
                  <div className="flex -space-x-5" aria-hidden="true">
                    {pathwayProducts.map((product) => <ProductImage key={product.slug} product={product} alt="" sizes="84px" width={84} height={84} className="size-16 rounded-full border-2 border-white bg-white object-contain p-1 shadow-md transition group-hover:-translate-y-1 sm:size-20" />)}
                  </div>
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em] text-[#071724] sm:text-2xl">{t(`pathway.${pathway.key}.title`)}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{t(`pathway.${pathway.key}.description`)}</p>
                <p className="mt-4 text-sm font-bold text-[#071724]">{pathwayProducts.map((product) => product.name).join(' + ')}</p>
                <a href={`#hormone-product-${pathway.slugs[0]}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200">
                  {t('seeOptions')}<ArrowRight size={15} aria-hidden="true" />
                </a>
              </article>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell className="bg-[#eef4f3]" >
        <div id="hormone-products" className="scroll-mt-24">
          <SectionIntro eyebrow={t('productsEyebrow')} title={t('productsTitle')} description={t('productsDescription')} />
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {hormoneProducts.map((product) => (
              <article id={`hormone-product-${product.slug}`} key={product.slug} className="scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_22px_58px_rgba(7,23,36,0.08)]">
                <div className="relative h-64 overflow-hidden bg-[radial-gradient(circle_at_50%_26%,rgba(45,212,191,0.2),transparent_36%),linear-gradient(145deg,#ffffff,#e9f1f0)]">
                  <ProductImage product={product} alt={t('heroProductAlt', { product: product.name })} sizes="(min-width: 1280px) 29vw, (min-width: 768px) 45vw, 100vw" width={600} height={600} className="absolute inset-0 size-full object-contain p-5" />
                  {product.purchaseRules.kitEligible ? <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-teal-700/15 bg-white/90 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-teal-800 shadow-sm backdrop-blur"><PackageCheck size={13} aria-hidden="true" />{t('completeKitEligible')}</span> : null}
                </div>
                <div className="flex min-h-[25rem] flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-semibold tracking-[-0.045em] text-[#071724]">{product.name}</h3>
                    <div className="shrink-0 text-right"><span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500">{t('startingAt')}</span><strong className="mt-1 block text-2xl text-teal-800">{money.format(getStartingPrice(product))}</strong></div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{t(`productFocus.${product.slug}`)}</p>
                  <dl className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="flex items-start justify-between gap-4"><dt className="font-semibold text-slate-500">{t('formatLabel')}</dt><dd className="text-right font-semibold text-[#071724]">{getFormatSummary(product)}</dd></div>
                    <div className="flex items-center justify-between gap-4"><dt className="font-semibold text-slate-500">{product.variants.length === 1 ? t('oneOption') : t('multipleOptions', { count: product.variants.length })}</dt><dd className="flex items-center gap-1 text-xs font-bold text-teal-800"><Check size={14} aria-hidden="true" />{product.purchaseRules.kitEligible ? t('completeKitEligible') : ''}</dd></div>
                  </dl>
                  <div className="mt-auto pt-6">
                    <a href={path(`/products/${product.slug}#purchase-options-${product.slug}`)} className="inline-flex min-h-12 w-[calc(100%-4rem)] items-center justify-center gap-2 rounded-full bg-[#071724] px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 sm:w-full">{t('chooseOptions')}<ArrowRight size={16} aria-hidden="true" /></a>
                    <a href={path(`/products/${product.slug}`)} className="mt-3 inline-flex min-h-10 w-[calc(100%-4rem)] items-center justify-center text-sm font-bold text-teal-800 underline decoration-teal-300 underline-offset-4 transition hover:text-[#071724] sm:w-full">{t('seeResearchDetails')}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell className="bg-[#071724] text-white">
        <SectionIntro inverted eyebrow={t('statisticsEyebrow')} title={t('statisticsTitle')} description={t('statisticsDescription')} />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {statistics.map((stat) => (
            <article key={stat.key} className="rounded-[1.75rem] border border-white/12 bg-white/7 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-7">
              <strong className="block text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-none tracking-[-0.065em] text-white">{t(`stat${stat.key}Value`)}</strong>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true"><span className={`block h-full rounded-full bg-[#28e0c1] ${stat.barClass}`} /></div>
              <p className="mt-6 min-h-20 text-base leading-7 text-slate-200">{t(`stat${stat.key}Body`)}</p>
              <a href={stat.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-200 underline decoration-teal-500/60 underline-offset-4 transition hover:text-white">{t(`stat${stat.key}Source`)} · {t('viewSource')}<ArrowRight size={14} aria-hidden="true" /></a>
            </article>
          ))}
        </div>
        <p className="mt-7 max-w-5xl rounded-2xl border border-amber-200/20 bg-amber-100/10 p-4 text-sm font-semibold leading-6 text-amber-50">{t('statisticsDisclaimer')}</p>
      </SectionShell>

      <SectionShell className="bg-white">
        <SectionIntro eyebrow={t('pathwayMapEyebrow')} title={t('pathwayMapTitle')} description={t('pathwayMapDescription')} />
        <div className="mt-9 grid gap-4">
          {pathwayConfigs.map((pathway) => {
            const Icon = pathway.icon
            const pathwayProducts = pathway.slugs.map(getProduct).filter((product): product is Product => Boolean(product))
            return (
              <article key={pathway.key} className="relative overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-[#f8fafc] p-5 shadow-[0_14px_36px_rgba(7,23,36,0.05)] sm:p-6">
                <span className={`absolute inset-y-0 left-0 w-1.5 ${pathway.lineAccent}`} />
                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.9fr_0.9fr_0.68fr] lg:items-center">
                  <div className="rounded-xl bg-white p-4"><span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">{t('stepQuestion')}</span><p className="mt-2 text-sm font-semibold leading-6 text-[#071724]">{t(`question.${pathway.key}`)}</p></div>
                  <div className="relative rounded-xl bg-white p-4 lg:before:absolute lg:before:-left-4 lg:before:top-1/2 lg:before:-translate-y-1/2 lg:before:text-slate-300 lg:before:content-['→']"><span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">{t('stepPathway')}</span><p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#071724]"><Icon size={16} aria-hidden="true" />{t(`pathway.${pathway.key}.title`)}</p></div>
                  <div className="relative rounded-xl bg-white p-4 lg:before:absolute lg:before:-left-4 lg:before:top-1/2 lg:before:-translate-y-1/2 lg:before:text-slate-300 lg:before:content-['→']"><span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">{t('stepCompounds')}</span><p className="mt-2 text-sm font-bold text-[#071724]">{pathwayProducts.map((product) => product.name).join(' + ')}</p></div>
                  <div className="relative lg:before:absolute lg:before:-left-4 lg:before:top-1/2 lg:before:-translate-y-1/2 lg:before:text-slate-300 lg:before:content-['→']"><span className="sr-only">{t('stepCompare')}</span><a href="#hormone-comparison" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#071724] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700">{t('compareNow')}<ArrowRight size={14} aria-hidden="true" /></a></div>
                </div>
              </article>
            )
          })}
        </div>
      </SectionShell>

      <SectionShell className="bg-[#eef4f3]">
        <div id="hormone-comparison" className="scroll-mt-24">
          <SectionIntro eyebrow={t('comparisonEyebrow')} title={t('comparisonTitle')} description={t('comparisonDescription')} />
          <div className="mt-9 hidden overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white shadow-[0_20px_55px_rgba(7,23,36,0.07)] md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#071724] text-white"><tr>{['productColumn', 'focusColumn', 'optionsColumn', 'priceColumn', 'actionColumn'].map((key) => <th key={key} scope="col" className="px-5 py-4 text-xs font-bold uppercase tracking-[0.1em]">{t(key)}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-200">
                {hormoneProducts.map((product) => <tr key={product.slug} className="align-top transition hover:bg-teal-50/40"><th scope="row" className="px-5 py-5 text-base font-bold text-[#071724]">{product.name}</th><td className="max-w-sm px-5 py-5 leading-6 text-slate-600">{t(`productFocus.${product.slug}`)}</td><td className="px-5 py-5 font-semibold leading-6 text-slate-700">{getFormatSummary(product)}</td><td className="whitespace-nowrap px-5 py-5 text-lg font-bold text-teal-800">{money.format(getStartingPrice(product))}</td><td className="px-5 py-5"><a href={path(`/products/${product.slug}#purchase-options-${product.slug}`)} className="inline-flex items-center gap-1.5 font-bold text-[#071724] underline decoration-teal-400 underline-offset-4">{t('chooseOptions')}<ArrowRight size={14} aria-hidden="true" /></a></td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="mt-7 grid gap-3 md:hidden">
            {hormoneProducts.map((product) => <article key={product.slug} className="rounded-2xl border border-slate-900/10 bg-white p-5 shadow-sm"><div className="flex items-baseline justify-between gap-4"><h3 className="text-lg font-bold text-[#071724]">{product.name}</h3><strong className="text-xl text-teal-800">{money.format(getStartingPrice(product))}</strong></div><p className="mt-3 text-sm leading-6 text-slate-600">{t(`productFocus.${product.slug}`)}</p><p className="mt-3 text-xs font-semibold leading-5 text-slate-500">{getFormatSummary(product)}</p><a href={path(`/products/${product.slug}#purchase-options-${product.slug}`)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 py-2.5 text-sm font-bold text-white">{t('chooseOptions')}<ArrowRight size={14} aria-hidden="true" /></a></article>)}
          </div>
        </div>
      </SectionShell>

      <SectionShell className="bg-white">
        <SectionIntro eyebrow={t('kitEyebrow')} title={t('kitTitle')} description={t('kitDescription')} />
        <EncoreCompleteKit variant="full" showClosingMessage className="mt-9" />
      </SectionShell>

      <div className="bg-[#F8FAFC] py-6 sm:py-10">
        <FAQAccordion eyebrow={t('faqEyebrow')} title={t('faqTitle')} items={faqItems} cta={{ label: t('seeAllFaqs'), href: '/faq' }} />
      </div>

      <section className="bg-[#071724] px-5 pb-32 pt-16 text-white sm:px-8 sm:pb-20 lg:py-24">
        <div className="mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_85%_30%,rgba(45,212,191,0.2),transparent_32%),rgba(255,255,255,0.05)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.22)] sm:p-9 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{t('finalEyebrow')}</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">{t('finalTitle')}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{t('finalDescription')}</p>
          <div className="mt-8 flex flex-col gap-3 pr-16 sm:flex-row sm:flex-wrap sm:pr-0">
            <a href="#hormone-products" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#28e0c1] px-6 py-3 text-sm font-bold text-[#071724] transition hover:bg-white">{t('primaryCta')}<ArrowRight size={16} aria-hidden="true" /></a>
            <a href={path('/intake')} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/12">{t('secondaryCta')}</a>
          </div>
          <p className="mt-8 flex items-start gap-2 border-t border-white/12 pt-5 text-sm font-bold leading-6 text-slate-200"><Check size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-300" />{t('researchNotice')}</p>
        </div>
      </section>
    </main>
  )
}
