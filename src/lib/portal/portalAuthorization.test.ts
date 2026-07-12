import { describe, expect, it } from 'vitest'
import type { PortalIdentity, PortalRole, ClientAccountStatus } from './portalAuth'
import { authorizePortal } from './portalAuthorization'

function identity(status: ClientAccountStatus, roles: PortalRole[] = ['client']): PortalIdentity {
  return { user: { id: '00000000-0000-4000-8000-000000000001' } as PortalIdentity['user'], status, roles, profile: { legal_name: 'Test Client', preferred_name: 'Test', email: 'test@example.com' } }
}

describe('portal authorization decisions', () => {
  it('rejects unauthenticated protected access', () => expect(authorizePortal(null)).toBe('unauthenticated'))
  it('does not permit clients into admin routes', () => expect(authorizePortal(identity('active'), { admin: true })).toBe('admin_required'))
  it('does not permit support into admin routes', () => expect(authorizePortal(identity('active', ['support']), { admin: true })).toBe('admin_required'))
  it('permits an admin into admin routes', () => expect(authorizePortal(identity('active', ['admin']), { admin: true })).toBe('allow'))
  it('blocks suspended and archived accounts', () => { expect(authorizePortal(identity('suspended'))).toBe('account_unavailable'); expect(authorizePortal(identity('archived'))).toBe('account_unavailable') })
  it('limits onboarding-incomplete accounts', () => { expect(authorizePortal(identity('onboarding_incomplete'))).toBe('onboarding_required'); expect(authorizePortal(identity('onboarding_incomplete'), { allowOnboarding: true })).toBe('allow') })
  it('limits pending-review accounts', () => expect(authorizePortal(identity('pending_review'))).toBe('pending_review'))
  it('permits active clients', () => expect(authorizePortal(identity('active'))).toBe('allow'))
})
