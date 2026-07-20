import { describe, expect, it } from 'vitest'
import migration from '../../../supabase/migrations/202607200002_client_portal_launch.sql?raw'

describe('client portal launch migration', () => {
  it('repairs and maintains verified-email account status', () => {
    expect(migration).toContain('sync_portal_email_confirmation')
    expect(migration).toContain("statuses.status = 'unverified'")
    expect(migration).toContain("'onboarding_incomplete'")
  })

  it('keeps application review and support creation server-authoritative', () => {
    expect(migration).toContain('review_portal_application')
    expect(migration).toContain('not public.portal_is_admin()')
    expect(migration).toContain('create_portal_support_thread')
    expect(migration).toContain('not public.portal_is_active_client()')
  })

  it('keeps assigned client documents private', () => {
    expect(migration).toContain("values('client-documents', 'client-documents', false")
    expect(migration).toContain('clients read assigned portal documents')
    expect(migration).toContain('a.user_id = auth.uid()')
    expect(migration).not.toContain("values('client-documents', 'client-documents', true")
  })
})
