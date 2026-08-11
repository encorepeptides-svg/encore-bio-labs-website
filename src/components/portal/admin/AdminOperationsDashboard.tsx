import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Boxes,
  CircleAlert,
  ClipboardList,
  FileText,
  FlaskConical,
  Headphones,
  Inbox,
  LoaderCircle,
  Mail,
  MessageCircle,
  PackageCheck,
  Phone,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import {
  adminFetchOrders,
  adminFetchOverview,
  adminUnreadCommunicationCount,
  type AdminOverview,
  type PortalOrder,
} from '../../../lib/portal/portalData'
import { getLeads } from '../../../lib/crmStorage'
import { selectStorefrontFollowUps, storefrontOrderNeedsFollowUp } from '../../../lib/storefront/adminQueue'
import { adminFetchStorefrontOrders, type StorefrontOrderRow } from '../../../lib/storefront/interimCheckout'
import { supabase } from '../../../lib/supabaseClient'
import type { Lead } from '../../../types/crm'

type WhatsAppBootstrap = {
  metrics: {
    total_conversations: number
    hot: number
    warm: number
    open_reviews: number
    due_followups: number
    human_takeovers: number
  }
  readiness?: {
    webhook?: { configured?: boolean }
    delivery?: { configured?: boolean }
  }
}

type DashboardData = {
  overview: AdminOverview
  websiteLeads: Lead[]
  orders: PortalOrder[]
  storefrontOrders: StorefrontOrderRow[]
  unreadCommunications: number
  whatsapp: WhatsAppBootstrap | null
  partial: boolean
}

const EMPTY_OVERVIEW: AdminOverview = {
  pendingApplications: 0,
  activeClients: 0,
  openThreads: 0,
  processingOrders: 0,
}

async function fetchWhatsAppBootstrap(): Promise<WhatsAppBootstrap | null> {
  if (!supabase) return null
  const { data, error } = await supabase.functions.invoke<{
    ok: boolean
    data?: WhatsAppBootstrap
    error?: string
  }>('closeos-admin', { body: { action: 'bootstrap' } })
  if (error || !data?.ok) return null
  return data.data ?? null
}

async function loadDashboard(): Promise<DashboardData> {
  const [overviewResult, leadsResult, ordersResult, storefrontResult, unreadResult, whatsappResult] = await Promise.allSettled([
    adminFetchOverview(),
    getLeads(),
    adminFetchOrders(),
    adminFetchStorefrontOrders(),
    adminUnreadCommunicationCount(),
    fetchWhatsAppBootstrap(),
  ])

  const failures = [overviewResult, leadsResult, ordersResult, storefrontResult, unreadResult, whatsappResult]
    .filter((result) => result.status === 'rejected').length

  return {
    overview: overviewResult.status === 'fulfilled' ? overviewResult.value : EMPTY_OVERVIEW,
    websiteLeads: leadsResult.status === 'fulfilled' ? leadsResult.value : [],
    orders: ordersResult.status === 'fulfilled' ? ordersResult.value : [],
    storefrontOrders: storefrontResult.status === 'fulfilled' ? storefrontResult.value : [],
    unreadCommunications: unreadResult.status === 'fulfilled' ? unreadResult.value : 0,
    whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : null,
    partial: failures > 0,
  }
}

function isPaid(status: string) {
  return ['paid', 'succeeded', 'complete', 'completed'].includes(status.toLowerCase())
}

function isOpenFulfillment(status: string) {
  return ['pending', 'processing', 'unfulfilled', 'ready'].includes(status.toLowerCase())
}

