import type { ReactNode } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { authorizePortal } from '../../lib/portal/portalAuthorization'

export function ProtectedPortal({ children, admin = false, allowOnboarding = false }: { children: ReactNode; admin?: boolean; allowOnboarding?: boolean }) {
  const { identity, loading, configured } = usePortalAuth()
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  if (!configured) return <PortalGate title={t('gateConfigTitle')} copy={t('gateConfigCopy')} action={t('gateReturnHome')} href={path('/')} />
  if (loading) return <PortalGate title={t('gateVerifyingTitle')} copy={t('gateVerifyingCopy')} />
  const decision = authorizePortal(identity, { admin, allowOnboarding })
  if (decision === 'unauthenticated') return <PortalGate title={t('gateSignInTitle')} copy={t('gateSignInCopy')} action={t('gateSignInAction')} href={path('/client-login')} />
  if (decision === 'admin_required') return <PortalGate title={t('gateAdminTitle')} copy={t('gateAdminCopy')} action={t('gateAdminAction')} href={path('/portal')} />
  if (decision === 'account_unavailable') return <PortalGate title={t('gateAccountTitle')} copy={t('gateAccountCopy')} action={t('gateAccountAction')} href={path('/client-login')} />
  if (decision === 'unverified') return <PortalGate title={t('gateUnverifiedTitle')} copy={t('gateUnverifiedCopy')} action={t('gateUnverifiedAction')} href={path('/client-login')} />
  if (decision === 'onboarding_required') return <PortalGate title={t('gateOnboardingTitle')} copy={t('gateOnboardingCopy')} action={t('gateOnboardingAction')} href={path('/portal/onboarding')} />
  if (decision === 'pending_review') return <PortalGate title={t('gatePendingTitle')} copy={t('gatePendingCopy')} action={t('gatePendingAction')} href={path('/portal/security')} />
  return children
}

function PortalGate({ title, copy, action, href }: { title:string; copy:string; action?:string; href?:string }) {
  const { t } = useTranslation('portal')
  return <main id="main-content" className="grid min-h-[70vh] place-items-center bg-[#f5f6f3] px-5"><div className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-[0_28px_90px_rgba(7,23,36,.1)]"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{t('gateTitle')}</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.055em]">{title}</h1><p className="mt-4 leading-7 text-slate-600">{copy}</p>{action&&href?<a href={href} className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">{action}</a>:null}</div></main>
}
