import { Bell, Calculator, ClipboardCheck, ClipboardList, FileText, FlaskConical, Gauge, Headphones, LogOut, Package, ShieldCheck, TrendingUp, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { LanguageSelector } from '../LanguageSelector'

export function PortalShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { identity, logout } = usePortalAuth()
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  const { t: tInventory } = useTranslation('inventory')
  const clientNav = [
    ['/portal', t('navOverview'), Gauge], ['/portal/orders', t('navOrders'), Package], ['/portal/intake', t('navIntake'), ClipboardList], ['/portal/protocols', t('navProtocols'), FlaskConical],
    ['/portal/progress', t('navProgress'), TrendingUp], ['/portal/check-ins', t('navCheckIns'), ClipboardCheck],
    ['/portal/calculators', t('navCalculators'), Calculator], ['/portal/documents', t('navDocuments'), FileText],
    ['/portal/support', t('navSupport'), Headphones], ['/portal/notifications', t('navNotifications'), Bell], ['/portal/profile', t('navProfile'), UserRound], ['/portal/security', t('navSecurity'), ShieldCheck],
  ] as const
  const portalPath = window.location.pathname
  const adminNav = [['/admin',t('adminNavOverview')],['/admin/applications',t('adminNavApplications')],['/admin/clients',t('adminNavClients')],['/admin/orders',t('adminNavOrders')],['/admin/inventory',tInventory('nav')],['/admin/storefront',t('adminNavStorefront')],['/admin/protocols',t('adminNavProtocols')],['/admin/documents',t('adminNavDocuments')],['/admin/support',t('adminNavSupport')],['/admin/content',t('adminNavContent')],['/admin/audit-log',t('adminNavAudit')],['/admin/settings',t('adminNavSettings')]] as const
  const nav = admin ? adminNav : clientNav
  const statusKey = identity ? ({
    unverified: 'accountStatusUnverified',
    onboarding_incomplete: 'accountStatusOnboarding',
    pending_review: 'accountStatusPending',
    active: 'accountStatusActive',
    suspended: 'accountStatusSuspended',
    archived: 'accountStatusArchived',
  } as const)[identity.status] : null
  return <main id="main-content" className="min-h-screen bg-[#f5f6f3] px-4 py-5 sm:px-6 lg:p-8"><div className="mx-auto grid max-w-[92rem] gap-5 lg:grid-cols-[17rem_1fr]">
    <aside className="rounded-[1.75rem] bg-[#071724] p-5 text-white shadow-[0_25px_80px_rgba(7,23,36,.16)] lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)]"><a href={path('/')} className="text-xl font-semibold">encore <span className="text-teal-300">bio labs</span></a><p className="mt-7 text-[.65rem] font-bold uppercase tracking-[.18em] text-teal-200">{admin?t('adminLabel'):t('clientPortalLabel')}</p><nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">{nav.map((entry)=>{const href=entry[0];const label=entry[1];const Icon=entry.length>2?entry[2]:null;const active=portalPath===href;return <a key={href} href={path(href)} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active?'bg-white text-[#071724]':'text-slate-300 hover:bg-white/8 hover:text-white'}`}>{Icon?<Icon size={16}/>:null}{label}</a>})}</nav><button onClick={()=>void logout().then(()=>window.location.assign(path('/client-login')))} className="mt-5 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 hover:bg-white/8"><LogOut size={16}/>{t('secureLogout')}</button></aside>
    <section className="min-w-0 rounded-[1.75rem] bg-white p-5 shadow-[0_20px_70px_rgba(7,23,36,.07)] sm:p-8 lg:p-10"><header className="mb-9 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">{admin?t('adminWorkspace'):t('privateAccount')}</p><p className="mt-1 text-sm text-slate-500">{t('signedInAs',{email:identity?.profile.email??''})}</p></div><div className="flex items-center gap-3"><LanguageSelector variant="nav" />{statusKey?<span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-900">{t(statusKey)}</span>:null}</div></header>{children}</section>
  </div></main>
}