function money(cents: number, locale: 'en' | 'es') {
  return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function dateLabel(value: string, locale: 'en' | 'es', unknownLabel: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return unknownLabel
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

export function AdminOperationsDashboard() {
  const { path, locale } = useLocale()
  const { t } = useTranslation('portal')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setData(await loadDashboard())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The administration dashboard could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  if (loading && !data) {
    return <div className="mt-8 grid min-h-72 place-items-center rounded-[2rem] border border-slate-900/8 bg-[#f8faf9]">
      <div className="text-center">
        <LoaderCircle className="mx-auto animate-spin text-teal-700" size={30} aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-slate-600">Loading Encore operations…</p>
      </div>
    </div>
  }

  if (error && !data) {
    return <div className="mt-8 rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-red-950">
      <p className="font-semibold">The operations dashboard could not be loaded.</p>
      <p className="mt-2 text-sm leading-6">{error}</p>
      <button type="button" onClick={() => void refresh()} className="mt-4 rounded-full bg-red-950 px-5 py-2.5 text-sm font-semibold text-white">Retry</button>
    </div>
  }

  if (!data) return null

  const whatsapp = data.whatsapp?.metrics
  const totalLeads = data.websiteLeads.length + (whatsapp?.total_conversations ?? 0)
  const hotWebsiteLeads = data.websiteLeads.filter((lead) => lead.leadScore.score >= 70).length
  const hotLeads = hotWebsiteLeads + (whatsapp?.hot ?? 0)
  const readyToShip = data.orders.filter((order) => isPaid(order.payment_status) && isOpenFulfillment(order.fulfillment_status)).length
  const activeFulfillment = data.orders.filter((order) => !['delivered', 'canceled', 'cancelled'].includes(order.fulfillment_status.toLowerCase())).length
  const storefrontFollowUps = selectStorefrontFollowUps(data.storefrontOrders)
  const storefrontFollowUpCount = data.storefrontOrders.filter(storefrontOrderNeedsFollowUp).length
  const recentLeads = [...data.websiteLeads]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)
  const fulfillmentQueue = data.orders
    .filter((order) => isOpenFulfillment(order.fulfillment_status))
    .slice(0, 5)

  const salesModules: Module[] = [
    {
      title: 'CRM & Leads',
      description: 'Website inquiries, lead scoring, follow-up drafts, notes, and pipeline management.',
      href: '/admin/leads',
      icon: UsersRound,
      metric: `${data.websiteLeads.length} website leads`,
      status: hotWebsiteLeads ? `${hotWebsiteLeads} high intent` : 'Pipeline ready',
    },
    {
      title: 'WhatsApp Sales Desk',
      description: 'Bilingual conversations, lead qualification, review queues, and human takeover.',
      href: '/admin/whatsapp',
      icon: MessageCircle,
      metric: `${whatsapp?.total_conversations ?? 0} conversations`,
      status: whatsapp?.open_reviews ? `${whatsapp.open_reviews} need review` : 'Review queue clear',
    },
    {
      title: t('adminDashboardStorefrontTitle'),
      description: t('adminDashboardStorefrontDescription'),
      href: '/admin/storefront',
      icon: Store,
      metric: t('adminDashboardStorefrontMetric', { count: storefrontFollowUpCount }),
      status: t('adminDashboardStorefrontStatus'),
    },
    {
      title: 'Orders',
      description: 'Create orders, review payment status, update fulfillment, and add tracking.',
      href: '/admin/orders',
      icon: ShoppingCart,
      metric: `${data.overview.processingOrders} processing`,
      status: `${data.orders.length} total orders`,
    },
    {
      title: 'Shipping & Fulfillment',
      description: 'Work the fulfillment queue now and connect live carrier rates and labels later.',
      href: '/admin/shipping',
      icon: Truck,
      metric: `${readyToShip} ready to ship`,
      status: 'API-ready workspace',
    },
    {
      title: 'Inventory',
      description: 'Stock levels, movements, reorder settings, backorders, and product availability.',
      href: '/admin/inventory',
      icon: Boxes,
      metric: `${activeFulfillment} active fulfillments`,
      status: 'Stock operations',
    },
    {
      title: 'Sales Inbox',
      description: 'Customer messages, contact forms, assignments, read status, and replies.',
      href: '/admin/communications',
      icon: Inbox,
      metric: `${data.unreadCommunications} unread`,
      status: data.unreadCommunications ? 'Attention needed' : 'Inbox clear',
    },
  ]

  const administrationModules: Module[] = [
    { title: 'Applications', description: 'Review portal applications and onboarding decisions.', href: '/admin/applications', icon: ClipboardList, metric: `${data.overview.pendingApplications} pending` },
    { title: 'Clients', description: 'Manage client access, status, profiles, and portal relationships.', href: '/admin/clients', icon: UserCheck, metric: `${data.overview.activeClients} active` },
    { title: 'Support', description: 'Resolve open support threads and customer concerns.', href: '/admin/support', icon: Headphones, metric: `${data.overview.openThreads} open` },
    { title: 'Documents', description: 'Upload and assign research documents and client files.', href: '/admin/documents', icon: FileText, metric: 'Document center' },
    { title: 'Protocols', description: 'Create and manage approved portal protocol records.', href: '/admin/protocols', icon: FlaskConical, metric: 'Client records' },
    { title: 'Content', description: 'Review social proof, testimonials, and publishing controls.', href: '/admin/content', icon: ShieldCheck, metric: 'Content review' },
    { title: 'Audit Log', description: 'Review administrator actions and operational history.', href: '/admin/audit-log', icon: PackageCheck, metric: 'System history' },
    { title: 'Settings', description: 'Central home for future integrations and operating preferences.', href: '/admin/settings', icon: Settings, metric: 'Configuration' },
  ]

  return <div className="mt-8 grid gap-8">
    <section className="relative overflow-hidden rounded-[2rem] bg-[#071724] p-6 text-white shadow-[0_30px_100px_rgba(7,23,36,.2)] sm:p-8 lg:p-10">
      <div className="absolute -right-20 -top-24 size-72 rounded-full bg-teal-300/10 blur-3xl" aria-hidden="true" />
      <div className="relative grid gap-8 xl:grid-cols-[1.35fr_.65fr] xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-200">Encore command center</p>
          <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Run administration, sales, and fulfillment from one place.</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">Start every work session here. Leads, WhatsApp, orders, inventory, customer communication, applications, and shipping operations are organized into one daily workspace.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <QuickLink href={path('/admin/leads')} label="Work the lead pipeline" meta={`${hotLeads} high-intent leads`} />
          <QuickLink href={path('/admin/storefront')} label={t('adminDashboardStorefrontQuickLink')} meta={t('adminDashboardStorefrontQuickMeta', { count: storefrontFollowUpCount })} />
          <QuickLink href={path('/admin/orders')} label="Process orders" meta={`${readyToShip} ready to ship`} />
          <QuickLink href={path('/admin/communications')} label="Open sales inbox" meta={`${data.unreadCommunications} unread messages`} />
        </div>
      </div>
    </section>

    {data.partial ? <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>Some live counters could not be loaded, but the available administration modules remain accessible.</p>
    </div> : null}

    {storefrontFollowUpCount ? <section className="flex flex-col gap-5 rounded-[1.5rem] border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-[0_16px_50px_rgba(120,53,15,.08)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-950 text-amber-100"><CircleAlert size={19} aria-hidden="true" /></span>
        <div>
          <h2 className="text-lg font-semibold">{t('adminDashboardStorefrontAlertTitle', { count: storefrontFollowUpCount })}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-amber-900/80">{t('adminDashboardStorefrontAlertCopy')}</p>
        </div>
      </div>
      <a href={path('/admin/storefront')} className="shrink-0 rounded-full bg-amber-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-900">{t('adminDashboardStorefrontAlertAction')}</a>
    </section> : null}

    <section aria-label="Operations scorecard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Scorecard label="All active leads" value={totalLeads} detail={`${data.websiteLeads.length} website · ${whatsapp?.total_conversations ?? 0} WhatsApp`} />
        <Scorecard label="High-intent leads" value={hotLeads} detail={`${hotWebsiteLeads} website · ${whatsapp?.hot ?? 0} WhatsApp`} />
        <Scorecard label="Orders processing" value={data.overview.processingOrders} detail={`${readyToShip} paid and ready`} />
        <Scorecard label={t('adminDashboardStorefrontScorecard')} value={storefrontFollowUpCount} detail={t('adminDashboardStorefrontScorecardDetail')} />
        <Scorecard label="Needs attention" value={data.overview.openThreads + data.overview.pendingApplications + data.unreadCommunications + storefrontFollowUpCount + (whatsapp?.open_reviews ?? 0)} detail="Support, applications, inbox, checkout, and WhatsApp reviews" />
      </div>
    </section>

    <ModuleSection title="Sales & fulfillment" description="The tools you will use most often to move a lead from first message through delivery." modules={salesModules} path={path} />

    <section className="grid gap-5 xl:grid-cols-3">
      <ActivityCard title="Newest website leads" actionLabel="Open CRM" actionHref={path('/admin/leads')}>
        {recentLeads.length ? recentLeads.map((lead) => <ActivityRow
          key={lead.id}
          title={`${lead.firstName} ${lead.lastName}`.trim() || 'Unnamed lead'}
          detail={`${lead.campaignSource} · Score ${lead.leadScore.score}`}
          meta={dateLabel(lead.createdAt, locale, t('adminDashboardStorefrontUnknownDate'))}
        />) : <EmptyActivity copy="New website inquiries will appear here." />}
      </ActivityCard>

      <ActivityCard title={t('adminDashboardStorefrontQueueTitle')} actionLabel={t('adminDashboardStorefrontQueueAction')} actionHref={path('/admin/storefront')}>
        {storefrontFollowUps.length ? storefrontFollowUps.map((order) => <StorefrontFollowUpRow
          key={order.id}
          order={order}
          locale={locale}
          orderHref={`${path('/admin/storefront')}?order=${encodeURIComponent(order.id)}`}
          labels={{
            call: t('adminDashboardStorefrontCall'),
            email: t('adminDashboardStorefrontEmail'),
            open: t('adminDashboardStorefrontOpen'),
            shippingReview: t('adminStorefrontPendingShippingReview'),
            quotePending: t('adminStorefrontQuotePending'),
            pendingPayment: t('adminDashboardStorefrontPendingPayment'),
            unknownDate: t('adminDashboardStorefrontUnknownDate'),
          }}
        />) : <EmptyActivity copy={t('adminDashboardStorefrontQueueEmpty')} />}
      </ActivityCard>

      <ActivityCard title="Fulfillment queue" actionLabel="Open shipping" actionHref={path('/admin/shipping')}>
        {fulfillmentQueue.length ? fulfillmentQueue.map((order) => <ActivityRow
          key={order.id}
          title={order.order_number}
          detail={`${money(order.amount_cents, locale)} · ${order.payment_status.replaceAll('_', ' ')}`}
          meta={order.fulfillment_status.replaceAll('_', ' ')}
        />) : <EmptyActivity copy="No orders are waiting for fulfillment." />}
      </ActivityCard>
    </section>

    <ModuleSection title="Administration" description="Client operations, storefront controls, documentation, governance, and system configuration." modules={administrationModules} path={path} />
  </div>
}

type Module = {
  title: string
  description: string
  href: string
  icon: LucideIcon
  metric: string
  status?: string
}

function ModuleSection({ title, description, modules, path }: { title: string; description: string; modules: Module[]; path: (href: string) => string }) {
  return <section>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Workspace</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-[#071724]">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
    <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {modules.map((module) => <ModuleCard key={module.href} module={module} href={path(module.href)} />)}
    </div>
  </section>
}

function ModuleCard({ module, href }: { module: Module; href: string }) {
  const Icon = module.icon
  return <a href={href} className="group grid min-h-56 grid-rows-[auto_1fr_auto] rounded-[1.5rem] border border-slate-900/8 bg-white p-5 shadow-[0_16px_50px_rgba(7,23,36,.06)] transition hover:-translate-y-1 hover:border-teal-500/35 hover:shadow-[0_24px_70px_rgba(7,23,36,.11)]">
    <div className="flex items-start justify-between gap-4">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#071724] text-teal-200"><Icon size={20} aria-hidden="true" /></span>
      <span className="rounded-full bg-[#f1f5f3] px-3 py-1.5 text-xs font-semibold text-slate-600">{module.metric}</span>
    </div>
    <div className="mt-6">
      <h3 className="text-xl font-semibold tracking-[-.03em] text-[#071724]">{module.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
    </div>
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-900/7 pt-4 text-sm font-semibold text-teal-800">
      <span>{module.status ?? 'Open workspace'}</span>
      <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
    </div>
  </a>
}

function Scorecard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <div className="rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-5">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">{label}</p>
    <p className="mt-3 text-4xl font-semibold tracking-[-.06em] text-[#071724]">{value}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
  </div>
}

function QuickLink({ href, label, meta }: { href: string; label: string; meta: string }) {
  return <a href={href} className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/8 px-5 py-4 transition hover:bg-white/13">
    <span>
      <span className="block text-sm font-semibold text-white">{label}</span>
      <span className="mt-1 block text-xs text-slate-300">{meta}</span>
    </span>
    <ArrowRight size={17} className="text-teal-200 transition group-hover:translate-x-1" aria-hidden="true" />
  </a>
}

function ActivityCard({ title, actionLabel, actionHref, children }: { title: string; actionLabel: string; actionHref: string; children: React.ReactNode }) {
  return <section className="rounded-[1.5rem] border border-slate-900/8 bg-white p-5 shadow-[0_16px_50px_rgba(7,23,36,.05)]">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-[-.03em] text-[#071724]">{title}</h2>
      <a href={actionHref} className="text-xs font-semibold text-teal-800 hover:text-teal-950">{actionLabel}</a>
    </div>
    <div className="mt-4 divide-y divide-slate-900/7">{children}</div>
  </section>
}

function ActivityRow({ title, detail, meta }: { title: string; detail: string; meta: string }) {
  return <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[#071724]">{title}</p>
      <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
    </div>
    <span className="shrink-0 text-xs font-semibold capitalize text-slate-400">{meta}</span>
  </div>
}

type StorefrontRowLabels = {
  call: string
  email: string
  open: string
  shippingReview: string
  quotePending: string
  pendingPayment: string
  unknownDate: string
}

function StorefrontFollowUpRow({ order, locale, orderHref, labels }: { order: StorefrontOrderRow; locale: 'en' | 'es'; orderHref: string; labels: StorefrontRowLabels }) {
  const name = order.contact?.name?.trim() || order.order_reference
  const total = order.total_cents === null ? money(order.subtotal_cents, locale) : money(order.total_cents, locale)
  const status = order.status === 'pending_shipping_review'
    ? labels.shippingReview
    : order.status === 'quote_pending'
      ? labels.quotePending
      : labels.pendingPayment
  const phone = order.contact?.phone?.trim() ?? ''
  const callablePhone = phone.replace(/[^+\d]/g, '')
  const email = order.contact?.email?.trim() ?? ''
  const contactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''

  return <div className="py-4 first:pt-0 last:pb-0">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#071724]">{name}</p>
        <p className="mt-1 truncate font-mono text-xs text-slate-500">{order.order_reference} · {total}</p>
      </div>
      <span className="shrink-0 text-xs font-semibold text-slate-400">{dateLabel(order.created_at, locale, labels.unknownDate)}</span>
    </div>
    <p className="mt-2 text-xs font-semibold text-amber-800">{status}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {callablePhone ? <a href={`tel:${callablePhone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-900/10 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Phone size={13} aria-hidden="true" />{labels.call}</a> : null}
      {contactEmail ? <a href={`mailto:${encodeURIComponent(contactEmail)}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-900/10 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Mail size={13} aria-hidden="true" />{labels.email}</a> : null}
      <a href={orderHref} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#071724] px-3 text-xs font-semibold text-white hover:bg-[#0c2537]">{labels.open}<ArrowRight size={13} aria-hidden="true" /></a>
    </div>
  </div>
}

function EmptyActivity({ copy }: { copy: string }) {
  return <p className="py-7 text-center text-sm text-slate-500">{copy}</p>
}
