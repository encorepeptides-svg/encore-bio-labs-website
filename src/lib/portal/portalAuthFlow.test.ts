import { describe, expect, it } from 'vitest'
import type { PortalIdentity, PortalRole } from './portalAuth'
import { getPortalLandingPath, validatePortalEmail } from './portalAuthFlow'

function identity(roles: PortalRole[], status: PortalIdentity['status'] = 'active'): PortalIdentity {
  return {
    user: { id: '00000000-0000-4000-8000-000000000001' } as PortalIdentity['user'],
    roles,
    status,
    profile: { legal_name: 'Test Client', preferred_name: 'Test', email: 'test@example.com' },
  }
}

describe('portal authentication flow', () => {
  it('validates required and malformed email addresses before authentication', () => {
    expect(validatePortalEmail('')).toBe('required')
    expect(validatePortalEmail('not-an-email')).toBe('invalid')
    expect(validatePortalEmail(' client@example.com ')).toBeNull()
  })

  it('redirects clients to the client dashboard and administrators to the admin dashboard', () => {
    expect(getPortalLandingPath(identity(['client']))).toBe('/portal')
    expect(getPortalLandingPath(identity(['support']))).toBe('/portal')
    expect(getPortalLandingPath(identity(['admin']))).toBe('/admin/content')
    expect(getPortalLandingPath(identity(['super_admin']))).toBe('/admin/content')
  })

  it('resumes the correct client step for incomplete and pending accounts', () => {
    expect(getPortalLandingPath(identity(['client'], 'onboarding_incomplete'))).toBe('/portal/intake')
    expect(getPortalLandingPath(identity(['client'], 'pending_review'))).toBe('/portal/security')
  })
})
