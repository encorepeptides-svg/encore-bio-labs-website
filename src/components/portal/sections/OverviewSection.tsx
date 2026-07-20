import { Bell, ClipboardCheck, FileText, FlaskConical, Headphones, Package, TrendingUp } from 'lucide-react'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { usePortalAuth } from '../../../context/usePortalAuth'
import { fetchOverviewSummary } from '../../../lib/portal/portalData'
import { Badge, formatMoney, statusTone, useAsync, useDateFormatter } from './shared'

export function OverviewSection() {
  const { identity } = usePortalAuth()
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  const formatDate = useDateFormatter()
  const { data } = useAsync(() => identity ? fetchOverviewSummary(identity.user.id) : Promise.reject(new Error('no identity')), [identity?.user.id])

  const modules = [
    ['/portal/orders', t('moduleOrdersTitle'), t('moduleOrdersCopy'), Package],
    ['/portal/protocols', t('moduleProtocolsTitle'), t('moduleProtocolsCopy'), FlaskConical],
    ['/portal/intake', t('moduleIntakeTitle'), t('moduleIntakeCopy'), ClipboardCheck],
    ['/portal/progress', t('moduleProgressTitle'), t('moduleProgressCopy'), TrendingUp],
    ['/portal/documents', t('moduleDocumentsTitle'), t('moduleDocumentsCopy'), FileText],
    ['/portal/support', t('moduleSupportTitle'), t('moduleSupportCopy'), Headphones],
  ] as const

  const accountStatus = identity ? t(({
    unverified: 'accountStatusUnverified', onboarding_incomplete: 'accountStatusOnboarding', pending_review: 'accountStatusPending',
    active: 'accountStatusActive', suspended: 'accountStatusSuspended', archived: 'accountStatusArchived',
  } as const)[identity.status]) : t('statusAccountStatusUnknown')

  return <>
    <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('accountOverview')}</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{t('welcomeMessage', { name: identity?.profile.preferred_name || identity?.profile.legal_name || t('defaultClientName') })}</h1>
    <p className="mt-4 max-w-2xl leading-7 text-slate-600">{t('overviewBody')}</p>

    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label={t('statusAccountStatus')} value={accountStatus} />
      <Stat label={t('overviewStatOrders')} value={data ? String(data.orders) : '—'} />
      <Stat label={t('overviewStatProtocols')} value={data ? String(data.activeProtocols) : '—'} />
      <Stat label={t('statusNotifications')} value={data ? (data.unreadNotifications ? t('overviewUnreadCount', { count: data.unreadNotifications }) : t('statusNoNotifications')) : '—'} icon={data ? data.unreadNotifications > 0 : false} />
    </div>

    {data?.latestOrder ? <a href={path('/portal/orders')} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-[#071724] p-6 text-white transition hover:bg-[#0b2432]">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-200">{t('overviewLatestOrder')}</p><p className="mt-2 text-lg font-semibold">{data.latestOrder.order_number}</p><p className="mt-1 text-sm text-slate-300">{formatDate(data.latestOrder.created_at)} · {formatMoney(data.latestOrder.amount_cents)}</p></div>
      <Badge tone={statusTone(data.latestOrder.fulfillment_status)}>{data.latestOrder.fulfillment_status.replaceAll('_', ' ')}</Badge>
    </a> : null}

    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(([href, title, copy, Icon]) => <a key={href} href={path(href)} className="group rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_55px_rgba(7,23,36,.08)]"><Icon size={23} className="text-teal-700" /><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></a>)}</div>
  </>
}

function Stat({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  return <div className="rounded-[1.25rem] bg-white p-5 shadow-[0_14px_45px_rgba(7,23,36,.06)]">{icon ? <Bell size={17} className="text-teal-700" /> : null}<p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 font-semibold capitalize">{value}</p></div>
}
