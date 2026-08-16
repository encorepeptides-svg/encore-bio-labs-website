import { describe, expect, it } from 'vitest'
import source from '../../../supabase/functions/communications/index.ts?raw'
import distributorSource from '../../../supabase/functions/distributor-onboarding/index.ts?raw'

describe('portal invitation delivery', () => {
  it('requires an authenticated administrator before sending an invitation', () => {
    expect(source).toContain("service.auth.getUser(accessToken)")
    expect(source).toContain(".in('role', ['admin', 'super_admin'])")
    expect(source).toContain('Administrator authorization required.')
  })

  it('uses Supabase Auth to send a unique invite and records its approval path', () => {
    expect(source).toContain('auth.admin.inviteUserByEmail')
    expect(source).toContain(".from('portal_invitations')")
    expect(source).toContain("approval_mode: approvalMode")
    expect(source).toContain("auth_user_id: invited.user.id")
    expect(source).toContain("Deno.env.get('PORTAL_SITE_URL')")
  })

  it('moves distributor invitations to the recoverable outbox processor', () => {
    expect(source).toContain("payload.action === 'distributor_invite'")
    expect(source).toContain('Use the recoverable distributor-onboarding endpoint.')
    expect(distributorSource).toContain("userClient.rpc('admin_begin_distributor_invitation'")
    expect(distributorSource).toContain("service_claim_distributor_onboarding_outbox")
    expect(distributorSource).toContain('auth.admin.generateLink')
  })

  it('sends distributor invitations to the dedicated localized activation routes', () => {
    const distributorInvite = distributorSource.slice(distributorSource.indexOf('async function processAuthInvite'))
    expect(distributorInvite).toContain("'/es/distributor/reset-password?invited=1'")
    expect(distributorInvite).toContain("'/distributor/reset-password?invited=1'")
    expect(distributorInvite).not.toContain("'/es/client-reset-password?invited=1'")
    expect(distributorInvite).not.toContain("'/client-reset-password?invited=1'")
  })
})
