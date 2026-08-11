import { useEffect, useState } from 'react'
import { Download, LoaderCircle, MessageCircle, RefreshCw, UsersRound } from 'lucide-react'
import { CRMDashboard } from '../../crm/CRMDashboard'
import { LeadDetailDrawer } from '../../crm/LeadDetailDrawer'
import { LeadTable } from '../../crm/LeadTable'
import { WhatsAppLeadDesk } from '../../crm/WhatsAppLeadDesk'
import { useLocale } from '../../../i18n/LocaleContext'
import { downloadLeadsCsv } from '../../../lib/exportCrmCsv'
import { getLeads, isCrmUsingSupabase } from '../../../lib/crmStorage'
import type { Lead } from '../../../types/crm'

type SalesDesk = 'website' | 'whatsapp'

export function AdminSalesCRM({ initialDesk = 'website' }: { initialDesk?: SalesDesk }) {
  const { path } = useLocale()
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(initialDesk === 'website')
  const [error, setError] = useState('')

  async function loadLeads() {
    setLoading(true)
    setError('')
    try {
      setLeads(await getLeads())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Website leads could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadLeads()
  }, [])

  async function refreshLead(lead: Lead) {
    setLeads(await getLeads())
    setSelectedLead(lead)
  }

  return <div className="mt-8 grid gap-6">
    <section className="rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">Sales workspace</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#071724]">
            {initialDesk === 'website' ? 'Website lead pipeline' : 'WhatsApp qualification desk'}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {initialDesk === 'website'
              ? 'Review intake inquiries, scores, product interest, notes, and follow-up activity.'
              : 'Review bilingual WhatsApp conversations, qualification, open loops, human takeover, and follow-up drafts.'}
          </p>
        </div>
        <nav aria-label="Sales CRM desks" className="inline-flex w-fit rounded-full border border-slate-900/10 bg-white p-1 shadow-sm">
          <a
            href={path('/admin/leads')}
            aria-current={initialDesk === 'website' ? 'page' : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${initialDesk === 'website' ? 'bg-[#071724] text-white' : 'text-slate-600 hover:text-[#071724]'}`}
          >
            <UsersRound size={15} aria-hidden="true" />
            Website leads
          </a>
          <a
            href={path('/admin/whatsapp')}
            aria-current={initialDesk === 'whatsapp' ? 'page' : undefined}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${initialDesk === 'whatsapp' ? 'bg-[#071724] text-white' : 'text-slate-600 hover:text-[#071724]'}`}
          >
            <MessageCircle size={15} aria-hidden="true" />
            WhatsApp
          </a>
        </nav>
      </div>
    </section>

    {!isCrmUsingSupabase() ? <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Supabase is required for CRM access.</div> : null}

    {initialDesk === 'website' ? <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-500">
          {loading ? 'Loading website leads…' : `${leads.length} lead records`}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadLeads()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724] disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => downloadLeadsCsv(leads)}
            disabled={leads.length === 0}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Download size={15} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={loadLeads} /> : null}
      {!loading && !error && leads.length === 0 ? <EmptyState /> : null}
      {!loading && !error && leads.length > 0 ? <>
        <CRMDashboard leads={leads} />
        <LeadTable leads={leads} onSelect={setSelectedLead} />
      </> : null}
    </> : <WhatsAppLeadDesk />}

    <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onChange={refreshLead} />
  </div>
}

function LoadingState() {
  return <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-slate-900/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.06)]">
    <div>
      <LoaderCircle size={30} aria-hidden="true" className="mx-auto animate-spin text-teal-700" />
      <p className="mt-4 text-sm font-semibold text-slate-600">Loading CRM data…</p>
    </div>
  </div>
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-[1.75rem] border border-red-500/20 bg-red-50 p-6 text-red-950">
    <p className="text-sm font-semibold">CRM data could not be loaded.</p>
    <p className="mt-2 text-sm leading-6">{message}</p>
    <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-red-950 px-4 py-2 text-sm font-semibold text-white">Retry</button>
  </div>
}

function EmptyState() {
  return <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-slate-900/15 bg-white p-8 text-center">
    <div>
      <p className="text-lg font-semibold text-[#071724]">No website leads yet.</p>
      <p className="mt-2 text-sm text-slate-500">New intake and contact inquiries will appear here automatically.</p>
      <a href="/intake" className="mt-5 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white">Open intake</a>
    </div>
  </div>
}
