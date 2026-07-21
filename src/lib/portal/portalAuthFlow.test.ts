import { describe, expect, it } from 'vitest'
import type { PortalIdentity, PortalRole } from './portalAuth'
import { getPortalLandingPath, validatePortalEmail } from './portalAuthFlow'

function identity(roles: PortalRole[]): PortalIdentity {
  return {
    user: { id: '00000000-0000-4000-8000-000000000001' } as PortalIdentity['user'],
    roles,
    status: 'active',
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
})
