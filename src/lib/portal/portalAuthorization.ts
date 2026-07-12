import { isAdminRole, type PortalIdentity } from './portalAuth'

export type PortalAccessDecision = 'allow' | 'unauthenticated' | 'admin_required' | 'unverified' | 'onboarding_required' | 'pending_review' | 'account_unavailable'

export function authorizePortal(identity: PortalIdentity | null, options: { admin?: boolean; allowOnboarding?: boolean } = {}): PortalAccessDecision {
  if (!identity) return 'unauthenticated'
  if (options.admin && !isAdminRole(identity.roles)) return 'admin_required'
  if (identity.status === 'suspended' || identity.status === 'archived') return 'account_unavailable'
  if (!options.admin && identity.status === 'unverified') return 'unverified'
  if (!options.admin && identity.status === 'onboarding_incomplete' && !options.allowOnboarding) return 'onboarding_required'
  if (!options.admin && identity.status === 'pending_review' && !options.allowOnboarding) return 'pending_review'
  return 'allow'
}
