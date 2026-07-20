import { CircleDollarSign, Landmark, MessageCircle, Send, Smartphone, WalletCards, Zap, type LucideIcon } from 'lucide-react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import type { CartItem } from '../../lib/cart'
import { calculateSubtotal, formatCartCurrency } from '../../lib/cart'
import { buildCartPaymentRequestMessage, buildWhatsAppUrl } from '../../lib/whatsapp'

type PaymentRequestMethod = {
  key: 'zelle' | 'cashApp' | 'venmo' | 'applePay' | 'bankTransfer' | 'paypalRequest'
  icon: LucideIcon
}

const paymentRequestMethods: PaymentRequestMethod[] = [
  { key: 'zelle', icon: Zap },
  { key: 'cashApp', icon: CircleDollarSign },
  { key: 'venmo', icon: Smartphone },
  { key: 'applePay', icon: WalletCards },
  { key: 'bankTransfer', icon: Landmark },
  { key: 'paypalRequest', icon: Send },
]

export function PaymentRequestMethods({ items }: { items: CartItem[] }) {
  const { locale } = useLocale()
  const { t } = useTranslation('cart')
  const subtotal = formatCartCurrency(calculateSubtotal(items))

  if (!items.length) return null

  return (
    <section className="mt-8 w-full rounded-3xl border border-slate-900/10 bg-white p-5 text-left shadow-[0_18px_50px_rgba(7,23,36,0.05)]" aria-labelledby="payment-routes-heading">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
          <WalletCards size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id="payment-routes-heading" className="text-lg font-semibold text-[#071724]">{t('paymentRoutesTitle')}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{t('paymentRoutesBody')}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-teal-800"><MessageCircle size={17} aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-semibold text-[#071724]">{t('paymentCashOnDelivery')}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{t('paymentAvailableNow')}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {paymentRequestMethods.map(({ key, icon: Icon }) => {
          const method = t(`payment${key[0].toUpperCase()}${key.slice(1)}` as 'paymentZelle')
          const message = buildCartPaymentRequestMessage({ items, subtotal, method, locale })
          return (
            <a
              key={key}
              href={buildWhatsAppUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('paymentRequestAction', { method })}
              className="group flex min-h-16 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm transition hover:border-teal-600/40 hover:bg-teal-50 focus:outline-none focus:ring-4 focus:ring-teal-100"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-white group-hover:text-teal-800"><Icon size={17} aria-hidden="true" /></span>
              <span>
                <span className="block font-semibold text-[#071724]">{method}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{t('paymentRequestAvailable')}</span>
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
