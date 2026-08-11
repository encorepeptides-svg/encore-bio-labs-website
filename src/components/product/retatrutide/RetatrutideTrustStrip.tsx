import { BadgeCheck, Boxes, PackageCheck, Microscope, Truck } from 'lucide-react'
import { useTranslation } from '../../../i18n/LocaleContext'

// Sits directly under the hero, above the configurator: the proofs a buyer needs
// before they see a price. Deliberately claim-free on purity — Retatrutide has no
// entry in coa.ts yet, so nothing here promises a document we cannot produce.
const proofs = [
  { icon: Boxes, titleKey: 'trustOrdersTitle', noteKey: 'trustOrdersNote' },
  { icon: BadgeCheck, titleKey: 'trustTestedTitle', noteKey: 'trustTestedNote' },
  { icon: Microscope, titleKey: 'trustMethodTitle', noteKey: 'trustMethodNote' },
  { icon: PackageCheck, titleKey: 'trustAmbientTitle', noteKey: 'trustAmbientNote' },
  { icon: Truck, titleKey: 'trustDispatchTitle', noteKey: 'trustDispatchNote' },
] as const

export function RetatrutideTrustStrip() {
  const { t } = useTranslation('retatrutide')

  return (
    <section className="bg-[#071724] text-white" aria-label={t('trustTestedTitle')}>
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 divide-y divide-white/10 px-5 sm:grid-cols-2 sm:divide-y-0 sm:px-8 lg:grid-cols-5">
        {proofs.map((proof) => (
          <div key={proof.titleKey} className="flex items-center gap-3 py-4 sm:border-b sm:border-white/10 sm:py-5 lg:border-b-0 lg:border-r lg:px-4 lg:py-6 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.7rem] bg-teal-400/15 text-teal-300">
              <proof.icon size={16} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-5 tracking-[-0.01em]">{t(proof.titleKey)}</span>
              <span className="mt-0.5 block text-xs leading-4 text-slate-400">{t(proof.noteKey)}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
