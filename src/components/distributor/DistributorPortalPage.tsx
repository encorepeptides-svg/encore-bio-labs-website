import {
  BadgeDollarSign,
  Check,
  Copy,
  HandCoins,
  HelpCircle,
  Link2,
  LoaderCircle,
  Search,
  Share2,
  ShoppingBag,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import {
  calculateDistributorOverviewMetrics,
  emptyDistributorDashboardMetrics,
  loadDistributorAdjustmentsPage,
  loadDistributorCommissionsPage,
  loadDistributorDashboard,
  loadDistributorPayoutsPage,
  loadDistributorReferralsPage,
  loadDistributorSalesPage,
  type DistributorAccount,
  type DistributorAdjustment,
  type DistributorAttributedOrder,
  type DistributorCommissionEntry,
  type DistributorDashboard,
  type DistributorPage,
  type DistributorPageRequest,
  type DistributorPayout,
  type DistributorSale,
} from '../../lib/distributorPortal'
import { PortalShell } from '../portal/PortalShell'
import { loadPremiumDashboard, type PremiumDashboard } from '../../lib/distributorPremium'
import {
  DistributorDisputesSection,
  DistributorGrowthCenter,
  DistributorNotifications,
  DistributorPremiumOverview,
  DistributorReceipts,
  DistributorSecurity,
} from './DistributorPremiumExperience'

const DASHBOARD_TIME_ZONE = 'America/Denver'
const PAGE_SIZE = 25
const emptyDashboard: DistributorDashboard = {
  account: null,
  metrics: emptyDistributorDashboardMetrics,
  attributedOrders: [],
  sales: [],
  commissions: [],
  payouts: [],
  adjustments: [],
  balances: [],
}

type PageLoader<T> = (request?: DistributorPageRequest) => Promise<DistributorPage<T>>

function useDistributorPage<T extends { id: string }>(
  loader: PageLoader<T>,
  distributorId: string | null,
  enabled: boolean,
  search = '',
) {
  const [page, setPage] = useState<DistributorPage<T>>({ items: [], nextCursor: null, hasMore: false })
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!enabled || !distributorId) return
    let cancelled = false
    setLoading(true)
    setError('')
    setPage({ items: [], nextCursor: null, hasMore: false })
    void loader({ distributorId, pageSize: PAGE_SIZE, search }).then((result) => {
      if (!cancelled) setPage(result)
    }).catch(() => {
      if (!cancelled) setError('load')
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [distributorId, enabled, loader, reloadToken, search])

  const loadMore = useCallback(async () => {
    if (!distributorId || !page.nextCursor || loadingMore) return
    setLoadingMore(true)
    setError('')
    try {
      const next = await loader({ distributorId, pageSize: PAGE_SIZE, cursor: page.nextCursor, search })
      setPage((current) => ({
        items: [...current.items, ...next.items],
        nextCursor: next.nextCursor,
        hasMore: next.hasMore,
      }))
    } catch {
      setError('load-more')
    } finally {
      setLoadingMore(false)
    }
  }, [distributorId, loader, loadingMore, page.nextCursor, search])

  return {
    ...page,
    loading,
    loadingMore,
    error,
    loadMore,
    retry: () => setReloadToken((value) => value + 1),
  }
}

export function DistributorPortalPage({ section = 'overview' }: { section?: string }) {
  const { identity } = usePortalAuth()
  const { locale, path } = useLocale()
  const { t } = useTranslation('distributor')
  const [dashboard, setDashboard] = useState<DistributorDashboard>(emptyDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [salesSearch, setSalesSearch] = useState('')
  const [commissionsSearch, setCommissionsSearch] = useState('')
  const [adjustmentsSearch, setAdjustmentsSearch] = useState('')
  const [payoutsSearch, setPayoutsSearch] = useState('')

  const load = useCallback(async () => {
    if (!identity) return
    setLoading(true)
    setError('')
    try {
      setDashboard(await loadDistributorDashboard(identity.user.id))
    } catch {
      setError(t('loadError'))
    } finally {
      setLoading(false)
    }
  }, [identity, t])

  useEffect(() => { void load() }, [load])

  const account = dashboard.account
  const accountId = account?.id ?? null
  const referrals = useDistributorPage(loadDistributorReferralsPage, accountId, section === 'overview')
  const sales = useDistributorPage(loadDistributorSalesPage, accountId, section === 'sales', salesSearch)
  const commissions = useDistributorPage(loadDistributorCommissionsPage, accountId, section === 'commissions', commissionsSearch)
  const adjustments = useDistributorPage(loadDistributorAdjustmentsPage, accountId, section === 'adjustments', adjustmentsSearch)
  const payouts = useDistributorPage(loadDistributorPayoutsPage, accountId, section === 'payouts', payoutsSearch)

  const catalogPath = path('/catalog')
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const referralLink = account ? `${origin}${catalogPath}?ref=${encodeURIComponent(account.referral_code)}` : ''
  const money = (cents: number, currency = dashboard.metrics.currency) => new Intl.NumberFormat(
    locale === 'es' ? 'es-MX' : 'en-US',
    { style: 'currency', currency },
  ).format(cents / 100)
  const date = (value: string) => new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    dateStyle: 'medium',
    timeZone: DASHBOARD_TIME_ZONE,
  }).format(new Date(/^\d{4}-\d{2}-\d{2}$/u.test(value) ? `${value}T12:00:00Z` : value))
  const metrics = calculateDistributorOverviewMetrics(dashboard)

  async function copyLink(value: string, key = 'main') {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(() => setCopied(''), 1800)
  }

  async function shareLink() {
    if (!referralLink) return
    if (navigator.share) {
      await navigator.share({ title: t('shareTitle'), text: t('shareText'), url: referralLink })
      return
    }
    await copyLink(referralLink)
  }

  if (loading) return <PortalShell distributor><LoadingPanel label={t('navOverview')} /></PortalShell>
  if (error) return <PortalShell distributor><EmptyState title={error} body="" action={t('retry')} onAction={() => void load()} /></PortalShell>
  if (!account) return <PortalShell distributor><EmptyState title={t('noAccountTitle')} body={t('noAccountBody')} /></PortalShell>

  if (section === 'overview') return <PortalShell distributor><PremiumOverviewRoute distributorId={account.id} locale={locale} preferredName={identity?.profile.preferred_name || account.display_name} path={path} /></PortalShell>
  if (section === 'growth' || section === 'tools') return <PortalShell distributor><DistributorGrowthCenter distributorId={account.id} userId={identity!.user.id} referralCode={account.referral_code} locale={locale} /></PortalShell>
  if (section === 'notifications') return <PortalShell distributor><DistributorNotifications distributorId={account.id} locale={locale} /></PortalShell>
  if (section === 'disputes') return <PortalShell distributor><DistributorDisputesSection distributorId={account.id} userId={identity!.user.id} locale={locale} /></PortalShell>
  if (section === 'receipts') return <PortalShell distributor><DistributorReceipts distributorId={account.id} locale={locale} /></PortalShell>
  if (section === 'security') return <PortalShell distributor><DistributorSecurity distributorId={account.id} userId={identity!.user.id} locale={locale} /></PortalShell>

  return (
    <PortalShell distributor>
      {section === 'overview' ? (
        <>
          <section className="relative overflow-hidden rounded-[1.75rem] bg-[#071724] p-6 text-white sm:p-8 lg:p-10">
            <div className="molecule-field" aria-hidden="true" />
            <div className="relative max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-200">{t('eyebrow')}</p>
                <StatusPill status={account.status} t={t} />
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-.055em] sm:text-5xl lg:text-6xl">{t('title')}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{t('intro')}</p>
            </div>
          </section>
          {account.status !== 'active' ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t('inactiveNotice')}</p> : null}
          <ReferralLinkCard account={account} referralLink={referralLink} copied={copied === 'main'} t={t} onCopy={() => void copyLink(referralLink)} onShare={() => void shareLink()} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Link2} label={t('metricAttributedOrders')} value={String(metrics.attributedOrders)} />
            <Metric icon={ShoppingBag} label={t('metricTotalSales')} value={String(dashboard.metrics.totalSales)} />
            <Metric icon={TrendingUp} label={t('metricAttributedRevenue')} value={money(metrics.attributedCommissionableRevenue)} />
            <Metric icon={TrendingUp} label={t('metricOrderPaymentRate')} value={dashboard.metrics.orderPaymentRateBps === null ? '—' : `${(dashboard.metrics.orderPaymentRateBps / 100).toFixed(2)}%`} tooltip={t('metricOrderPaymentRateTooltip')} />
            <Metric icon={HandCoins} label={t('metricPendingCommission')} value={money(metrics.pendingCommission)} />
            <Metric icon={BadgeDollarSign} label={t('metricReadyForPayout')} value={money(metrics.readyForPayout)} />
            <Metric icon={WalletCards} label={t('metricPaid')} value={money(metrics.paidCommission)} />
            <Metric icon={HandCoins} label={t('metricPendingRecovery')} value={money(metrics.pendingRecovery)} />
          </div>
          <p className="mt-4 text-xs text-slate-500" title={t('timezoneNote')}>{t('timezoneNote')}</p>
          <AttributedOrdersTable state={referrals} money={money} date={date} t={t} />
        </>
      ) : null}
      {section === 'sales' ? <SalesSection state={sales} search={salesSearch} onSearch={setSalesSearch} money={money} date={date} t={t} /> : null}
      {section === 'commissions' ? <CommissionsSection account={account} state={commissions} search={commissionsSearch} onSearch={setCommissionsSearch} money={money} date={date} t={t} /> : null}
      {section === 'adjustments' ? <AdjustmentsSection state={adjustments} search={adjustmentsSearch} onSearch={setAdjustmentsSearch} money={money} date={date} t={t} /> : null}
      {section === 'payouts' ? <PayoutsSection state={payouts} search={payoutsSearch} onSearch={setPayoutsSearch} money={money} date={date} t={t} /> : null}
      {section === 'tools' ? <ToolsSection account={account} baseLink={referralLink} copied={copied} onCopy={copyLink} t={t} /> : null}
    </PortalShell>
  )
}

