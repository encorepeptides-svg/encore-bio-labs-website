import { ArrowRight, BadgeCheck, Boxes, CheckCircle2, ChevronDown, ExternalLink, FileCheck2, ShoppingCart, X, ZoomIn } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { coaBySlug } from '../../data/coa'
import {
  getLocalizedProtocol,
  getProtocolBySlug,
  getProtocolCategoryName,
  getRelatedProtocols,
  protocolFaqs,
  resolveProtocolComponents,
  type ProtocolConfig,
} from '../../data/protocols'
import { getLocalizedProduct, localizedFormatLabel } from '../../data/productTranslations'
import { useCart } from '../../context/useCart'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { applyDocumentMetadata } from '../../i18n/applyMetadata'
import { formatCartCurrency } from '../../lib/cart'
import { GuidedAliquotCalculator } from '../calculators/GuidedAliquotCalculator'
import { ProductImage } from '../ProductImage'
import { ProtocolBundleVisual } from './ProtocolBundleVisual'

type SelectedVariantMap = Record<string, string>

export function ProtocolDetailPage({ slug }: { slug: string }) {
  const protocol = getProtocolBySlug(slug)
  const { locale, path } = useLocale()
  const { t } = useTranslation('protocols')

  useEffect(() => {
    const localized = protocol ? getLocalizedProtocol(protocol, locale) : null
    applyDocumentMetadata(`/protocols/${slug}`, locale, localized
      ? { title: `${localized.title} | Encore Bio Labs`, description: localized.description }
      : { title: `${t('notFoundTitle')} | Encore Bio Labs`, description: t('notFoundCopy') })
  }, [locale, protocol, slug, t])

  if (!protocol) {
    return (
      <main id="main-content" className="bg-[#f8fafc] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,.08)]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('notFoundEyebrow')}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">{t('notFoundTitle')}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{t('notFoundCopy')}</p>
          <a href={path('/protocols')} className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#071724] px-6 text-sm font-bold text-white">{t('notFoundCta')}</a>
        </div>
      </main>
    )
  }

  return <ProtocolDetailContent protocol={protocol} />
}

