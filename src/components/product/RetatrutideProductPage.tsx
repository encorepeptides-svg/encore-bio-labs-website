import {
  ArrowRight,
  Check,
  ChevronDown,
  ShoppingCart,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useCart } from '../../context/useCart'
import type { Product, ProductVariant } from '../../data/products'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import {
  changePurchaseOption,
  getDefaultPurchaseSelection,
  getKitPremium,
  getRetatrutideVariantBadge,
  money,
  quotePurchase,
  unitMoney,
  type PurchaseOptionId,
  type PurchaseSelection,
} from '../../lib/purchaseOptions'
import { cn } from '../../lib/utils'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import { MetabolicPortfolio } from '../metabolic/MetabolicPortfolio'
import { RetatrutidePathways } from '../retatrutide/RetatrutidePathways'
import { RetatrutideResearchContext } from '../retatrutide/RetatrutideResearchContext'
import { ProductBreadcrumb, ProductHero } from './ProductPageSections'
import { RetatrutideBenefitsSection } from './retatrutide/RetatrutideBenefitsSection'
import { RetatrutideEvidenceStrip } from './retatrutide/RetatrutideEvidenceStrip'
import { RetatrutideQualitySection } from './retatrutide/RetatrutideQualitySection'

function PurchaseConfigurator({
  product,
  variant,
  selection,
  onVariantChange,
  onSelectionChange,
}: {
  product: Product
  variant: ProductVariant
  selection: PurchaseSelection
  onVariantChange: (variant: ProductVariant) => void
  onSelectionChange: (selection: PurchaseSelection) => void
}) {
  const { addToCart } = useCart()
  const { locale } = useLocale()
  const { t } = useTranslation('retatrutide')
  const quote = useMemo(() => quotePurchase(product, variant, selection), [product, selection, variant])

  function selectPurchaseType(optionId: PurchaseOptionId) {
    onSelectionChange(changePurchaseOption(product, selection, optionId))
  }

  function addConfiguredOrder() {
    addToCart(product, variant, 1, selection)
  }

  const options: Array<{ id: PurchaseOptionId; title: string; note: string; price: string }> = [
    { id: 'vial-only', title: t('vialOnlyTitle'), note: t('vialOnlyNote'), price: money(variant.price) },
    { id: 'complete-kit', title: t('completeKitTitle'), note: t('completeKitNote'), price: money(variant.price + getKitPremium(product)) },
    { id: 'multipack', title: t('researchPackTitle'), note: t('researchPackNote'), price: `${t('fromPrice').split(' ')[0]} ${money(quotePurchase(product, variant, { optionId: 'multipack', packSize: 2, includeKit: false }).linePrice)}` },
  ]

  return (
    <div id="retatrutide-purchase" className="scroll-mt-28 rounded-[2rem] bg-white p-5 shadow-[0_28px_90px_rgba(7,23,36,0.1)] sm:p-8 lg:p-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{t('selectFormat')}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#071724]">{t('chooseStrength')}</h2>
        </div>
        <p className="text-sm text-slate-500">{t('fiveFormats')}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {product.variants.map((entry) => {
          const active = entry === variant
          const badge = getRetatrutideVariantBadge(product, entry, locale)
          return (
            <button
              key={entry.sku}
              type="button"
              aria-pressed={active}
              onClick={() => onVariantChange(entry)}
              className={cn(
                'group relative flex h-36 flex-col items-start justify-between rounded-[1.35rem] border p-4 text-left outline-none transition duration-300 hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-teal-100 sm:p-5',
                active
                  ? 'border-teal-700 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-[0_16px_40px_rgba(13,148,136,0.14)]'
                  : 'border-slate-900/8 bg-[#fbfcfc] hover:border-teal-600/30 hover:bg-white hover:shadow-[0_14px_36px_rgba(7,23,36,0.08)]',
              )}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className="text-2xl font-semibold tracking-[-0.045em] text-[#071724]">{entry.label}</span>
                <span className={cn('mt-1 size-3 rounded-full border', active ? 'border-teal-700 bg-teal-600 shadow-[0_0_0_4px_rgba(20,184,166,0.12)]' : 'border-slate-300 bg-white')} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-700">{money(entry.price)}</span>
                {badge ? <span className="mt-1 block text-[0.6rem] font-bold uppercase tracking-[0.12em] text-teal-700">{badge}</span> : <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.12em] text-slate-400">{t('vialFormat')}</span>}
              </span>
            </button>
          )
        })}
      </div>

      <fieldset className="mt-7">
        <legend className="text-sm font-semibold text-[#071724]">{t('chooseYourPurchaseOption')}</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {options.map((option) => {
            const active = selection.optionId === option.id
            return (
              <label key={option.id} className={cn('cursor-pointer rounded-[1.25rem] border p-4 transition hover:-translate-y-0.5', active ? 'border-teal-700 bg-teal-50/70' : 'border-slate-900/8 bg-white hover:border-teal-700/30')}>
                <input type="radio" name="retatrutide-purchase-type" value={option.id} checked={active} onChange={() => selectPurchaseType(option.id)} className="sr-only" />
                <span className="flex items-start justify-between gap-3"><span><strong className="block text-sm text-[#071724]">{option.title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{option.note}</span></span><strong className="whitespace-nowrap text-sm text-[#071724]">{option.price}</strong></span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {selection.optionId === 'multipack' ? (
        <div className="mt-4 grid gap-4 rounded-[1.25rem] bg-slate-50 p-4 sm:grid-cols-2 sm:items-end">
          <label className="text-sm font-semibold text-[#071724]">{t('packQuantity')}<select aria-label={t('packQuantity')} value={selection.packSize} onChange={(event) => onSelectionChange({ ...selection, packSize: Number(event.target.value) })} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3">{product.purchaseRules.multipackQuantities.map((size) => <option key={size} value={size}>{size} {t('vialsSuffix')}</option>)}</select></label>
          <label className="flex min-h-12 items-center gap-3 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700"><input type="checkbox" checked={selection.includeKit} onChange={(event) => onSelectionChange({ ...selection, includeKit: event.target.checked })} className="size-4 accent-teal-700" />{t('addOneKit', { price: money(getKitPremium(product)) })}</label>
        </div>
      ) : null}

      <div className="mt-7 flex flex-col gap-5 border-t border-slate-900/8 pt-7 lg:flex-row lg:items-center lg:justify-between">
        <div aria-live="polite" aria-atomic="true">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">{t('configuredTotal')}</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-3"><strong className="text-4xl tracking-[-0.05em] text-[#071724]">{money(quote.linePrice)}</strong>{quote.pricePerMeasure ? <span className="text-sm text-slate-500">{unitMoney(quote.pricePerMeasure)} {t('perMg')}</span> : null}</div>
          {quote.savings > 0 ? <p className="mt-1 text-sm font-semibold text-emerald-700">{t('save', { amount: money(quote.savings), percent: quote.savingsPercent })}</p> : null}
        </div>
        <button type="button" onClick={addConfiguredOrder} className="retatrutide-primary-cta inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#071724] px-8 text-base font-semibold text-white shadow-[0_18px_45px_rgba(7,23,36,0.2)] transition hover:-translate-y-0.5 hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"><ShoppingCart size={18} />{t('addConfiguredOrder')}</button>
      </div>
      <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500"><Check size={14} className="mt-0.5 shrink-0 text-teal-700" />{t('researchUseAvailability')}</p>

      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-3 right-20 z-40 flex items-center justify-between gap-3 rounded-full border border-white/70 bg-white/92 p-2 pl-5 shadow-[0_18px_55px_rgba(7,23,36,0.18)] backdrop-blur-xl md:hidden">
        <div><p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-slate-500">{variant.label}</p><p className="text-sm font-semibold text-[#071724]">{money(quote.linePrice)}</p></div>
        <button type="button" onClick={addConfiguredOrder} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#071724] px-5 text-sm font-semibold text-white">{t('addToCart')}</button>
      </div>
    </div>
  )
}

export function RetatrutideProductPage({ product }: { product: Product }) {
  const { t } = useTranslation('retatrutide')
  const [openFaq, setOpenFaq] = useState(0)
  const [variant, setVariant] = useState<ProductVariant>(product.variants[0])
  const [selection, setSelection] = useState<PurchaseSelection>(() => getDefaultPurchaseSelection(product))

  const faqs = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
    { question: t('faq6Q'), answer: t('faq6A') },
  ]

  return (
    <main id="main-content" className="overflow-hidden bg-[#f8faf9] pb-24 text-[#071724] md:pb-0">
      <ProductBreadcrumb product={product} tone="dark" />

      <ProductHero product={product} />

      <section className="relative z-10 -mt-20 px-5 pb-16 sm:px-8 lg:-mt-28 lg:pb-20">
        <div className="mx-auto max-w-[88rem]">
          <PurchaseConfigurator product={product} variant={variant} selection={selection} onVariantChange={setVariant} onSelectionChange={setSelection} />
          {product.purchaseRules.kitEligible ? <EncoreCompleteKit variant="reassurance" productName={product.name} bacWaterAmount={product.bacWaterAmount} className="mt-4" /> : null}
        </div>
      </section>

      <RetatrutideEvidenceStrip />
      <RetatrutideBenefitsSection />
      <RetatrutideResearchContext />
      <RetatrutidePathways />
      <RetatrutideQualitySection />

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[88rem]"><EncoreCompleteKit productName={product.name} bacWaterAmount={product.bacWaterAmount} /></div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl"><p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{t('faqEyebrow')}</p><h2 className="mt-4 text-center text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{t('faqTitle')}</h2><div className="mt-10 divide-y divide-slate-900/8 rounded-[2rem] bg-white px-6 shadow-[0_24px_75px_rgba(7,23,36,0.07)] sm:px-8">{faqs.map((faq, index) => { const open = openFaq === index; return <div key={faq.question}><button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : index)} className="flex min-h-20 w-full items-center justify-between gap-5 py-5 text-left"><span className="text-lg font-semibold tracking-[-0.02em]">{faq.question}</span><ChevronDown size={20} className={cn('shrink-0 text-teal-700 transition', open && 'rotate-180')} /></button><AnimatePresence initial={false}>{open ? <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="max-w-3xl pb-6 text-base leading-7 text-slate-600">{faq.answer}</p></motion.div> : null}</AnimatePresence></div>})}</div></div>
      </section>

      <MetabolicPortfolio mode="product" />

      <section className="px-5 pb-24 pt-20 sm:px-8 lg:pb-32 lg:pt-28">
        <div className="mx-auto max-w-[88rem] overflow-hidden bg-[#071724] px-6 py-16 text-center text-white shadow-[0_38px_110px_rgba(7,23,36,0.22)] sm:px-10 lg:py-24"><h2 className="text-5xl font-semibold tracking-[-0.06em] sm:text-6xl">{t('beginYourResearch')}</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">{t('finalCtaLine1')}<br />{t('finalCtaLine2')}<br />{t('finalCtaLine3')}</p><a href="#retatrutide-purchase" className="retatrutide-primary-cta mt-9 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-teal-400 px-8 text-base font-bold text-[#071724] shadow-[0_18px_48px_rgba(20,184,166,0.28)] transition hover:-translate-y-1 hover:bg-white">{t('finalConfigureCta')}<ArrowRight size={18} aria-hidden="true" /></a></div>
      </section>
    </main>
  )
}
