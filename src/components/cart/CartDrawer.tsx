import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useCart } from '../../context/useCart'
import { formatCartCurrency } from '../../lib/cart'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { purchaseTypeLabel } from '../../i18n/displayLabels'
import { EncoreCompleteKit } from '../EncoreCompleteKit'
import { ProductImage } from '../ProductImage'

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const

export function CartDrawer() {
  const {
    items,
    isOpen,
    itemCount,
    totals,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()
  const prefersReducedMotion = useReducedMotion()
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { path } = useLocale()
  const { t } = useTranslation('cart')
  const { t: tCommon } = useTranslation('common')

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeCart()
      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute('hidden'))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [closeCart, isOpen])

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            key="cart-drawer-backdrop"
            type="button"
            aria-label={t('closeCart')}
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-[#071724]/34 backdrop-blur-sm"
          />
          <motion.aside
            key="cart-drawer-panel"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 32 }}
            transition={{ duration: 0.28, ease: PREMIUM_EASE }}
            className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-md flex-col bg-[#f5f5f2] shadow-[-28px_0_80px_rgba(7,23,36,0.22)]"
          >
            <div className="flex items-center justify-between border-b border-slate-900/10 bg-white/72 px-5 py-4 backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{t('cartLabel')}</p>
                <h2 id="cart-drawer-title" className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                  {t(itemCount === 1 ? 'itemCountOne' : 'itemCountOther', { count: itemCount })}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeCart}
                aria-label={t('closeCart')}
                className="flex size-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-[#071724]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {items.length ? (
                <div className="grid gap-4">
                  {items.map((item) => {
                    const product = {
                      slug: item.productSlug,
                      image: item.image,
                      heroImage: item.image,
                    }

                    return (
                      <article key={item.id} className="rounded-[1.25rem] border border-slate-900/10 bg-white p-4 shadow-[0_14px_36px_rgba(7,23,36,0.06)]">
                        <div className="flex gap-4">
                          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#eef3f0]">
                            <ProductImage
                              product={product}
                              alt={t('productImageAlt', { product: item.productName })}
                              width={80}
                              height={80}
                              sizes="80px"
                              className="h-full w-full object-contain p-1.5"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <a href={path(`/products/${item.productSlug}`)} onClick={closeCart} className="block truncate text-sm font-semibold text-[#071724] hover:text-teal-700">{item.productName}</a>
                            <p className="mt-1 text-xs text-slate-500">{item.variantLabel} · {purchaseTypeLabel(tCommon, item.purchaseType)}</p>
                            <p className="mt-1 text-xs text-slate-500">{tCommon('packLabel', { pack: item.packSize })} · {tCommon('kitLabel', { kit: item.kitIncluded ? t('kitYes') : t('kitNo') })}</p>
                            <p className="mt-2 text-sm font-semibold text-[#071724]">{formatCartCurrency(item.linePrice)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-slate-900/10 bg-[#f8fafc]">
                            <button
                              type="button"
                              aria-label={t('decreaseQuantity', { product: item.productName, variant: item.variantLabel })}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex size-9 items-center justify-center text-slate-600"
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-[#071724]">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={t('increaseQuantity', { product: item.productName, variant: item.variantLabel })}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex size-9 items-center justify-center text-slate-600"
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={t('removeAriaLabel', { product: item.productName, variant: item.variantLabel })}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            {t('remove')}
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-900/10 pt-3 text-xs">
                          <span className="text-slate-500">{t('lineSubtotal')}</span>
                          <span className="font-semibold text-[#071724]">{formatCartCurrency(item.linePrice * item.quantity)}</span>
                        </div>
                        {item.savings > 0 ? <p className="mt-2 text-xs font-semibold text-emerald-700">{t('savings', { amount: formatCartCurrency(item.savings * item.quantity) })}</p> : null}
                        {item.kitIncluded ? <EncoreCompleteKit variant="cart" className="mt-3" /> : null}
                        <a href={path(`/products/${item.productSlug}`)} onClick={closeCart} className="mt-3 inline-flex text-xs font-semibold text-teal-800">{t('editPurchaseOption')}</a>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-900/15 bg-white/60 p-8 text-center">
                  <ShoppingCart size={28} aria-hidden="true" className="text-teal-700" />
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">{t('emptyTitle')}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{t('emptyBody')}</p>
                  <a
                    href={path('/catalog')}
                    onClick={closeCart}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#071724] px-5 text-sm font-semibold text-white"
                  >
                    {t('browseCatalog')}
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-slate-900/10 bg-white/82 p-5 backdrop-blur-xl">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t('subtotal')}</span>
                  <span className="font-semibold text-[#071724]">{formatCartCurrency(totals.subtotal)}</span>
                </div>
                <p className="text-xs leading-5 text-slate-500">{t('shippingNote')}</p>
              </div>
              {items.length ? (
                <div className="mt-5 grid gap-2">
                  <a href={path('/cart')} onClick={closeCart} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700">{t('viewCart')}</a>
                  <a href={path('/checkout')} onClick={closeCart} className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 text-sm font-semibold text-[#071724] transition hover:bg-teal-50">{t('continueToOrder')}</a>
                </div>
              ) : null}
              {items.length ? (
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-slate-500">
                  <ShieldCheck size={13} aria-hidden="true" className="shrink-0 text-teal-700" />
                  {t('reviewedNote')}
                </p>
              ) : null}
              {items.length ? (
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-3 w-full text-center text-xs font-semibold text-slate-500 transition hover:text-rose-700"
                >
                  {t('clearCart')}
                </button>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export function CartNavButton() {
  const { itemCount, openCart } = useCart()
  const { t } = useTranslation('cart')

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-[#071724] shadow-sm backdrop-blur-xl transition hover:bg-white"
      aria-label={t(itemCount === 1 ? 'cartWithItemsAriaOne' : 'cartWithItemsAriaOther', { count: itemCount })}
    >
      <ShoppingCart size={18} aria-hidden="true" />
      {itemCount ? (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-teal-700 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      ) : null}
    </button>
  )
}
