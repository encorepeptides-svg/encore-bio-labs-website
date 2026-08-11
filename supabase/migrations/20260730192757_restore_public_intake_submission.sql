-- Restore the CRM intake surface when migration history exists but the CRM
-- relations were removed or never created. Every operation is idempotent.

create extension if not exists "pgcrypto";

create table if not exists public.crm_campaign_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  description text
);

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  phone text not null default '',
  city text not null default '',
  state text not null default '',
  country text not null default '',
  preferred_language text not null default 'English',
  source text not null default '',
  campaign_source text not null default '',
  interested_products text[] not null default '{}',
  primary_goal text not null default '',
  budget_range text not null default '',
  notes text not null default '',
  status text not null default 'new',
  lead_score integer not null default 0,
  lead_score_explanation jsonb not null default '[]'::jsonb,
  last_contacted_at timestamptz,
  consent_to_contact boolean not null default false,
  research_use_acknowledgment boolean not null default false,
  portal_handoff_token uuid,
  portal_user_id uuid references auth.users(id) on delete set null
);

create table if not exists public.crm_intake_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  age integer,
  sex text not null default '',
  weight text not null default '',
  height text not null default '',
  main_goal text not null default '',
  current_routine text not null default '',
  sleep_quality text not null default '',
  appetite text not null default '',
  energy text not null default '',
  previous_products_used text not null default '',
  medical_conditions text not null default '',
  medications text not null default '',
  budget text not null default '',
  delivery_city text not null default '',
  preferred_contact_method text not null default '',
  consent_to_contact boolean not null default false,
  research_use_acknowledgment boolean not null default false,
  intake_payload jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_timeline_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  event_type text not null default 'manual',
  title text not null default '',
  description text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  note text not null,
  created_by text not null default 'admin'
);

create table if not exists public.crm_products_interests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  product_name text not null,
  category text,
  priority text
);

alter table public.crm_leads
  add column if not exists portal_handoff_token uuid,
  add column if not exists portal_user_id uuid references auth.users(id) on delete set null;
alter table public.crm_intake_submissions
  add column if not exists intake_payload jsonb not null default '{}'::jsonb;
alter table public.onboarding_profiles
  add column if not exists public_intake_answers jsonb not null default '{}'::jsonb;

create index if not exists crm_leads_created_at_idx on public.crm_leads (created_at desc);
create index if not exists crm_leads_status_idx on public.crm_leads (status);
create index if not exists crm_leads_campaign_source_idx on public.crm_leads (campaign_source);
create index if not exists crm_intake_submissions_lead_id_idx on public.crm_intake_submissions (lead_id);
create index if not exists crm_timeline_events_lead_id_idx on public.crm_timeline_events (lead_id);
create index if not exists crm_notes_lead_id_idx on public.crm_notes (lead_id);
create index if not exists crm_products_interests_lead_id_idx on public.crm_products_interests (lead_id);
create unique index if not exists crm_leads_portal_handoff_token_uidx
  on public.crm_leads(portal_handoff_token) where portal_handoff_token is not null;
create unique index if not exists crm_leads_portal_user_uidx
  on public.crm_leads(portal_user_id) where portal_user_id is not null;

alter table public.crm_campaign_sources enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_intake_submissions enable row level security;
alter table public.crm_timeline_events enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_products_interests enable row level security;

create or replace function public.is_crm_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'crm_admin', false)
$$;

revoke all on function public.is_crm_admin() from public, anon;
grant execute on function public.is_crm_admin() to authenticated;

drop policy if exists "public may submit new leads" on public.crm_leads;
drop policy if exists "public may submit intake details" on public.crm_intake_submissions;
drop policy if exists "public may create submission timeline" on public.crm_timeline_events;
drop policy if exists "public may submit product interests" on public.crm_products_interests;
drop policy if exists "admins manage campaign sources" on public.crm_campaign_sources;
drop policy if exists "admins manage leads" on public.crm_leads;
drop policy if exists "admins manage intake submissions" on public.crm_intake_submissions;
drop policy if exists "admins manage timeline events" on public.crm_timeline_events;
drop policy if exists "admins manage notes" on public.crm_notes;
drop policy if exists "admins manage product interests" on public.crm_products_interests;

create policy "admins manage campaign sources" on public.crm_campaign_sources
  for all to authenticated using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage leads" on public.crm_leads
  for all to authenticated using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage intake submissions" on public.crm_intake_submissions
  for all to authenticated using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage timeline events" on public.crm_timeline_events
  for all to authenticated using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage notes" on public.crm_notes
  for all to authenticated using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins manage product interests" on public.crm_products_interests
  for all to authenticated using (public.is_crm_admin()) with check (public.is_crm_admin());

revoke all on public.crm_campaign_sources, public.crm_leads,
  public.crm_intake_submissions, public.crm_timeline_events,
  public.crm_notes, public.crm_products_interests from anon;
grant select, insert, update, delete on public.crm_campaign_sources,
  public.crm_leads, public.crm_intake_submissions, public.crm_timeline_events,
  public.crm_notes, public.crm_products_interests to authenticated;

