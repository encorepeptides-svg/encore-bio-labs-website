import { FlaskConical, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { useTranslation } from '../../i18n/LocaleContext'

export function CatalogTrustStrip() {
  const { t } = useTranslation('catalog')

  const trustItems = [
    { icon: ShieldCheck, label: t('trustThirdPartyTested') },
    { icon: PackageCheck, label: t('trustJanoshikCoas') },
    { icon: Truck, label: t('trustShipsFromUsa') },
    { icon: FlaskConical, label: t('trustResearchUseOnly') },
  ]

  return (
    <section className="px-5 py-8 sm:px-8">
      <div className="mx-auto grid max-w-[88rem] gap-3 rounded-[1.5rem] border border-white/70 bg-white/72 p-3 shadow-[0_18px_54px_rgba(7,23,36,0.06)] backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-[1.1rem] bg-[#f5f5f2]/80 px-4 py-3">
            <item.icon size={17} aria-hidden="true" className="shrink-0 text-teal-700" />
            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
