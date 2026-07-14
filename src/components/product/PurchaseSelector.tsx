import { Check, PackageCheck, ShoppingCart } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '../../context/useCart'
import type { Product, ProductVariant } from '../../data/products'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { formatLabel } from '../../i18n/displayLabels'
import {
  changePurchaseOption,
  getDefaultPurchaseSelection,
  getKitPremium,
  getRetatrutideVariantBadge,
  isProductPurchasable,
  money,
  quotePurchase,
  unitMoney,
  type PurchaseOptionId,
  type PurchaseSelection,
} from '../../lib/purchaseOptions'
import { cn } from '../../lib/utils'

function track(name: string, detail: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent(`encore:${name}`, { detail }))
}

export function PurchaseSelector({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useCart()
  const { path, locale } = useLocale()
  const { t } = useTranslation('purchaseSelector')
  const { t: tCommon } = useTranslation('common')
  const [variant, setVariant] = useState<ProductVariant>(product.variants[0])
  const [selection, setSelection] = useState<PurchaseSelection>(() => getDefaultPurchaseSelection(product))
  const quote = useMemo(() => quotePurchase(product, variant, selection), [product, selection, variant])
  const smallestMultipackQuote = useMemo(() => {
    if (!product.purchaseRules.multipackEligible || !product.purchaseRules.multipackQuantities.length) return undefined
    const smallestPackSize = Math.min(...product.purchaseRules.multipackQuantities)
    return quotePurchase(product, variant, { optionId: 'multipack', packSize: smallestPackSize, includeKit: false })
  }, [product, variant])

  useEffect(() => {
    track('product_view', { productId: product.slug })
  }, [product.slug])

  function selectOption(optionId: PurchaseOptionId) {
    const next = changePurchaseOption(product, selection, optionId)
    setSelection(next)
    track('purchase_option_selected', { productId: product.slug, optionId })
    if (optionId === 'complete-kit') track('complete_kit_selected', { productId: product.slug })
    if (optionId === 'multipack') track('multipack_selected', { productId: product.slug, packSize: next.packSize })
  }

  const optionClass = (active: boolean) => cn(
    'relative grid min-w-0 cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] gap-3 rounded-2xl border p-4 text-left transition focus-within:ring-4 focus-within:ring-teal-100',
    active ? 'border-teal-700 bg-teal-50/70 shadow-[0_12px_30px_rgba(13,148,136,0.1)]' : 'border-slate-900/10 bg-white hover:border-teal-600/40',
  )

  return (
    <section className={cn('rounded-[1.75rem] border border-slate-900/10 bg-white p-5 shadow-[0_24px_70px_rgba(7,23,36,0.09)] sm:p-6', compact && 'p-4 sm:p-5')} aria-labelledby={`purchase-options-${product.slug}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{t('configureOrder')}</p>
      <h2 id={`purchase-options-${product.slug}`} className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('purchaseOptions')}</h2>

      {product.variants.length > 1 ? (
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[#071724]">{t('strengthOrFormat')}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((entry) => {
              const badge = entry.price > 0 ? getRetatrutideVariantBadge(product, entry, locale) : undefined
              return (
                <button key={`${entry.label}-${entry.format}`} type="button" aria-pressed={entry === variant} onClick={() => { setVariant(entry); track('strength_selected', { productId: product.slug, sku: entry.sku, strength: entry.label }) }} className={cn('min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold outline-none focus:ring-4 focus:ring-teal-100', entry === variant ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-600')}>
                  {entry.label} · {entry.price > 0 ? money(entry.price) : t('requestAvailability')}{badge ? <span className="ml-2 text-[10px] uppercase tracking-wide text-teal-700">{badge}</span> : null}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : (
        <p className="mt-4 text-sm font-semibold text-[#071724]">{t('formatLabel', { label: variant.label, format: formatLabel(tCommon, variant.format) })}</p>
      )}

      {!isProductPurchasable(product) || variant.price <= 0 ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
          <p className="text-sm font-semibold text-[#071724]">{t('unavailableTitle')}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{t('unavailableBody')}</p>
          <a href={path(`/intake?product=${encodeURIComponent(product.slug)}`)} className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#071724] px-5 text-sm font-semibold text-white">{t('requestAvailability')}</a>
        </div>
      ) : (
      <>

      <fieldset className="mt-5">
        <legend className="sr-only">{t('chooseOnePurchaseOption')}</legend>
        <div className="grid gap-3">
          <label className={optionClass(selection.optionId === 'vial-only')}>
            <input type="radio" name={`purchase-${product.slug}`} value="vial-only" checked={selection.optionId === 'vial-only'} onChange={() => selectOption('vial-only')} className="mt-1 size-4 accent-teal-700" />
            <span className="min-w-0"><span className="flex flex-wrap items-baseline justify-between gap-2"><strong className="text-sm text-[#071724]">{product.purchaseRules.productType === 'research-vial' ? t('vialOnly') : t('productOnly')}</strong><strong className="text-base text-[#071724]">{money(variant.price)}</strong></span><span className="mt-1 block text-xs leading-5 text-slate-500">{product.purchaseRules.productType === 'research-vial' ? t('vialOnlyDescription') : t('productOnlyDescription')}</span></span>
          </label>

          {product.purchaseRules.kitEligible ? (
            <label className={optionClass(selection.optionId === 'complete-kit')}>
              <input type="radio" name={`purchase-${product.slug}`} value="complete-kit" checked={selection.optionId === 'complete-kit'} onChange={() => selectOption('complete-kit')} className="mt-1 size-4 accent-teal-700" />
              <span className="min-w-0"><span className="flex flex-wrap items-baseline justify-between gap-2"><span className="inline-flex flex-wrap items-baseline gap-2"><strong className="text-sm text-[#071724]">{t('encoreCompleteKit')}</strong><span className="whitespace-nowrap rounded-full bg-teal-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{t('mostPopular')}</span></span><strong className="text-base text-[#071724]">{money(variant.price + getKitPremium(product))}</strong></span><span className="mt-1 block text-xs leading-5 text-slate-500">{t('kitDescription', { price: money(getKitPremium(product)) })}</span></span>
            </label>
          ) : null}

          {product.purchaseRules.multipackEligible && smallestMultipackQuote ? (
            <label className={optionClass(selection.optionId === 'multipack')}>
              <input type="radio" name={`purchase-${product.slug}`} value="multipack" checked={selection.optionId === 'multipack'} onChange={() => selectOption('multipack')} className="mt-1 size-4 accent-teal-700" />
              <span className="min-w-0"><span className="flex flex-wrap items-baseline justify-between gap-2"><strong className="text-sm text-[#071724]">{t('multiVialPack')}</strong><strong className="text-base text-[#071724]">{t('fromPrice', { price: money(smallestMultipackQuote.linePrice) })}</strong></span><span className="mt-1 block text-xs leading-5 text-slate-500">{t('multipackDescription')}</span></span>
            </label>
          ) : null}
        </div>
      </fieldset>

      {selection.optionId === 'multipack' ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
          <label className="text-sm font-semibold text-[#071724]">{t('packQuantity')}<select value={selection.packSize} onChange={(event) => setSelection((current) => ({ ...current, packSize: Number(event.target.value) }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-4 focus:ring-teal-100">{product.purchaseRules.multipackQuantities.map((size) => <option key={size} value={size}>{size} {t('vialsSuffix')}</option>)}</select></label>
          {product.purchaseRules.kitEligible ? <label className="mt-3 flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={selection.includeKit} onChange={(event) => setSelection((current) => ({ ...current, includeKit: event.target.checked }))} className="size-4 accent-teal-700" />{t('addOneKit', { price: money(getKitPremium(product)) })}</label> : null}
        </div>
      ) : null}

      {quote.kitIncluded ? <div className="mt-4 rounded-2xl bg-teal-50 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-teal-950"><PackageCheck size={16} />{t('kitIncludedTitle')}</p><ul className="mt-2 grid gap-1 text-xs leading-5 text-teal-900 sm:grid-cols-2"><li>• {t('kitItem1')}</li><li>• {t('kitItem2')}</li><li>• {t('kitItem3')}</li><li>• {t('kitItem4')}</li><li>• {t('kitItem5')}</li></ul></div> : null}

      <div className="mt-5 rounded-2xl border border-slate-200 p-4" aria-live="polite" aria-atomic="true">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('orderTotal')}</p><p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#071724]">{money(quote.linePrice)}</p></div><div className="text-right text-xs leading-5 text-slate-500">{quote.packSize > 1 ? <><p>{t('effectivePerVial', { price: money(quote.unitPrice) })}</p><p className="font-semibold text-emerald-700">{t('save', { amount: money(quote.savings), percent: quote.savingsPercent })}</p></> : null}{quote.pricePerMeasure && variant.unitType ? <p>{t('perUnit', { price: unitMoney(quote.pricePerMeasure), unit: variant.unitType })}</p> : null}</div></div>
      </div>

      {variant.price > 0 ? <button type="button" onClick={() => { addToCart(product, variant, 1, selection); track('add_to_cart', { productId: product.slug, sku: quote.sku, optionId: selection.optionId, packSize: selection.packSize, kitIncluded: quote.kitIncluded }) }} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-200"><ShoppingCart size={16} />{t('addConfiguredOrder')}</button> : <a href={path(`/intake?product=${encodeURIComponent(product.slug)}`)} className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-[#071724]">{t('requestAvailability')}</a>}
      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500"><Check size={14} className="mt-0.5 shrink-0 text-teal-700" />{t('researchUsePaymentNote')}</p>
      </>
      )}
    </section>
  )
}
