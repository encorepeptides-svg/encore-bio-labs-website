-- Baseline CRM tables required before the production security migration.
-- Every statement is idempotent so this is safe for projects that previously
-- applied supabase/schema.sql manually.
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
  research_use_acknowledgment boolean not null default false
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
  research_use_acknowledgment boolean not null default false
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

create index if not exists crm_leads_created_at_idx on public.crm_leads (created_at desc);
create index if not exists crm_leads_status_idx on public.crm_leads (status);
create index if not exists crm_leads_campaign_source_idx on public.crm_leads (campaign_source);
create index if not exists crm_intake_submissions_lead_id_idx on public.crm_intake_submissions (lead_id);
create index if not exists crm_timeline_events_lead_id_idx on public.crm_timeline_events (lead_id);
create index if not exists crm_notes_lead_id_idx on public.crm_notes (lead_id);
create index if not exists crm_products_interests_lead_id_idx on public.crm_products_interests (lead_id);

alter table public.crm_campaign_sources enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_intake_submissions enable row level security;
alter table public.crm_timeline_events enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_products_interests enable row level security;
