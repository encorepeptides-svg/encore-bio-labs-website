import {
  BadgeDollarSign,
  Bell,
  Boxes,
  Calculator,
  Camera,
  ClipboardCheck,
  ClipboardList,
  FileText,
  FlaskConical,
  Gauge,
  HandCoins,
  Headphones,
  History,
  Link2,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquareQuote,
  MessageCircleQuestion,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  UserCheck,
  UserRound,
  UsersRound,
  WalletCards,
  ReceiptText,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { LanguageSelector } from '../LanguageSelector'
import { BrandLogoLink } from '../BrandLogoLink'
import { adminUnreadCommunicationCount } from '../../lib/portal/portalData'
import { stripLocalePrefix } from '../../i18n/config'

type NavEntry = readonly [href: string, label: string, icon: LucideIcon]
type NavGroup = { label: string; entries: NavEntry[] }

export function PortalShell({ children, admin = false, distributor = false }: { children: ReactNode; admin?: boolean; distributor?: boolean }) {
  const { identity, logout } = usePortalAuth()
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  const { t: tDistributor } = useTranslation('distributor')
  const { t: tInventory } = useTranslation('inventory')
  const clientNav: NavEntry[] = [
    ['/portal', t('navOverview'), Gauge],
    ['/portal/orders', t('navOrders'), Package],
    ['/portal/intake', t('navIntake'), ClipboardList],
    ['/portal/protocols', t('navProtocols'), FlaskConical],
    ['/portal/progress', t('navProgress'), TrendingUp],
    ['/portal/check-ins', t('navCheckIns'), ClipboardCheck],
    ['/portal/research-matches', t('navResearchMatches'), Sparkles],
    ['/portal/calculators', t('navCalculators'), Calculator],
    ['/portal/research-media', t('navResearchMedia'), Camera],
    ['/portal/feedback', t('navFeedback'), MessageSquareQuote],
    ['/portal/documents', t('navDocuments'), FileText],
    ['/portal/support', t('navSupport'), Headphones],
    ['/portal/notifications', t('navNotifications'), Bell],
    ['/portal/profile', t('navProfile'), UserRound],
    ['/portal/security', t('navSecurity'), ShieldCheck],
  ]
  const distributorNav: NavEntry[] = identity?.distributorOnboardingStatus === 'active' ? [
    ['/distributor', tDistributor('navOverview'), Gauge],
    ['/distributor/sales', tDistributor('navSales'), TrendingUp],
    ['/distributor/commissions', tDistributor('navCommissions'), HandCoins],
    ['/distributor/adjustments', tDistributor('navAdjustments'), History],
    ['/distributor/payouts', tDistributor('navPayouts'), WalletCards],
    ['/distributor/receipts', tDistributor('navReceipts'), ReceiptText],
    ['/distributor/growth', tDistributor('navGrowth'), Link2],
    ['/distributor/disputes', tDistributor('navDisputes'), MessageCircleQuestion],
    ['/distributor/notifications', tDistributor('navNotifications'), Bell],
    ['/distributor/security', tDistributor('navSecurity'), ShieldCheck],
  ] : [
    ['/distributor/onboarding', tDistributor('onboardingNav'), ClipboardCheck],
  ]
  const portalPath = stripLocalePrefix(window.location.pathname).path
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (admin) void adminUnreadCommunicationCount().then(setUnread).catch(() => setUnread(0))
  }, [admin, portalPath])

  const adminGroups: NavGroup[] = [
    {
      label: 'Command center',
      entries: [['/admin', 'Dashboard', Gauge]],
    },
    {
      label: 'Sales & fulfillment',
      entries: [
        ['/admin/leads', 'CRM & Leads', UsersRound],
        ['/admin/distributors', t('adminNavDistributors'), BadgeDollarSign],
        ['/admin/whatsapp', 'WhatsApp Sales', MessageCircle],
        ['/admin/storefront', t('adminNavStorefront'), Store],
        ['/admin/orders', t('adminNavOrders'), ShoppingCart],
        ['/admin/shipping', 'Shipping', Truck],
        ['/admin/inventory', tInventory('nav'), Boxes],
        ['/admin/communications', `Communications${unread ? ` (${unread})` : ''}`, Mail],
        ['/admin/customer-messages', 'Customer Messages', MessageSquareQuote],
      ],
    },
    {
      label: 'Administration',
      entries: [
        ['/admin/applications', t('adminNavApplications'), ClipboardList],
        ['/admin/clients', t('adminNavClients'), UserCheck],
        ['/admin/protocols', t('adminNavProtocols'), FlaskConical],
        ['/admin/documents', t('adminNavDocuments'), FileText],
        ['/admin/support', t('adminNavSupport'), Headphones],
        ['/admin/content', t('adminNavContent'), Sparkles],
        ['/admin/audit-log', t('adminNavAudit'), History],
        ['/admin/settings', t('adminNavSettings'), Settings],
      ],
    },
  ]

  const statusKey = identity ? ({
    unverified: 'accountStatusUnverified',
    onboarding_incomplete: 'accountStatusOnboarding',
    pending_review: 'accountStatusPending',
    active: 'accountStatusActive',
    suspended: 'accountStatusSuspended',
    archived: 'accountStatusArchived',
  } as const)[identity.status] : null

  function active(href: string) {
    if (href === '/admin' || href === '/portal') return portalPath === href
    if (href === '/admin/leads' && (portalPath === '/admin/crm' || portalPath.startsWith('/admin/crm/'))) return true
    return portalPath === href || portalPath.startsWith(`${href}/`)
  }

  function navLink([href, label, Icon]: NavEntry) {
    const isActive = active(href)
    return <a
      key={href}
      href={path(href)}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => setMenuOpen(false)}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${isActive ? 'bg-white text-[#071724] shadow-sm' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </a>
  }

  return <main id="main-content" className="min-h-screen bg-[#f5f6f3] px-4 py-5 sm:px-6 lg:p-8">
    <div className="mx-auto grid max-w-[100rem] gap-5 lg:grid-cols-[18rem_1fr]">
      <aside className="rounded-[1.75rem] bg-[#071724] p-5 text-white shadow-[0_25px_80px_rgba(7,23,36,.16)] lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-4"><BrandLogoLink className="rounded-xl bg-white/95 px-3 py-2 shadow-sm" imageClassName="h-8 sm:h-8" /><button className="grid size-11 place-items-center rounded-xl border border-white/15 lg:hidden" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
        <div className={`${menuOpen ? 'block' : 'hidden'} lg:block`}>
        <p className="mt-7 text-[.65rem] font-bold uppercase tracking-[.18em] text-teal-200">{admin ? t('adminLabel') : distributor ? tDistributor('portalLabel') : t('clientPortalLabel')}</p>

        {admin ? <div className="mt-4 grid gap-6">
          {adminGroups.map((group) => <section key={group.label}>
            <p className="px-3 text-[.6rem] font-bold uppercase tracking-[.17em] text-slate-500">{group.label}</p>
            <nav aria-label={group.label} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {group.entries.map(navLink)}
            </nav>
          </section>)}
        </div> : <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {(distributor ? distributorNav : clientNav).map(navLink)}
        </nav>}

        <button
          onClick={() => void logout().then(() => window.location.assign(path(distributor ? '/distributor/login' : '/client-login')))}
          className="mt-6 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 hover:bg-white/8"
        >
          <LogOut size={16} aria-hidden="true" />
          {t('secureLogout')}
        </button>
        </div>
      </aside>

      <section className="min-w-0 rounded-[1.75rem] bg-white p-5 shadow-[0_20px_70px_rgba(7,23,36,.07)] sm:p-8 lg:p-10">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">{admin ? t('adminWorkspace') : distributor ? tDistributor('workspaceLabel') : t('privateAccount')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('signedInAs', { email: identity?.profile.email ?? '' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="nav" />
            {statusKey && !distributor ? <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900">{t(statusKey)}</span> : null}
          </div>
        </header>
        {children}
      </section>
    </div>
  </main>
}
