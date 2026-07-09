import {
  Boxes,
  CreditCard,
  Headphones,
  MapPin,
  MessageCircle,
  PackageSearch,
  Sparkles,
  Truck,
  type LucideIcon,
} from 'lucide-react'

const actions: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'browse-products', label: 'Browse Products', icon: Boxes },
  { id: 'best-sellers', label: 'Best Sellers', icon: Sparkles },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'local-delivery', label: 'Local Delivery', icon: MapPin },
  { id: 'track-order', label: 'Track My Order', icon: PackageSearch },
  { id: 'contact-team', label: 'Contact Team', icon: Headphones },
  { id: 'order-whatsapp', label: 'Order on WhatsApp', icon: MessageCircle },
]

export function QuickActions({ onAction }: { onAction: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-t border-slate-900/8 bg-white/70 px-4 py-3">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className="flex items-center gap-2 rounded-xl border border-slate-900/8 bg-white px-3 py-2.5 text-left text-xs font-semibold text-[var(--navy)] shadow-[0_8px_20px_rgba(7,23,36,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50"
        >
          <action.icon size={14} aria-hidden="true" className="shrink-0 text-teal-600" />
          <span className="truncate">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
