import {
  Bell,
  Gauge,
  HandCoins,
  History,
  Link2,
  LogOut,
  Menu,
  MessageCircleQuestion,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { useState } from 'react'
import type { Locale } from '../../i18n/config'
import type { PremiumDashboard } from '../../lib/distributorPremium'
import { BrandLogoLink } from '../BrandLogoLink'
import { DistributorPremiumOverview } from './DistributorPremiumExperience'

const previewDashboard: PremiumDashboard = {
  account: {
    id: 'preview',
    displayName: 'Distribuidora Rivera',
    status: 'active',
    onboardingStatus: 'active',
    referralCode: 'RIVERA25',
    commissionRateBps: 2500,
    attributionWindowDays: 30,
    commissionHoldDays: 14,
    payoutMinimumCents: 25000,
    taxStatus: 'verified',
    countryCode: 'MX',
    entityType: 'business',
  },
  period: {
    startAt: '2026-07-18T00:00:00Z',
    endAt: '2026-08-16T23:59:59Z',
    priorStartAt: '2026-06-18T00:00:00Z',
    timeZone: 'America/Denver',
    analyticsStartedAt: '2026-06-01T00:00:00Z',
    analyticsAvailable: true,
    attributionModel: 'last_valid_partner_touch',
  },
  traffic: {
    clicks: 1264,
    uniqueClicks: 982,
    uniqueVisitors: 846,
    productViews: 672,
    checkouts: 184,
    completedCheckouts: 151,
    paidOrders: 128,
    visitorToCheckoutBps: 2175,
    checkoutToPaidBps: 6957,
    visitorToPaidBps: 1513,
    clickToPaidBps: 1013,
  },
  trafficPrior: {},
  commerce: {
    paidOrders: 128,
    grossRevenueCents: 1864200,
    refundsCents: 74200,
    netAttributedRevenueCents: 1790000,
    netCommissionCents: 447500,
    averageOrderValueCents: 14564,
  },
  commercePrior: {},
  financial: {
    availableCents: 328000,
    pendingCents: 119500,
    inPayoutCents: 75000,
    pendingAdjustmentsCents: 0,
    totalPaidCents: 1287600,
    minimumCents: 25000,
    amountToMinimumCents: 0,
    progressBps: 10000,
    nextPayoutDate: '2026-08-21',
    nextPayoutReason: 'scheduled',
    paymentProvider: 'manual',
    paymentStatus: 'verified',
    paymentLast4: '4821',
    currency: 'USD',
  },
  onboarding: [
    { key: 'identity', complete: true, completedAt: '2026-05-10', actionPath: '/distributor/onboarding', blockedReason: null },
    { key: 'contract', complete: true, completedAt: '2026-05-10', actionPath: '/distributor/onboarding', blockedReason: null },
    { key: 'tax', complete: true, completedAt: '2026-05-11', actionPath: '/distributor/onboarding', blockedReason: null },
    { key: 'payment', complete: true, completedAt: '2026-05-11', actionPath: '/distributor/onboarding', blockedReason: null },
    { key: 'approval', complete: true, completedAt: '2026-05-12', actionPath: '/distributor/onboarding', blockedReason: null },
    { key: 'activation', complete: true, completedAt: '2026-05-12', actionPath: '/distributor/onboarding', blockedReason: null },
  ],
  bestProduct: { productName: 'Retatrutide 10 mg', netRevenueCents: 612400, paid_orders: 42 },
  bestProductConversion: { productName: 'BPC-157 / TB-500', paid_orders: 26 },
  bestCampaign: { name: 'Agosto · WhatsApp VIP', netRevenueCents: 824100, paid_orders: 57 },
  bestChannel: { channel: 'WhatsApp', netRevenueCents: 1022600, paid_orders: 74 },
  partnerManager: {
    displayName: 'Mariana Torres',
    title: 'Partner Success Manager',
    email: 'partners@encorebiolabs.com',
    phone: null,
    whatsapp: null,
    responseTimeEn: 'Within one business day',
    responseTimeEs: 'Dentro de un día hábil',
    avatarPath: null,
  },
  goals: [],
  unreadNotifications: 3,
  openDisputes: 0,
  campaignCount: 8,
  activeLinkCount: 14,
  featureFlags: { growth_center: true, reports: true, disputes: true },
}

const nav = [
  ['Resumen', Gauge],
  ['Ventas', TrendingUp],
  ['Comisiones', HandCoins],
  ['Ajustes', History],
  ['Pagos', WalletCards],
  ['Comprobantes', ReceiptText],
  ['Centro de crecimiento', Link2],
  ['Aclaraciones', MessageCircleQuestion],
  ['Notificaciones', Bell],
  ['Seguridad', ShieldCheck],
] as const

export function DistributorPremiumPreviewPage({ locale }: { locale: Locale }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <main id="main-content" className="min-h-screen bg-[#f5f6f3] px-4 py-5 text-[#071724] sm:px-6 lg:p-8">
    <div className="mx-auto grid max-w-[100rem] gap-5 lg:grid-cols-[18rem_1fr]">
      <aside className="rounded-[1.75rem] bg-[#071724] p-5 text-white shadow-[0_25px_80px_rgba(7,23,36,.16)] lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <BrandLogoLink className="rounded-xl bg-white/95 px-3 py-2 shadow-sm" imageClassName="h-8" />
          <button className="grid size-11 place-items-center rounded-xl border border-white/15 lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Abrir menú"><Menu size={19} /></button>
        </div>
        <div className={`${menuOpen ? 'block' : 'hidden'} lg:block`}>
          <p className="mt-7 text-[.65rem] font-bold uppercase tracking-[.18em] text-teal-200">Portal de socios</p>
          <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1" aria-label="Preview del portal">
            {nav.map(([label, Icon], index) => <a key={label} href="#preview" className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${index === 0 ? 'bg-white text-[#071724] shadow-sm' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}><Icon size={16} /><span>{label}</span></a>)}
          </nav>
          <button className="mt-6 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300"><LogOut size={16} />Cerrar sesión segura</button>
        </div>
      </aside>

      <section className="min-w-0 rounded-[1.75rem] bg-white p-5 shadow-[0_20px_70px_rgba(7,23,36,.07)] sm:p-8 lg:p-10">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-950">Vista previa de diseño · datos demostrativos no operativos · esta ruta no existe en producción</div>
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">Inteligencia de socios</p><p className="mt-1 text-sm text-slate-500">sesión protegida · socio@ejemplo.com</p></div>
          <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900">Comisión base 25%</span>
        </header>
        <DistributorPremiumOverview dashboard={previewDashboard} locale={locale} preferredName="Héctor" path={() => '#preview'} onRange={() => undefined} />
      </section>
    </div>
  </main>
}
