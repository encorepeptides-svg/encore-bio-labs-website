import { isAdminRole, isDistributorRole, type PortalAudience, type PortalIdentity } from './portalAuth'

export type PortalEmailValidationError = 'required' | 'invalid' | null

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validatePortalEmail(email: string): PortalEmailValidationError {
  const normalized = email.trim()
  if (!normalized) return 'required'
  return EMAIL_PATTERN.test(normalized) ? null : 'invalid'
}

export function getPortalLandingPath(identity: PortalIdentity, requestedPath?: string | null, audience: PortalAudience = 'client') {
  const safeRequestedPath = requestedPath && /^\/(admin|portal|distributor)(\/|$)/.test(requestedPath) && !requestedPath.includes('\\') && !requestedPath.includes('//')
    ? requestedPath
    : null
  if (audience === 'distributor') {
    if (isDistributorRole(identity.roles) && identity.distributorOnboardingStatus !== 'active') return '/distributor/onboarding'
    if (safeRequestedPath?.startsWith('/distributor') && isDistributorRole(identity.roles)) return safeRequestedPath
    return '/distributor'
  }
  if (safeRequestedPath?.startsWith('/admin') && isAdminRole(identity.roles)) return safeRequestedPath
  if (safeRequestedPath?.startsWith('/distributor') && isDistributorRole(identity.roles)) {
    return identity.distributorOnboardingStatus === 'active' ? safeRequestedPath : '/distributor/onboarding'
  }
  if (safeRequestedPath?.startsWith('/portal')) return safeRequestedPath
  if (isAdminRole(identity.roles)) return '/admin/content'
  if (isDistributorRole(identity.roles)) return identity.distributorOnboardingStatus === 'active' ? '/distributor' : '/distributor/onboarding'
  if (identity.status === 'onboarding_incomplete') return '/portal/intake'
  if (identity.status === 'pending_review') return '/portal/security'
  return '/portal'
}
