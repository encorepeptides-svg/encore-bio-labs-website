import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../supabaseClient'

export type PortalRole = 'client' | 'support' | 'admin' | 'super_admin' | 'distributor'
export type ClientAccountStatus = 'unverified' | 'onboarding_incomplete' | 'pending_review' | 'active' | 'suspended' | 'archived'
export type DistributorAccountStatus = 'pending' | 'active' | 'suspended' | 'archived'
export type DistributorOnboardingState = 'draft' | 'invite_pending' | 'invited' | 'email_accepted' | 'documents_complete' | 'payment_configured' | 'approved' | 'active' | 'expired' | 'revoked' | 'rejected' | 'suspended'
export type PortalAudience = 'client' | 'distributor'

export type PortalIdentity = {
  user: User
  roles: PortalRole[]
  status: ClientAccountStatus
  distributorStatus: DistributorAccountStatus | null
  distributorOnboardingStatus?: DistributorOnboardingState | null
  mfaCurrentLevel?: 'aal1' | 'aal2' | null
  mfaNextLevel?: 'aal1' | 'aal2' | null
  mfaEnrolled?: boolean
  profile: {
    legal_name: string
    preferred_name: string
    email: string
    mobile?: string | null
    preferred_language?: string | null
    time_zone?: string | null
  }
}

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) throw new Error('Portal authentication is not configured.')
  return supabase
}

function localizedAuthPath(path: string) {
  return `${window.location.origin}${window.location.pathname.startsWith('/es/') ? '/es' : ''}${path}`
}

export async function loadPortalIdentity(): Promise<PortalIdentity | null> {
  const client = requireSupabase()
  const { data: userData, error: userError } = await client.auth.getUser()
  if (userError || !userData.user) return null
  const user = userData.user
  const [{ data: roles, error: roleError }, { data: status, error: statusError }, { data: profile, error: profileError }, distributorResult, assuranceResult, factorResult] = await Promise.all([
    client.from('user_roles').select('role').eq('user_id', user.id),
    client.from('client_statuses').select('status').eq('user_id', user.id).maybeSingle(),
    client.from('profiles').select('legal_name,preferred_name,email,mobile,preferred_language,time_zone').eq('id', user.id).maybeSingle(),
    client.from('distributor_accounts').select('id,status,onboarding_status').eq('user_id', user.id).maybeSingle(),
    client.auth.mfa.getAuthenticatorAssuranceLevel(),
    client.auth.mfa.listFactors(),
  ])
  const distributorTableUnavailable = distributorResult.error?.code === '42P01' || distributorResult.error?.code === 'PGRST205'
  if (roleError || (!distributorTableUnavailable && distributorResult.error)) throw new Error('Portal access could not be verified.')
  const isDistributor = Boolean(distributorResult.data)
  if ((statusError || profileError || !status || !profile) && !isDistributor) throw new Error('Portal access could not be verified.')
  const resolvedRoles = (roles ?? []).map((entry) => entry.role as PortalRole)
  if (isDistributor && !resolvedRoles.includes('distributor')) resolvedRoles.push('distributor')
  const fallbackName = String(user.user_metadata?.legal_name ?? user.email?.split('@')[0] ?? 'Encore user')
  return {
    user,
    roles: resolvedRoles,
    status: (status?.status ?? 'active') as ClientAccountStatus,
    distributorStatus: (distributorResult.data?.status as DistributorAccountStatus | undefined) ?? null,
    distributorOnboardingStatus: (distributorResult.data?.onboarding_status as DistributorOnboardingState | undefined) ?? null,
    mfaCurrentLevel: assuranceResult.data?.currentLevel === 'aal2' ? 'aal2' : assuranceResult.data?.currentLevel === 'aal1' ? 'aal1' : null,
    mfaNextLevel: assuranceResult.data?.nextLevel === 'aal2' ? 'aal2' : assuranceResult.data?.nextLevel === 'aal1' ? 'aal1' : null,
    mfaEnrolled: Boolean(factorResult.data?.totp.some((factor) => factor.status === 'verified')),
    profile: profile ?? {
      legal_name: fallbackName,
      preferred_name: String(user.user_metadata?.preferred_name ?? fallbackName.split(' ')[0] ?? fallbackName),
      email: user.email ?? '',
      mobile: null,
      preferred_language: null,
      time_zone: null,
    },
  }
}

export async function signInPortal(email: string, password: string) {
  return requireSupabase().auth.signInWithPassword({ email: email.trim(), password })
}

export async function challengePortalMfa(code: string) {
  const client = requireSupabase()
  const { data: factors, error: factorError } = await client.auth.mfa.listFactors()
  if (factorError) return { data: null, error: factorError }
  const factor = factors.totp.find((item) => item.status === 'verified')
  if (!factor) throw new Error('No verified MFA factor is available.')
  const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId: factor.id })
  if (challengeError) return { data: null, error: challengeError }
  return client.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code: code.trim() })
}

export async function registerPortalAccount(input: { legalName: string; email: string; mobile: string; preferredLanguage: string; password: string; intakeHandoffToken?: string }) {
  return requireSupabase().auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      emailRedirectTo: `${localizedAuthPath('/client-login')}?verified=1`,
      data: { legal_name: input.legalName, preferred_name: input.legalName.split(' ')[0] ?? '', mobile: input.mobile, preferred_language: input.preferredLanguage, intake_handoff_token: input.intakeHandoffToken },
    },
  })
}

export async function requestPasswordReset(email: string, audience: PortalAudience = 'client') {
  const resetPath = audience === 'distributor' ? '/distributor/reset-password' : '/client-reset-password'
  return requireSupabase().auth.resetPasswordForEmail(email.trim(), { redirectTo: localizedAuthPath(resetPath) })
}

export async function updatePortalPassword(password: string) {
  return requireSupabase().auth.updateUser({ password })
}

export async function signOutPortal() {
  return requireSupabase().auth.signOut({ scope: 'local' })
}

export function isStaffRole(roles: PortalRole[]) {
  return roles.some((role) => role === 'support' || role === 'admin' || role === 'super_admin')
}

export function isAdminRole(roles: PortalRole[]) {
  return roles.some((role) => role === 'admin' || role === 'super_admin')
}

export function isDistributorRole(roles: PortalRole[]) {
  return roles.includes('distributor')
}
