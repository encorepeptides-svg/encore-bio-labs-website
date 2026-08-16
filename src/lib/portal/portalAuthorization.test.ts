import { describe, expect, it } from 'vitest'
import type { ClientAccountStatus, DistributorAccountStatus, DistributorOnboardingState, PortalIdentity, PortalRole } from './portalAuth'
import { authorizePortal } from './portalAuthorization'

function identity(
  status: ClientAccountStatus,
  roles: PortalRole[] = ['client'],
  distributorStatus: DistributorAccountStatus | null = roles.includes('distributor') ? 'active' : null,
  distributorOnboardingStatus: DistributorOnboardingState | null = roles.includes('distributor') ? 'active' : null,
): PortalIdentity {
  return { user: { id: '00000000-0000-4000-8000-000000000001' } as PortalIdentity['user'], status, distributorStatus, distributorOnboardingStatus, roles, profile: { legal_name: 'Test Client', preferred_name: 'Test', email: 'test@example.com' } }
}

describe('portal authorization decisions', () => {
  it('rejects unauthenticated protected access', () => expect(authorizePortal(null)).toBe('unauthenticated'))
  it('does not permit clients into admin routes', () => expect(authorizePortal(identity('active'), { admin: true })).toBe('admin_required'))
  it('does not permit support into admin routes', () => expect(authorizePortal(identity('active', ['support']), { admin: true })).toBe('admin_required'))
  it('permits an admin into admin routes', () => expect(authorizePortal(identity('active', ['admin']), { admin: true })).toBe('allow'))
  it('isolates distributor routes from client accounts', () => {
    expect(authorizePortal(identity('active'), { distributor: true })).toBe('distributor_required')
    expect(authorizePortal(identity('onboarding_incomplete', ['distributor'], 'active'), { distributor: true })).toBe('allow')
  })
  it('honors every distributor account lifecycle state', () => {
    expect(authorizePortal(identity('active', ['distributor'], 'pending', 'email_accepted'), { distributor: true })).toBe('distributor_pending')
    expect(authorizePortal(identity('active', ['distributor'], 'suspended', 'suspended'), { distributor: true })).toBe('distributor_suspended')
    expect(authorizePortal(identity('active', ['distributor'], 'archived', null), { distributor: true })).toBe('distributor_archived')
    expect(authorizePortal(identity('active', ['distributor'], null), { distributor: true })).toBe('distributor_required')
  })
  it('allows incomplete distributors only into onboarding routes', () => {
    const pending = identity('active', ['distributor'], 'pending', 'documents_complete')
    expect(authorizePortal(pending, { distributor: true })).toBe('distributor_pending')
    expect(authorizePortal(pending, { distributor: true, allowDistributorOnboarding: true })).toBe('allow')
  })
  it('blocks suspended and archived accounts', () => { expect(authorizePortal(identity('suspended'))).toBe('account_unavailable'); expect(authorizePortal(identity('archived'))).toBe('account_unavailable') })
  it('limits onboarding-incomplete accounts', () => { expect(authorizePortal(identity('onboarding_incomplete'))).toBe('onboarding_required'); expect(authorizePortal(identity('onboarding_incomplete'), { allowOnboarding: true })).toBe('allow') })
  it('limits pending-review accounts', () => expect(authorizePortal(identity('pending_review'))).toBe('pending_review'))
  it('permits active clients', () => expect(authorizePortal(identity('active'))).toBe('allow'))
})
