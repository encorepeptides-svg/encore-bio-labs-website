import { describe, expect, it } from 'vitest'
import type { DistributorAccountStatus, DistributorOnboardingState, PortalIdentity, PortalRole } from './portalAuth'
import { getPortalLandingPath, validatePortalEmail } from './portalAuthFlow'

function identity(
  roles: PortalRole[],
  status: PortalIdentity['status'] = 'active',
  distributorStatus: DistributorAccountStatus | null = roles.includes('distributor') ? 'active' : null,
  distributorOnboardingStatus: DistributorOnboardingState | null = roles.includes('distributor') ? 'active' : null,
): PortalIdentity {
  return {
    user: { id: '00000000-0000-4000-8000-000000000001' } as PortalIdentity['user'],
    roles,
    status,
    distributorStatus,
    distributorOnboardingStatus,
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
    expect(getPortalLandingPath(identity(['distributor']))).toBe('/distributor')
  })

  it('resumes the correct client step for incomplete and pending accounts', () => {
    expect(getPortalLandingPath(identity(['client'], 'onboarding_incomplete'))).toBe('/portal/intake')
    expect(getPortalLandingPath(identity(['client'], 'pending_review'))).toBe('/portal/security')
  })

  it('returns an authenticated administrator to the requested CRM route', () => {
    expect(getPortalLandingPath(identity(['admin']), '/admin/leads')).toBe('/admin/leads')
    expect(getPortalLandingPath(identity(['client']), '/admin/leads')).toBe('/portal')
  })

  it('returns an authorized distributor to its requested workspace route', () => {
    expect(getPortalLandingPath(identity(['distributor']), '/distributor/sales')).toBe('/distributor/sales')
    expect(getPortalLandingPath(identity(['client']), '/distributor/sales')).toBe('/portal')
  })

  it('routes a distributor with incomplete onboarding only to the onboarding workspace', () => {
    expect(getPortalLandingPath(identity(['distributor'], 'active', 'pending', 'email_accepted'), '/distributor/sales')).toBe('/distributor/onboarding')
  })

  it('keeps distributor authentication inside the partner audience', () => {
    expect(getPortalLandingPath(identity(['distributor']), null, 'distributor')).toBe('/distributor')
    expect(getPortalLandingPath(identity(['distributor']), '/distributor/commissions', 'distributor')).toBe('/distributor/commissions')
    expect(getPortalLandingPath(identity(['client']), '/portal', 'distributor')).toBe('/distributor')
  })

  it('rejects external and malformed return paths', () => {
    expect(getPortalLandingPath(identity(['admin']), 'https://example.com')).toBe('/admin/content')
    expect(getPortalLandingPath(identity(['admin']), '//example.com/admin')).toBe('/admin/content')
    expect(getPortalLandingPath(identity(['distributor']), '//example.com/distributor', 'distributor')).toBe('/distributor')
    expect(getPortalLandingPath(identity(['distributor']), '/distributor\\evil', 'distributor')).toBe('/distributor')
  })
})
