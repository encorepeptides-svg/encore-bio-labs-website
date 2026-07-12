import { Bell, Calculator, ClipboardCheck, FileText, Headphones, Package, TrendingUp } from 'lucide-react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { PortalShell } from './PortalShell'

const modules = [
  ['/portal/progress','My Progress','Record and review your general progress measurements.',TrendingUp],
  ['/portal/check-ins','Weekly Check-In','Complete a short trend-focused weekly update.',ClipboardCheck],
  ['/portal/calculators','Calculators','Use general BMI and progress measurements with clear limitations.',Calculator],
  ['/portal/orders','Orders','Review authenticated order and fulfillment records.',Package],
  ['/portal/documents','Documents','Access documents specifically assigned to your account.',FileText],
  ['/portal/support','Support','Create and review secure operational support requests.',Headphones],
] as const

export function ClientPortalPage({ section = 'overview' }: { section?: string }) {
  const { identity }=usePortalAuth()
  if(section!=='overview') return <PortalShell><SectionEmpty section={section}/></PortalShell>
  return <PortalShell><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Account overview</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.055em] sm:text-5xl">Welcome, {identity?.profile.preferred_name||identity?.profile.legal_name||'Encore client'}.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">Your private workspace for onboarding status, progress records, orders, assigned research documentation, notifications, and operational support.</p>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(([href,title,copy,Icon])=><a key={href} href={href} className="group rounded-[1.5rem] border border-slate-900/8 bg-[#f8faf9] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_55px_rgba(7,23,36,.08)]"><Icon size={23} className="text-teal-700"/><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></a>)}</div>
    <div className="mt-8 grid gap-4 md:grid-cols-3"><Status title="Account status" value={identity?.status.replaceAll('_',' ')??'Unknown'}/><Status title="New documents" value="No assigned documents"/><Status title="Notifications" value="No new notifications" icon/></div>
  </PortalShell>
}

function Status({title,value,icon=false}:{title:string;value:string;icon?:boolean}){return <div className="rounded-[1.25rem] bg-white p-5 shadow-[0_14px_45px_rgba(7,23,36,.06)]">{icon?<Bell size={17} className="text-teal-700"/>:null}<p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 font-semibold capitalize">{value}</p></div>}
function SectionEmpty({section}:{section:string}){const title=section.split('-').map((part)=>part[0]?.toUpperCase()+part.slice(1)).join(' ');return <><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Client portal</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.055em]">{title}</h1><div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8"><h2 className="text-xl font-semibold">No records yet</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">This authenticated module is ready for its Phase 2–4 server integration. It does not display sample or fabricated client data.</p>{section==='support'?<p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Do not use this portal for emergencies or requests involving personal dosing, injection, treatment, titration, or human-use reconstitution instructions.</p>:null}{section==='check-ins'?<p className="mt-5 text-sm leading-6 text-slate-600">This portal does not provide emergency or medical services. Contact a licensed healthcare professional regarding medical concerns. Call 911 for an emergency.</p>:null}</div></>}
