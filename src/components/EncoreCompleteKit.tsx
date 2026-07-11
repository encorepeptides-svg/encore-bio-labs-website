import { Bandage, Check, Droplet, FlaskConical, PackageCheck, Syringe } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '../lib/utils'
import {
  encoreCompleteKitCopy,
  getEncoreCompleteKitCompactSummary,
  getEncoreCompleteKitItems,
  type EncoreCompleteKitItem,
} from '../data/encoreCompleteKit'

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
  showDescription?: boolean
  showClosingMessage?: boolean
  className?: string
}

export function EncoreCompleteKit({
  productName,
  bacWaterAmount,
  syringeCount,
  prepPadCount,
  variant = 'full',
  showDescription = true,
  showClosingMessage = true,
  className,
}: EncoreCompleteKitProps) {
  const items = getEncoreCompleteKitItems({ productName, bacWaterAmount, syringeCount, prepPadCount })

  if (variant === 'compact') return <CompactCard syringeCount={syringeCount} className={className} />
  if (variant === 'inline') return <InlineCard items={items} showClosingMessage={showClosingMessage} className={className} />
  if (variant === 'cart') return <CartReminder items={items} className={className} />
  if (variant === 'checkout') return <CheckoutReminder items={items} className={className} />
  return (
    <FullCard items={items} showDescription={showDescription} showClosingMessage={showClosingMessage} className={className} />
  )
}

function KitIcon({ item, className }: { item: EncoreCompleteKitItem; className?: string }) {
  const Icon = itemIcons[item.key]
  return <Icon size={18} aria-hidden="true" className={className} />
}

function FullCard({
  items,
  showDescription,
  showClosingMessage,
  className,
}: {
  items: EncoreCompleteKitItem[]
  showDescription: boolean
  showClosingMessage: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_24px_80px_rgba(7,23,36,0.08)] sm:p-8',
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/15 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
        <PackageCheck size={15} aria-hidden="true" />
        {encoreCompleteKitCopy.fullEyebrow}
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#071724] sm:text-3xl">
        {encoreCompleteKitCopy.fullHeading}
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{encoreCompleteKitCopy.fullDescription}</p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-start gap-3 rounded-2xl border border-slate-900/10 bg-[#f8fafc] p-4 transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-teal-200/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <KitIcon item={item} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#071724]">{item.title}</p>
              {showDescription ? <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ul>

      {showClosingMessage ? (
        <p className="mt-6 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">
          {encoreCompleteKitCopy.closingMessage}
        </p>
      ) : null}
    </div>
  )
}

function InlineCard({
  items,
  showClosingMessage,
  className,
}: {
  items: EncoreCompleteKitItem[]
  showClosingMessage: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-slate-900/10 bg-white p-6 shadow-[0_20px_64px_rgba(7,23,36,0.07)] sm:p-8',
        className,
      )}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-700/15 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">
            <PackageCheck size={14} aria-hidden="true" />
            {encoreCompleteKitCopy.fullEyebrow}
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[#071724] sm:text-3xl">
            {encoreCompleteKitCopy.fullHeading}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            {encoreCompleteKitCopy.fullDescription}
          </p>
          {showClosingMessage ? (
            <p className="mt-4 text-sm font-semibold text-teal-800">{encoreCompleteKitCopy.closingMessage}</p>
          ) : null}
          <a
            href="/catalog"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Browse Catalog
          </a>
        </div>

        <ul className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <li
              key={item.key}
              className="rounded-2xl border border-slate-900/10 bg-[#f8fafc] p-4 transition motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-teal-200/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                <KitIcon item={item} />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#071724]">{item.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CompactCard({ syringeCount, className }: { syringeCount?: number; className?: string }) {
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
          {encoreCompleteKitCopy.compactHeading}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          {getEncoreCompleteKitCompactSummary({ syringeCount })}
        </p>
      </div>
    </div>
  )
}

function CartReminder({ items, className }: { items: EncoreCompleteKitItem[]; className?: string }) {
  return (
    <div className={cn('rounded-lg bg-teal-50/70 px-3 py-2', className)}>
      <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-teal-800">
        <PackageCheck size={13} aria-hidden="true" className="shrink-0" />
        {encoreCompleteKitCopy.cartHeading}
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
  )
}

function CheckoutReminder({ items, className }: { items: EncoreCompleteKitItem[]; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-900/10 bg-[#f8fafc] p-4', className)}>
      <p className="flex items-center gap-2 text-sm font-semibold text-[#071724]">
        <PackageCheck size={16} aria-hidden="true" className="text-teal-700" />
        {encoreCompleteKitCopy.checkoutHeading}
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
  )
}
