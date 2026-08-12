import { useCallback, useEffect, useState } from 'react'
import { Download, LoaderCircle, MessageCircle, RefreshCw, UsersRound } from 'lucide-react'
import { CRMDashboard } from '../../crm/CRMDashboard'
import { LeadDetailDrawer } from '../../crm/LeadDetailDrawer'
import { LeadTable } from '../../crm/LeadTable'
import { WhatsAppLeadDesk } from '../../crm/WhatsAppLeadDesk'
import { useLocale, useTranslation } from '../../../i18n/LocaleContext'
import { downloadLeadsCsv } from '../../../lib/exportCrmCsv'
import { getLeads, isCrmUsingSupabase } from '../../../lib/crmStorage'
import type { Lead } from '../../../types/crm'

type SalesDesk = 'website' | 'whatsapp'

export function AdminSalesCRM({ initialDesk = 'website' }: { initialDesk?: SalesDesk }) {
  const { path, locale } = useLocale()
  const { t } = useTranslation('crm')
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(initialDesk === 'website')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [syncWarning, setSyncWarning] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  const loadLeads = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    if (!silent) setError('')
    try {
      const nextLeads = await getLeads()
      setLeads(nextLeads)
      setSelectedLead((current) => current ? nextLeads.find((lead) => lead.id === current.id) ?? null : null)
      setLastSyncedAt(new Date())
      setSyncWarning('')
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : t('loadErrorFallback')
      if (silent) setSyncWarning(message)
      else setError(message)
    } finally {
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (initialDesk !== 'website') return
    void loadLeads()
    const refresh = () => void loadLeads(true)
    const interval = window.setInterval(refresh, 30_000)
    const handleVisibility = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [initialDesk, loadLeads])

  async function refreshLead(lead: Lead) {
    const nextLeads = await getLeads()
    setLeads(nextLeads)
    setSelectedLead(nextLeads.find((item) => item.id === lead.id) ?? null)
    setLastSyncedAt(new Date())
  }

  const syncTime = lastSyncedAt
    ? new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(lastSyncedAt)
    : null

  return <div className="mt-8 grid gap-6">
    <section className="rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">{t('salesWorkspace')}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#071724]">
            {initialDesk === 'website' ? t('websitePipeline') : t('whatsappDesk')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {initialDesk === 'website'
              ? t('websiteIntro')
              : t('whatsappIntro')}
          </p>
        </div>
        <nav aria-label={t('deskNavigation')} className="inline-flex w-fit rounded-full border border-slate-900/10 bg-white p-1 shadow-sm">
          <a
            href={path('/admin/leads')}
            aria-current={initialDesk === 'website' ? 'page' : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${initialDesk === 'website' ? 'bg-[#071724] text-white' : 'text-slate-600 hover:text-[#071724]'}`}
          >
            <UsersRound size={15} aria-hidden="true" />
            {t('websiteLeads')}
          </a>
          <a
            href={path('/admin/whatsapp')}
            aria-current={initialDesk === 'whatsapp' ? 'page' : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${initialDesk === 'whatsapp' ? 'bg-[#071724] text-white' : 'text-slate-600 hover:text-[#071724]'}`}
          >
            <MessageCircle size={15} aria-hidden="true" />
            {t('whatsapp')}
          </a>
        </nav>
      </div>
    </section>

    {!isCrmUsingSupabase() ? <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{t('supabaseRequired')}</div> : null}

    {initialDesk === 'website' ? <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-500" aria-live="polite">
          <span>{loading ? t('loadingRecords') : t('recordCount', { count: leads.length })}</span>
          {!loading ? <span className="ml-2 font-normal text-slate-400">· {t('autoRefresh')}{syncTime ? ` · ${t('lastSynced', { time: syncTime })}` : ''}</span> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadLeads(true)}
            disabled={loading || refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724] disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading || refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            {t('refresh')}
          </button>
          <button
            type="button"
            onClick={() => downloadLeadsCsv(leads)}
            disabled={leads.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Download size={15} aria-hidden="true" />
            {t('exportCsv')}
          </button>
        </div>
      </div>

      {loading ? <LoadingState copy={t('loadingData')} /> : null}
      {error ? <ErrorState title={t('loadErrorTitle')} retry={t('retry')} message={error} onRetry={() => void loadLeads()} /> : null}
      {syncWarning && leads.length ? <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{t('syncWarning')}</div> : null}
      {!loading && !error && leads.length === 0 ? <EmptyState title={t('emptyTitle')} copy={t('emptyCopy')} action={t('openIntake')} href={path('/intake')} /> : null}
      {!loading && !error && leads.length > 0 ? <>
        <CRMDashboard leads={leads} onSelect={setSelectedLead} />
        <LeadTable leads={leads} onSelect={setSelectedLead} />
      </> : null}
    </> : <WhatsAppLeadDesk />}

    <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onChange={refreshLead} />
  </div>
}

function LoadingState({ copy }: { copy: string }) {
  return <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.06)]">
    <div>
      <LoaderCircle size={30} aria-hidden="true" className="mx-auto animate-spin text-teal-700" />
      <p className="mt-4 text-sm font-semibold text-slate-600">{copy}</p>
    </div>
  </div>
}

function ErrorState({ title, retry, message, onRetry }: { title: string; retry: string; message: string; onRetry: () => void }) {
  return <div className="rounded-[1.75rem] border border-red-500/20 bg-red-50 p-6 text-red-950">
    <p className="text-sm font-semibold">{title}</p>
    <p className="mt-2 text-sm leading-6">{message}</p>
    <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-red-950 px-4 py-2 text-sm font-semibold text-white">{retry}</button>
  </div>
}

function EmptyState({ title, copy, action, href }: { title: string; copy: string; action: string; href: string }) {
  return <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-slate-900/15 bg-white p-8 text-center">
    <div>
      <p className="text-lg font-semibold text-[#071724]">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{copy}</p>
      <a href={href} className="mt-5 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white">{action}</a>
    </div>
  </div>
}
