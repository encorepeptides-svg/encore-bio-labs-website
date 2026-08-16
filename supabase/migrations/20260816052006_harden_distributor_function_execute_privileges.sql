-- Trigger functions are invoked by PostgreSQL, never directly through the API.
revoke all on function public.assign_storefront_distributor_attribution() from public, anon, authenticated;
revoke all on function public.create_distributor_referral_from_order() from public, anon, authenticated;
revoke all on function public.consume_distributor_customer_redemption() from public, anon, authenticated;
revoke all on function public.sync_distributor_sale_from_order() from public, anon, authenticated;

-- Administrative RPCs validate auth.uid() and portal_is_admin() internally.
-- They remain callable by authenticated administrators only.
revoke all on function public.admin_upsert_distributor(uuid, text, text, integer, public.distributor_account_status, integer, integer, boolean, boolean) from public, anon, authenticated;
revoke all on function public.admin_reconcile_distributor_sale(text) from public, anon;
revoke all on function public.admin_create_distributor_payout(uuid, date, date) from public, anon;
revoke all on function public.admin_mark_distributor_payout_paid(uuid, text) from public, anon;

grant execute on function public.admin_reconcile_distributor_sale(text) to authenticated;
grant execute on function public.admin_create_distributor_payout(uuid, date, date) to authenticated;
grant execute on function public.admin_mark_distributor_payout_paid(uuid, text) to authenticated;