function PremiumOverviewRoute({ distributorId, locale, preferredName, path }: { distributorId: string; locale: 'en' | 'es'; preferredName: string; path: (value: string) => string }) {
  const [dashboard, setDashboard] = useState<PremiumDashboard | null>(null)
  const [error, setError] = useState('')
  const load = useCallback((days: number | null = 30) => {
    setError('')
    const end = new Date()
    const start = days === null ? undefined : new Date(end.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
    void loadPremiumDashboard(distributorId, start, end.toISOString()).then(setDashboard).catch(() => setError(locale === 'es' ? 'No pudimos cargar el panel.' : 'We could not load the dashboard.'))
  }, [distributorId, locale])
  useEffect(() => load(), [load])
  if (error) return <EmptyState title={error} body="" action={locale === 'es' ? 'Reintentar' : 'Retry'} onAction={() => load()} />
  if (!dashboard) return <LoadingPanel label={locale === 'es' ? 'Cargando panel' : 'Loading dashboard'} />
  return <DistributorPremiumOverview dashboard={dashboard} locale={locale} preferredName={preferredName} path={path} onRange={load} />
}

type PageState<T> = DistributorPage<T> & {
  loading: boolean
  loadingMore: boolean
  error: string
  loadMore: () => Promise<void>
  retry: () => void
}

function ReferralLinkCard({ account, referralLink, copied, t, onCopy, onShare }: {
  account: DistributorAccount
  referralLink: string
  copied: boolean
  t: (key: string, vars?: Record<string, string | number>) => string
  onCopy: () => void
  onShare: () => void
}) {
  const disabled = account.status !== 'active'
  return (
    <section className="mt-6 rounded-[1.5rem] border border-slate-900/8 bg-[#f7faf9] p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[.15em] text-teal-800">{t('referralLinkLabel')}</p>
          <p className="mt-2 truncate font-mono text-sm text-slate-700">{referralLink}</p>
          <p className="mt-3 text-xs font-semibold text-slate-500">{t('referralCodeLabel')}: <span className="rounded-md bg-white px-2 py-1 font-mono text-[#071724]">{account.referral_code}</span></p>
          {account.customer_discount_enabled ? <p className="mt-3 max-w-xl text-xs leading-5 text-teal-900">{t('customerOfferSummary', { rate: (account.customer_discount_rate_bps / 100).toFixed(0), max: (account.customer_discount_max_cents / 100).toFixed(0) })}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={disabled} onClick={onCopy} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t('copied') : t('copyLink')}</button>
          <button type="button" disabled={disabled} onClick={onShare} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Share2 size={16} />{t('shareLink')}</button>
        </div>
      </div>
    </section>
  )
}

function Metric({ icon: Icon, label, value, tooltip }: { icon: typeof TrendingUp; label: string; value: string; tooltip?: string }) {
  return (
    <div className="rounded-[1.35rem] border border-slate-900/8 p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Icon size={18} /></span>
      <p className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.12em] text-slate-500">{label}{tooltip ? <span title={tooltip} aria-label={tooltip}><HelpCircle size={14} /></span> : null}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-.04em]">{value}</p>
    </div>
  )
}

