import { describe, expect, it } from 'vitest'
import source from '../../../supabase/functions/communications/index.ts?raw'

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
})
