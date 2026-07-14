import { Bell, Calculator, ClipboardCheck, FileText, Headphones, Package, TrendingUp } from 'lucide-react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { PortalShell } from './PortalShell'

export function ClientPortalPage({ section = 'overview' }: { section?: string }) {
  const { identity }=usePortalAuth()
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  const modules = [
    ['/portal/progress',t('moduleProgressTitle'),t('moduleProgressCopy'),TrendingUp],
    ['/portal/check-ins',t('moduleCheckInsTitle'),t('moduleCheckInsCopy'),ClipboardCheck],
    ['/portal/calculators',t('moduleCalculatorsTitle'),t('moduleCalculatorsCopy'),Calculator],
    ['/portal/orders',t('moduleOrdersTitle'),t('moduleOrdersCopy'),Package],
    ['/portal/documents',t('moduleDocumentsTitle'),t('moduleDocumentsCopy'),FileText],
    ['/portal/support',t('moduleSupportTitle'),t('moduleSupportCopy'),Headphones],
  ] as const
  if(section!=='overview') return <PortalShell><SectionEmpty section={section}/></PortalShell>
  return <PortalShell><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('accountOverview')}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">{t('welcomeMessage',{name:identity?.profile.preferred_name||identity?.profile.legal_name||t('defaultClientName')})}</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">{t('overviewBody')}</p>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(([href,title,copy,Icon])=><a key={href} href={path(href)} className="group rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_55px_rgba(7,23,36,.08)]"><Icon size={23} className="text-teal-700"/><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></a>)}</div>
    <div className="mt-8 grid gap-4 md:grid-cols-3"><Status title={t('statusAccountStatus')} value={identity?.status.replaceAll('_',' ')??t('statusAccountStatusUnknown')}/><Status title={t('statusNewDocuments')} value={t('statusNoDocuments')}/><Status title={t('statusNotifications')} value={t('statusNoNotifications')} icon/></div>
  </PortalShell>
}

function Status({title,value,icon=false}:{title:string;value:string;icon?:boolean}){return <div className="rounded-[1.25rem] bg-white p-5 shadow-[0_14px_45px_rgba(7,23,36,.06)]">{icon?<Bell size={17} className="text-teal-700"/>:null}<p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 font-semibold capitalize">{value}</p></div>}
function SectionEmpty({section}:{section:string}){
  const { t } = useTranslation('portal')
  const title=section.split('-').map((part)=>part[0]?.toUpperCase()+part.slice(1)).join(' ')
  return <><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('clientPortalLabel')}</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.055em]">{title}</h1><div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8"><h2 className="text-xl font-semibold">{t('sectionEmptyTitle')}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{t('sectionEmptyBody')}</p>{section==='support'?<p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">{t('sectionEmptySupportWarning')}</p>:null}{section==='check-ins'?<p className="mt-5 text-sm leading-6 text-slate-600">{t('sectionEmptyCheckInsWarning')}</p>:null}</div></>
}