function ProtocolDetailContent({ protocol }: { protocol: ProtocolConfig }) {
  const { locale, path } = useLocale()
  const { t } = useTranslation('protocols')
  const { addToCart } = useCart()
  const localized = getLocalizedProtocol(protocol, locale)
  const components = useMemo(() => resolveProtocolComponents(protocol), [protocol])
  const localizedComponents = components.map((entry) => ({ ...entry, product: getLocalizedProduct(entry.product, locale) }))
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariantMap>(() => Object.fromEntries(components.map((entry) => [entry.product.slug, entry.defaultVariant.label])))
  const [zoomed, setZoomed] = useState(false)

  const configuredComponents = components.map((entry) => ({
    ...entry,
    selectedVariant: entry.product.variants.find((variant) => variant.label === selectedVariants[entry.product.slug]) ?? entry.defaultVariant,
  }))
  const subtotal = configuredComponents.reduce((sum, entry) => sum + entry.selectedVariant.price * entry.config.quantity, 0)
  const availableCoas = configuredComponents.flatMap((entry) => coaBySlug[entry.product.slug] ? [{ product: entry.product, record: coaBySlug[entry.product.slug] }] : [])
  const related = getRelatedProtocols(protocol)

  useEffect(() => {
    if (!zoomed) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setZoomed(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [zoomed])

  function addConfiguredProtocol() {
    for (const component of configuredComponents) {
      addToCart(component.product, component.selectedVariant, component.config.quantity)
    }
  }

  return (
    <main id="main-content" className="bg-[#f8fafc]">
      <section className="relative isolate overflow-hidden bg-[#071724] px-5 pb-16 pt-8 text-white sm:px-8 lg:pb-24 lg:pt-12">
        <div className="molecule-field -z-20 opacity-[0.15]" aria-hidden="true" />
        <div className="absolute -right-44 top-0 -z-10 size-[36rem] rounded-full bg-teal-300/12 blur-3xl" aria-hidden="true" />
        <div className="mx-auto max-w-[88rem]">
          <nav aria-label={t('breadcrumbLabel')} className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <a href={path('/')} className="font-semibold transition hover:text-white">{t('home')}</a><span aria-hidden="true">/</span>
            <a href={path(`/protocols#protocol-category-${protocol.categorySlug}`)} className="font-semibold transition hover:text-white">{getProtocolCategoryName(protocol.categorySlug, locale)}</a><span aria-hidden="true">/</span>
            <span className="text-slate-200">{localized.title}</span>
          </nav>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_1.02fr] lg:gap-14">
            <div>
              <a href={path('/protocols')} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-200 transition hover:text-white">← {t('backToProtocols')}</a>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-teal-100/15 bg-teal-100/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-teal-100">{getProtocolCategoryName(protocol.categorySlug, locale)}</span>
                {localized.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200">{tag}</span>)}
              </div>
              <h1 className="mt-6 text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.9] tracking-[-0.07em]">{localized.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{localized.description}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.06] px-5 py-4 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">{t('currentPricing')}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{formatCartCurrency(subtotal)}</p>
                </div>
                <button type="button" onClick={addConfiguredProtocol} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-teal-300 px-7 text-sm font-bold text-[#071724] shadow-[0_18px_44px_rgba(45,212,191,.22)] transition hover:bg-white"><ShoppingCart size={18} aria-hidden="true" />{t('addProtocolToCart')}</button>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-400">{t('bundleContains', { count: components.length })}</p>
            </div>

            <div className="relative">
              <ProtocolBundleVisual protocol={protocol} alt={t('visualAlt', { protocol: localized.title, count: components.length })} priority className="border border-white/15 shadow-[0_44px_120px_rgba(0,0,0,.38)]" />
              <button type="button" onClick={() => setZoomed(true)} className="absolute bottom-5 right-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/80 bg-white/88 px-4 text-xs font-bold text-[#071724] shadow-lg backdrop-blur transition hover:bg-white" aria-label={t('zoomImage')}><ZoomIn size={16} aria-hidden="true" />{t('zoomImage')}</button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[88rem] gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_70px_rgba(7,23,36,.07)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('objectiveEyebrow')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#071724]">{t('objectiveTitle')}</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">{localized.objective}</p>
            <div className="mt-7 grid gap-3">
              <TrustRow icon={BadgeCheck} text={t('trustPricing')} />
              <TrustRow icon={Boxes} text={t('trustSku')} />
              <TrustRow icon={FileCheck2} text={t('trustDocumentation')} />
            </div>
            <a href={path('/quality')} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-teal-800 underline-offset-4 hover:underline">{t('qualityLink')}<ArrowRight size={15} aria-hidden="true" /></a>
            {availableCoas.length ? (
              <div className="mt-7 border-t border-slate-900/10 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{t('availableCoas')}</p>
                <div className="mt-3 grid gap-2">
                  {availableCoas.map(({ product, record }) => <a key={product.slug} href={record.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-between gap-3 rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900"><span>{t('viewCoa', { product: product.name })}</span><ExternalLink size={15} aria-hidden="true" /></a>)}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-slate-900/10 bg-white p-6 shadow-[0_22px_70px_rgba(7,23,36,.07)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('configureEyebrow')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#071724]">{t('configureTitle')}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{t('configureCopy')}</p>
            <div className="mt-7 divide-y divide-slate-900/10 rounded-[1.4rem] border border-slate-900/10">
              {localizedComponents.map(({ config, product, defaultVariant }) => (
                <div key={product.slug} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <a href={path(`/products/${product.slug}`)} className="text-lg font-semibold text-[#071724] underline-offset-4 hover:underline">{product.name}</a>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{t('quantity', { count: config.quantity })} · {localizedFormatLabel(defaultVariant.format, locale)}</p>
                  </div>
                  {product.variants.length > 1 ? (
                    <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      {t('variantFor', { product: product.name })}
                      <select value={selectedVariants[product.slug]} onChange={(event) => setSelectedVariants((current) => ({ ...current, [product.slug]: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-slate-900/15 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-[#071724] sm:min-w-48">
                        {product.variants.map((variant) => <option key={variant.sku ?? variant.label} value={variant.label}>{variant.label} · {formatCartCurrency(variant.price)}</option>)}
                      </select>
                    </label>
                  ) : <span className="rounded-full bg-[#f1f5f4] px-4 py-2 text-sm font-semibold text-slate-600">{product.variants[0].label} · {formatCartCurrency(product.variants[0].price)}</span>}
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-5 rounded-[1.35rem] bg-[#071724] p-5 text-white">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">{t('currentSubtotal')}</p><p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{formatCartCurrency(subtotal)}</p></div>
              <button type="button" onClick={addConfiguredProtocol} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-teal-300 px-6 text-sm font-bold text-[#071724] transition hover:bg-white"><ShoppingCart size={17} aria-hidden="true" />{t('addProtocolToCart')}</button>
            </div>
            <div className="mt-5 rounded-[1.2rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>{t('fulfillmentTitle')}:</strong> {t('fulfillmentCopy')}</div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef3f2] px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('educationEyebrow')}</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">{t('educationTitle')}</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="rounded-[1.7rem] bg-[#071724] p-7 text-white">
              {localized.education.map((paragraph) => <p key={paragraph} className="mt-4 first:mt-0 text-base leading-8 text-slate-200">{paragraph}</p>)}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{t('componentDetails')}</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {localizedComponents.map(({ product }) => (
                  <article key={product.slug} className="grid grid-cols-[5.5rem_1fr] items-center gap-4 rounded-[1.4rem] border border-slate-900/10 bg-white p-4">
                    <div className="aspect-square rounded-xl bg-[#f3f7f6] p-1"><ProductImage product={product} alt="" sizes="88px" className="size-full object-contain" /></div>
                    <div><h4 className="font-semibold text-[#071724]">{product.name}</h4><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{product.shortDescription}</p><a href={path(`/products/${product.slug}`)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-800">{t('viewProduct', { product: product.name })}<ArrowRight size={13} aria-hidden="true" /></a></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[88rem]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('calculatorEyebrow')}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">{t('calculatorTitle')}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{t('calculatorIntro')}</p>
          <GuidedAliquotCalculator productSlugs={components.map((entry) => entry.product.slug)} defaultProductSlug={components[0].product.slug} secondaryHref="/catalog" className="mt-8" />
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('specificationsEyebrow')}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">{t('specificationsTitle')}</h2>
          </div>
          <dl className="divide-y divide-slate-900/10 overflow-hidden rounded-[1.5rem] border border-slate-900/10">
            {[
              [t('specFormat'), t('specFormatValue')],
              [t('specContents'), t('specContentsValue', { count: components.length })],
              [t('specStorage'), t('specStorageValue')],
              [t('specBatch'), t('specBatchValue')],
              [t('specPricing'), t('specPricingValue')],
            ].map(([label, value]) => <div key={label} className="grid gap-2 p-5 sm:grid-cols-[10rem_1fr]"><dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</dt><dd className="text-sm leading-6 text-[#071724]">{value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-[74rem]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('faqEyebrow')}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#071724]">{t('faqTitle')}</h2>
          <div className="mt-8 divide-y divide-slate-900/10 overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white">
            {protocolFaqs[locale].map((item) => <details key={item.question} className="group p-5 open:bg-[#f5f8f7]"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-[#071724]">{item.question}<ChevronDown size={18} aria-hidden="true" className="shrink-0 text-teal-700 transition group-open:rotate-180" /></summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p></details>)}
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="bg-[#071724] px-5 py-14 text-white sm:px-8 lg:py-20">
          <div className="mx-auto max-w-[88rem]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{t('relatedEyebrow')}</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{t('relatedTitle')}</h2>
            <div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4">
              {related.map((candidate) => {
                const item = getLocalizedProtocol(candidate, locale)
                return <a key={candidate.slug} href={path(`/protocols/${candidate.slug}`)} className="min-w-[min(82vw,24rem)] snap-start rounded-[1.5rem] border border-white/12 bg-white/[0.06] p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"><p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">{getProtocolCategoryName(candidate.categorySlug, locale)}</p><h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{item.tagline}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-200">{t('viewProtocol')}<ArrowRight size={15} aria-hidden="true" /></span></a>
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[88rem] items-start gap-4 rounded-[1.6rem] border border-teal-900/10 bg-teal-50 p-6 text-teal-950">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div><h2 className="font-semibold">{t('disclaimerTitle')}</h2><p className="mt-2 text-sm leading-6">{t('disclaimerCopy')}</p></div>
        </div>
      </section>

      {zoomed ? (
        <div role="dialog" aria-modal="true" aria-label={t('zoomImage')} className="fixed inset-0 z-[100] grid place-items-center bg-[#020810]/88 p-4 backdrop-blur-xl" onMouseDown={(event) => { if (event.target === event.currentTarget) setZoomed(false) }}>
          <div className="relative w-full max-w-5xl">
            <button type="button" onClick={() => setZoomed(false)} className="absolute right-3 top-3 z-10 grid size-12 place-items-center rounded-full bg-white text-[#071724] shadow-xl" aria-label={t('closeImage')}><X size={20} aria-hidden="true" /></button>
            <ProtocolBundleVisual protocol={protocol} alt={t('visualAlt', { protocol: localized.title, count: components.length })} priority className="min-h-[70vh] border border-white/15" />
          </div>
        </div>
      ) : null}
    </main>
  )
}

function TrustRow({ icon: Icon, text }: { icon: typeof BadgeCheck; text: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-[#f3f7f6] px-4 py-3 text-sm font-semibold text-[#071724]"><Icon size={18} className="text-teal-700" aria-hidden="true" />{text}</div>
}
