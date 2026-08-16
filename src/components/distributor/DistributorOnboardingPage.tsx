import { Check, CircleAlert, Clock3, FileCheck2, FileUp, LoaderCircle, RefreshCw, ShieldCheck, UserRound, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import {
  loadDistributorOnboarding,
  uploadDistributorOnboardingDocument,
  type DistributorOnboardingData,
  type DistributorOnboardingDocument,
  type DistributorOnboardingState,
} from '../../lib/distributorPortal'
import { PortalShell } from '../portal/PortalShell'

const stateOrder: DistributorOnboardingState[] = ['invited', 'email_accepted', 'documents_complete', 'payment_configured', 'approved', 'active']
const allowedSections = new Set(['progress', 'profile', 'documents', 'payment'])

export function DistributorOnboardingPage({ section = 'progress' }: { section?: string }) {
  const { identity, refresh: refreshIdentity } = usePortalAuth()
  const { locale, path } = useLocale()
  const { t } = useTranslation('distributor')
  const [data, setData] = useState<DistributorOnboardingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<DistributorOnboardingDocument['document_type'] | ''>('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const currentSection = allowedSections.has(section) ? section : 'progress'

  const load = useCallback(async () => {
    if (!identity) return
    setLoading(true)
    setError('')
    try {
      setData(await loadDistributorOnboarding(identity.user.id))
      await refreshIdentity()
    } catch {
      setError(t('onboardingLoadError'))
    } finally {
      setLoading(false)
    }
  }, [identity, refreshIdentity, t])

  useEffect(() => { void load() }, [load])

  async function upload(documentType: DistributorOnboardingDocument['document_type'], event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !data) return
    setUploading(documentType)
    setError('')
    setMessage('')
    try {
      await uploadDistributorOnboardingDocument(data.account.id, documentType, file)
      setMessage(t('onboardingDocumentUploaded'))
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('onboardingUploadError'))
    } finally {
      setUploading('')
    }
  }

  const date = (value: string) => new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

  if (loading) return <PortalShell distributor><div className="grid min-h-[28rem] place-items-center"><LoaderCircle className="animate-spin text-teal-700" aria-label={t('onboardingLoading')} /></div></PortalShell>
  if (!data) return <PortalShell distributor><OnboardingNotice icon={CircleAlert} title={t('onboardingMissingTitle')} body={error || t('onboardingMissingBody')} /></PortalShell>

  const stateIndex = stateOrder.indexOf(data.account.onboarding_status)
  const terminal = ['expired', 'revoked', 'rejected', 'suspended'].includes(data.account.onboarding_status)
  const docs = (['tax_form', 'distribution_agreement'] as const).map((type) => ({
    type,
    document: data.documents.find((document) => document.document_type === type && document.status !== 'rejected') ?? data.documents.find((document) => document.document_type === type),
  }))

  return <PortalShell distributor>
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('onboardingEyebrow')}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{t('onboardingTitle')}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{t('onboardingIntro')}</p>
      </div>
      <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-900/10 px-4 text-sm font-semibold"><RefreshCw size={15} />{t('retry')}</button>
    </div>

    <nav className="mt-7 flex flex-wrap gap-2" aria-label={t('onboardingTitle')}>
      {[
        ['progress', t('onboardingNavProgress')],
        ['profile', t('onboardingNavProfile')],
        ['documents', t('onboardingNavDocuments')],
        ['payment', t('onboardingNavPayment')],
      ].map(([key, label]) => <a key={key} href={path(`/distributor/onboarding${key === 'progress' ? '' : `/${key}`}`)} className={`rounded-full px-4 py-2 text-sm font-semibold ${currentSection === key ? 'bg-[#071724] text-white' : 'bg-slate-100 text-slate-700'}`}>{label}</a>)}
    </nav>

    {message ? <p role="status" className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">{message}</p> : null}
    {error ? <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</p> : null}
    {terminal ? <OnboardingNotice icon={CircleAlert} title={t(`onboardingTerminal${capitalize(data.account.onboarding_status)}Title`)} body={data.account.status_reason || t(`onboardingTerminal${capitalize(data.account.onboarding_status)}Body`)} /> : null}

    {currentSection === 'progress' ? <>
      <section className="mt-7 rounded-[1.5rem] bg-[#071724] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-teal-200">{t('onboardingCurrentStatus')}</p><h2 className="mt-2 text-3xl font-semibold">{t(`onboardingState${capitalize(data.account.onboarding_status)}`)}</h2></div>
          {data.account.onboarding_status === 'active' ? <a href={path('/distributor')} className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#071724]">{t('onboardingOpenPortal')}</a> : <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold">{t('onboardingProtectedUntilActive')}</span>}
        </div>
      </section>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stateOrder.map((state, index) => {
          const complete = data.account.onboarding_status === 'active' || stateIndex > index
          const current = data.account.onboarding_status === state
          return <li key={state} className={`rounded-[1.25rem] border p-5 ${complete ? 'border-teal-200 bg-teal-50' : current ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}><span className={`flex size-9 items-center justify-center rounded-full ${complete ? 'bg-teal-700 text-white' : current ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'}`}>{complete ? <Check size={17} /> : <Clock3 size={17} />}</span><p className="mt-4 font-semibold">{t(`onboardingState${capitalize(state)}`)}</p><p className="mt-2 text-xs leading-5 text-slate-600">{t(`onboardingState${capitalize(state)}Help`)}</p></li>
        })}
      </ol>
      <section className="mt-8"><h2 className="text-2xl font-semibold">{t('onboardingTimeline')}</h2>{data.events.length ? <div className="mt-4 grid gap-3">{data.events.map((event) => <article key={event.id} className="rounded-[1.1rem] border border-slate-900/8 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><p className="font-semibold">{t(`onboardingEvent${capitalize(event.event_type)}`)}</p><time className="text-xs text-slate-500">{date(event.occurred_at)}</time></div><p className="mt-2 text-xs text-slate-500">{t('onboardingEventSource', { source: event.source })}</p>{event.reason ? <p className="mt-2 text-sm text-slate-700">{event.reason}</p> : null}</article>)}</div> : <p className="mt-4 text-sm text-slate-600">{t('onboardingTimelineEmpty')}</p>}</section>
    </> : null}

    {currentSection === 'profile' ? <section className="mt-7"><SectionHeading title={t('onboardingProfileTitle')} body={t('onboardingProfileBody')} /><dl className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label={t('adminDisplayName')} value={data.account.display_name} icon={UserRound} /><Detail label={t('adminInviteEmail')} value={data.account.email} icon={ShieldCheck} /><Detail label={t('adminReferralCode')} value={data.account.referral_code} icon={FileCheck2} /><Detail label={t('adminInviteLanguage')} value={data.account.preferred_language === 'Spanish' ? t('adminInviteLanguageSpanish') : t('adminInviteLanguageEnglish')} icon={FileCheck2} /></dl></section> : null}

    {currentSection === 'documents' ? <section className="mt-7"><SectionHeading title={t('onboardingDocumentsTitle')} body={t('onboardingDocumentsBody')} /><p className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">{t('onboardingDocumentPrivacy')}</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{docs.map(({ type, document }) => <article key={type} className="rounded-[1.25rem] border border-slate-900/8 p-5"><FileCheck2 className="text-teal-700" /><h3 className="mt-4 text-lg font-semibold">{t(`onboardingDocument${capitalize(type)}`)}</h3><p className="mt-2 text-sm text-slate-600">{document ? t(`onboardingDocumentStatus${capitalize(document.status)}`) : t('onboardingDocumentMissing')}</p>{document?.rejection_reason ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">{document.rejection_reason}</p> : null}<label className={`mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-[#071724] px-4 text-sm font-semibold text-white ${uploading ? 'pointer-events-none opacity-50' : ''}`}><FileUp size={16} />{uploading === type ? t('onboardingUploading') : document ? t('onboardingReplaceDocument') : t('onboardingUploadDocument')}<input className="sr-only" type="file" accept="application/pdf,image/jpeg,image/png" disabled={Boolean(uploading) || document?.status === 'approved'} onChange={(event) => void upload(type, event)} /></label></article>)}</div></section> : null}

    {currentSection === 'payment' ? <section className="mt-7"><SectionHeading title={t('onboardingPaymentTitle')} body={t('onboardingPaymentBody')} />{data.payment?.provider_status === 'configured' ? <div className="mt-6 rounded-[1.25rem] border border-teal-200 bg-teal-50 p-6"><WalletCards className="text-teal-800" /><h3 className="mt-4 text-xl font-semibold text-teal-950">{t('onboardingPaymentConfigured')}</h3><p className="mt-2 text-sm text-teal-900">{t('onboardingPaymentSummary', { provider: data.payment.provider, last4: data.payment.account_last4 || '••••' })}</p></div> : <OnboardingNotice icon={WalletCards} title={t('onboardingPaymentPending')} body={t('onboardingPaymentPendingBody')} />}</section> : null}
  </PortalShell>
}

function SectionHeading({ title, body }: { title: string; body: string }) {
  return <div><h2 className="text-3xl font-semibold tracking-[-.04em]">{title}</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{body}</p></div>
}

function Detail({ label, value, icon: Icon }: { label: string; value: string; icon: typeof UserRound }) {
  return <div className="rounded-[1.25rem] border border-slate-900/8 p-5"><Icon size={18} className="text-teal-700" /><dt className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 font-semibold">{value}</dd></div>
}

function OnboardingNotice({ icon: Icon, title, body }: { icon: typeof CircleAlert; title: string; body: string }) {
  return <div className="mt-7 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-6"><Icon className="text-amber-700" /><h2 className="mt-4 text-xl font-semibold text-amber-950">{title}</h2><p className="mt-2 text-sm leading-6 text-amber-900">{body}</p></div>
}

function capitalize(value: string) {
  return value.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')
}