function AttributedOrdersTable({ state, money, date, t }: { state: PageState<DistributorAttributedOrder>; money: (cents: number) => string; date: (value: string) => string; t: (key: string) => string }) {
  const sourceLabel = (source: string) => source === 'manual_code' ? t('sourceManualCode') : t('sourceReferralLink')
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold tracking-[-.04em]">{t('attributedOrdersTitle')}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{t('attributedOrdersBody')}</p>
      {state.loading ? <TableLoading label={t('loadingRows')} /> : state.items.length ? (
        <div className="mt-5 overflow-x-auto rounded-[1.25rem] border border-slate-900/8">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">{t('columnOrder')}</th><th className="px-5 py-3">{t('columnDate')}</th><th className="px-5 py-3">{t('columnValue')}</th><th className="px-5 py-3">{t('columnSource')}</th></tr></thead>
            <tbody>{state.items.map((order) => <tr key={order.id} className="border-t border-slate-900/8"><td className="px-5 py-4 font-mono text-xs">…{order.storefront_order_id.slice(-8)}</td><td className="px-5 py-4 text-slate-600">{date(order.created_at)}</td><td className="px-5 py-4 font-semibold">{order.estimated_order_value_cents === null ? '—' : money(order.estimated_order_value_cents)}</td><td className="px-5 py-4">{sourceLabel(order.source)}</td></tr>)}</tbody>
          </table>
        </div>
      ) : <EmptyRow text={t('emptyAttributedOrders')} />}
      <PageControls state={state} t={t} />
    </section>
  )
}

