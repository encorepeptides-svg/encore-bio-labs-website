-- Encore Bio Labs Client Portal — Phase 1 foundation
create extension if not exists "pgcrypto";

create type public.portal_role as enum ('client', 'support', 'admin', 'super_admin');
create type public.client_account_status as enum ('unverified', 'onboarding_incomplete', 'pending_review', 'active', 'suspended', 'archived');
create type public.application_decision as enum ('pending', 'approved', 'rejected', 'corrections_requested');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  legal_name text not null default '', preferred_name text not null default '', email text not null default '',
  mobile text not null default '', preferred_language text not null default 'English', time_zone text not null default 'America/Denver',
  deleted_at timestamptz
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.portal_role not null default 'client', created_at timestamptz not null default now(),
  created_by uuid references auth.users(id), primary key (user_id, role)
);
create table public.client_statuses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status public.client_account_status not null default 'unverified',
  status_reason text, updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
create table public.consent_versions (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  consent_key text not null, version text not null, title text not null, body_hash text not null,
  active boolean not null default true, unique(consent_key, version)
);
create table public.consent_acceptances (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_version_id uuid not null references public.consent_versions(id), signature_value text not null,
  accepted_at timestamptz not null default now(), active boolean not null default true,
  replaced_by uuid references public.consent_acceptances(id), withdrawn_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);
create table public.onboarding_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  date_of_birth date, height_cm numeric(6,2), starting_weight_kg numeric(7,2), current_weight_kg numeric(7,2), waist_cm numeric(7,2),
  preferred_units text not null default 'imperial' check (preferred_units in ('imperial','metric')),
  goals text[] not null default '{}', activity_level text, exercise_frequency text, average_sleep_hours numeric(4,1),
  water_consistency integer check (water_consistency between 1 and 5), appetite_rating integer check (appetite_rating between 1 and 5),
  energy_rating integer check (energy_rating between 1 and 5), stress_rating integer check (stress_rating between 1 and 5),
  wellness_rating integer check (wellness_rating between 1 and 5), communication_preferences jsonb not null default '{}'::jsonb,
  submitted_at timestamptz, decision public.application_decision not null default 'pending', decision_at timestamptz, decision_by uuid references auth.users(id)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), read_at timestamptz, type text not null, title text not null,
  body text not null default '', action_path text, metadata jsonb not null default '{}'::jsonb
);
create table public.admin_notes (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), created_by uuid not null references auth.users(id), note text not null, deleted_at timestamptz
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), actor_id uuid references auth.users(id),
  actor_role public.portal_role, event_type text not null, resource_type text, resource_id uuid, success boolean not null default true,
  ip inet, user_agent text, metadata jsonb not null default '{}'::jsonb
);
create table public.security_events (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), user_id uuid references auth.users(id) on delete set null,
  event_type text not null, success boolean not null default true, ip inet, user_agent text, metadata jsonb not null default '{}'::jsonb
);
create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), status text not null default 'requested', completed_at timestamptz
);
create table public.data_export_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), status text not null default 'requested', completed_at timestamptz
);

-- Phase 2–4 normalized structures are created now so ownership and RLS boundaries exist before feature work.
create table public.progress_entries (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), entry_date date not null, measurements jsonb not null default '{}'::jsonb, scores jsonb not null default '{}'::jsonb, notes text, deleted_at timestamptz);
create table public.progress_photos (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, progress_entry_id uuid references public.progress_entries(id) on delete cascade, created_at timestamptz not null default now(), storage_path text not null, mime_type text not null, byte_size bigint not null, staff_visible boolean not null default false, scan_status text not null default 'pending', deleted_at timestamptz);
create table public.weekly_checkins (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), week_start date not null, measurements jsonb not null default '{}'::jsonb, scores jsonb not null default '{}'::jsonb, support_concern boolean not null default false, notes text, unique(user_id, week_start));
create table public.portal_orders (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), order_number text not null unique, amount_cents integer not null default 0, payment_status text not null default 'payment_pending', fulfillment_status text not null default 'review_required', deleted_at timestamptz);
create table public.portal_order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.portal_orders(id) on delete cascade, product_slug text not null, variant_sku text not null, quantity integer not null check(quantity > 0), unit_amount_cents integer not null, metadata jsonb not null default '{}'::jsonb);
create table public.shipments (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.portal_orders(id) on delete cascade, created_at timestamptz not null default now(), status text not null default 'processing', carrier text, tracking_number text, shipped_at timestamptz, delivered_at timestamptz);
create table public.product_lots (id uuid primary key default gen_random_uuid(), product_slug text not null, lot_number text not null unique, created_at timestamptz not null default now(), expires_at date, metadata jsonb not null default '{}'::jsonb);
create table public.documents (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), category text not null, title text not null, version text not null, storage_path text not null, product_slug text, lot_id uuid references public.product_lots(id), expires_at date, replaced_by uuid references public.documents(id), deleted_at timestamptz);
create table public.document_assignments (id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, order_id uuid references public.portal_orders(id) on delete cascade, created_at timestamptz not null default now(), revoked_at timestamptz, unique(document_id,user_id,order_id));
create table public.support_threads (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), category text not null, subject text not null, status text not null default 'open', priority text not null default 'normal', assigned_to uuid references auth.users(id), closed_at timestamptz);
create table public.support_messages (id uuid primary key default gen_random_uuid(), thread_id uuid not null references public.support_threads(id) on delete cascade, author_id uuid not null references auth.users(id), created_at timestamptz not null default now(), message text not null, attachment_path text);