insert into public.crm_campaign_sources (name, description)
values
  ('Instagram', 'Instagram posts, profile clicks, and DMs'),
  ('WhatsApp', 'WhatsApp inquiries'),
  ('Google', 'Google search or ads'),
  ('Referral', 'Referral from existing customer or partner'),
  ('Website Intake', 'Encore website intake form'),
  ('Catalog', 'Catalog page inquiry'),
  ('Direct', 'Direct website visit'),
  ('Other', 'Other source')
on conflict (name) do nothing;

create or replace function public.submit_public_intake(submission jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  submitted_lead_id uuid := (submission ->> 'lead_id')::uuid;
  submitted_intake_id uuid := coalesce(nullif(submission ->> 'intake_id', '')::uuid, submitted_lead_id);
  submitted_handoff_token uuid := (submission ->> 'handoff_token')::uuid;
  submitted_email text := lower(btrim(coalesce(submission ->> 'email', '')));
  submitted_products text[] := array(
    select jsonb_array_elements_text(coalesce(submission -> 'interested_products', '[]'::jsonb))
  );
begin
  if pg_catalog.pg_column_size(submission) > 524288 then
    raise exception 'intake submission is too large';
  end if;
  if submitted_email = ''
    or btrim(coalesce(submission ->> 'first_name', '')) = ''
    or btrim(coalesce(submission ->> 'last_name', '')) = ''
    or btrim(coalesce(submission ->> 'phone', '')) = '' then
    raise exception 'complete contact information is required';
  end if;
  if coalesce((submission ->> 'consent_to_contact')::boolean, false) is not true
    or coalesce((submission ->> 'research_use_acknowledgment')::boolean, false) is not true then
    raise exception 'required intake consent is missing';
  end if;

  if exists(select 1 from public.crm_leads where id = submitted_lead_id) then
    if exists(
      select 1 from public.crm_leads
      where id = submitted_lead_id and portal_handoff_token = submitted_handoff_token
    ) then
      return submitted_lead_id;
    end if;
    raise exception 'submission identifier is already in use';
  end if;

  insert into public.crm_leads(
    id, first_name, last_name, email, phone, city, country,
    preferred_language, source, campaign_source, interested_products,
    primary_goal, status, lead_score, lead_score_explanation,
    consent_to_contact, research_use_acknowledgment, portal_handoff_token
  ) values (
    submitted_lead_id,
    btrim(submission ->> 'first_name'),
    btrim(submission ->> 'last_name'),
    submitted_email,
    btrim(submission ->> 'phone'),
    btrim(coalesce(submission ->> 'city', '')),
    'United States',
    case when submission ->> 'locale' = 'es' then 'Spanish' else 'English' end,
    'Website intake',
    'Website Intake',
    submitted_products,
    coalesce(submission ->> 'primary_goal', 'General Research Review'),
    'new',
    coalesce((submission ->> 'lead_score')::integer, 0),
    coalesce(submission -> 'lead_score_explanation', '[]'::jsonb),
    true,
    true,
    submitted_handoff_token
  );

  insert into public.crm_intake_submissions(
    id, lead_id, sex, weight, height, main_goal, current_routine,
    sleep_quality, appetite, energy, previous_products_used,
    medical_conditions, medications, delivery_city, preferred_contact_method,
    consent_to_contact, research_use_acknowledgment, intake_payload
  ) values (
    submitted_intake_id,
    submitted_lead_id,
    coalesce(submission #>> '{form_data,sex}', ''),
    coalesce(submission #>> '{form_data,currentWeight}', ''),
    coalesce(submission #>> '{form_data,height}', ''),
    coalesce(submission ->> 'primary_goal', ''),
    coalesce(submission ->> 'current_routine', ''),
    coalesce(submission ->> 'sleep_quality', ''),
    coalesce(submission ->> 'appetite', ''),
    coalesce(submission ->> 'energy', ''),
    coalesce(submission ->> 'previous_products_used', ''),
    coalesce(submission ->> 'medical_conditions', ''),
    coalesce(submission ->> 'medications', ''),
    coalesce(submission ->> 'delivery_city', ''),
    coalesce(submission ->> 'preferred_contact_method', ''),
    true,
    true,
    submission
  );

  insert into public.crm_timeline_events(lead_id, event_type, title, description)
  values
    (submitted_lead_id, 'lead_created', 'Lead created from website intake', null),
    (submitted_lead_id, 'intake_submitted', 'Research intake submitted', 'Submission includes research-use-only acknowledgment.');

  insert into public.crm_products_interests(lead_id, product_name, priority)
  select submitted_lead_id, product_name, 'primary'
  from unnest(submitted_products) product_name;

  return submitted_lead_id;
end;
$$;

revoke all on function public.submit_public_intake(jsonb) from public;
grant execute on function public.submit_public_intake(jsonb) to anon, authenticated;

create or replace function public.hydrate_public_intake(
  target_user_id uuid,
  submitted_handoff_token uuid,
  verified_email text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_lead_id uuid;
  matched_first_name text;
  matched_last_name text;
  matched_phone text;
  matched_preferred_language text;
  matched_payload jsonb;
  prefill_goals text[];
  prefill_interests text[];
  prefill_products text[];
  sanitized_answers jsonb;
begin
  select lead.id, lead.first_name, lead.last_name, lead.phone, lead.preferred_language, intake.intake_payload
    into matched_lead_id, matched_first_name, matched_last_name, matched_phone, matched_preferred_language, matched_payload
  from public.crm_leads lead
  join public.crm_intake_submissions intake on intake.lead_id = lead.id
  where lead.portal_handoff_token = submitted_handoff_token
    and lower(lead.email) = lower(btrim(verified_email))
    and (lead.portal_user_id is null or lead.portal_user_id = target_user_id)
  order by intake.created_at desc
  limit 1;

  if matched_lead_id is null then return false; end if;

  prefill_goals := array(select jsonb_array_elements_text(coalesce(matched_payload #> '{portal_prefill,goals}', '[]'::jsonb)));
  prefill_interests := array(select jsonb_array_elements_text(coalesce(matched_payload #> '{portal_prefill,research_interests}', '[]'::jsonb)));
  prefill_products := array(select jsonb_array_elements_text(coalesce(matched_payload #> '{portal_prefill,interested_products}', '[]'::jsonb)));
  sanitized_answers := coalesce(matched_payload -> 'form_data', '{}'::jsonb)
    - array['firstName','lastName','email','phone','city','medicationsOrCompounds','sensitivities'];

  update public.crm_leads set portal_user_id = target_user_id, updated_at = now()
  where id = matched_lead_id;

  update public.profiles
    set legal_name = case when btrim(coalesce(legal_name, '')) = '' then btrim(concat(matched_first_name, ' ', matched_last_name)) else legal_name end,
        preferred_name = case when btrim(coalesce(preferred_name, '')) = '' then matched_first_name else preferred_name end,
        mobile = case when btrim(coalesce(mobile, '')) = '' then matched_phone else mobile end,
        preferred_language = case when btrim(coalesce(preferred_language, '')) = '' then matched_preferred_language else preferred_language end,
        updated_at = now()
  where id = target_user_id;

  insert into public.onboarding_profiles(user_id, goals, research_interests, interested_products, public_intake_answers)
  values(target_user_id, prefill_goals, prefill_interests, prefill_products, sanitized_answers)
  on conflict(user_id) do update set
    goals = case when cardinality(public.onboarding_profiles.goals) = 0 then excluded.goals else public.onboarding_profiles.goals end,
    research_interests = case when cardinality(public.onboarding_profiles.research_interests) = 0 then excluded.research_interests else public.onboarding_profiles.research_interests end,
    interested_products = case when cardinality(public.onboarding_profiles.interested_products) = 0 then excluded.interested_products else public.onboarding_profiles.interested_products end,
    public_intake_answers = case when public.onboarding_profiles.public_intake_answers = '{}'::jsonb then excluded.public_intake_answers else public.onboarding_profiles.public_intake_answers end,
    updated_at = now();

  return true;
end;
$$;

revoke all on function public.hydrate_public_intake(uuid, uuid, text) from public, anon, authenticated;

create or replace function public.claim_public_intake(handoff_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_email text;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  authenticated_email := coalesce(auth.jwt() ->> 'email', '');
  return public.hydrate_public_intake(auth.uid(), handoff_token, authenticated_email);
end;
$$;

revoke all on function public.claim_public_intake(uuid) from public, anon;
grant execute on function public.claim_public_intake(uuid) to authenticated;

create or replace function public.handle_new_portal_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  handoff_token_text text;
  parsed_handoff_token uuid;
begin
  insert into public.profiles(id,email,legal_name,preferred_name,mobile,preferred_language)
  values(
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'legal_name',''),
    coalesce(new.raw_user_meta_data->>'preferred_name',''),
    coalesce(new.raw_user_meta_data->>'mobile',''),
    coalesce(new.raw_user_meta_data->>'preferred_language','English')
  );
  insert into public.user_roles(user_id,role) values(new.id,'client'::public.portal_role);
  insert into public.client_statuses(user_id,status)
  values(
    new.id,
    case
      when new.email_confirmed_at is null then 'unverified'::public.client_account_status
      else 'onboarding_incomplete'::public.client_account_status
    end
  );

  handoff_token_text := new.raw_user_meta_data ->> 'intake_handoff_token';
  if handoff_token_text is not null then
    begin
      parsed_handoff_token := handoff_token_text::uuid;
      perform public.hydrate_public_intake(new.id, parsed_handoff_token, coalesce(new.email, ''));
    exception when invalid_text_representation then
      null;
    end;
  end if;
  return new;
end;
$$;

revoke all on function public.handle_new_portal_user() from public, anon, authenticated;

notify pgrst, 'reload schema';
