import { useEffect, useState } from 'react'
import { useTranslation } from '../../i18n/LocaleContext'
import { supabase } from '../../lib/supabaseClient'
import { PortalShell } from './PortalShell'

type ApplicationRow={user_id:string;submitted_at:string|null;decision:string;profiles?:{legal_name:string;email:string}|null}

export function AdminPortalPage({ section = 'overview' }: { section?: string }) {
  const { t } = useTranslation('portal')
  const [applications,setApplications]=useState<ApplicationRow[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('')
  useEffect(()=>{let active=true;async function load(){if(!supabase)return;const{data,error:queryError}=await supabase.from('onboarding_profiles').select('user_id,submitted_at,decision,profiles!onboarding_profiles_user_id_fkey(legal_name,email)').not('submitted_at','is',null).eq('decision','pending').order('submitted_at',{ascending:true}).limit(50);if(!active)return;if(queryError)setError(t('adminLoadError'));else setApplications((data??[]) as unknown as ApplicationRow[]);setLoading(false)}void load();return()=>{active=false}},[t])
  const sectionTitle = ({ clients: t('adminNavClients'), orders: t('adminNavOrders'), documents: t('adminNavDocuments'), support: t('adminNavSupport'), 'audit-log': t('adminNavAudit'), settings: t('adminNavSettings') } as Record<string,string>)[section] ?? section
  return <PortalShell admin><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('adminLabel')}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{section==='applications'?t('adminApplicationsTitle'):t('adminOperationsTitle')}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">{t('adminIntro')}</p>
    {section==='overview'?<div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label={t('adminPendingApplications')} value={loading?'—':String(applications.length)}/><Stat label={t('adminActiveClients')} value={t('adminServerQueryRequired')}/><Stat label={t('adminOpenSupport')} value={t('adminPhase4')}/><Stat label={t('adminSecurityAlerts')} value={t('adminServerQueryRequired')}/></div>:null}
    {section==='applications'?<div className="mt-9 overflow-hidden rounded-[1.5rem] border border-slate-900/8"><div className="grid grid-cols-[1fr_auto] bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"><span>{t('adminApplicant')}</span><span>{t('adminSubmitted')}</span></div>{loading?<p className="p-6 text-sm text-slate-500">{t('adminLoadingApplications')}</p>:error?<p role="alert" className="p-6 text-sm text-red-700">{error}</p>:applications.length?applications.map((application)=><div key={application.user_id} className="grid grid-cols-[1fr_auto] gap-4 border-t border-slate-900/8 px-5 py-4"><div><p className="font-semibold">{application.profiles?.legal_name||t('adminClientApplication')}</p><p className="mt-1 text-sm text-slate-500">{application.profiles?.email}</p></div><time className="text-sm text-slate-500">{application.submitted_at?new Date(application.submitted_at).toLocaleDateString():''}</time></div>):<p className="p-6 text-sm text-slate-500">{t('adminNoPendingApplications')}</p>}</div>:null}
    {!['overview','applications'].includes(section)?<div className="mt-9 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8"><h2 className="text-xl font-semibold">{sectionTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t('adminModulePending')}</p></div>:null}
  </PortalShell>
}

function Stat({label,value}:{label:string;value:string}){return <div className="rounded-[1.25rem] bg-[#f8faf9] p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-3 text-2xl font-semibold capitalize">{value}</p></div>}
