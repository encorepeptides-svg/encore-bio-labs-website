import { isAdminRole, type PortalIdentity } from './portalAuth'

export type PortalEmailValidationError = 'required' | 'invalid' | null

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validatePortalEmail(email: string): PortalEmailValidationError {
  const normalized = email.trim()
  if (!normalized) return 'required'
  return EMAIL_PATTERN.test(normalized) ? null : 'invalid'
}

export function getPortalLandingPath(identity: PortalIdentity) {
  return isAdminRole(identity.roles) ? '/admin/content' : '/portal'
}
