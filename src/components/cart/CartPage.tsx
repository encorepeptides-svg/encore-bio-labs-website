import { MessageCircle, Minus, PackageCheck, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from '../../context/useCart'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { purchaseTypeLabel } from '../../i18n/displayLabels'
import { formatCartCurrency } from '../../lib/cart'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import { ProductImage } from '../ProductImage'

export function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart()
  const { path } = useLocale()
  const { t } = useTranslation('cart')
  const { t: tCommon } = useTranslation('common')

  return (
    <main id="main-content" className="bg-[#f5f5f2] px-5 py-10 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-[88rem]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">{t('yourCart')}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#071724] sm:text-5xl">
          {t('reviewSelections')}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {t('reviewSelectionsBody')}
        </p>

        {items.length ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_23rem] lg:items-start">
            <section aria-labelledby="cart-items-heading">
              <div className="flex items-center justify-between gap-4">
                <h2 id="cart-items-heading" className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                  {t(itemCount === 1 ? 'itemCountOne' : 'itemCountOther', { count: itemCount })}
                </h2>
                <button type="button" onClick={clearCart} className="text-sm font-semibold text-slate-500 transition hover:text-rose-700">
                  {t('clearCart')}
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                {items.map((item) => {
                  const product = {
                    slug: item.productSlug,
                    image: item.image,
                    heroImage: item.image,
                  }
                  return (
                    <article key={item.id} className="rounded-[1.5rem] border border-slate-900/10 bg-white p-5 shadow-[0_18px_50px_rgba(7,23,36,0.06)] sm:p-6">
                      <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5">
                        <a href={path(`/products/${item.productSlug}`)} className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[#eef3f0]">
                          <ProductImage
                            product={product}
                            alt={t('productImageAlt', { product: item.productName })}
                            width={112}
                            height={112}
                            sizes="112px"
                            className="h-full w-full object-contain p-2"
                          />
                        </a>
                        <div className="min-w-0">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              {item.category ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">{item.category}</p> : null}
                              <a href={path(`/products/${item.productSlug}`)} className="mt-1 block text-xl font-semibold tracking-[-0.03em] text-[#071724] hover:text-teal-700">{item.productName}</a>
                              <p className="mt-1 text-sm text-slate-500">{item.variantLabel} · {purchaseTypeLabel(tCommon, item.purchaseType)}</p>
                              <p className="mt-1 text-xs text-slate-500">{purchaseTypeLabel(tCommon, item.purchaseType)} · {t('packQuantityKitSku', { pack: item.packSize, kit: item.kitIncluded ? t('kitYes') : t('kitNo'), sku: item.sku })}</p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-xs text-slate-500">{t('perVial', { price: formatCartCurrency(item.unitPrice) })}</p>
                              <p className="mt-1 text-xl font-semibold text-[#071724]">{formatCartCurrency(item.linePrice * item.quantity)}</p>
                              {item.savings > 0 ? <p className="mt-1 text-xs font-semibold text-emerald-700">{t('savings', { amount: formatCartCurrency(item.savings * item.quantity) })}</p> : null}
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-full border border-slate-900/10 bg-[#f8fafc]">
                              <button type="button" aria-label={t('decreaseQuantity', { product: item.productName, variant: item.variantLabel })} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex size-11 items-center justify-center rounded-full text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-600"><Minus size={15} aria-hidden="true" /></button>
                              <span className="min-w-10 text-center text-sm font-semibold text-[#071724]" aria-label={t('quantitySelected', { count: item.quantity })}>{item.quantity}</span>
                              <button type="button" aria-label={t('increaseQuantity', { product: item.productName, variant: item.variantLabel })} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex size-11 items-center justify-center rounded-full text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-600"><Plus size={15} aria-hidden="true" /></button>
                            </div>
                            <button type="button" onClick={() => removeFromCart(item.id)} aria-label={t('removeAriaLabel', { product: item.productName, variant: item.variantLabel })} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"><Trash2 size={15} aria-hidden="true" />{t('remove')}</button>
                          </div>
                          {item.kitIncluded ? <EncoreCompleteKit variant="cart" productName={item.productName} bacWaterAmount={item.bacWaterAmount} className="mt-4" /> : null}
                          <a href={path(`/products/${item.productSlug}`)} className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-teal-800">{t('editPurchaseOption')}</a>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <aside className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-[0_24px_70px_rgba(7,23,36,0.08)] lg:sticky lg:top-28">
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('orderSummary')}</h2>
              <div className="mt-5 flex items-center justify-between border-b border-slate-900/10 pb-5">
                <span className="font-semibold text-slate-600">{t('subtotal')}</span>
                <span className="text-2xl font-semibold text-[#071724]">{formatCartCurrency(subtotal)}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">{t('shippingNote')}</p>
              <a href={path('/checkout')} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700">{t('continueToOrder')}</a>
              <a href={path('/legal/shipping-returns')} className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-sm font-semibold text-teal-800 transition hover:text-[#071724]">{t('reviewShippingDelivery')}</a>
              <a href={path('/catalog')} className="mt-3 inline-flex min-h-11 w-full items-center justify-center text-sm font-semibold text-slate-600 transition hover:text-[#071724]">{t('continueBrowsing')}</a>
              <div className="mt-6 rounded-2xl bg-[#f8fafc] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]"><PackageCheck size={16} aria-hidden="true" className="text-teal-700" />{t('kitSelectionsShown')}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t('orderReviewedNote')}</p>
                <a href="https://wa.me/19153595448" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-teal-800"><MessageCircle size={14} aria-hidden="true" />{t('contactSupportWhatsapp')}</a>
              </div>
            </aside>
          </div>
        ) : (
          <section className="mt-10 flex min-h-[28rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-900/15 bg-white/70 p-8 text-center">
            <ShoppingCart size={32} aria-hidden="true" className="text-teal-700" />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#071724]">{t('readyForNextSelection')}</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">{t('browseAndReturn')}</p>
            <a href={path('/catalog')} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#071724] px-7 text-sm font-semibold text-white transition hover:bg-teal-700">{t('browseCatalog')}</a>
          </section>
        )}
      </div>
    </main>
  )
}