function SalesSection({ state, search, onSearch, money, date, t }: { state: PageState<DistributorSale>; search: string; onSearch: (value: string) => void; money: (cents: number, currency?: string) => string; date: (value: string) => string; t: (key: string) => string }) {
  return <section><SectionHeading title={t('salesTitle')} body={t('salesBody')} /><SearchField value={search} onChange={onSearch} t={t} />{state.loading ? <TableLoading label={t('loadingRows')} /> : state.items.length ? <SalesTable sales={state.items} money={money} date={date} t={t} /> : <EmptyRow text={t('emptySales')} />}<PageControls state={state} t={t} /></section>
}

function CommissionsSection({ account, state, search, onSearch, money, date, t }: { account: DistributorAccount; state: PageState<DistributorCommissionEntry>; search: string; onSearch: (value: string) => void; money: (cents: number, currency?: string) => string; date: (value: string) => string; t: (key: string, vars?: Record<string, string | number>) => string }) {
  return (
    <section>
      <SectionHeading title={t('commissionsTitle')} body={t('commissionsBody')} />
      <div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric icon={BadgeDollarSign} label={t('currentRate')} value={`${(account.commission_rate_bps / 100).toFixed(2)}%`} /><Metric icon={TrendingUp} label={t('holdPeriod')} value={t('holdDays', { days: account.commission_hold_days })} /><Metric icon={WalletCards} label={t('minimumPayout')} value={money(account.payout_minimum_cents)} /></div>
      <div className="mt-6 rounded-[1.25rem] border border-teal-700/15 bg-teal-50 p-5"><h2 className="font-semibold text-teal-950">{t('commissionRuleTitle')}</h2><p className="mt-2 text-sm leading-6 text-teal-900">{t('commissionRuleBody')}</p></div>
      <SearchField value={search} onChange={onSearch} t={t} />
      {state.loading ? <TableLoading label={t('loadingRows')} /> : state.items.length ? <CommissionTable entries={state.items} money={money} date={date} t={t} /> : <EmptyRow text={t('emptyCommissions')} />}
      <PageControls state={state} t={t} />
    </section>
  )
}

