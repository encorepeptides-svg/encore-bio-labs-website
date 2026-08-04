-- Incident fix: the CRM lead desk could never display a lead.
--
-- public.is_crm_admin() gated on the `app_metadata.role = 'crm_admin'` JWT
-- claim, which no signup, invitation, or onboarding flow has ever written. The
-- only accounts that ever had it were patched by hand via SQL. Meanwhile the
-- portal has a fully-populated role system in public.user_roles
-- (client/support/admin/super_admin) that every other policy already uses via
-- public.portal_is_admin().
--
-- This redefines is_crm_admin() to consult user_roles, so CRM access can no
-- longer drift away from portal admin access. The legacy JWT claim is still
-- accepted as a transitional OR-branch: the encorepeptides@gmail.com account
-- currently carries BOTH signals, and keeping the claim means the deploy order
-- of this migration and the frontend bundle cannot lock anyone out. The claim
-- branch should be dropped once the owner confirms every CRM operator has an
-- admin/super_admin row in user_roles.
--
-- Only the function body changes; every existing policy already calls
-- is_crm_admin() and is left untouched.

create or replace function public.is_crm_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1
      from public.user_roles
      where user_id = auth.uid()
        and role in ('admin'::public.portal_role, 'super_admin'::public.portal_role)
    )
    -- Transitional: hand-set JWT claim from the incident. Remove once every
    -- CRM operator has an admin/super_admin row in public.user_roles.
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'crm_admin', false)
$$;

revoke all on function public.is_crm_admin() from public;
grant execute on function public.is_crm_admin() to authenticated;
