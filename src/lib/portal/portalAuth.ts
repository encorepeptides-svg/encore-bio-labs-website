import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../supabaseClient'

export type PortalRole = 'client' | 'support' | 'admin' | 'super_admin'
export type ClientAccountStatus = 'unverified' | 'onboarding_incomplete' | 'pending_review' | 'active' | 'suspended' | 'archived'

export type PortalIdentity = {
  user: User
  roles: PortalRole[]
  status: ClientAccountStatus
  profile: { legal_name: string; preferred_name: string; email: string }
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
  const [{ data: roles, error: roleError }, { data: status, error: statusError }, { data: profile, error: profileError }] = await Promise.all([
    client.from('user_roles').select('role').eq('user_id', user.id),
    client.from('client_statuses').select('status').eq('user_id', user.id).single(),
    client.from('profiles').select('legal_name,preferred_name,email').eq('id', user.id).single(),
  ])
  if (roleError || statusError || profileError) throw new Error('Portal access could not be verified.')
  return { user, roles: (roles ?? []).map((entry) => entry.role as PortalRole), status: status.status as ClientAccountStatus, profile }
}

export async function signInPortal(email: string, password: string) {
  return requireSupabase().auth.signInWithPassword({ email, password })
}

export async function registerPortalAccount(input: { legalName: string; email: string; mobile: string; preferredLanguage: string; password: string }) {
  return requireSupabase().auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${localizedAuthPath('/client-login')}?verified=1`,
      data: { legal_name: input.legalName, preferred_name: input.legalName.split(' ')[0] ?? '', mobile: input.mobile, preferred_language: input.preferredLanguage },
    },
  })
}

export async function requestPasswordReset(email: string) {
  return requireSupabase().auth.resetPasswordForEmail(email, { redirectTo: localizedAuthPath('/client-reset-password') })
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