function SalesTable({ sales, money, date, t }: { sales: DistributorSale[]; money: (cents: number, currency?: string) => string; date: (value: string) => string; t: (key: string) => string }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-slate-900/8">
      <table className="w-full min-w-[86rem] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">{t('columnOrder')}</th><th className="px-5 py-3">{t('columnDate')}</th><th className="px-5 py-3">{t('columnDiscountType')}</th><th className="px-5 py-3">{t('columnDiscount')}</th><th className="px-5 py-3">{t('columnRevenue')}</th><th className="px-5 py-3">{t('columnRate')}</th><th className="px-5 py-3">{t('columnGrossCommission')}</th><th className="px-5 py-3">{t('columnNetCommission')}</th><th className="px-5 py-3">{t('columnHold')}</th><th className="px-5 py-3">{t('columnStatus')}</th></tr></thead>
        <tbody>{sales.map((sale) => <tr key={sale.id} className="border-t border-slate-900/8"><td className="px-5 py-4 font-semibold">{sale.order_reference}</td><td className="px-5 py-4 text-slate-600">{date(sale.paid_at)}</td><td className="px-5 py-4">{t(`discount${capitalize(sale.discount_source)}`)}{sale.other_promotion_won ? ` · ${t('otherPromotionWon')}` : ''}</td><td className="px-5 py-4">{money(sale.discount_cents, sale.currency)}</td><td className="px-5 py-4">{money(sale.original_commissionable_revenue_cents, sale.currency)}</td><td className="px-5 py-4">{(sale.commission_rate_bps / 100).toFixed(2)}%</td><td className="px-5 py-4">{money(sale.original_commission_amount_cents, sale.currency)}</td><td className="px-5 py-4 font-semibold">{money(sale.ledger_net_commission_cents, sale.currency)}</td><td className="px-5 py-4 text-slate-600">{date(sale.hold_until)}</td><td className="px-5 py-4"><SalePill status={sale.status} t={t} /></td></tr>)}</tbody>
      </table>
    </div>
  )
}

