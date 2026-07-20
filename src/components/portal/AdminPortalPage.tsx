import { useTranslation } from '../../i18n/LocaleContext'
import { adminFetchAuditLog, adminFetchOverview } from '../../lib/portal/portalData'
import { PortalShell } from './PortalShell'
import { AdminApplications } from './admin/AdminApplications'
import { AdminClients } from './admin/AdminClients'
import { AdminDocuments } from './admin/AdminDocuments'
import { AdminOrders } from './admin/AdminOrders'
import { AdminProtocols } from './admin/AdminProtocols'
import { AdminStorefront } from './admin/AdminStorefront'
import { AdminSupport } from './admin/AdminSupport'
import { SocialProofAdmin } from './SocialProofAdmin'
import { EmptyCard, LoadState, useAsync, useDateFormatter } from './sections/shared'

export function AdminPortalPage({ section = 'overview' }: { section?: string }) {
  const { t } = useTranslation('portal')
  const titles: Record<string, string> = {
    overview: t('adminOperationsTitle'), applications: t('adminApplicationsTitle'), clients: t('adminNavClients'),
    orders: t('adminNavOrders'), storefront: t('adminNavStorefront'), protocols: t('adminNavProtocols'), documents: t('adminNavDocuments'),
    support: t('adminNavSupport'), 'audit-log': t('adminNavAudit'), settings: t('adminNavSettings'), content: t('adminNavContent'),
  }
  const content = (() => {
    switch (section) {
      case 'overview': return <AdminOverview />
      case 'applications': return <AdminApplications />
      case 'clients': return <AdminClients />
      case 'orders': return <AdminOrders />
      case 'storefront': return <AdminStorefront />
      case 'protocols': return <AdminProtocols />
      case 'documents': return <AdminDocuments />
      case 'support': return <AdminSupport />
      case 'audit-log': return <AdminAuditLog />
      case 'content': return <SocialProofAdmin />
      case 'settings': return <EmptyCard title={t('adminNavSettings')} copy={t('adminSettingsCopy')} />
      default: return <EmptyCard title={titles[section] ?? section} copy={t('adminModulePending')} />
    }
  })()
  return <PortalShell admin>
    <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('adminLabel')}</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{titles[section] ?? section}</h1>
    {section === 'overview' || section === 'applications' ? <p className="mt-4 max-w-2xl leading-7 text-slate-600">{t('adminIntro')}</p> : null}
    {content}
  </PortalShell>
}

function AdminOverview() {
  const { t } = useTranslation('portal')
  const { data, loading, error, reload } = useAsync(adminFetchOverview)
  return <LoadState loading={loading} error={error} onRetry={reload}>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label={t('adminPendingApplications')} value={data ? String(data.pendingApplications) : '—'} />
      <Stat label={t('adminActiveClients')} value={data ? String(data.activeClients) : '—'} />
      <Stat label={t('adminOpenSupport')} value={data ? String(data.openThreads) : '—'} />
      <Stat label={t('adminProcessingOrders')} value={data ? String(data.processingOrders) : '—'} />
    </div>
  </LoadState>
}

function AdminAuditLog() {
  const { t } = useTranslation('portal')
  const formatDate = useDateFormatter()
  const { data, loading, error, reload } = useAsync(adminFetchAuditLog)
  return <LoadState loading={loading} error={error} onRetry={reload}>
    {data?.length ? <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-slate-900/8 bg-white">
      <table className="w-full min-w-[38rem] text-left text-sm">
        <thead><tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500"><th className="px-5 py-3">{t('adminAuditWhen')}</th><th className="px-5 py-3">{t('adminAuditEvent')}</th><th className="px-5 py-3">{t('adminAuditResource')}</th><th className="px-5 py-3">{t('adminAuditRole')}</th></tr></thead>
        <tbody>{data.map((entry) => <tr key={entry.id} className="border-t border-slate-900/6"><td className="px-5 py-3 text-slate-500">{formatDate(entry.created_at, true)}</td><td className="px-5 py-3 font-semibold">{entry.event_type.replaceAll('_', ' ')}</td><td className="px-5 py-3 text-slate-600">{entry.resource_type ?? '—'}</td><td className="px-5 py-3 text-slate-600">{entry.actor_role ?? '—'}</td></tr>)}</tbody>
      </table>
    </div> : <EmptyCard title={t('adminNavAudit')} copy={t('adminAuditEmptyCopy')} />}
  </LoadState>
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.25rem] bg-[#f8faf9] p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold capitalize">{value}</p></div>
}
