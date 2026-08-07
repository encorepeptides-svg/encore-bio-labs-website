import { Truck } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'
import { formatCartCurrency } from '../../lib/cart'
import { centsToNextTier, promotionTierFor } from '../../lib/promotions'

/**
 * Tells the shopper where they stand against the order-value promotions —
 * what they have already earned, or what is left to earn it.
 *
 * The import-fee caveat only shows once free shipping is in play, because that
 * is the point where "free shipping" could otherwise be read as "no extra
 * charges at all" by someone shipping to Mexico.
 */
export function CartPromotionNote({ subtotal, className = '' }: { subtotal: number; className?: string }) {
  const { t } = useTranslation('cart')
  const subtotalCents = Math.round(subtotal * 100)
  const tier = promotionTierFor(subtotalCents)
  const next = centsToNextTier(subtotalCents)

  if (subtotalCents <= 0) return null

  const message = next
    ? t(next.tier === 'volume' ? 'promoProgressVolume' : 'promoProgressFreeShipping', {
        amount: formatCartCurrency(next.remainingCents / 100),
      })
    : t('promoUnlockedVolume')

  const earned = tier !== 'none'

  return (
    <div
      className={`rounded-2xl border p-3 ${earned ? 'border-emerald-600/25 bg-emerald-50' : 'border-teal-700/20 bg-teal-50/60'} ${className}`}
    >
      <p className={`flex items-start gap-2 text-xs font-semibold leading-5 ${earned ? 'text-emerald-800' : 'text-teal-900'}`}>
        <Truck size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          {tier === 'free_shipping' ? `${t('promoUnlockedFreeShipping')} · ` : ''}
          {message}
        </span>
      </p>
      {earned ? <p className="mt-1.5 pl-6 text-[0.7rem] leading-4 text-slate-500">{t('promoImportFeeNote')}</p> : null}
    </div>
  )
}
