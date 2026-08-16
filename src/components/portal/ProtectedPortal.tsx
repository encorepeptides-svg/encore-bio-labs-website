import type { ReactNode } from 'react'
import { usePortalAuth } from '../../context/usePortalAuth'
import { useLocale, useTranslation } from '../../i18n/LocaleContext'
import { authorizePortal } from '../../lib/portal/portalAuthorization'

export function ProtectedPortal({ children, admin = false, distributor = false, allowOnboarding = false, allowDistributorOnboarding = false }: { children: ReactNode; admin?: boolean; distributor?: boolean; allowOnboarding?: boolean; allowDistributorOnboarding?: boolean }) {
  const { identity, loading, configured } = usePortalAuth()
  const { path } = useLocale()
  const { t } = useTranslation('portal')
  const { t: tDistributor } = useTranslation('distributor')
  const gateT = distributor ? tDistributor : t
  if (!configured) return <PortalGate title={gateT('gateConfigTitle')} copy={gateT('gateConfigCopy')} action={gateT('gateReturnHome')} href={path('/')} distributor={distributor} />
  if (loading) return <PortalGate title={gateT('gateVerifyingTitle')} copy={gateT('gateVerifyingCopy')} distributor={distributor} />
  const decision = authorizePortal(identity, { admin, distributor, allowOnboarding, allowDistributorOnboarding })
  if (decision === 'unauthenticated') {
    const currentPath = typeof window === 'undefined' ? (admin ? '/admin' : distributor ? '/distributor' : '/portal') : window.location.pathname.replace(/^\/es(?=\/)/, '')
    const signInPath = distributor ? '/distributor/login' : '/client-login'
    const signInHref = admin || distributor ? `${path(signInPath)}?next=${encodeURIComponent(currentPath)}` : path(signInPath)
    return <PortalGate
      title={admin ? t('gateAdminSignInTitle') : distributor ? tDistributor('gateSignInTitle') : t('gateSignInTitle')}
      copy={admin ? t('gateAdminSignInCopy') : distributor ? tDistributor('gateSignInCopy') : t('gateSignInCopy')}
      action={admin ? t('gateAdminSignInAction') : distributor ? tDistributor('gateSignInAction') : t('gateSignInAction')}
      href={signInHref}
      admin={admin}
      distributor={distributor}
    />
  }
  if (decision === 'admin_required') return <PortalGate title={t('gateAdminTitle')} copy={t('gateAdminCopy')} action={t('gateAdminAction')} href={path('/portal')} />
  if (decision === 'distributor_required') return <PortalGate title={tDistributor('gateNoProfileTitle')} copy={tDistributor('gateNoProfileCopy')} action={tDistributor('gateSupportAction')} href={path('/contact')} distributor />
  if (decision === 'distributor_pending') return <PortalGate title={tDistributor('gatePendingTitle')} copy={tDistributor('gatePendingCopy')} action={tDistributor('gateSupportAction')} href={path('/contact')} distributor />
  if (decision === 'distributor_suspended') return <PortalGate title={tDistributor('gateSuspendedTitle')} copy={tDistributor('gateSuspendedCopy')} action={tDistributor('gateSupportAction')} href={path('/contact')} distributor />
  if (decision === 'distributor_expired') return <PortalGate title={tDistributor('gateExpiredTitle')} copy={tDistributor('gateExpiredCopy')} action={tDistributor('gateSupportAction')} href={path('/contact')} distributor />
  if (decision === 'distributor_rejected') return <PortalGate title={tDistributor('gateRejectedTitle')} copy={tDistributor('gateRejectedCopy')} action={tDistributor('gateSupportAction')} href={path('/contact')} distributor />
  if (decision === 'distributor_revoked') return <PortalGate title={tDistributor('gateRevokedTitle')} copy={tDistributor('gateRevokedCopy')} action={tDistributor('gateSupportAction')} href={path('/contact')} distributor />
  if (decision === 'distributor_archived') return <PortalGate title={tDistributor('gateArchivedTitle')} copy={tDistributor('gateArchivedCopy')} action={tDistributor('gateSupportAction')} href={path('/contact')} distributor />
  if (decision === 'account_unavailable') return <PortalGate title={t('gateAccountTitle')} copy={t('gateAccountCopy')} action={t('gateAccountAction')} href={path('/client-login')} />
  if (decision === 'unverified') return <PortalGate title={t('gateUnverifiedTitle')} copy={t('gateUnverifiedCopy')} action={t('gateUnverifiedAction')} href={path('/client-login')} />
  if (decision === 'onboarding_required') return <PortalGate title={t('gateOnboardingTitle')} copy={t('gateOnboardingCopy')} action={t('gateOnboardingAction')} href={path('/portal/intake')} />
  if (decision === 'pending_review') return <PortalGate title={t('gatePendingTitle')} copy={t('gatePendingCopy')} action={t('gatePendingAction')} href={path('/portal/security')} />
  return children
}

function PortalGate({ title, copy, action, href, admin = false, distributor = false }: { title:string; copy:string; action?:string; href?:string; admin?: boolean; distributor?: boolean }) {
  const { t } = useTranslation('portal')
  const { t: tDistributor } = useTranslation('distributor')
  return <main id="main-content" className="grid min-h-[70vh] place-items-center bg-[#f5f6f3] px-5"><div className="max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-[0_28px_90px_rgba(7,23,36,.1)]"><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">{admin ? t('gateAdminTitleLabel') : distributor ? tDistributor('brandTagline') : t('gateTitle')}</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.055em]">{title}</h1><p className="mt-4 leading-7 text-slate-600">{copy}</p>{action&&href?<a href={href} className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#071724] px-6 text-sm font-semibold text-white">{action}</a>:null}</div></main>
}
