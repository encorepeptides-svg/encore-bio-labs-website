-- The project grants new functions to API roles through default privileges.
-- Remove those direct grants from internal SECURITY DEFINER helpers while
-- retaining the intended public submit and authenticated claim surfaces.

revoke all on function public.is_crm_admin() from public, anon;
grant execute on function public.is_crm_admin() to authenticated;

revoke all on function public.hydrate_public_intake(uuid, uuid, text)
  from public, anon, authenticated;

revoke all on function public.claim_public_intake(uuid) from public, anon;
grant execute on function public.claim_public_intake(uuid) to authenticated;

revoke all on function public.handle_new_portal_user()
  from public, anon, authenticated;

revoke all on function public.submit_public_intake(jsonb) from public;
grant execute on function public.submit_public_intake(jsonb) to anon, authenticated;

notify pgrst, 'reload schema';
