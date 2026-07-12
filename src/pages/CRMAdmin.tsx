import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Download, LoaderCircle, LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react'
import { CRMDashboard } from '../components/crm/CRMDashboard'
import { LeadDetailDrawer } from '../components/crm/LeadDetailDrawer'
import { LeadTable } from '../components/crm/LeadTable'
import { downloadLeadsCsv } from '../lib/exportCrmCsv'
import { getLeads, isCrmUsingSupabase } from '../lib/crmStorage'
import { supabase } from '../lib/supabaseClient'
import type { Lead } from '../types/crm'

function isCrmAdmin(session: Session | null) {
  return session?.user.app_metadata.role === 'crm_admin'
}

export function CRMAdmin() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [crmError, setCrmError] = useState('')
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isCrmAdmin(session)) void loadLeads()
  }, [session])

  async function loadLeads() {
    setLoading(true)
    setCrmError('')

    try {
      setLeads(await getLeads())
    } catch (loadError) {
      setCrmError(loadError instanceof Error ? loadError.message : 'CRM data could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!supabase) {
      setError('Supabase is not configured for this deployment.')
      return
    }
    setAuthLoading(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setAuthLoading(false)
    if (signInError) {
      setError('Sign-in failed. Check your credentials and try again.')
      return
    }
    if (!isCrmAdmin(data.session)) {
      await supabase.auth.signOut()
      setError('This account is not authorized for CRM access.')
    }
  }

  async function refreshLead(lead: Lead) {
    setLeads(await getLeads())
    setSelectedLead(lead)
  }

  if (authLoading && !session) {
    return <main id="main-content" className="grid min-h-screen place-items-center bg-[#071724] text-white"><LoaderCircle className="animate-spin" aria-label="Checking admin session" /></main>
  }

  if (!isCrmAdmin(session)) {
    return (
      <main id="main-content" className="relative min-h-screen overflow-hidden bg-[#071724] px-5 py-12 text-white sm:px-8">
        <div className="molecule-field" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-5xl place-items-center">
          <form onSubmit={submitPassword} className="w-full max-w-xl rounded-[1.75rem] border border-white/10 bg-white/10 p-6 shadow-[0_32px_110px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#071724]">
              <LockKeyhole size={20} aria-hidden="true" />
            </span>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">Internal CRM</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Encore lead desk</h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Sign in with an authorized Encore administrator account to access private inquiry data.
            </p>
            <label className="mt-7 grid gap-2 text-sm font-semibold">
              Admin email
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="username"
                required
                className="h-12 rounded-full border border-white/10 bg-white px-4 text-sm text-[#071724] outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300/20"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-semibold">
              Admin password
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="h-12 rounded-full border border-white/10 bg-white px-4 text-sm text-[#071724] outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-300/20"
              />
            </label>
            {error ? <p className="mt-3 rounded-2xl border border-red-300/30 bg-red-500/10 p-3 text-sm font-semibold text-red-100">{error}</p> : null}
            <button type="submit" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-teal-300 px-6 text-sm font-semibold text-[#071724]">
              {authLoading ? 'Signing in…' : 'Sign in securely'}
            </button>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-400">
              <ShieldCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-300" />
              Access is enforced by Supabase Auth and database row-level security.
            </p>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className="relative min-h-screen bg-[#f5f5f2] px-5 py-8 sm:px-8 lg:py-12">
      <div className="molecule-field" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[92rem] gap-6">
        <header className="flex flex-col gap-5 rounded-[1.75rem] border border-slate-900/10 bg-[#071724] p-6 text-white shadow-[0_28px_90px_rgba(7,23,36,0.2)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">Encore Bio Labs CRM</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Lead intelligence dashboard</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Lightweight internal view for website inquiries, intake submissions, lead scoring, and compliant follow-up templates.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">Signed in</div>
              <div className="mt-1 text-sm font-semibold">{session?.user.email}</div>
            </div>
            <button
              type="button"
              onClick={() => void supabase?.auth.signOut()}
              className="h-11 rounded-full border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </header>

        {!isCrmUsingSupabase() ? <div role="alert">Supabase is required for CRM access.</div> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-500">
            {loading ? 'Loading CRM data...' : `${leads.length} leads loaded`}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadLeads()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 text-sm font-semibold text-[#071724]"
            >
              <RefreshCw size={15} aria-hidden="true" />
              Retry
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
        {crmError ? <ErrorState message={crmError} onRetry={loadLeads} /> : null}
        {!loading && !crmError && leads.length === 0 ? <EmptyState /> : null}
        {!loading && !crmError && leads.length > 0 ? (
          <>
            <CRMDashboard leads={leads} />
            <LeadTable leads={leads} onSelect={setSelectedLead} />
          </>
        ) : null}
      </div>

      <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onChange={refreshLead} />
    </main>
  )
}

function LoadingState() {
  return (
    <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-slate-900/10 bg-white/78 p-8 text-center shadow-[0_24px_80px_rgba(7,23,36,0.08)]">
      <div>
        <LoaderCircle size={30} aria-hidden="true" className="mx-auto animate-spin text-teal-700" />
        <p className="mt-4 text-sm font-semibold text-slate-600">Loading CRM data...</p>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[1.75rem] border border-red-500/20 bg-red-50 p-6 text-red-950">
      <p className="text-sm font-semibold">CRM data could not be loaded.</p>
      <p className="mt-2 text-sm leading-6">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-full bg-red-950 px-4 py-2 text-sm font-semibold text-white">
        Retry
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-slate-900/15 bg-white/78 p-8 text-center">
      <div>
        <p className="text-lg font-semibold text-[#071724]">No CRM leads yet.</p>
        <p className="mt-2 text-sm text-slate-500">Submit a website intake form to create the first lead.</p>
        <a href="/intake" className="mt-5 inline-flex rounded-full bg-[#071724] px-5 py-3 text-sm font-semibold text-white">
          Open intake
        </a>
      </div>
    </div>
  )
}
