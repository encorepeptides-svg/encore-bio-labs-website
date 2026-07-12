-- Production CRM hardening for projects that previously ran supabase/schema.sql.
alter table public.crm_leads add column if not exists notes text not null default '';

drop policy if exists "TEMP DEV anon read crm_campaign_sources" on public.crm_campaign_sources;
drop policy if exists "TEMP DEV anon write crm_campaign_sources" on public.crm_campaign_sources;
drop policy if exists "TEMP DEV anon read crm_leads" on public.crm_leads;
drop policy if exists "TEMP DEV anon write crm_leads" on public.crm_leads;
drop policy if exists "TEMP DEV anon read crm_intake_submissions" on public.crm_intake_submissions;
drop policy if exists "TEMP DEV anon write crm_intake_submissions" on public.crm_intake_submissions;
drop policy if exists "TEMP DEV anon read crm_timeline_events" on public.crm_timeline_events;
drop policy if exists "TEMP DEV anon write crm_timeline_events" on public.crm_timeline_events;
drop policy if exists "TEMP DEV anon read crm_notes" on public.crm_notes;
drop policy if exists "TEMP DEV anon write crm_notes" on public.crm_notes;
drop policy if exists "TEMP DEV anon read crm_products_interests" on public.crm_products_interests;
drop policy if exists "TEMP DEV anon write crm_products_interests" on public.crm_products_interests;

create or replace function public.is_crm_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'crm_admin', false)
$$;
revoke all on function public.is_crm_admin() from public;
grant execute on function public.is_crm_admin() to authenticated;

create policy "public may submit new leads" on public.crm_leads for insert to anon
  with check (consent_to_contact = true and research_use_acknowledgment = true);
create policy "public may submit intake details" on public.crm_intake_submissions for insert to anon
  with check (consent_to_contact = true and research_use_acknowledgment = true);
create policy "public may create submission timeline" on public.crm_timeline_events for insert to anon
  with check (event_type in ('lead_created', 'intake_submitted'));
create policy "public may submit product interests" on public.crm_products_interests for insert to anon
  with check (true);
create policy "admins manage campaign sources" on public.crm_campaign_sources for all to authenticated
  using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage leads" on public.crm_leads for all to authenticated
  using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage intake submissions" on public.crm_intake_submissions for all to authenticated
  using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage timeline events" on public.crm_timeline_events for all to authenticated
  using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage notes" on public.crm_notes for all to authenticated
  using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage product interests" on public.crm_products_interests for all to authenticated
  using (public.is_crm_admin()) with check (public.is_crm_admin());