function CommissionTable({ entries, money, date, t }: { entries: DistributorCommissionEntry[]; money: (cents: number, currency?: string) => string; date: (value: string) => string; t: (key: string) => string }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-slate-900/8">
      <table className="w-full min-w-[68rem] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">{t('columnDate')}</th><th className="px-5 py-3">{t('columnOrder')}</th><th className="px-5 py-3">{t('columnType')}</th><th className="px-5 py-3">{t('columnReason')}</th><th className="px-5 py-3">{t('columnAmount')}</th><th className="px-5 py-3">{t('columnRemaining')}</th></tr></thead>
        <tbody>{entries.map((entry) => <tr key={entry.id} className="border-t border-slate-900/8"><td className="px-5 py-4 text-slate-600">{date(entry.created_at)}</td><td className="px-5 py-4 font-semibold">{entry.order_reference || '—'}</td><td className="px-5 py-4">{t(`entry${capitalize(entry.entry_type)}`)}</td><td className="px-5 py-4">{entry.reason}</td><td className={`px-5 py-4 font-semibold ${entry.amount_cents < 0 ? 'text-red-700' : 'text-teal-800'}`}>{entry.amount_cents > 0 ? '+' : ''}{money(entry.amount_cents, entry.currency)}</td><td className="px-5 py-4 font-semibold">{money(entry.remaining_cents, entry.currency)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}

function AdjustmentsSection({ state, search, onSearch, money, date, t }: { state: PageState<DistributorAdjustment>; search: string; onSearch: (value: string) => void; money: (cents: number, currency?: string) => string; date: (value: string) => string; t: (key: string) => string }) {
  return (
    <section>
      <SectionHeading title={t('adjustmentsTitle')} body={t('adjustmentsBody')} />
      <SearchField value={search} onChange={onSearch} t={t} />
      {state.loading ? <TableLoading label={t('loadingRows')} /> : state.items.length ? (
        <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-slate-900/8"><table className="w-full min-w-[74rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">{t('columnDate')}</th><th className="px-5 py-3">{t('columnOrder')}</th><th className="px-5 py-3">{t('columnType')}</th><th className="px-5 py-3">{t('columnReason')}</th><th className="px-5 py-3">{t('columnAmount')}</th><th className="px-5 py-3">{t('columnOriginalPayout')}</th><th className="px-5 py-3">{t('columnRecoveryPayout')}</th><th className="px-5 py-3">{t('columnRemaining')}</th></tr></thead><tbody>{state.items.map((entry) => <tr key={entry.id} className="border-t border-slate-900/8"><td className="px-5 py-4 text-slate-600">{date(entry.created_at)}</td><td className="px-5 py-4 font-semibold">{entry.order_reference || '—'}</td><td className="px-5 py-4">{t(`entry${capitalize(entry.entry_type)}`)}</td><td className="px-5 py-4">{entry.reason}</td><td className={`px-5 py-4 font-semibold ${entry.amount_cents < 0 ? 'text-red-700' : 'text-teal-800'}`}>{entry.amount_cents > 0 ? '+' : ''}{money(entry.amount_cents, entry.currency)}</td><td className="px-5 py-4 font-mono text-xs">{entry.original_payout_id ? `…${entry.original_payout_id.slice(-8)}` : '—'}</td><td className="px-5 py-4 font-mono text-xs">{entry.recovery_payout_id ? `…${entry.recovery_payout_id.slice(-8)}` : '—'}</td><td className="px-5 py-4 font-semibold">{money(entry.remaining_cents, entry.currency)}</td></tr>)}</tbody></table></div>
      ) : <EmptyRow text={t('emptyAdjustments')} />}
      <PageControls state={state} t={t} />
    </section>
  )
}

function PayoutsSection({ state, search, onSearch, money, date, t }: { state: PageState<DistributorPayout>; search: string; onSearch: (value: string) => void; money: (cents: number, currency?: string) => string; date: (value: string) => string; t: (key: string) => string }) {
  return (
    <section>
      <SectionHeading title={t('payoutsTitle')} body={t('payoutsBody')} />
      <SearchField value={search} onChange={onSearch} t={t} />
      {state.loading ? <TableLoading label={t('loadingRows')} /> : state.items.length ? <div className="mt-6 grid gap-4">{state.items.map((payout) => <article key={payout.id} className="rounded-[1.25rem] border border-slate-900/8 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-semibold">{date(payout.period_start)} – {date(payout.period_end)}</p><p className="mt-1 font-mono text-xs text-slate-500">{payout.external_reference || '—'}</p></div><div className="text-right"><p className="text-2xl font-semibold">{money(payout.amount_cents, payout.currency)}</p><PayoutPill status={payout.status} t={t} /></div></div><dl className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2 xl:grid-cols-5"><Breakdown label={t('payoutGross')} value={money(payout.gross_commission_cents, payout.currency)} /><Breakdown label={t('payoutPositive')} value={money(payout.positive_adjustments_cents, payout.currency)} /><Breakdown label={t('payoutNegative')} value={money(payout.negative_adjustments_cents, payout.currency)} /><Breakdown label={t('payoutRecoveries')} value={money(payout.recoveries_applied_cents, payout.currency)} /><Breakdown label={t('payoutNet')} value={money(payout.amount_cents, payout.currency)} /></dl></article>)}</div> : <EmptyRow text={t('emptyPayouts')} />}
      <PageControls state={state} t={t} />
    </section>
  )
}

function SearchField({ value, onChange, t }: { value: string; onChange: (value: string) => void; t: (key: string) => string }) {
  return <label className="relative mt-6 block max-w-md"><span className="sr-only">{t('searchRecords')}</span><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={value} onChange={(event) => onChange(event.target.value)} className="portal-input pl-11" placeholder={t('searchRecords')} /></label>
}

function PageControls<T>({ state, t }: { state: PageState<T>; t: (key: string) => string }) {
  if (state.error) return <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><span>{t('pageLoadError')}</span><button type="button" onClick={state.retry} className="font-semibold underline underline-offset-4">{t('retry')}</button></div>
  if (!state.hasMore) return state.items.length ? <p className="mt-4 text-xs text-slate-500">{t('allRowsLoaded')}</p> : null
  return <button type="button" disabled={state.loadingMore} onClick={() => void state.loadMore()} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 text-sm font-semibold disabled:opacity-50">{state.loadingMore ? <LoaderCircle size={16} className="animate-spin" /> : null}{state.loadingMore ? t('loadingRows') : t('loadMore')}</button>
}

function TableLoading({ label }: { label: string }) { return <div className="mt-6 flex min-h-32 items-center justify-center rounded-[1.25rem] border border-slate-900/8 bg-slate-50 text-sm text-slate-600"><LoaderCircle size={18} className="mr-2 animate-spin" />{label}</div> }
function LoadingPanel({ label }: { label: string }) { return <div className="grid min-h-[28rem] place-items-center"><LoaderCircle className="animate-spin text-teal-700" aria-label={label} /></div> }
function Breakdown({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div> }

function ToolsSection({ account, baseLink, copied, onCopy, t }: { account: DistributorAccount; baseLink: string; copied: string; onCopy: (value: string, key: string) => Promise<void>; t: (key: string) => string }) {
  const links = [[t('catalogLink'), baseLink, 'catalog'], [t('whatsappLink'), `${baseLink}&utm_source=whatsapp&utm_campaign=distributor`, 'whatsapp'], [t('instagramLink'), `${baseLink}&utm_source=instagram&utm_campaign=distributor`, 'instagram']]
  return <section><SectionHeading title={t('toolsTitle')} body={t('toolsBody')} /><div className="mt-6 grid gap-3">{links.map(([label, link, key]) => <div key={key} className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-900/8 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-semibold">{label}</p><p className="mt-1 truncate font-mono text-xs text-slate-500">{link}</p></div><button disabled={account.status !== 'active'} onClick={() => void onCopy(link, key)} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white disabled:opacity-50">{copied === key ? <Check size={16} /> : <Copy size={16} />} {copied === key ? t('copied') : t('copyLink')}</button></div>)}</div><div className="mt-8 rounded-[1.5rem] bg-[#f7faf9] p-6"><h2 className="text-xl font-semibold">{t('campaignGuidanceTitle')}</h2><ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-700">{[t('campaignGuidance1'), t('campaignGuidance2'), t('campaignGuidance3')].map((item, index) => <li key={item} className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-semibold text-teal-800">{index + 1}</span><span>{item}</span></li>)}</ol></div></section>
}

function SectionHeading({ title, body }: { title: string; body: string }) { return <div><h1 className="text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{title}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{body}</p></div> }
function EmptyRow({ text }: { text: string }) { return <p className="mt-6 rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-7 text-sm text-slate-600">{text}</p> }
function EmptyState({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) { return <div className="grid min-h-[28rem] place-items-center text-center"><div className="max-w-lg"><Link2 className="mx-auto text-teal-700" /><h1 className="mt-5 text-3xl font-semibold">{title}</h1>{body ? <p className="mt-3 leading-7 text-slate-600">{body}</p> : null}{action ? <button onClick={onAction} className="mt-6 min-h-11 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white">{action}</button> : null}</div></div> }
function StatusPill({ status, t }: { status: DistributorAccount['status']; t: (key: string, vars?: Record<string, string | number>) => string }) { const key = { pending: 'statusPending', active: 'statusActive', suspended: 'statusSuspended', archived: 'statusArchived' }[status]; return <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">{t('statusLabel', { status: t(key) })}</span> }
function SalePill({ status, t }: { status: DistributorSale['status']; t: (key: string) => string }) { const key = { pending: 'salePending', approved: 'saleApproved', in_payout: 'saleInPayout', paid: 'salePaid', voided: 'saleVoided', reversed: 'saleReversed' }[status]; return <Pill>{t(key)}</Pill> }
function PayoutPill({ status, t }: { status: DistributorPayout['status']; t: (key: string) => string }) { const key = { draft: 'payoutDraft', processing: 'payoutProcessing', paid: 'payoutPaid', failed: 'payoutFailed', cancelled: 'payoutCancelled' }[status]; return <Pill>{t(key)}</Pill> }
function Pill({ children }: { children: string }) { return <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">{children}</span> }
function capitalize(value: string) { return value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('') }