create or replace function public.portal_has_role(required_role public.portal_role) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.user_roles where user_id=auth.uid() and role=required_role) $$;
create or replace function public.portal_is_admin() returns boolean language sql stable security definer set search_path='' as $$ select public.portal_has_role('admin') or public.portal_has_role('super_admin') $$;
create or replace function public.portal_is_active_client() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.client_statuses where user_id=auth.uid() and status='active') $$;
revoke all on function public.portal_has_role(public.portal_role), public.portal_is_admin(), public.portal_is_active_client() from public;
grant execute on function public.portal_has_role(public.portal_role), public.portal_is_admin(), public.portal_is_active_client() to authenticated;

create or replace function public.handle_new_portal_user() returns trigger language plpgsql security definer set search_path='' as $$ begin
  insert into public.profiles(id,email,legal_name,preferred_name,mobile,preferred_language) values(new.id,coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'legal_name',''),coalesce(new.raw_user_meta_data->>'preferred_name',''),coalesce(new.raw_user_meta_data->>'mobile',''),coalesce(new.raw_user_meta_data->>'preferred_language','English'));
  insert into public.user_roles(user_id,role) values(new.id,'client');
  insert into public.client_statuses(user_id,status) values(new.id,case when new.email_confirmed_at is null then 'unverified' else 'onboarding_incomplete' end);
  return new;
end $$;
drop trigger if exists on_auth_user_created_portal on auth.users;
create trigger on_auth_user_created_portal after insert on auth.users for each row execute function public.handle_new_portal_user();

alter table public.profiles enable row level security; alter table public.user_roles enable row level security; alter table public.client_statuses enable row level security;
alter table public.consent_versions enable row level security; alter table public.consent_acceptances enable row level security; alter table public.onboarding_profiles enable row level security;
alter table public.notifications enable row level security; alter table public.admin_notes enable row level security; alter table public.audit_logs enable row level security; alter table public.security_events enable row level security;
alter table public.account_deletion_requests enable row level security; alter table public.data_export_requests enable row level security;
alter table public.progress_entries enable row level security; alter table public.progress_photos enable row level security; alter table public.weekly_checkins enable row level security;
alter table public.portal_orders enable row level security; alter table public.portal_order_items enable row level security; alter table public.shipments enable row level security; alter table public.product_lots enable row level security;
alter table public.documents enable row level security; alter table public.document_assignments enable row level security; alter table public.support_threads enable row level security; alter table public.support_messages enable row level security;

create policy "profiles own read" on public.profiles for select to authenticated using(id=auth.uid() or public.portal_is_admin());
create policy "profiles own update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "roles own read" on public.user_roles for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy "statuses own read" on public.client_statuses for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy "consent versions authenticated read" on public.consent_versions for select to authenticated using(active=true or public.portal_is_admin());
create policy "consent own read" on public.consent_acceptances for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy "consent append own" on public.consent_acceptances for insert to authenticated with check(user_id=auth.uid());
create policy "onboarding own read" on public.onboarding_profiles for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy "onboarding own insert" on public.onboarding_profiles for insert to authenticated with check(user_id=auth.uid());
create policy "onboarding own update before review" on public.onboarding_profiles for update to authenticated using(user_id=auth.uid() and submitted_at is null) with check(user_id=auth.uid());
create policy "admin reviews onboarding" on public.onboarding_profiles for update to authenticated using(public.portal_is_admin()) with check(public.portal_is_admin());
create policy "notifications own read" on public.notifications for select to authenticated using(user_id=auth.uid());
create policy "notifications own update" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "admin notes admins only" on public.admin_notes for all to authenticated using(public.portal_is_admin()) with check(public.portal_is_admin());
create policy "audit admins read" on public.audit_logs for select to authenticated using(public.portal_is_admin());
create policy "security own or admin read" on public.security_events for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy "deletion own insert" on public.account_deletion_requests for insert to authenticated with check(user_id=auth.uid());
create policy "deletion own read" on public.account_deletion_requests for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy "export own insert" on public.data_export_requests for insert to authenticated with check(user_id=auth.uid());
create policy "export own read" on public.data_export_requests for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());

