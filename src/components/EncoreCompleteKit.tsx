import { Bandage, Check, Droplet, FlaskConical, PackageCheck, Syringe } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '../lib/utils'
import {
  getEncoreCompleteKitCompactSummary,
  getEncoreCompleteKitItems,
  type EncoreCompleteKitItem,
} from '../data/encoreCompleteKit'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import kitHeroImage from '../assets/images/complete-research-kit-hero.webp'

const itemIcons: Record<EncoreCompleteKitItem['key'], ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false'; className?: string }>> = {
  peptide: FlaskConical,
  'bac-water': Droplet,
  syringes: Syringe,
  'prep-pads': Bandage,
  packaging: PackageCheck,
}

export type EncoreCompleteKitVariant = 'full' | 'compact' | 'inline' | 'cart' | 'checkout'

export type EncoreCompleteKitProps = {
  productName?: string
  bacWaterAmount?: string
  syringeCount?: number
  prepPadCount?: number
  variant?: EncoreCompleteKitVariant
  showClosingMessage?: boolean
  className?: string
}

export function EncoreCompleteKit({
  productName,
  bacWaterAmount,
  syringeCount,
  prepPadCount,
  variant = 'full',
  showClosingMessage = true,
  className,
}: EncoreCompleteKitProps) {
  const { t } = useTranslation('kit')
  const items = getEncoreCompleteKitItems({ productName, bacWaterAmount, syringeCount, prepPadCount }, t)

  if (variant === 'compact') return <CompactCard syringeCount={syringeCount} className={className} />
  if (variant === 'inline') return <InlineCard className={className} />
  if (variant === 'cart') return <CartReminder items={items} className={className} />
  if (variant === 'checkout') return <CheckoutReminder items={items} className={className} />
  return (
    <FullCard items={items} showClosingMessage={showClosingMessage} className={className} />
  )
}

function KitIcon({ item, className }: { item: EncoreCompleteKitItem; className?: string }) {
  const Icon = itemIcons[item.key]
  return <Icon size={18} aria-hidden="true" className={className} />
}

function FullCard({
  items,
  showClosingMessage,
  className,
}: {
  items: EncoreCompleteKitItem[]
  showClosingMessage: boolean
  className?: string
}) {
  const { t } = useTranslation('kit')

  const bacWater = items.find((item) => item.key === 'bac-water')
  const preparation = items.find((item) => item.key === 'syringes')
  const packaging = items.find((item) => item.key === 'packaging')
  return <div className={cn('overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white shadow-[0_18px_55px_rgba(7,23,36,.07)]', className)}>
    <div className="grid items-center gap-5 p-5 sm:p-6 lg:grid-cols-[10rem_1fr]">
      <img src={kitHeroImage} alt={t('kitThumbnailAlt')} width="240" height="160" loading="lazy" decoding="async" className="h-28 w-full rounded-xl border border-teal-900/10 object-cover object-[62%_center]" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">{t('fullEyebrow')}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-.03em] text-[#071724] sm:text-2xl">{t('fullHeading')}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('fullDescription')}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">{[
          { item: bacWater, label: t('includedBacWater') },
          { item: preparation, label: t('includedPreparation') },
          { item: packaging, label: t('includedPackaging') },
        ].map(({ item, label }) => <li key={label} className="flex items-center gap-2 text-sm font-semibold text-[#071724]"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">{item ? <KitIcon item={item} /> : <PackageCheck size={16} aria-hidden="true" />}</span>{label}</li>)}</ul>
        {showClosingMessage ? <p className="mt-4 text-xs leading-5 text-slate-500">{t('kitMatchedLine')}</p> : null}
      </div>
    </div>
  </div>
}

/**
 * Homepage "Complete Research Kit" presentation. The approved artwork already
 * contains the eyebrow, headline, contents list, badges, and CTAs, so this
 * section deliberately renders ONLY that image (wrapped in one accessible link
 * to the kits page) — no duplicated copy, mock cards, or competing buttons.
 */
function InlineCard({ className }: { className?: string }) {
  const { path } = useLocale()
  const { t } = useTranslation('kit')

  return (
    <div
      id="complete-research-kit"
      className={cn(
        'rounded-[1.75rem] bg-[linear-gradient(135deg,#f8fcfb,#eef5f4)] p-4 sm:p-6 lg:p-8',
        className,
      )}
    >
      <a
        href={path('/kits')}
        aria-label={t('homeImageAlt')}
        className="group mx-auto block w-full max-w-[1120px] rounded-[1.25rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f1f7f6]"
      >
        <img
          src={kitHeroImage}
          alt={t('homeImageAlt')}
          width="1536"
          height="1024"
          loading="lazy"
          decoding="async"
          className="h-auto w-full rounded-[1.25rem] object-contain drop-shadow-[0_20px_60px_rgba(7,23,36,0.10)] transition duration-500 motion-safe:group-hover:-translate-y-1"
          sizes="(min-width: 1160px) 1120px, 92vw"
          style={{ aspectRatio: '3 / 2' }}
        />
      </a>
    </div>
  )
}

function CompactCard({ syringeCount, className }: { syringeCount?: number; className?: string }) {
  const { t } = useTranslation('kit')

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-teal-700/15 bg-teal-50/60 p-3',
        className,
      )}
    >
      <PackageCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-800">
          {t('compactHeading')}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          {getEncoreCompleteKitCompactSummary({ syringeCount }, t)}
        </p>
      </div>
    </div>
  )
}

function CartReminder({ items, className }: { items: EncoreCompleteKitItem[]; className?: string }) {
  const { t } = useTranslation('kit')

  return (
    <div className={cn('rounded-lg bg-teal-50/70 px-3 py-2', className)}>
      <div className="flex items-start gap-2.5">
        <img
          src={kitHeroImage}
          alt={t('kitThumbnailAlt')}
          width="96"
          height="64"
          loading="lazy"
          decoding="async"
          className="size-12 shrink-0 rounded-lg border border-teal-900/10 object-cover object-[62%_center]"
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-teal-800">
            <PackageCheck size={13} aria-hidden="true" className="shrink-0" />
            {t('cartHeading')}
          </p>
          <ul className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[0.7rem] leading-5 text-teal-800/90">
            {items.map((item, index) => (
              <li key={item.key}>
                {item.title}
                {index < items.length - 1 ? <span aria-hidden="true">,</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function CheckoutReminder({ items, className }: { items: EncoreCompleteKitItem[]; className?: string }) {
  const { t } = useTranslation('kit')

  return (
    <div className={cn('rounded-2xl border border-slate-900/10 bg-[#f8fafc] p-4', className)}>
      <div className="flex items-start gap-3">
        <img
          src={kitHeroImage}
          alt={t('kitThumbnailAlt')}
          width="96"
          height="64"
          loading="lazy"
          decoding="async"
          className="size-14 shrink-0 rounded-xl border border-slate-900/10 object-cover object-[62%_center]"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]">
            <PackageCheck size={16} aria-hidden="true" className="text-teal-700" />
            {t('checkoutHeading')}
          </p>
          <ul className="mt-3 grid gap-1.5">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-2 text-xs leading-5 text-slate-600">
                <Check size={12} aria-hidden="true" className="shrink-0 text-teal-700" />
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
