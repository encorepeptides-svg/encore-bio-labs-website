import { describe, expect, it } from 'vitest'
import migration from '../../supabase/migrations/20260815200011_distributor_onboarding_outbox.sql?raw'
import processor from '../../supabase/functions/distributor-onboarding/index.ts?raw'
import communications from '../../supabase/functions/communications/index.ts?raw'
import app from '../App.tsx?raw'
import authorization from './portal/portalAuthorization.ts?raw'
import authPage from '../components/portal/PortalAuthPages.tsx?raw'
import adminPage from '../components/distributor/DistributorAdminPage.tsx?raw'
import onboardingPage from '../components/distributor/DistributorOnboardingPage.tsx?raw'
import portalApi from './distributorPortal.ts?raw'

describe('recoverable distributor onboarding contract', () => {
  it('1. commits the profile before invitation, audit event, and outbox work', () => {
    const start = migration.indexOf('create or replace function public.admin_begin_distributor_invitation')
    const body = migration.slice(start, migration.indexOf('create or replace function public.admin_queue_distributor_invitation_resend'))
    expect(body.indexOf('insert into public.distributor_accounts')).toBeLessThan(body.indexOf('insert into public.distributor_onboarding_invitations'))
    expect(body.indexOf('insert into public.distributor_onboarding_invitations')).toBeLessThan(body.indexOf('insert into public.distributor_onboarding_events'))
    expect(body.indexOf('insert into public.distributor_onboarding_events')).toBeLessThan(body.indexOf('insert into public.distributor_onboarding_outbox'))
  })

  it('2. never calls Auth from the transaction that creates the profile', () => {
    const begin = migration.slice(migration.indexOf('admin_begin_distributor_invitation'), migration.indexOf('admin_queue_distributor_invitation_resend'))
    expect(begin).not.toContain('auth.admin')
    expect(begin).not.toContain('generateLink')
  })

  it('3. rolls profile, invitation, event, and outbox back together if an insert fails', () => {
    expect(migration).toContain('create or replace function public.admin_begin_distributor_invitation')
    expect(migration).not.toContain('exception when others')
    expect(processor).toContain("userClient.rpc('admin_begin_distributor_invitation'")
  })

  it('4. preserves the committed profile when Auth generation fails', () => {
    expect(processor).toContain('await service.auth.admin.generateLink')
    expect(processor).toContain("service_complete_distributor_onboarding_outbox")
    expect(migration).toContain("else 'failed'::public.distributor_onboarding_outbox_status")
  })

  it('5. records email failure without deleting the profile or Auth user', () => {
    expect(migration).toContain("set status = 'failed', last_error")
    expect(migration).toContain("'last_invitation_error'")
    expect(migration).not.toContain('delete from public.distributor_accounts')
    expect(migration).not.toContain('delete from auth.users')
  })

  it('6. retries failed outbox work with bounded exponential backoff', () => {
    expect(migration).toContain("outbox.status in ('pending', 'failed')")
    expect(migration).toContain('outbox.attempts < outbox.max_attempts')
    expect(migration).toContain('power(2, attempts)')
    expect(migration).toContain("then 'blocked'::public.distributor_onboarding_outbox_status")
  })

  it('7. links an existing Auth user by verified email and uses a recovery link', () => {
    expect(processor).toContain('findAuthUserByEmail')
    expect(processor).toContain("type: 'recovery' as const")
    expect(migration).toContain("'auth_email_mismatch'")
    expect(migration).toContain("'auth_user_already_linked'")
  })

  it('8. makes invite creation idempotent', () => {
    expect(migration).toContain('idempotency_key text not null unique')
    expect(migration).toContain("return jsonb_build_object('outcome', 'already_completed'")
  })

  it('9. collapses rapid duplicate processor claims with row locking', () => {
    expect(migration).toContain('for update skip locked')
    expect(migration).toContain("set status = 'processing', attempts = attempts + 1")
  })

  it('10. enforces resend cooldown and a hard resend limit', () => {
    expect(migration).toContain("last_resend_at > now() - interval '10 minutes'")
    expect(migration).toContain("'resend_cooldown'")
    expect(migration).toContain('resend_count >= 20')
    expect(adminPage).toContain('600_000')
  })

  it('11. expires an unaccepted invitation without activating it', () => {
    expect(migration).toContain("('invited', 'expired')")
    expect(migration).toContain('service_expire_distributor_invitations')
    expect(migration).toContain("invitation.status = 'sent' and invitation.expires_at <= now()")
  })

  it('12. supports audited revocation before acceptance', () => {
    expect(migration).toContain("('invited', 'revoked')")
    expect(migration).toContain("when 'revoke' then 'revoked'")
    expect(migration).toContain("requested_action in ('revoke', 'reject', 'suspend')")
  })

  it('13. supports audited rejection before activation', () => {
    expect(migration).toContain("('documents_complete', 'rejected')")
    expect(migration).toContain("when 'reject' then 'rejected'")
    expect(adminPage).toContain("transition('reject')")
  })

  it('14. suspends an active distributor and queues session revocation', () => {
    expect(migration).toContain("('active', 'suspended')")
    expect(migration).toContain("requested_action in ('revoke', 'suspend')")
    expect(migration).toContain("'revoke_sessions'")
  })

  it('15. requires an explicit audited reactivation', () => {
    expect(migration).toContain("('suspended', 'active')")
    expect(migration).toContain("when 'reactivate' then 'active'")
    expect(adminPage).toContain("transition('reactivate')")
  })

  it('16. keeps one required document from completing the document stage', () => {
    expect(migration).toContain('count(distinct document_type) = 2')
    expect(migration).toContain("document_type in ('tax_form', 'distribution_agreement')")
  })

  it('17. advances only after both required documents pass defined checks', () => {
    expect(migration).toContain("status in ('complete', 'approved')")
    expect(migration).toContain("'mime_size_path_and_storage_presence'")
    expect(migration).toContain("'required_documents_complete'")
  })

  it('18. rejects missing, oversized, or unsupported document metadata', () => {
    expect(migration).toContain("source_mime_type not in ('application/pdf', 'image/jpeg', 'image/png')")
    expect(migration).toContain('source_byte_size not between 1 and 10485760')
    expect(migration).toContain("'storage_object_not_visible'")
  })

  it('19. prevents duplicate current documents while allowing a rejected replacement', () => {
    expect(migration).toContain('distributor_onboarding_one_current_document_idx')
    expect(migration).toContain("where status in ('submitted', 'complete', 'approved')")
    expect(migration).toContain('Superseded by distributor upload.')
  })

  it('20. stores documents in a private size- and MIME-limited bucket', () => {
    expect(migration).toContain("'distributor-onboarding-private', 'distributor-onboarding-private', false, 10485760")
    expect(migration).toContain("array['application/pdf', 'image/jpeg', 'image/png']")
    expect(onboardingPage).toContain('application/pdf,image/jpeg,image/png')
  })

  it('21. leaves payout setup pending until an external provider is confirmed', () => {
    expect(migration).toContain("provider_status in ('pending', 'configured', 'failed', 'disabled')")
    expect(migration).toContain("'confirmation_source', 'admin_provider_verification'")
    expect(onboardingPage).toContain('onboardingPaymentPendingBody')
  })

  it('22. stores only provider reference, status, and last four characters', () => {
    expect(migration).toContain('provider_account_reference text not null')
    expect(migration).toContain("account_last4 text check")
    expect(migration).not.toContain('bank_account_number')
    expect(migration).not.toContain('routing_number')
  })

  it('23. blocks approval until two documents are approved and payment is configured', () => {
    expect(migration).toContain("document.status = 'approved'")
    expect(migration).toContain("payment.provider_status = 'configured'")
    expect(migration).toContain("'documents_or_payment_not_approved'")
  })

  it('24. prevents self-approval and direct client state writes', () => {
    expect(migration).toContain('not public.portal_is_admin()')
    expect(migration).toContain('revoke all on public.distributor_onboarding_invitations')
    expect(migration).toContain('grant select on public.distributor_onboarding_invitations')
    expect(migration).not.toContain('grant update on public.distributor_accounts to authenticated')
  })

  it('25. makes activation a separate explicit admin transition', () => {
    expect(migration).toContain("('payment_configured', 'approved')")
    expect(migration).toContain("('approved', 'active')")
    expect(migration).not.toContain("('payment_configured', 'active')")
  })

  it('26. permits commission and payout RLS identity only for active accounts', () => {
    const portalIdentity = migration.slice(migration.indexOf('create or replace function public.portal_distributor_id()'), migration.indexOf('create or replace function public.distributor_onboarding_state_can_transition'))
    expect(portalIdentity).toContain("account.onboarding_status = 'active'")
    expect(portalIdentity).toContain("account.status = 'active'")
    expect(authorization).toContain("onboarding !== 'active'")
  })

  it('27. allows only onboarding routes before activation', () => {
    expect(app).toContain("logicalPath.startsWith('/distributor/onboarding/')")
    expect(app).toContain('<ProtectedPortal distributor allowDistributorOnboarding>')
    expect(app).toContain('<ProtectedPortal distributor><DistributorPortalPage')
  })

  it('28. denies suspended, revoked, rejected, and expired distributors', () => {
    expect(authorization).toContain("onboarding === 'suspended'")
    expect(authorization).toContain("onboarding === 'revoked'")
    expect(authorization).toContain("onboarding === 'rejected'")
    expect(authorization).toContain("onboarding === 'expired'")
  })

  it('29. isolates distributor records while retaining audited admin visibility', () => {
    expect(migration).toContain('distributor_id = (select public.portal_onboarding_distributor_id())')
    expect(migration).toContain('or public.portal_is_admin()')
    expect(migration).toContain('with (security_invoker = true)')
  })

  it('30. stores only a hash reference and never persists or logs the action link', () => {
    expect(migration).toContain('token_reference_hash text')
    expect(processor).toContain('reference_hash: await sha256(referenceSource)')
    expect(migration).not.toContain('action_link')
    expect(processor).not.toContain('console.log')
    expect(portalApi).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
  })

  it('31. records password configuration only after successful updateUser and verifies an Auth password exists', () => {
    expect(authPage.indexOf('await updatePortalPassword')).toBeLessThan(authPage.indexOf('await recordDistributorPasswordConfigured'))
    expect(migration).toContain("nullif(encrypted_password, '') is not null")
  })

  it('32. preserves both orphan directions for manual reconciliation without auto-deletion', () => {
    expect(migration).toContain("'auth_orphan'")
    expect(migration).toContain("'profile_orphan'")
    expect(migration).toContain("'ambiguous_legacy_state'")
    expect(migration).toContain('do not delete this historical Auth user automatically')
    expect(migration).not.toContain('delete from auth.users')
  })

  it('33. blocks revoked JWTs immediately through state-aware RLS even before access-token expiry', () => {
    expect(migration).toContain('delete from auth.sessions where user_id = target_user_id')
    expect(migration).toContain("account.onboarding_status = 'active'")
    expect(migration).toContain('service_revoke_distributor_sessions')
  })

  it('34. disables the orphan-producing legacy distributor invitation endpoint', () => {
    expect(communications).toContain('Use the recoverable distributor-onboarding endpoint.')
    expect(communications.slice(communications.indexOf("payload.action === 'distributor_invite'"))).not.toContain('inviteDistributor(')
  })
})
