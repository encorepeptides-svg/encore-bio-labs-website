import { useState } from 'react'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'
import type { CartItem } from '../../lib/cart'
import { ExpressOrderDialog } from './ExpressOrderDialog'

/**
 * The cart-side entry point into express ordering.
 *
 * The button stays small because the cart summary is narrow; everything the
 * order needs — the label, the payment rail, the acknowledgment — is collected
 * in the dialog, where there is room to lay it out properly.
 */
export function ExpressWhatsAppCheckout({ items }: { items: CartItem[] }) {
  const { t } = useTranslation('cart')
  const [open, setOpen] = useState(false)

  if (!items.length) return null

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-sm font-semibold text-[#071724] shadow-[0_10px_30px_rgba(37,211,102,0.28)] transition hover:bg-[#1eb855]"
      >
        <MessageCircle size={16} aria-hidden="true" />
        {t('expressStart')}
      </button>
      <p className="mt-2.5 flex items-start justify-center gap-1.5 text-center text-xs leading-5 text-slate-500">
        <ShieldCheck size={13} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
        {t('expressTeaser')}
      </p>
      <ExpressOrderDialog items={items} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