create policy "progress own active" on public.progress_entries for all to authenticated using(user_id=auth.uid() and public.portal_is_active_client()) with check(user_id=auth.uid() and public.portal_is_active_client());
create policy "photos own active" on public.progress_photos for all to authenticated using(user_id=auth.uid() and public.portal_is_active_client()) with check(user_id=auth.uid() and public.portal_is_active_client());
create policy "checkins own active" on public.weekly_checkins for all to authenticated using(user_id=auth.uid() and public.portal_is_active_client()) with check(user_id=auth.uid() and public.portal_is_active_client());
create policy "orders own read" on public.portal_orders for select to authenticated using(user_id=auth.uid() and public.portal_is_active_client() or public.portal_is_admin());
create policy "order items through owner" on public.portal_order_items for select to authenticated using(exists(select 1 from public.portal_orders o where o.id=order_id and (o.user_id=auth.uid() and public.portal_is_active_client() or public.portal_is_admin())));
create policy "shipments through owner" on public.shipments for select to authenticated using(exists(select 1 from public.portal_orders o where o.id=order_id and (o.user_id=auth.uid() and public.portal_is_active_client() or public.portal_is_admin())));
create policy "lots staff read" on public.product_lots for select to authenticated using(public.portal_has_role('support') or public.portal_is_admin());
create policy "documents assigned read" on public.documents for select to authenticated using(public.portal_is_admin() or exists(select 1 from public.document_assignments a where a.document_id=id and a.user_id=auth.uid() and a.revoked_at is null));
create policy "assignments own read" on public.document_assignments for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy "support own threads" on public.support_threads for select to authenticated using(user_id=auth.uid() or assigned_to=auth.uid() or public.portal_is_admin());
create policy "support client creates" on public.support_threads for insert to authenticated with check(user_id=auth.uid() and public.portal_is_active_client());
create policy "support messages scoped" on public.support_messages for select to authenticated using(exists(select 1 from public.support_threads t where t.id=thread_id and (t.user_id=auth.uid() or t.assigned_to=auth.uid() or public.portal_is_admin())));
create policy "support messages create scoped" on public.support_messages for insert to authenticated with check(author_id=auth.uid() and exists(select 1 from public.support_threads t where t.id=thread_id and (t.user_id=auth.uid() or t.assigned_to=auth.uid() or public.portal_is_admin())));

insert into public.consent_versions(consent_key,version,title,body_hash) values
('terms','2026-07','Terms of Service','configure-production-hash'),('privacy','2026-07','Privacy Notice','configure-production-hash'),
('research_use_only','2026-07','Research Use Only Acknowledgment','configure-production-hash'),('no_medical_advice','2026-07','No Medical Advice Acknowledgment','configure-production-hash'),
('electronic_communications','2026-07','Electronic Communication Consent','configure-production-hash'),('progress_data','2026-07','Progress Data Consent','configure-production-hash'),
('progress_photos','2026-07','Optional Progress Photo Consent','configure-production-hash') on conflict do nothing;

create or replace function public.submit_portal_onboarding()
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from public.onboarding_profiles where user_id=auth.uid()) then raise exception 'onboarding missing'; end if;
  if (select count(distinct cv.consent_key) from public.consent_acceptances ca join public.consent_versions cv on cv.id=ca.consent_version_id where ca.user_id=auth.uid() and ca.active=true and cv.consent_key in ('terms','privacy','research_use_only','no_medical_advice','electronic_communications','progress_data')) < 6 then raise exception 'required consents missing'; end if;
  update public.onboarding_profiles set submitted_at=now(), updated_at=now(), decision='pending' where user_id=auth.uid() and submitted_at is null;
  update public.client_statuses set status='pending_review', updated_at=now() where user_id=auth.uid() and status='onboarding_incomplete';
  insert into public.audit_logs(actor_id,actor_role,event_type,resource_type,resource_id,success) values(auth.uid(),'client','account_submitted','onboarding_profile',auth.uid(),true);
end $$;
revoke all on function public.submit_portal_onboarding() from public;
grant execute on function public.submit_portal_onboarding() to authenticated;
