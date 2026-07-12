import type { ReactNode } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { authorizePortal } from '../../lib/portal/portalAuthorization'

export function ProtectedPortal({ children, admin = false, allowOnboarding = false }: { children: ReactNode; admin?: boolean; allowOnboarding?: boolean }) {
  const { identity, loading, configured } = usePortalAuth()
  if (!configured) return <PortalGate title="Portal configuration required" copy="Connect the approved Supabase project and apply the portal migration before using protected routes." action="Return home" href="/" />
  if (loading) return <PortalGate title="Verifying secure access" copy="Checking your authenticated session and account permissions…" />
  const decision = authorizePortal(identity, { admin, allowOnboarding })
  if (decision === 'unauthenticated') return <PortalGate title="Sign in required" copy="This route requires a verified Encore client account." action="Sign in" href="/client-login" />
  if (decision === 'admin_required') return <PortalGate title="Access unavailable" copy="Your account does not have administrative permission." action="Return to portal" href="/portal" />
  if (decision === 'account_unavailable') return <PortalGate title="Account access unavailable" copy="Contact Encore account support for assistance." action="Account support" href="/client-login" />
  if (decision === 'unverified') return <PortalGate title="Verify your email" copy="Use the secure link sent to your email before continuing." action="Return to sign in" href="/client-login" />
  if (decision === 'onboarding_required') return <PortalGate title="Complete onboarding" copy="Finish your account information and required acknowledgments before submitting for review." action="Continue onboarding" href="/portal/onboarding" />
  if (decision === 'pending_review') return <PortalGate title="Application under review" copy="Your onboarding submission is in Encore’s review queue. You can access security settings while review is pending." action="Security settings" href="/portal/security" />
  return children
}

function PortalGate({ title, copy, action, href }: { title:string; copy:string; action?:string; href?:string }) { return <main id="main-content" className="grid min-h-[70vh] place-items-center bg-[#f5f6f3] px-5"><div className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-[0_28px_90px_rgba(7,23,36,.1)]"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Encore client portal</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.055em]">{title}</h1><p className="mt-4 leading-7 text-slate-600">{copy}</p>{action&&href?<a href={href} className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">{action}</a>:null}</div></main> }
