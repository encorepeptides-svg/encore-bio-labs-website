import { ArrowRight, Bandage, Check, Droplet, FlaskConical, PackageCheck, Syringe } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '../lib/utils'
import {
  getEncoreCompleteKitCompactSummary,
  getEncoreCompleteKitItems,
  type EncoreCompleteKitItem,
} from '../data/encoreCompleteKit'
import {
  ENCORE_COMPLETE_KIT_IMAGE,
  ENCORE_COMPLETE_KIT_IMAGE_HEIGHT,
  ENCORE_COMPLETE_KIT_IMAGE_WIDTH,
} from '../data/kitMedia'
import { useLocale, useTranslation } from '../i18n/LocaleContext'
import { BacWaterHeroImage } from './BacWaterHeroImage'

const itemIcons: Record<EncoreCompleteKitItem['key'], ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false'; className?: string }>> = {
  peptide: FlaskConical,
  'bac-water': Droplet,
  syringes: Syringe,
  'prep-pads': Bandage,
  packaging: PackageCheck,
}

export type EncoreCompleteKitVariant = 'full' | 'compact' | 'reassurance' | 'inline' | 'cart' | 'checkout'

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
  if (variant === 'reassurance') return <PurchaseReassurance className={className} />
  if (variant === 'inline') return <InlineCard className={className} />
  if (variant === 'cart') return <CartReminder items={items} className={className} />
  if (variant === 'checkout') return <CheckoutReminder items={items} className={className} />
  return (
    <FullCard items={items} showClosingMessage={showClosingMessage} className={className} />
  )
}

function PurchaseReassurance({ className }: { className?: string }) {
  const { t } = useTranslation('kit')
  const benefits = [
    { icon: Droplet, label: t('reassuranceBacWater') },
    { icon: Syringe, label: t('reassurancePreparation') },
    { icon: PackageCheck, label: t('reassurancePackaging') },
  ]

  return (
    <aside
      className={cn(
        'rounded-2xl border border-teal-700/20 bg-[#f8fcfb] px-4 py-3.5 sm:px-5 sm:py-4',
        className,
      )}
      aria-label={t('reassuranceHeading')}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
        <div className="min-w-0 lg:w-52 lg:shrink-0">
          <p className="text-sm font-semibold tracking-[-0.015em] text-[#071724]">{t('reassuranceHeading')}</p>
          <p className="mt-1 text-[0.7rem] leading-4 text-slate-500">{t('reassuranceMicrocopy')}</p>
        </div>
        <ul className="grid flex-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {benefits.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-xs font-semibold leading-5 text-slate-700">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-teal-100/80 text-teal-800">
                <Icon size={14} aria-hidden="true" />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
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
    <div className="grid items-center gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(18rem,0.95fr)_1.3fr] lg:gap-7">
      <div className="relative">
        <img
          src={ENCORE_COMPLETE_KIT_IMAGE}
          alt={t('kitThumbnailAlt')}
          width={ENCORE_COMPLETE_KIT_IMAGE_WIDTH}
          height={ENCORE_COMPLETE_KIT_IMAGE_HEIGHT}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full rounded-xl border border-teal-900/10 object-cover object-center"
          sizes="(min-width: 1024px) 34vw, 100vw"
        />
        <div className="absolute -bottom-2 right-3 aspect-square w-[28%] min-w-20 overflow-hidden rounded-xl border-2 border-white bg-white shadow-[0_14px_34px_rgba(7,23,36,0.2)] sm:right-5">
          <BacWaterHeroImage alt={t('bacWaterHeroAlt')} sizes="(min-width: 1024px) 10vw, 28vw" className="size-full object-cover object-center" />
        </div>
      </div>
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

/** Homepage kit presentation with localized HTML and the canonical kit photograph. */
function InlineCard({ className }: { className?: string }) {
  const { path } = useLocale()
  const { t } = useTranslation('kit')

  return (
    <section
      id="complete-research-kit"
      className={cn(
        'relative overflow-hidden rounded-[1.75rem] border border-teal-900/10 bg-[linear-gradient(135deg,#f8fcfb,#eef5f4)] shadow-[0_24px_70px_rgba(7,23,36,0.08)]',
        className,
      )}
    >
      <div className="grid items-stretch lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-9 lg:p-12">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-700/20 bg-white/80 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-800">
            <PackageCheck size={15} aria-hidden="true" />
            {t('homeEyebrow')}
          </p>
          <h2 className="mt-5 max-w-xl text-[clamp(2rem,1.35rem+2.5vw,3.7rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#071724]">
            {t('homeHeading')}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">{t('homeDescription')}</p>
          <p className="mt-5 flex items-start gap-2 text-sm font-semibold leading-6 text-teal-900">
            <Check size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />
            {t('homeTrust')}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href={path('/catalog')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#071724] px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
              {t('homeCta')}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href={path('/kits')} className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-900/12 bg-white px-6 py-3 text-sm font-semibold text-[#071724] transition hover:border-teal-300 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
              {t('homeSecondary')}
            </a>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t('homeResearchNotice')}</p>
        </div>
        <div className="relative self-center overflow-hidden bg-white p-2 sm:p-3">
          <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(7rem,0.75fr)] items-center gap-2 sm:gap-3">
            <img
              src={ENCORE_COMPLETE_KIT_IMAGE}
              alt={t('homeImageAlt')}
              width={ENCORE_COMPLETE_KIT_IMAGE_WIDTH}
              height={ENCORE_COMPLETE_KIT_IMAGE_HEIGHT}
              loading="lazy"
              decoding="async"
              className="aspect-video h-auto w-full rounded-xl object-cover object-center"
              sizes="(min-width: 1024px) 38vw, 65vw"
            />
            <BacWaterHeroImage
              alt={t('bacWaterHeroAlt')}
              sizes="(min-width: 1024px) 17vw, 35vw"
              className="aspect-square size-full rounded-xl object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
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
          src={ENCORE_COMPLETE_KIT_IMAGE}
          alt={t('kitThumbnailAlt')}
          width={ENCORE_COMPLETE_KIT_IMAGE_WIDTH}
          height={ENCORE_COMPLETE_KIT_IMAGE_HEIGHT}
          loading="lazy"
          decoding="async"
          className="aspect-video h-12 w-auto shrink-0 rounded-lg border border-teal-900/10 object-cover object-center"
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
          src={ENCORE_COMPLETE_KIT_IMAGE}
          alt={t('kitThumbnailAlt')}
          width={ENCORE_COMPLETE_KIT_IMAGE_WIDTH}
          height={ENCORE_COMPLETE_KIT_IMAGE_HEIGHT}
          loading="lazy"
          decoding="async"
          className="aspect-video h-14 w-auto shrink-0 rounded-xl border border-slate-900/10 object-cover object-center"
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
