import { BadgeDollarSign, CircleDollarSign, ClipboardCheck, LoaderCircle, MailPlus, RefreshCw, UsersRound, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { adminConfirmDistributorPayment, adminCreateDistributorPayout, adminInviteDistributor, adminMarkDistributorPayoutPaid, adminProcessDistributorOnboardingOutbox, adminReconcileDistributorSale, adminResendDistributorInvitation, adminReviewDistributorDocument, adminTransitionDistributorOnboarding, calculateDistributorAdminOverviewMetrics, emptyDistributorDashboardMetrics, loadDistributorAdminData, type DistributorAccount, type DistributorAdminData, type DistributorOnboardingState, type DistributorOnboardingSummary } from '../../lib/distributorPortal'
import { PortalShell } from '../portal/PortalShell'
import { DistributorAccountingAdmin } from './DistributorAccountingAdmin'
import { DistributorAdminPremium } from './DistributorAdminPremium'
import { usePortalAuth } from '../../context/usePortalAuth'

type AdminData = DistributorAdminData
const emptyData: AdminData = { account: null, metrics: emptyDistributorDashboardMetrics, accounts: [], attributedOrders: [], sales: [], commissions: [], payouts: [], adjustments: [], balances: [], saleItems: [], refunds: [], onboarding: [], onboardingDocuments: [], onboardingEvents: [], reconciliationIssues: [] }

export function DistributorAdminPage({ section = 'overview' }: { section?: string }) {
  const { locale, path } = useLocale()
  const { identity } = usePortalAuth()
  const { t } = useTranslation('distributor')
  const [data, setData] = useState<AdminData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const money = (cents: number, currency = 'USD') => new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', { style: 'currency', currency }).format(cents / 100)
  const date = (value: string) => new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', { dateStyle: 'medium' }).format(new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value))

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setData(await loadDistributorAdminData()) }
    catch { setError(t('adminError')) }
    finally { setLoading(false) }
  }, [t])

  useEffect(() => { void load() }, [load])
  const metrics = calculateDistributorAdminOverviewMetrics(data)

  function notify(nextMessage: string) { setMessage(nextMessage); setError(''); window.setTimeout(()=>setMessage(''),3000) }
  function fail(cause: unknown) { setMessage(''); setError(cause instanceof Error ? `${t('adminError')} ${cause.message}` : t('adminError')) }

  if (loading) return <PortalShell admin><div className="grid min-h-[30rem] place-items-center"><LoaderCircle className="animate-spin text-teal-700" aria-label={t('adminTitle')} /></div></PortalShell>

  return <PortalShell admin>
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('adminEyebrow')}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{t('adminTitle')}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{t('adminIntro')}</p></div><div className="flex flex-wrap gap-3"><a href={path('/admin/distributors/accounts#invite-distributor')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-[#0c2739]"><MailPlus size={16}/>{t('adminInviteSend')}</a><button onClick={()=>void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-900/10 px-4 text-sm font-semibold"><RefreshCw size={15}/>{t('retry')}</button></div></div>
    <nav className="mt-7 flex flex-wrap gap-2" aria-label={t('adminTitle')}>{[['overview',t('navOverview')],['accounts',t('adminAccountsTitle')],['onboarding',t('adminOnboardingTitle')],['sales',t('salesTitle')],['adjustments',t('navAdjustments')],['payouts',t('payoutsTitle')],['reconciliation',locale === 'es' ? 'Reconciliación' : 'Reconciliation'],['configuration',locale === 'es' ? 'Configuración' : 'Configuration'],['rules',locale === 'es' ? 'Reglas' : 'Rules'],['profitability',locale === 'es' ? 'Rentabilidad' : 'Profitability'],['resources',locale === 'es' ? 'Recursos' : 'Resources'],['managers',locale === 'es' ? 'Responsables' : 'Managers'],['security',locale === 'es' ? 'MFA' : 'MFA']].map(([key,label])=><a key={key} href={path(key==='overview'?'/admin/distributors':`/admin/distributors/${key}`)} className={`rounded-full px-4 py-2 text-sm font-semibold ${section===key?'bg-[#071724] text-white':'bg-slate-100 text-slate-700'}`}>{label}</a>)}</nav>
    {message?<p role="status" className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-950">{message}</p>:null}
    {error?<p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">{error}</p>:null}
    {section==='overview'?<>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><AdminMetric icon={UsersRound} label={t('adminActivePartners')} value={String(metrics.activeDistributors)}/><AdminMetric icon={ClipboardCheck} label={t('adminAttributedOrders')} value={String(metrics.attributedOrders)}/><AdminMetric icon={BadgeDollarSign} label={t('adminOutstandingCommission')} value={money(metrics.outstandingCommission)}/><AdminMetric icon={WalletCards} label={t('adminPaidCommission')} value={money(metrics.paidCommission)}/></div>
      <AccountTable accounts={data.accounts} data={data} money={money} t={t}/>
    </>:null}
    {section==='accounts'?<><DistributorInviteForm onInvited={async(outcome)=>{notify(outcome === 'completed' ? t('adminInviteSuccess') : t('adminOnboardingQueued'));await load()}} onError={fail} t={t}/><AccountTable accounts={data.accounts} data={data} money={money} t={t}/></>:null}
    {section==='onboarding'?<DistributorOnboardingAdmin data={data} date={date} onSaved={async(nextMessage)=>{notify(nextMessage);await load()}} onError={fail} t={t}/>:null}
    {section==='sales'?<><SaleForm onSaved={async()=>{notify(t('adminSaleSaved'));await load()}} onError={fail} t={t}/><SalesAdminTable data={data} accounts={data.accounts} money={money} date={date} t={t}/></>:null}
    {section==='adjustments'?<DistributorAccountingAdmin data={data} money={money} date={date} onSaved={async(nextMessage)=>{notify(nextMessage);await load()}} onError={fail} t={t}/>:null}
    {section==='payouts'?<><PayoutForm accounts={data.accounts} onSaved={async()=>{notify(t('adminPayoutCreated'));await load()}} onError={fail} t={t}/><PayoutAdminTable data={data} accounts={data.accounts} money={money} date={date} onPaid={async()=>{notify(t('adminMarkedPaid'));await load()}} onError={fail} t={t}/></>:null}
    {['reconciliation','configuration','rules','profitability','resources','managers','security'].includes(section) && identity ? <DistributorAdminPremium section={section} accounts={data.accounts} userId={identity.user.id} locale={locale} /> : null}
  </PortalShell>
}

function DistributorInviteForm({ onInvited, onError, t }: { onInvited:(outcome: 'completed' | 'pending')=>Promise<void>; onError:(error:unknown)=>void; t:(key:string)=>string }) {
  const initial = { email: '', name: '', code: '', preferredLanguage: 'Spanish' as 'English' | 'Spanish' }
  const [form, setForm] = useState(initial)
  const [sending, setSending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSending(true)
    try {
      const result = await adminInviteDistributor({
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        preferredLanguage: form.preferredLanguage,
      })
      if (result.operation.outcome === 'blocked') throw new Error(result.operation.reason || t('adminOnboardingBlocked'))
      setForm(initial)
      await onInvited(result.outcome === 'completed' ? 'completed' : 'pending')
    } catch (error) {
      onError(error)
    } finally {
      setSending(false)
    }
  }

  return <section id="invite-distributor" className="mt-7 scroll-mt-8 rounded-[1.5rem] border border-teal-900/10 bg-teal-50/60 p-5 sm:p-6">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700">{t('adminInviteEyebrow')}</p>
    <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#071724]">{t('adminInviteTitle')}</h2>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('adminInviteIntro')}</p>
    <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label={t('adminInviteName')}><input className="portal-input" value={form.name} onChange={event=>setForm({...form,name:event.target.value})} autoComplete="off" required/></Field>
      <Field label={t('adminInviteEmail')}><input className="portal-input" type="email" value={form.email} onChange={event=>setForm({...form,email:event.target.value})} autoComplete="off" required/></Field>
      <Field label={t('adminInviteCode')}><input className="portal-input uppercase" pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,31}" value={form.code} onChange={event=>setForm({...form,code:event.target.value})} autoComplete="off" required/></Field>
      <Field label={t('adminInviteLanguage')}><select className="portal-input" value={form.preferredLanguage} onChange={event=>setForm({...form,preferredLanguage:event.target.value as 'English'|'Spanish'})}><option value="Spanish">{t('adminInviteLanguageSpanish')}</option><option value="English">{t('adminInviteLanguageEnglish')}</option></select></Field>
      <div className="rounded-xl border border-teal-900/10 bg-white/75 p-4 text-sm leading-6 text-slate-600 sm:col-span-2"><span className="font-semibold text-[#071724]">{t('adminInviteTermsTitle')}</span> {t('adminInviteTerms')}</div>
      <div className="sm:col-span-2"><button disabled={sending} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white transition hover:bg-[#0c2739] disabled:opacity-50"><MailPlus size={16}/>{sending?t('adminInviteSending'):t('adminInviteSend')}</button></div>
    </form>
  </section>
}

function DistributorOnboardingAdmin({ data, date, onSaved, onError, t }: { data: AdminData; date: (value: string) => string; onSaved: (message: string) => Promise<void>; onError: (error: unknown) => void; t: (key: string) => string }) {
  const [filter, setFilter] = useState<'all' | DistributorOnboardingState>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(data.onboarding[0]?.distributor_id ?? '')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState('')
  const [payment, setPayment] = useState({ provider: '', accountReference: '', last4: '' })
  const normalizedQuery = query.trim().toLowerCase()
  const rows = data.onboarding.filter((row) => (filter === 'all' || row.onboarding_status === filter) && (!normalizedQuery || `${row.display_name} ${row.email} ${row.referral_code}`.toLowerCase().includes(normalizedQuery)))
  const selected = data.onboarding.find((row) => row.distributor_id === selectedId) ?? null
  const documents = selected ? data.onboardingDocuments.filter((document) => document.distributor_id === selected.distributor_id) : []
  const events = selected ? data.onboardingEvents.filter((event) => event.distributor_id === selected.distributor_id) : []

  async function resend(row: DistributorOnboardingSummary) {
    if (!window.confirm(t('adminOnboardingConfirm'))) return
    setBusy('resend')
    try {
      const result = await adminResendDistributorInvitation(row.distributor_id)
      if (result.operation.outcome === 'blocked') throw new Error(result.operation.reason || t('adminOnboardingBlocked'))
      await onSaved(result.outcome === 'completed' ? t('adminOnboardingResent') : t('adminOnboardingQueued'))
    } catch (error) { onError(error) } finally { setBusy('') }
  }

  async function transition(action: 'approve' | 'activate' | 'revoke' | 'reject' | 'suspend' | 'reactivate') {
    if (!selected) return
    const requiresReason = ['revoke', 'reject', 'suspend'].includes(action)
    if (requiresReason && !reason.trim()) { onError(new Error(t('adminOnboardingReasonRequired'))); return }
    if (!window.confirm(t('adminOnboardingConfirm'))) return
    setBusy(action)
    try {
      const result = await adminTransitionDistributorOnboarding(selected.distributor_id, action, reason.trim())
      if (result.operation.outcome === 'blocked') throw new Error(result.operation.reason || t('adminOnboardingBlocked'))
      setReason('')
      await onSaved(result.outcome === 'completed' ? t(`adminOnboarding${capitalize(action)}Saved`) : t('adminOnboardingQueued'))
    } catch (error) { onError(error) } finally { setBusy('') }
  }

  async function reviewDocument(documentId: string, decision: 'approved' | 'rejected') {
    if (decision === 'rejected' && !reason.trim()) { onError(new Error(t('adminOnboardingReasonRequired'))); return }
    if (!window.confirm(t('adminOnboardingConfirm'))) return
    setBusy(`${decision}:${documentId}`)
    try {
      const result = await adminReviewDistributorDocument(documentId, decision, reason.trim())
      if (result.outcome === 'blocked') throw new Error(result.reason || t('adminOnboardingBlocked'))
      setReason('')
      await onSaved(t(decision === 'approved' ? 'adminOnboardingDocumentApproved' : 'adminOnboardingDocumentRejected'))
    } catch (error) { onError(error) } finally { setBusy('') }
  }

  async function confirmPayment(event: FormEvent) {
    event.preventDefault()
    if (!selected || !window.confirm(t('adminOnboardingConfirm'))) return
    setBusy('payment')
    try {
      const result = await adminConfirmDistributorPayment({ distributorId: selected.distributor_id, ...payment })
      if (result.outcome === 'blocked') throw new Error(result.reason || t('adminOnboardingBlocked'))
      setPayment({ provider: '', accountReference: '', last4: '' })
      await onSaved(t('adminOnboardingPaymentSaved'))
    } catch (error) { onError(error) } finally { setBusy('') }
  }

  async function processPending() {
    setBusy('process')
    try {
      const result = await adminProcessDistributorOnboardingOutbox()
      await onSaved(result.outcome === 'completed' ? t('adminOnboardingProcessed') : t('adminOnboardingQueued'))
    } catch (error) { onError(error) } finally { setBusy('') }
  }

  return <section className="mt-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-semibold tracking-[-.04em]">{t('adminOnboardingTitle')}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{t('adminOnboardingBody')}</p></div><button type="button" disabled={Boolean(busy)} onClick={() => void processPending()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-900/10 px-4 text-sm font-semibold disabled:opacity-40"><RefreshCw size={15}/>{busy === 'process' ? t('adminSaving') : t('adminOnboardingProcessPending')}</button></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_14rem]">
      <input className="portal-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('adminOnboardingSearch')} />
      <select className="portal-input" value={filter} onChange={(event) => setFilter(event.target.value as 'all' | DistributorOnboardingState)}><option value="all">{t('adminOnboardingAllStates')}</option>{(['draft','invite_pending','invited','email_accepted','documents_complete','payment_configured','approved','active','expired','revoked','rejected','suspended'] as const).map((state) => <option key={state} value={state}>{t(`onboardingState${capitalize(state)}`)}</option>)}</select>
    </div>
    {rows.length ? <div className="mt-5 overflow-x-auto rounded-[1.25rem] border border-slate-900/8"><table className="w-full min-w-[112rem] text-left text-xs"><thead className="bg-slate-50 uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">{t('adminDisplayName')}</th><th className="px-4 py-3">{t('adminInviteEmail')}</th><th className="px-4 py-3">{t('columnStatus')}</th><th className="px-4 py-3">{t('adminOnboardingInvited')}</th><th className="px-4 py-3">{t('adminOnboardingAccepted')}</th><th className="px-4 py-3">{t('adminOnboardingAccess')}</th><th className="px-4 py-3">{t('adminOnboardingDocuments')}</th><th className="px-4 py-3">{t('adminOnboardingPayment')}</th><th className="px-4 py-3">{t('adminOnboardingApproval')}</th><th className="px-4 py-3">{t('adminOnboardingActivation')}</th><th className="px-4 py-3">{t('adminOnboardingError')}</th><th className="px-4 py-3">{t('adminOnboardingActions')}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.distributor_id} className="border-t border-slate-900/8"><td className="px-4 py-4 font-semibold">{row.display_name}</td><td className="px-4 py-4">{row.email}</td><td className="px-4 py-4"><OnboardingBadge state={row.onboarding_status} t={t} /></td><td className="px-4 py-4">{row.sent_at ? date(row.sent_at) : '—'}</td><td className="px-4 py-4">{row.email_accepted_at ? date(row.email_accepted_at) : '—'}</td><td className="px-4 py-4">{row.password_configured_at ? t('adminOnboardingConfigured') : t('adminOnboardingPending')}</td><td className="px-4 py-4">{row.documents_approved_count}/2 {t('adminOnboardingApprovedShort')}</td><td className="px-4 py-4">{row.payment_status ? t(`adminOnboardingPayment${capitalize(row.payment_status)}`) : '—'}</td><td className="px-4 py-4">{row.approved_at ? date(row.approved_at) : '—'}</td><td className="px-4 py-4">{row.activated_at ? date(row.activated_at) : '—'}</td><td className="max-w-52 px-4 py-4 text-red-700">{row.invitation_error || '—'}</td><td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => setSelectedId(row.distributor_id)} className="min-h-9 rounded-full border border-slate-200 px-3 font-semibold">{t('adminOnboardingReview')}</button>{['invited','expired'].includes(row.onboarding_status) ? <button type="button" disabled={Boolean(busy) || Boolean(row.last_resend_at && Date.now() - new Date(row.last_resend_at).getTime() < 600_000)} onClick={() => void resend(row)} className="min-h-9 rounded-full bg-[#071724] px-3 font-semibold text-white disabled:opacity-40">{t('adminOnboardingResend')}</button> : null}</div></td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">{t('adminOnboardingEmpty')}</p>}

    {selected ? <article className="mt-7 rounded-[1.5rem] border border-slate-900/8 bg-[#f7faf9] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-teal-700">{t('adminOnboardingDetail')}</p><h3 className="mt-2 text-2xl font-semibold">{selected.display_name}</h3><p className="mt-1 text-sm text-slate-600">{selected.email} · {selected.referral_code}</p></div><OnboardingBadge state={selected.onboarding_status} t={t} /></div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2"><section><h4 className="font-semibold">{t('adminOnboardingDocuments')}</h4><div className="mt-3 grid gap-3">{documents.length ? documents.map((document) => <div key={document.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{t(`onboardingDocument${capitalize(document.document_type)}`)}</p><p className="mt-1 text-xs text-slate-500">{document.original_filename} · {t(`onboardingDocumentStatus${capitalize(document.status)}`)}</p></div>{document.status === 'complete' ? <div className="flex gap-2"><button disabled={Boolean(busy)} onClick={() => void reviewDocument(document.id, 'approved')} className="min-h-9 rounded-full bg-teal-700 px-3 text-xs font-semibold text-white">{t('adminOnboardingApproveDocument')}</button><button disabled={Boolean(busy) || !reason.trim()} onClick={() => void reviewDocument(document.id, 'rejected')} className="min-h-9 rounded-full border border-red-200 px-3 text-xs font-semibold text-red-700">{t('adminOnboardingRejectDocument')}</button></div> : null}</div></div>) : <p className="text-sm text-slate-600">{t('adminOnboardingNoDocuments')}</p>}</div></section><section><h4 className="font-semibold">{t('adminOnboardingInviteAttempts')}</h4><dl className="mt-3 grid gap-3 rounded-xl bg-white p-4 text-sm"><div><dt className="text-xs text-slate-500">{t('adminOnboardingDeliveryStatus')}</dt><dd className="font-semibold">{selected.invitation_status || '—'}</dd></div><div><dt className="text-xs text-slate-500">{t('adminOnboardingResends')}</dt><dd className="font-semibold">{selected.resend_count}</dd></div><div><dt className="text-xs text-slate-500">{t('adminOnboardingExpires')}</dt><dd className="font-semibold">{selected.expires_at ? date(selected.expires_at) : '—'}</dd></div></dl></section></div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm"><span className="font-semibold">{t('adminOnboardingProcessorAttempts')}:</span> {selected.outbox_attempts ?? 0} · {selected.outbox_status || '—'}{selected.outbox_error ? <p className="mt-2 text-xs text-red-700">{selected.outbox_error}</p> : null}</div>
      <div className="mt-4"><Field label={t('adminOnboardingReason')}><textarea className="portal-input min-h-24" value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t('adminOnboardingReasonHint')} /></Field></div>
      <div className="mt-4 flex flex-wrap gap-2">{selected.onboarding_status === 'payment_configured' ? <ActionButton label={t('adminOnboardingApprove')} busy={busy === 'approve'} disabled={Boolean(busy)} onClick={() => void transition('approve')} /> : null}{selected.onboarding_status === 'approved' ? <ActionButton label={t('adminOnboardingActivate')} busy={busy === 'activate'} disabled={Boolean(busy)} onClick={() => void transition('activate')} /> : null}{selected.onboarding_status === 'suspended' ? <ActionButton label={t('adminOnboardingReactivate')} busy={busy === 'reactivate'} disabled={Boolean(busy)} onClick={() => void transition('reactivate')} /> : null}{['active','approved'].includes(selected.onboarding_status) ? <ActionButton label={t('adminOnboardingSuspend')} busy={busy === 'suspend'} disabled={Boolean(busy) || !reason.trim()} onClick={() => void transition('suspend')} danger /> : null}{!['active','revoked','rejected','suspended'].includes(selected.onboarding_status) ? <ActionButton label={t('adminOnboardingReject')} busy={busy === 'reject'} disabled={Boolean(busy) || !reason.trim()} onClick={() => void transition('reject')} danger /> : null}{!['revoked','rejected'].includes(selected.onboarding_status) ? <ActionButton label={t('adminOnboardingRevoke')} busy={busy === 'revoke'} disabled={Boolean(busy) || !reason.trim()} onClick={() => void transition('revoke')} danger /> : null}</div>
      {selected.onboarding_status === 'documents_complete' ? <form onSubmit={confirmPayment} className="mt-6 rounded-xl border border-teal-200 bg-white p-4"><h4 className="font-semibold">{t('adminOnboardingConfirmPayment')}</h4><p className="mt-2 text-xs leading-5 text-slate-600">{t('adminOnboardingConfirmPaymentBody')}</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><Field label={t('adminOnboardingProvider')}><input className="portal-input" value={payment.provider} onChange={(event) => setPayment({...payment, provider: event.target.value})} required /></Field><Field label={t('adminOnboardingProviderReference')}><input className="portal-input" value={payment.accountReference} onChange={(event) => setPayment({...payment, accountReference: event.target.value})} required /></Field><Field label={t('adminOnboardingLast4')}><input className="portal-input" pattern="[0-9A-Za-z]{4}" maxLength={4} value={payment.last4} onChange={(event) => setPayment({...payment, last4: event.target.value})} /></Field></div><button disabled={Boolean(busy)} className="mt-4 min-h-10 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white disabled:opacity-50">{busy === 'payment' ? t('adminSaving') : t('adminOnboardingConfirmPayment')}</button></form> : null}
      <section className="mt-6"><h4 className="font-semibold">{t('onboardingTimeline')}</h4><div className="mt-3 grid gap-2">{events.map((event) => <div key={event.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-white p-3 text-xs"><span><strong>{t(`onboardingEvent${capitalize(event.event_type)}`)}</strong>{event.reason ? ` · ${event.reason}` : ''}</span><time className="text-slate-500">{date(event.occurred_at)}</time></div>)}</div></section>
    </article> : null}

    {data.reconciliationIssues.length ? <section className="mt-8 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-5"><h3 className="font-semibold text-amber-950">{t('adminOnboardingReconciliation')}</h3><p className="mt-2 text-sm text-amber-900">{t('adminOnboardingReconciliationBody')}</p><div className="mt-4 grid gap-2">{data.reconciliationIssues.filter((issue) => issue.status === 'open').map((issue) => <div key={issue.id} className="rounded-xl bg-white/80 p-3 text-xs text-amber-950"><strong>{issue.issue_type}</strong> · {issue.email || issue.distributor_id || issue.auth_user_id}</div>)}</div></section> : null}
  </section>
}

function OnboardingBadge({ state, t }: { state: DistributorOnboardingState; t: (key: string) => string }) {
  const color = state === 'active' ? 'bg-emerald-100 text-emerald-800' : state === 'approved' || state === 'payment_configured' || state === 'documents_complete' ? 'bg-teal-100 text-teal-900' : state === 'expired' ? 'bg-amber-100 text-amber-900' : state === 'revoked' || state === 'rejected' || state === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{t(`onboardingState${capitalize(state)}`)}</span>
}

function ActionButton({ label, busy, disabled, danger = false, onClick }: { label: string; busy: boolean; disabled: boolean; danger?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`min-h-10 rounded-full px-4 text-sm font-semibold disabled:opacity-40 ${danger ? 'border border-red-200 bg-white text-red-700' : 'bg-[#071724] text-white'}`}>{busy ? '…' : label}</button>
}

function SaleForm({ onSaved, onError, t }: { onSaved:()=>Promise<void>; onError:(error:unknown)=>void; t:(key:string)=>string }) {
  const [orderReference,setOrderReference]=useState('');const [saving,setSaving]=useState(false)
  async function submit(event:FormEvent){event.preventDefault();setSaving(true);try{await adminReconcileDistributorSale(orderReference.trim());setOrderReference('');await onSaved()}catch(error){onError(error)}finally{setSaving(false)}}
  return <form onSubmit={submit} className="mt-7 rounded-[1.5rem] border border-slate-900/8 bg-[#f7faf9] p-5 sm:p-6"><h2 className="text-xl font-semibold">{t('adminRecordSaleTitle')}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('adminRecordSaleBody')}</p><div className="mt-5 max-w-xl"><Field label={t('adminOrderReference')}><input className="portal-input" value={orderReference} onChange={e=>setOrderReference(e.target.value)} placeholder="ORD-1234" required/></Field></div><button disabled={saving} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white disabled:opacity-50"><CircleDollarSign size={16}/>{saving?t('adminSaving'):t('adminRecordSale')}</button></form>
}

function PayoutForm({ accounts, onSaved, onError, t }: { accounts:DistributorAccount[];onSaved:()=>Promise<void>;onError:(error:unknown)=>void;t:(key:string)=>string }) {
  const now=new Date();const [form,setForm]=useState({distributorId:accounts[0]?.id??'',start:new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10),end:now.toISOString().slice(0,10)});const [saving,setSaving]=useState(false)
  useEffect(()=>{if(!form.distributorId&&accounts[0])setForm(current=>({...current,distributorId:accounts[0].id}))},[accounts,form.distributorId])
  async function submit(event:FormEvent){event.preventDefault();setSaving(true);try{await adminCreateDistributorPayout(form.distributorId,form.start,form.end);await onSaved()}catch(error){onError(error)}finally{setSaving(false)}}
  return <form onSubmit={submit} className="mt-7 rounded-[1.5rem] border border-slate-900/8 bg-[#f7faf9] p-5 sm:p-6"><h2 className="text-xl font-semibold">{t('adminPayoutTitle')}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('adminPayoutBody')}</p><div className="mt-5 grid gap-4 sm:grid-cols-3"><Field label={t('adminDistributor')}><select className="portal-input" value={form.distributorId} onChange={e=>setForm({...form,distributorId:e.target.value})} required><option value="" disabled>{t('adminDistributor')}</option>{accounts.filter(account=>account.status==='active').map(account=><option key={account.id} value={account.id}>{account.display_name}</option>)}</select></Field><Field label={t('adminPeriodStart')}><input className="portal-input" type="date" value={form.start} onChange={e=>setForm({...form,start:e.target.value})} required/></Field><Field label={t('adminPeriodEnd')}><input className="portal-input" type="date" value={form.end} onChange={e=>setForm({...form,end:e.target.value})} required/></Field></div><button disabled={saving||!form.distributorId} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white disabled:opacity-50"><WalletCards size={16}/>{saving?t('adminSaving'):t('adminCreatePayout')}</button></form>
}

function AccountTable({ accounts, data, money, t }: { accounts:DistributorAccount[]; data:AdminData;money:(cents:number)=>string;t:(key:string)=>string }) { return <section className="mt-8"><h2 className="text-2xl font-semibold tracking-[-.04em]">{t('adminAccountsTitle')}</h2>{accounts.length?<div className="mt-5 overflow-x-auto rounded-[1.25rem] border border-slate-900/8"><table className="w-full min-w-[72rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">{t('adminDisplayName')}</th><th className="px-5 py-3">{t('adminReferralCode')}</th><th className="px-5 py-3">{t('adminRate')}</th><th className="px-5 py-3">{t('adminCustomerOffer')}</th><th className="px-5 py-3">{t('adminOutstandingCommission')}</th><th className="px-5 py-3">{t('metricPendingRecovery')}</th><th className="px-5 py-3">{t('columnStatus')}</th></tr></thead><tbody>{accounts.map(account=>{const balance=data.balances.find(item=>item.distributor_id===account.id);return <tr key={account.id} className="border-t border-slate-900/8"><td className="px-5 py-4 font-semibold">{account.display_name}</td><td className="px-5 py-4 font-mono text-xs">{account.referral_code}</td><td className="px-5 py-4">{(account.commission_rate_bps/100).toFixed(2)}%</td><td className="px-5 py-4">{account.customer_discount_enabled?`${(account.customer_discount_rate_bps/100).toFixed(2)}% · ${money(account.customer_discount_max_cents)} · ${account.customer_discount_first_order_only?t('adminFirstOrderShort'):t('adminEveryOrderShort')}`:t('adminOfferDisabled')}</td><td className="px-5 py-4 font-semibold">{money(Number(balance?.payable_cents??0))}</td><td className="px-5 py-4 font-semibold text-red-700">{money(Number(balance?.pending_recovery_cents??0))}</td><td className="px-5 py-4 capitalize">{t(`status${capitalize(account.status)}`)}</td></tr>})}</tbody></table></div>:<p className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">{t('adminNoAccounts')}</p>}</section> }

function SalesAdminTable({ data, accounts, money, date, t }: { data:AdminData;accounts:DistributorAccount[];money:(cents:number,currency?:string)=>string;date:(value:string)=>string;t:(key:string)=>string }) { const name=(id:string)=>accounts.find(a=>a.id===id)?.display_name??'—';return <section className="mt-8">{data.sales.length?<div className="overflow-x-auto rounded-[1.25rem] border border-slate-900/8"><table className="w-full min-w-[80rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">{t('adminDistributor')}</th><th className="px-5 py-3">{t('columnOrder')}</th><th className="px-5 py-3">{t('columnDate')}</th><th className="px-5 py-3">{t('columnDiscountType')}</th><th className="px-5 py-3">{t('columnDiscount')}</th><th className="px-5 py-3">{t('columnRevenue')}</th><th className="px-5 py-3">{t('columnGrossCommission')}</th><th className="px-5 py-3">{t('columnNetCommission')}</th><th className="px-5 py-3">{t('columnStatus')}</th></tr></thead><tbody>{data.sales.map(sale=><tr key={sale.id} className="border-t border-slate-900/8"><td className="px-5 py-4 font-semibold">{name(sale.distributor_id)}</td><td className="px-5 py-4">{sale.order_reference}</td><td className="px-5 py-4">{date(sale.paid_at)}</td><td className="px-5 py-4">{t(`discount${capitalize(sale.discount_source)}`)}{sale.other_promotion_won?` · ${t('otherPromotionWon')}`:''}</td><td className="px-5 py-4">{money(sale.discount_cents,sale.currency)}</td><td className="px-5 py-4">{money(sale.original_commissionable_revenue_cents,sale.currency)}</td><td className="px-5 py-4">{money(sale.original_commission_amount_cents,sale.currency)}</td><td className="px-5 py-4 font-semibold">{money(sale.ledger_net_commission_cents,sale.currency)}</td><td className="px-5 py-4 capitalize">{t(`sale${capitalize(sale.status)}`)}</td></tr>)}</tbody></table></div>:<p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">{t('emptySales')}</p>}</section> }

function PayoutAdminTable({ data, accounts, money, date, onPaid, onError, t }: { data:AdminData;accounts:DistributorAccount[];money:(cents:number,currency?:string)=>string;date:(value:string)=>string;onPaid:()=>Promise<void>;onError:(error:unknown)=>void;t:(key:string)=>string }) { const [references,setReferences]=useState<Record<string,string>>({});const [saving,setSaving]=useState('');const name=(id:string)=>accounts.find(a=>a.id===id)?.display_name??'—';async function markPaid(id:string){setSaving(id);try{await adminMarkDistributorPayoutPaid(id,references[id]?.trim()??'');await onPaid()}catch(error){onError(error)}finally{setSaving('')}}return <section className="mt-8">{data.payouts.length?<div className="grid gap-4">{data.payouts.map(payout=><article key={payout.id} className="rounded-[1.25rem] border border-slate-900/8 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold">{name(payout.distributor_id)}</p><p className="mt-1 text-sm text-slate-500">{date(payout.period_start)} – {date(payout.period_end)}</p></div><div className="sm:text-right"><p className="text-xl font-semibold">{money(payout.amount_cents,payout.currency)}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-800">{t(`payout${capitalize(payout.status)}`)}</p></div></div>{['draft','processing'].includes(payout.status)?<div className="mt-4 flex flex-col gap-3 sm:flex-row"><input className="portal-input" placeholder={t('adminPaymentReference')} value={references[payout.id]??''} onChange={e=>setReferences({...references,[payout.id]:e.target.value})}/><button disabled={saving===payout.id||!references[payout.id]?.trim()} onClick={()=>void markPaid(payout.id)} className="min-h-11 shrink-0 rounded-full bg-[#071724] px-5 text-sm font-semibold text-white disabled:opacity-50">{saving===payout.id?t('adminSaving'):t('adminMarkPaid')}</button></div>:payout.external_reference?<p className="mt-4 font-mono text-xs text-slate-500">{payout.external_reference}</p>:null}</article>)}</div>:<p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">{t('emptyPayouts')}</p>}</section> }

function AdminMetric({icon:Icon,label,value}:{icon:typeof UsersRound;label:string;value:string}){return <div className="rounded-[1.25rem] border border-slate-900/8 p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800"><Icon size={18}/></span><p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="grid gap-2 text-sm font-semibold text-slate-700">{label}{children}</label>}
function capitalize(value:string){return value.split('_').map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join('')}
