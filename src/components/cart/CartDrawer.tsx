import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCart } from '../../context/useCart'
import { formatCartCurrency } from '../../lib/cart'

const productImages = import.meta.glob('../../assets/images/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const

function getProductImage(image: string) {
  return productImages[`../../assets/images/products/${image}`]
}

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

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-[#071724]/34 backdrop-blur-sm"
          />
          <motion.aside
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Encore cart</p>
                <h2 id="cart-drawer-title" className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="flex size-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-[#071724]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {items.length ? (
                <div className="grid gap-4">
                  {items.map((item) => {
                    const imageSrc = getProductImage(item.image)

                    return (
                      <article key={item.id} className="rounded-[1.25rem] border border-slate-900/10 bg-white p-4 shadow-[0_14px_36px_rgba(7,23,36,0.06)]">
                        <div className="flex gap-4">
                          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#eef3f0]">
                            {imageSrc ? (
                              <img
                                src={imageSrc}
                                alt={`${item.productName} ${item.variantLabel}`}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain p-1.5"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold text-[#071724]">{item.productName}</h3>
                            <p className="mt-1 text-xs text-slate-500">{item.variantLabel} · {item.variantFormat}</p>
                            <p className="mt-2 text-sm font-semibold text-[#071724]">{formatCartCurrency(item.unitPrice)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-slate-900/10 bg-[#f8fafc]">
                            <button
                              type="button"
                              aria-label={`Decrease ${item.productName} quantity`}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex size-9 items-center justify-center text-slate-600"
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-[#071724]">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${item.productName} quantity`}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex size-9 items-center justify-center text-slate-600"
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            Remove
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-900/15 bg-white/60 p-8 text-center">
                  <ShoppingCart size={28} aria-hidden="true" className="text-teal-700" />
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#071724]">Your cart is empty.</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Add research catalog items to prepare an inquiry.</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-900/10 bg-white/82 p-5 backdrop-blur-xl">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#071724]">{formatCartCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#071724]">{totals.shipping ? formatCartCurrency(totals.shipping) : 'Calculated later'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Estimated tax</span>
                  <span className="font-semibold text-[#071724]">{totals.tax ? formatCartCurrency(totals.tax) : 'Calculated later'}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-900/10 pt-4">
                <span className="text-base font-semibold text-[#071724]">Estimated total</span>
                <span className="text-2xl font-semibold tracking-[-0.03em] text-[#071724]">{formatCartCurrency(totals.total)}</span>
              </div>
              <a
                href="/checkout"
                onClick={closeCart}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-teal-700 aria-disabled:pointer-events-none aria-disabled:opacity-45"
                aria-disabled={!items.length}
              >
                Review Cart
              </a>
              {items.length ? (
                <button
                  type="button"
                  onClick={clearCart}
                  className="mt-3 w-full text-center text-xs font-semibold text-slate-500 transition hover:text-rose-700"
                >
                  Clear cart
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

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-[#071724] shadow-sm backdrop-blur-xl transition hover:bg-white"
      aria-label={`Open cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
    >
      <ShoppingCart size={18} aria-hidden="true" />
      {itemCount ? (
        <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-teal-700 px-1.5 py-0.5 text-[0.65rem] font-bold text-white">
          {itemCount}
        </span>
      ) : null}
    </button>
  )
}
