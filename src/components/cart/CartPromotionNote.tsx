import { Check, Truck } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'
import { formatCartCurrency } from '../../lib/cart'
import { PROMOTION_TIERS, centsToNextTier, promotionRuleFor, type EarnedTier } from '../../lib/promotions'

/**
 * Tells the shopper where they stand against the order-value promotions —
 * what they have already earned, what is left to earn the next tier, and the
 * whole ladder above it, so a $210 cart can still see that $500 and $1,000 are
 * worth reaching for.
 *
 * The import-fee caveat only shows once free shipping is in play, because that
 * is the point where "free shipping" could otherwise be read as "no extra
 * charges at all" by someone shipping to Mexico.
 */

const progressKeys: Record<EarnedTier, string> = {
  free_shipping: 'promoProgressFreeShipping',
  volume_10: 'promoProgressVolume10',
  volume_15: 'promoProgressVolume15',
  volume_20: 'promoProgressVolume20',
}

const unlockedKeys: Record<EarnedTier, string> = {
  free_shipping: 'promoUnlockedFreeShipping',
  volume_10: 'promoUnlockedVolume10',
  volume_15: 'promoUnlockedVolume15',
  volume_20: 'promoUnlockedVolume20',
}

const ladderKeys: Record<EarnedTier, string> = {
  free_shipping: 'promoLadderFreeShipping',
  volume_10: 'promoLadderVolume10',
  volume_15: 'promoLadderVolume15',
  volume_20: 'promoLadderVolume20',
}

export function CartPromotionNote({ subtotal, className = '' }: { subtotal: number; className?: string }) {
  const { t } = useTranslation('cart')
  const subtotalCents = Math.round(subtotal * 100)
  const earnedRule = promotionRuleFor(subtotalCents)
  const next = centsToNextTier(subtotalCents)

  if (subtotalCents <= 0) return null

  const earned = earnedRule !== null
  const headline = next
    ? t(progressKeys[next.tier], { amount: formatCartCurrency(next.remainingCents / 100) })
    : t(unlockedKeys.volume_20)

  return (
    <div
      className={`rounded-2xl border p-3 ${earned ? 'border-emerald-600/25 bg-emerald-50' : 'border-teal-700/20 bg-teal-50/60'} ${className}`}
    >
      <p className={`flex items-start gap-2 text-xs font-semibold leading-5 ${earned ? 'text-emerald-800' : 'text-teal-900'}`}>
        <Truck size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          {earnedRule && next ? `${t(unlockedKeys[earnedRule.id])} · ` : ''}
          {headline}
        </span>
      </p>

      <p className="mt-2.5 pl-6 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">{t('promoLadderTitle')}</p>
      <ul className="mt-1 space-y-0.5 pl-6">
        {PROMOTION_TIERS.map((tier) => {
          const reached = subtotalCents >= tier.thresholdCents
          return (
            <li
              key={tier.id}
              className={`flex items-center gap-1.5 text-[0.7rem] leading-4 ${reached ? 'font-semibold text-emerald-700' : 'text-slate-500'}`}
            >
              {reached ? (
                <Check size={11} aria-label={t('promoLadderEarnedAria')} className="shrink-0" />
              ) : (
                <span aria-hidden="true" className="h-[3px] w-[3px] shrink-0 rounded-full bg-slate-400" />
              )}
              <span>{t(ladderKeys[tier.id], { amount: formatCartCurrency(tier.thresholdCents / 100) })}</span>
            </li>
          )
        })}
      </ul>

      {earned ? <p className="mt-2 pl-6 text-[0.7rem] leading-4 text-slate-500">{t('promoImportFeeNote')}</p> : null}
    </div>
  )
}
