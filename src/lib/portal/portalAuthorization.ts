import { isAdminRole, isDistributorRole, type PortalIdentity } from './portalAuth'

export type PortalAccessDecision = 'allow' | 'unauthenticated' | 'admin_required' | 'distributor_required' | 'distributor_pending' | 'distributor_suspended' | 'distributor_archived' | 'distributor_expired' | 'distributor_rejected' | 'distributor_revoked' | 'unverified' | 'onboarding_required' | 'pending_review' | 'account_unavailable'

export function authorizePortal(identity: PortalIdentity | null, options: { admin?: boolean; distributor?: boolean; allowOnboarding?: boolean; allowDistributorOnboarding?: boolean } = {}): PortalAccessDecision {
  if (!identity) return 'unauthenticated'
  if (options.admin && !isAdminRole(identity.roles)) return 'admin_required'
  if (options.distributor) {
    if (!isDistributorRole(identity.roles) || !identity.distributorStatus) return 'distributor_required'
    const onboarding = identity.distributorOnboardingStatus
    if (onboarding === 'suspended' || identity.distributorStatus === 'suspended') return 'distributor_suspended'
    if (onboarding === 'revoked') return 'distributor_revoked'
    if (onboarding === 'rejected') return 'distributor_rejected'
    if (onboarding === 'expired') return 'distributor_expired'
    if (identity.distributorStatus === 'archived') return 'distributor_archived'
    if (options.allowDistributorOnboarding) return 'allow'
    if (onboarding !== 'active' || identity.distributorStatus !== 'active') return 'distributor_pending'
    return 'allow'
  }
  if (identity.status === 'suspended' || identity.status === 'archived') return 'account_unavailable'
  if (!options.admin && identity.status === 'unverified') return 'unverified'
  if (!options.admin && identity.status === 'onboarding_incomplete' && !options.allowOnboarding) return 'onboarding_required'
  if (!options.admin && identity.status === 'pending_review' && !options.allowOnboarding) return 'pending_review'
  return 'allow'
}
