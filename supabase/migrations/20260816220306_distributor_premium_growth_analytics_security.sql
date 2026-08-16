-- Encore Bio Labs distributor portal premium capabilities.
--
-- Incremental only: preserves the accounting ledger, onboarding history,
-- historical sales, payouts, and the previously deployed keyset RPCs.
-- Traffic analytics starts at migration time; no historical clicks or visitors
-- are fabricated. All money remains integer cents and all times are UTC.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

do $$ begin
  create type public.distributor_attribution_event_type as enum (
    'referral_link_clicked',
    'unique_visitor_recorded',
    'product_viewed',
    'checkout_started',
    'checkout_completed',
    'order_created',
    'order_paid',
    'order_cancelled',
    'refund_created',
    'chargeback_created'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.distributor_campaign_status as enum ('draft', 'active', 'paused', 'completed', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.distributor_dispute_status as enum ('open', 'waiting_for_information', 'under_review', 'approved', 'rejected', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.distributor_notification_type as enum (
    'first_sale', 'goal_reached', 'payout_eligible', 'new_resource', 'new_campaign',
    'commission_adjusted', 'commission_rejected', 'dispute_updated', 'document_expiring',
    'security', 'account'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.distributor_portal_settings (
  singleton boolean primary key default true check (singleton),
  payout_minimum_cents integer not null default 10000 check (payout_minimum_cents >= 0),
  commission_hold_days integer not null default 30 check (commission_hold_days between 0 and 180),
  payout_schedule text not null default 'monthly' check (payout_schedule in ('monthly', 'twice_monthly', 'manual')),
  payout_day smallint not null default 15 check (payout_day between 1 and 28),
  analytics_started_at timestamptz not null default now(),
  attribution_model text not null default 'last_valid_touch',
  attribution_window_days integer not null default 30 check (attribution_window_days between 1 and 180),
  minimum_winner_orders integer not null default 3 check (minimum_winner_orders between 1 and 1000),
  analytics_enabled boolean not null default true,
  premium_dashboard_enabled boolean not null default true,
  growth_center_enabled boolean not null default true,
  disputes_enabled boolean not null default true,
  commission_rules_enabled boolean not null default true,
  admin_mfa_enforcement_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.distributor_portal_settings(singleton)
values (true)
on conflict (singleton) do nothing;

create table if not exists public.distributor_partner_managers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  display_name text not null check (length(trim(display_name)) between 2 and 120),
  title text not null check (length(trim(title)) between 2 and 120),
  email text not null check (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text,
  whatsapp text,
  response_time_en text,
  response_time_es text,
  avatar_path text,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.distributor_accounts
  add column if not exists partner_manager_id uuid references public.distributor_partner_managers(id) on delete set null,
  add column if not exists country_code text not null default 'US' check (country_code ~ '^[A-Z]{2}$'),
  add column if not exists entity_type text not null default 'individual' check (entity_type in ('individual', 'sole_proprietor', 'company', 'nonprofit', 'other')),
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null;

create table if not exists public.distributor_campaigns (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (length(trim(name)) between 2 and 120),
  channel text not null check (channel in ('whatsapp', 'email', 'instagram', 'website', 'direct', 'other')),
  language text not null default 'es' check (language in ('en', 'es')),
  status public.distributor_campaign_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  unique (distributor_id, name)
);

create table if not exists public.distributor_partner_links (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  campaign_id uuid references public.distributor_campaigns(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique default lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 14)) check (slug ~ '^[a-z0-9][a-z0-9_-]{7,39}$'),
  destination_type text not null check (destination_type in ('home', 'catalog', 'category', 'product', 'landing_page')),
  destination_path text not null check (
    destination_path = '/'
    or destination_path = '/catalog'
    or destination_path = '/kits'
    or destination_path ~ '^/(products|categories|research)/[a-z0-9][a-z0-9-]*/?$'
  ),
  channel text not null check (channel in ('whatsapp', 'email', 'instagram', 'website', 'direct', 'other')),
  sub_id text check (sub_id is null or sub_id ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$'),
  language text not null default 'es' check (language in ('en', 'es')),
  active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.distributor_attribution_events (
  id uuid primary key,
  event_type public.distributor_attribution_event_type not null,
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  campaign_id uuid references public.distributor_campaigns(id) on delete set null,
  partner_link_id uuid references public.distributor_partner_links(id) on delete set null,
  sub_id text,
  anonymous_visitor_id uuid,
  session_id uuid,
  product_id text,
  order_id uuid references public.storefront_orders(id) on delete restrict,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  landing_url text,
  referrer text,
  channel text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  device_category text check (device_category is null or device_category in ('mobile', 'tablet', 'desktop', 'other')),
  consent_state text not null default 'unknown' check (consent_state in ('accepted', 'declined', 'unknown', 'essential')),
  attribution_model text not null default 'last_valid_touch',
  attribution_window_days integer not null default 30 check (attribution_window_days between 1 and 180),
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  check (length(coalesce(landing_url, '')) <= 1000),
  check (length(coalesce(referrer, '')) <= 1000),
  check (octet_length(metadata::text) <= 8192)
);

alter table public.storefront_orders
  add column if not exists distributor_campaign_id uuid references public.distributor_campaigns(id) on delete set null,
  add column if not exists distributor_partner_link_id uuid references public.distributor_partner_links(id) on delete set null,
  add column if not exists distributor_sub_id text,
  add column if not exists distributor_visitor_id uuid,
  add column if not exists distributor_session_id uuid,
  add column if not exists distributor_utm_source text,
  add column if not exists distributor_utm_medium text,
  add column if not exists distributor_utm_campaign text,
  add column if not exists distributor_utm_term text,
  add column if not exists distributor_utm_content text;

create table if not exists public.distributor_growth_assets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null check (length(trim(title)) between 2 and 180),
  description text,
  language text not null check (language in ('en', 'es')),
  asset_type text not null check (asset_type in ('image', 'video', 'banner', 'product_sheet', 'pdf', 'education', 'caption', 'email_copy', 'whatsapp_copy', 'instagram_copy')),
  product_id text,
  campaign_id uuid references public.distributor_campaigns(id) on delete set null,
  recommended_channel text,
  format text,
  dimensions text,
  version text not null default '1.0',
  approval_status text not null default 'draft' check (approval_status in ('draft', 'approved', 'withdrawn')),
  published_at timestamptz,
  expires_at timestamptz,
  object_path text,
  preview_path text,
  download_count bigint not null default 0 check (download_count >= 0),
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  check (expires_at is null or published_at is null or expires_at > published_at)
);

create table if not exists public.distributor_approved_copy (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null check (length(trim(title)) between 2 and 180),
  copy_type text not null check (copy_type in ('short_caption', 'long_caption', 'whatsapp', 'email', 'product_description', 'cta')),
  language text not null check (language in ('en', 'es')),
  product_id text,
  campaign_id uuid references public.distributor_campaigns(id) on delete set null,
  body text not null check (length(trim(body)) between 2 and 10000),
  approval_status text not null default 'draft' check (approval_status in ('draft', 'approved', 'withdrawn')),
  published_at timestamptz,
  expires_at timestamptz,
  version text not null default '1.0',
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null
);

create table if not exists public.distributor_asset_downloads (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  asset_id uuid not null references public.distributor_growth_assets(id) on delete restrict,
  campaign_id uuid references public.distributor_campaigns(id) on delete set null,
  partner_link_id uuid references public.distributor_partner_links(id) on delete set null,
  downloaded_at timestamptz not null default now(),
  idempotency_key text not null unique
);

create table if not exists public.distributor_goals (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  created_at timestamptz not null default now(),
  metric text not null check (metric in ('net_revenue_cents', 'paid_orders', 'net_commission_cents', 'campaigns_created')),
  target_value bigint not null check (target_value > 0),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  status text not null default 'active' check (status in ('active', 'reached', 'missed', 'cancelled')),
  reached_at timestamptz,
  created_by uuid references auth.users(id) on delete set null
);

create table if not exists public.distributor_notifications (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  created_at timestamptz not null default now(),
  notification_type public.distributor_notification_type not null,
  title_en text not null,
  title_es text not null,
  body_en text not null,
  body_es text not null,
  action_path text,
  read_at timestamptz,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.distributor_disputes (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  sale_id uuid references public.distributor_sales(id) on delete restrict,
  commission_ledger_id uuid references public.distributor_commission_ledger(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  dispute_type text not null check (dispute_type in ('attribution', 'commission', 'refund', 'chargeback', 'payout', 'other')),
  explanation text not null check (length(trim(explanation)) between 10 and 5000),
  evidence_due_at timestamptz,
  status public.distributor_dispute_status not null default 'open',
  assigned_to uuid references auth.users(id) on delete set null,
  public_resolution text,
  internal_notes text,
  resolved_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  idempotency_key text not null unique,
  check (sale_id is not null or commission_ledger_id is not null)
);

create table if not exists public.distributor_dispute_messages (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.distributor_disputes(id) on delete restrict,
  created_at timestamptz not null default now(),
  author_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (length(trim(body)) between 1 and 5000),
  internal_note boolean not null default false,
  evidence_object_path text,
  idempotency_key text not null unique
);

create table if not exists public.distributor_dispute_status_history (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references public.distributor_disputes(id) on delete restrict,
  from_status public.distributor_dispute_status,
  to_status public.distributor_dispute_status not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null,
  public_reason text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.distributor_commission_rules (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid references public.distributor_accounts(id) on delete restrict,
  created_at timestamptz not null default now(),
  scope_type text not null check (scope_type in ('product', 'collection')),
  scope_key text not null check (scope_key ~ '^[a-z0-9][a-z0-9-]{1,119}$'),
  commission_rate_bps integer check (commission_rate_bps is null or commission_rate_bps between 0 and 10000),
  excluded boolean not null default false,
  public_reason text not null check (length(trim(public_reason)) between 3 and 500),
  effective_from timestamptz not null,
  effective_until timestamptz,
  priority integer not null default 100,
  created_by uuid not null references auth.users(id) on delete restrict,
  supersedes_rule_id uuid references public.distributor_commission_rules(id) on delete restrict,
  check (excluded or commission_rate_bps is not null),
  check (not excluded or commission_rate_bps is null or commission_rate_bps = 0),
  check (effective_until is null or effective_until > effective_from)
);

create table if not exists public.distributor_product_costs (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  sku text,
  effective_from timestamptz not null,
  effective_until timestamptz,
  unit_cost_cents integer not null check (unit_cost_cents >= 0),
  shipping_subsidy_cents integer not null default 0 check (shipping_subsidy_cents >= 0),
  fee_rate_bps integer not null default 0 check (fee_rate_bps between 0 and 10000),
  fixed_fee_cents integer not null default 0 check (fixed_fee_cents >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete restrict,
  supersedes_cost_id uuid references public.distributor_product_costs(id) on delete restrict,
  check (effective_until is null or effective_until > effective_from)
);

alter table public.distributor_sale_items
  add column if not exists product_id text,
  add column if not exists product_category text,
  add column if not exists commission_rate_bps integer check (commission_rate_bps is null or commission_rate_bps between 0 and 10000),
  add column if not exists commission_rule_id uuid references public.distributor_commission_rules(id) on delete restrict,
  add column if not exists commission_excluded boolean not null default false,
  add column if not exists commission_exclusion_reason text;

create table if not exists public.distributor_payout_receipts (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null unique references public.distributor_payouts(id) on delete restrict,
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  receipt_number text not null unique,
  created_at timestamptz not null default now(),
  snapshot jsonb not null,
  check (octet_length(snapshot::text) <= 1048576)
);

create table if not exists public.distributor_export_jobs (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  created_at timestamptz not null default now(),
  requested_by uuid not null references auth.users(id) on delete restrict,
  export_type text not null check (export_type in ('growth_csv', 'growth_pdf', 'sales_csv', 'sales_pdf')),
  filters jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'expired')),
  object_path text,
  expires_at timestamptz,
  error_code text,
  idempotency_key text not null unique
);

create table if not exists public.distributor_security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  distributor_id uuid references public.distributor_accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  event_type text not null check (event_type in ('mfa_enrollment_started', 'mfa_enrolled', 'mfa_challenged', 'mfa_unenrolled', 'mfa_recovery_requested', 'session_revocation_requested')),
  factor_id uuid,
  success boolean not null,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique
);

alter table public.distributor_onboarding_documents
  add column if not exists expires_at timestamptz,
  add column if not exists country_code text,
  add column if not exists entity_type text;

create table if not exists public.distributor_tax_requirements (
  id uuid primary key default gen_random_uuid(),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  entity_type text not null check (entity_type in ('individual', 'sole_proprietor', 'company', 'nonprofit', 'other')),
  document_type text not null,
  title_en text not null,
  title_es text not null,
  description_en text,
  description_es text,
  required boolean not null default true,
  validity_days integer check (validity_days is null or validity_days between 1 and 3650),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  unique (country_code, entity_type, document_type)
);

-- Query and policy indexes. All high-cardinality list indexes end in id for a
-- stable keyset order; RLS ownership predicates are indexed.
create index if not exists distributor_campaigns_keyset_idx on public.distributor_campaigns(distributor_id, created_at desc, id desc);
create index if not exists distributor_links_keyset_idx on public.distributor_partner_links(distributor_id, created_at desc, id desc);
create index if not exists distributor_links_campaign_idx on public.distributor_partner_links(campaign_id, created_at desc) where campaign_id is not null;
create index if not exists distributor_events_metrics_idx on public.distributor_attribution_events(distributor_id, occurred_at, event_type);
create index if not exists distributor_events_campaign_idx on public.distributor_attribution_events(distributor_id, campaign_id, occurred_at) where campaign_id is not null;
create index if not exists distributor_events_link_idx on public.distributor_attribution_events(distributor_id, partner_link_id, occurred_at) where partner_link_id is not null;
create index if not exists distributor_events_product_idx on public.distributor_attribution_events(distributor_id, product_id, occurred_at) where product_id is not null;
create index if not exists distributor_events_visitor_idx on public.distributor_attribution_events(distributor_id, anonymous_visitor_id, occurred_at) where anonymous_visitor_id is not null;
create index if not exists distributor_assets_published_idx on public.distributor_growth_assets(approval_status, language, published_at desc) where approval_status = 'approved';
create index if not exists distributor_copy_published_idx on public.distributor_approved_copy(approval_status, language, published_at desc) where approval_status = 'approved';
create index if not exists distributor_notifications_keyset_idx on public.distributor_notifications(distributor_id, created_at desc, id desc);
create index if not exists distributor_disputes_keyset_idx on public.distributor_disputes(distributor_id, created_at desc, id desc);
create index if not exists distributor_dispute_messages_idx on public.distributor_dispute_messages(dispute_id, created_at, id);
create index if not exists distributor_rules_lookup_idx on public.distributor_commission_rules(distributor_id, scope_type, scope_key, effective_from desc, priority desc);
create index if not exists distributor_costs_lookup_idx on public.distributor_product_costs(product_id, sku, effective_from desc);
create index if not exists distributor_goals_active_idx on public.distributor_goals(distributor_id, status, period_start, period_end);
create index if not exists distributor_exports_keyset_idx on public.distributor_export_jobs(distributor_id, created_at desc, id desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.distributor_portal_settings enable row level security;
alter table public.distributor_partner_managers enable row level security;
alter table public.distributor_campaigns enable row level security;
alter table public.distributor_partner_links enable row level security;
alter table public.distributor_attribution_events enable row level security;
alter table public.distributor_growth_assets enable row level security;
alter table public.distributor_approved_copy enable row level security;
alter table public.distributor_asset_downloads enable row level security;
alter table public.distributor_goals enable row level security;
alter table public.distributor_notifications enable row level security;
alter table public.distributor_disputes enable row level security;
alter table public.distributor_dispute_messages enable row level security;
alter table public.distributor_dispute_status_history enable row level security;
alter table public.distributor_commission_rules enable row level security;
alter table public.distributor_product_costs enable row level security;
alter table public.distributor_payout_receipts enable row level security;
alter table public.distributor_export_jobs enable row level security;
alter table public.distributor_security_events enable row level security;
alter table public.distributor_tax_requirements enable row level security;

create policy "authenticated read distributor portal settings"
on public.distributor_portal_settings for select to authenticated
using (true);

create policy "admins update distributor portal settings"
on public.distributor_portal_settings for update to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

create policy "assigned distributors read partner manager"
on public.distributor_partner_managers for select to authenticated
using (
  (select public.portal_is_admin())
  or exists (
    select 1 from public.distributor_accounts account
    where account.partner_manager_id = distributor_partner_managers.id
      and account.id = (select public.portal_distributor_id())
  )
);

create policy "admins manage partner managers"
on public.distributor_partner_managers for all to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

create policy "distributors read own campaigns"
on public.distributor_campaigns for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "active distributors create own campaigns"
on public.distributor_campaigns for insert to authenticated
with check (
  distributor_id = (select public.portal_distributor_id())
  and exists (
    select 1 from public.distributor_accounts account
    where account.id = distributor_campaigns.distributor_id
      and account.status = 'active'
      and account.onboarding_status = 'active'
  )
  or (select public.portal_is_admin())
);

create policy "active distributors update own campaigns"
on public.distributor_campaigns for update to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()))
with check (
  (
    distributor_id = (select public.portal_distributor_id())
    and exists (
      select 1 from public.distributor_accounts account
      where account.id = distributor_campaigns.distributor_id
        and account.status = 'active'
        and account.onboarding_status = 'active'
    )
  )
  or (select public.portal_is_admin())
);

create policy "distributors read own partner links"
on public.distributor_partner_links for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "active distributors create own partner links"
on public.distributor_partner_links for insert to authenticated
with check (
  (
    distributor_id = (select public.portal_distributor_id())
    and (campaign_id is null or campaign_id in (
      select campaign.id from public.distributor_campaigns campaign
      where campaign.distributor_id = (select public.portal_distributor_id())
    ))
    and exists (
      select 1 from public.distributor_accounts account
      where account.id = distributor_partner_links.distributor_id
        and account.status = 'active'
        and account.onboarding_status = 'active'
    )
  )
  or (select public.portal_is_admin())
);

create policy "active distributors update own partner links"
on public.distributor_partner_links for update to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()))
with check (
  (
    distributor_id = (select public.portal_distributor_id())
    and (campaign_id is null or campaign_id in (
      select campaign.id from public.distributor_campaigns campaign
      where campaign.distributor_id = (select public.portal_distributor_id())
    ))
    and exists (
      select 1 from public.distributor_accounts account
      where account.id = distributor_partner_links.distributor_id
        and account.status = 'active'
        and account.onboarding_status = 'active'
    )
  )
  or (select public.portal_is_admin())
);

create policy "distributors read own attribution events"
on public.distributor_attribution_events for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "authenticated read approved growth assets"
on public.distributor_growth_assets for select to authenticated
using (
  (approval_status = 'approved' and published_at <= now() and (expires_at is null or expires_at > now()))
  or (select public.portal_is_admin())
);

create policy "admins manage growth assets"
on public.distributor_growth_assets for all to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

create policy "authenticated read approved distributor copy"
on public.distributor_approved_copy for select to authenticated
using (
  (approval_status = 'approved' and published_at <= now() and (expires_at is null or expires_at > now()))
  or (select public.portal_is_admin())
);

create policy "admins manage distributor copy"
on public.distributor_approved_copy for all to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

create policy "distributors read own asset downloads"
on public.distributor_asset_downloads for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "active distributors record own asset downloads"
on public.distributor_asset_downloads for insert to authenticated
with check (
  distributor_id = (select public.portal_distributor_id())
  and exists (
    select 1 from public.distributor_accounts account
    where account.id = distributor_asset_downloads.distributor_id and account.status = 'active'
  )
  or (select public.portal_is_admin())
);

create policy "distributors read own goals"
on public.distributor_goals for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "admins manage distributor goals"
on public.distributor_goals for all to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

create policy "distributors read own notifications"
on public.distributor_notifications for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "distributors update own notification read state"
on public.distributor_notifications for update to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()))
with check (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "distributors read own disputes"
on public.distributor_disputes for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "active distributors open own disputes"
on public.distributor_disputes for insert to authenticated
with check (
  (
    distributor_id = (select public.portal_distributor_id())
    and created_by = (select auth.uid())
    and internal_notes is null
    and assigned_to is null
    and status = 'open'
    and exists (
      select 1 from public.distributor_accounts account
      where account.id = distributor_disputes.distributor_id and account.status = 'active'
    )
    and (
      sale_id is null or exists (
        select 1 from public.distributor_sales sale
        where sale.id = distributor_disputes.sale_id and sale.distributor_id = distributor_disputes.distributor_id
      )
    )
    and (
      commission_ledger_id is null or exists (
        select 1 from public.distributor_commission_ledger ledger
        where ledger.id = distributor_disputes.commission_ledger_id and ledger.distributor_id = distributor_disputes.distributor_id
      )
    )
  )
  or (select public.portal_is_admin())
);

create policy "admins update distributor disputes"
on public.distributor_disputes for update to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

create policy "distributors read public messages on own disputes"
on public.distributor_dispute_messages for select to authenticated
using (
  (
    not internal_note
    and dispute_id in (
      select dispute.id from public.distributor_disputes dispute
      where dispute.distributor_id = (select public.portal_distributor_id())
    )
  )
  or (select public.portal_is_admin())
);

create policy "distributors message own disputes"
on public.distributor_dispute_messages for insert to authenticated
with check (
  (
    author_id = (select auth.uid())
    and not internal_note
    and dispute_id in (
      select dispute.id from public.distributor_disputes dispute
      join public.distributor_accounts account on account.id = dispute.distributor_id
      where dispute.distributor_id = (select public.portal_distributor_id())
        and dispute.status not in ('closed', 'rejected')
        and account.status = 'active'
    )
  )
  or (select public.portal_is_admin())
);

create policy "distributors read public own dispute history"
on public.distributor_dispute_status_history for select to authenticated
using (
  dispute_id in (
    select dispute.id from public.distributor_disputes dispute
    where dispute.distributor_id = (select public.portal_distributor_id())
  )
  or (select public.portal_is_admin())
);

create policy "admins read distributor commission rules"
on public.distributor_commission_rules for select to authenticated
using ((select public.portal_is_admin()));

create policy "distributors read applicable commission rules"
on public.distributor_commission_rules for select to authenticated
using (
  distributor_id is null
  or distributor_id = (select public.portal_distributor_id())
  or (select public.portal_is_admin())
);

create policy "admins create distributor commission rules"
on public.distributor_commission_rules for insert to authenticated
with check ((select public.portal_is_admin()) and created_by = (select auth.uid()));

create policy "admins read distributor product costs"
on public.distributor_product_costs for select to authenticated
using ((select public.portal_is_admin()));

create policy "admins create distributor product costs"
on public.distributor_product_costs for insert to authenticated
with check ((select public.portal_is_admin()) and created_by = (select auth.uid()));

create policy "distributors read own payout receipts"
on public.distributor_payout_receipts for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "distributors read own export jobs"
on public.distributor_export_jobs for select to authenticated
using (distributor_id = (select public.portal_distributor_id()) or (select public.portal_is_admin()));

create policy "active distributors create own export jobs"
on public.distributor_export_jobs for insert to authenticated
with check (
  distributor_id = (select public.portal_distributor_id())
  and requested_by = (select auth.uid())
  and exists (
    select 1 from public.distributor_accounts account
    where account.id = distributor_export_jobs.distributor_id and account.status = 'active'
  )
  or (select public.portal_is_admin())
);

create policy "users read own distributor security events"
on public.distributor_security_events for select to authenticated
using (user_id = (select auth.uid()) or (select public.portal_is_admin()));

create policy "users record own distributor security events"
on public.distributor_security_events for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (distributor_id is null or distributor_id = (select public.portal_distributor_id()))
);

create policy "authenticated read active tax requirements"
on public.distributor_tax_requirements for select to authenticated
using (active or (select public.portal_is_admin()));

create policy "admins manage tax requirements"
on public.distributor_tax_requirements for all to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

-- Explicit Data API grants (new Supabase projects no longer auto-expose new
-- public tables). RLS remains the authorization boundary.
revoke all on table public.distributor_portal_settings from anon, authenticated;
revoke all on table public.distributor_partner_managers from anon, authenticated;
revoke all on table public.distributor_campaigns from anon, authenticated;
revoke all on table public.distributor_partner_links from anon, authenticated;
revoke all on table public.distributor_attribution_events from anon, authenticated;
revoke all on table public.distributor_growth_assets from anon, authenticated;
revoke all on table public.distributor_approved_copy from anon, authenticated;
revoke all on table public.distributor_asset_downloads from anon, authenticated;
revoke all on table public.distributor_goals from anon, authenticated;
revoke all on table public.distributor_notifications from anon, authenticated;
revoke all on table public.distributor_disputes from anon, authenticated;
revoke all on table public.distributor_dispute_messages from anon, authenticated;
revoke all on table public.distributor_dispute_status_history from anon, authenticated;
revoke all on table public.distributor_commission_rules from anon, authenticated;
revoke all on table public.distributor_product_costs from anon, authenticated;
revoke all on table public.distributor_payout_receipts from anon, authenticated;
revoke all on table public.distributor_export_jobs from anon, authenticated;
revoke all on table public.distributor_security_events from anon, authenticated;
revoke all on table public.distributor_tax_requirements from anon, authenticated;

grant select, update on table public.distributor_portal_settings to authenticated;
grant select, insert, update on table public.distributor_partner_managers to authenticated;
grant select, insert, update on table public.distributor_campaigns to authenticated;
grant select, insert, update on table public.distributor_partner_links to authenticated;
grant select on table public.distributor_attribution_events to authenticated;
grant select, insert, update on table public.distributor_growth_assets to authenticated;
grant select, insert, update on table public.distributor_approved_copy to authenticated;
grant select, insert on table public.distributor_asset_downloads to authenticated;
grant select, insert, update on table public.distributor_goals to authenticated;
grant select, update on table public.distributor_notifications to authenticated;
grant select, insert, update on table public.distributor_disputes to authenticated;
grant select, insert on table public.distributor_dispute_messages to authenticated;
grant select on table public.distributor_dispute_status_history to authenticated;
grant select, insert on table public.distributor_commission_rules to authenticated;
grant select, insert on table public.distributor_product_costs to authenticated;
grant select on table public.distributor_payout_receipts to authenticated;
grant select, insert on table public.distributor_export_jobs to authenticated;
grant select, insert on table public.distributor_security_events to authenticated;
grant select, insert, update on table public.distributor_tax_requirements to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('distributor-growth-assets', 'distributor-growth-assets', false, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf']),
  ('distributor-dispute-evidence', 'distributor-dispute-evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "distributors read approved growth asset objects"
on storage.objects for select to authenticated
using (
  bucket_id = 'distributor-growth-assets'
  and (
    exists (
      select 1 from public.distributor_growth_assets asset
      where (asset.object_path = name or asset.preview_path = name)
        and asset.approval_status = 'approved'
        and asset.published_at <= now()
        and (asset.expires_at is null or asset.expires_at > now())
    )
    or (select public.portal_is_admin())
  )
);

create policy "admins manage growth asset objects"
on storage.objects for all to authenticated
using (bucket_id = 'distributor-growth-assets' and (select public.portal_is_admin()))
with check (bucket_id = 'distributor-growth-assets' and (select public.portal_is_admin()));

create policy "distributors read own dispute evidence"
on storage.objects for select to authenticated
using (
  bucket_id = 'distributor-dispute-evidence'
  and (
    (storage.foldername(name))[1] = (select public.portal_distributor_id())::text
    or (select public.portal_is_admin())
  )
);

create policy "active distributors upload own dispute evidence"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'distributor-dispute-evidence'
  and (
    (
      (storage.foldername(name))[1] = (select public.portal_distributor_id())::text
      and exists (
        select 1 from public.distributor_accounts account
        where account.id = (select public.portal_distributor_id()) and account.status = 'active'
      )
    )
    or (select public.portal_is_admin())
  )
);

create policy "admins update dispute evidence"
on storage.objects for update to authenticated
using (bucket_id = 'distributor-dispute-evidence' and (select public.portal_is_admin()))
with check (bucket_id = 'distributor-dispute-evidence' and (select public.portal_is_admin()));

-- Existing onboarding documents remain usable before activation, but replacing
-- an active distributor's tax/agreement file requires an aal2 session.
create policy "active distributor financial files require aal2"
on storage.objects as restrictive for insert to authenticated
with check (
  bucket_id <> 'distributor-onboarding-private'
  or not exists (
    select 1 from public.distributor_accounts account
    where account.id::text = (storage.foldername(name))[1]
      and account.onboarding_status = 'active'
  )
  or (select auth.jwt() ->> 'aal') = 'aal2'
  or (select public.portal_is_admin())
);

-- ---------------------------------------------------------------------------
-- Immutable history, timestamps, effective-dated commission rules
-- ---------------------------------------------------------------------------

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger touch_distributor_campaigns_updated_at before update on public.distributor_campaigns
for each row execute function private.touch_updated_at();
create trigger touch_distributor_partner_links_updated_at before update on public.distributor_partner_links
for each row execute function private.touch_updated_at();
create trigger touch_distributor_disputes_updated_at before update on public.distributor_disputes
for each row execute function private.touch_updated_at();
create trigger touch_distributor_growth_assets_updated_at before update on public.distributor_growth_assets
for each row execute function private.touch_updated_at();
create trigger touch_distributor_approved_copy_updated_at before update on public.distributor_approved_copy
for each row execute function private.touch_updated_at();

create or replace function private.reject_immutable_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'immutable distributor history cannot be changed' using errcode = '55000';
end
$$;

create trigger protect_distributor_rule_history before update or delete on public.distributor_commission_rules
for each row execute function private.reject_immutable_change();
create trigger protect_distributor_cost_history before update or delete on public.distributor_product_costs
for each row execute function private.reject_immutable_change();
create trigger protect_distributor_dispute_history before update or delete on public.distributor_dispute_status_history
for each row execute function private.reject_immutable_change();
create trigger protect_distributor_payout_receipts before update or delete on public.distributor_payout_receipts
for each row execute function private.reject_immutable_change();

update public.distributor_sale_items item
set
  product_id = coalesce(nullif(item.metadata ->> 'product_slug', ''), nullif(item.metadata ->> 'product_id', '')),
  product_category = nullif(item.metadata ->> 'category', ''),
  commission_rate_bps = sale.commission_rate_bps
from public.distributor_sales sale
where sale.id = item.sale_id
  and item.commission_rate_bps is null;

create or replace function private.resolve_distributor_commission_rule(
  target_distributor_id uuid,
  target_product_id text,
  target_collection text,
  target_occurred_at timestamptz,
  default_rate_bps integer
)
returns table (
  commission_rate_bps integer,
  excluded boolean,
  public_reason text,
  rule_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  with selected_rule as (
    select rule.*
    from public.distributor_commission_rules rule
    where (rule.distributor_id is null or rule.distributor_id = target_distributor_id)
      and rule.effective_from <= target_occurred_at
      and (rule.effective_until is null or rule.effective_until > target_occurred_at)
      and (
        (rule.scope_type = 'product' and rule.scope_key = lower(coalesce(target_product_id, '')))
        or (rule.scope_type = 'collection' and rule.scope_key = lower(coalesce(target_collection, '')))
      )
    order by
      (rule.distributor_id is not null) desc,
      (rule.scope_type = 'product') desc,
      rule.priority desc,
      rule.effective_from desc,
      rule.created_at desc,
      rule.id desc
    limit 1
  )
  select
    case when selected_rule.excluded then 0 else coalesce(selected_rule.commission_rate_bps, default_rate_bps) end,
    coalesce(selected_rule.excluded, false),
    selected_rule.public_reason,
    selected_rule.id
  from (values (1)) seed(value)
  left join selected_rule on true
$$;

revoke all on function private.resolve_distributor_commission_rule(uuid, text, text, timestamptz, integer) from public, anon, authenticated;

create or replace function public.snapshot_distributor_sale_items(target_sale_id uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  with sale_order as (
    select
      sale.id as sale_id,
      sale.distributor_id,
      sale.storefront_order_id,
      sale.paid_at,
      sale.discount_cents,
      sale.commission_rate_bps as default_rate_bps,
      order_row.items
    from public.distributor_sales sale
    join public.storefront_orders order_row on order_row.id = sale.storefront_order_id
    where sale.id = target_sale_id
  ), raw_items as (
    select
      sale_order.*,
      item.value as item,
      item.ordinality::integer as item_number,
      greatest(coalesce((item.value ->> 'quantity')::integer, 1), 1) as quantity,
      greatest(coalesce((item.value ->> 'line_total_cents')::integer, 0), 0) as gross_amount_cents,
      lower(nullif(item.value ->> 'product_slug', '')) as product_id,
      lower(nullif(item.value ->> 'category_slug', '')) as product_category
    from sale_order
    cross join lateral jsonb_array_elements(sale_order.items) with ordinality as item(value, ordinality)
  ), running as (
    select
      raw_items.*,
      sum(gross_amount_cents) over (order by item_number)::bigint as cumulative_gross,
      sum(gross_amount_cents) over ()::bigint as total_gross
    from raw_items
  ), discounted as (
    select
      running.*,
      case when total_gross = 0 then 0 else
        floor(least(discount_cents, total_gross::integer)::numeric * cumulative_gross / total_gross)::integer
        - floor(least(discount_cents, total_gross::integer)::numeric * (cumulative_gross - gross_amount_cents) / total_gross)::integer
      end as allocated_discount_cents
    from running
  ), resolved as (
    select
      discounted.*,
      greatest(gross_amount_cents - allocated_discount_cents, 0) as item_commissionable,
      rule.commission_rate_bps as resolved_rate_bps,
      rule.excluded as rule_excluded,
      rule.public_reason as rule_reason,
      rule.rule_id
    from discounted
    cross join lateral private.resolve_distributor_commission_rule(
      discounted.distributor_id,
      discounted.product_id,
      discounted.product_category,
      discounted.paid_at,
      discounted.default_rate_bps
    ) rule
  )
  insert into public.distributor_sale_items(
    sale_id, storefront_order_id, order_item_key, sku, product_name, variant_name,
    quantity, gross_amount_cents, allocated_discount_cents, commissionable_amount_cents,
    original_commission_cents, metadata, product_id, product_category,
    commission_rate_bps, commission_rule_id, commission_excluded, commission_exclusion_reason
  )
  select
    sale_id,
    storefront_order_id,
    coalesce(nullif(item ->> 'id', ''), coalesce(nullif(item ->> 'sku', ''), 'item') || ':' || item_number::text),
    nullif(item ->> 'sku', ''),
    nullif(item ->> 'product', ''),
    nullif(item ->> 'variant', ''),
    quantity,
    gross_amount_cents,
    allocated_discount_cents,
    item_commissionable,
    case when rule_excluded then 0 else floor(item_commissionable::numeric * resolved_rate_bps / 10000)::integer end,
    item,
    product_id,
    product_category,
    resolved_rate_bps,
    rule_id,
    rule_excluded,
    rule_reason
  from resolved
  on conflict (sale_id, order_item_key) do nothing
$$;

revoke all on function public.snapshot_distributor_sale_items(uuid) from public, anon, authenticated;

create or replace function private.record_distributor_commission_earned()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  total_commission integer;
  weighted_rate integer;
  rule_snapshot jsonb;
begin
  perform public.snapshot_distributor_sale_items(new.id);

  select
    coalesce(sum(item.original_commission_cents), 0)::integer,
    case when coalesce(sum(item.commissionable_amount_cents), 0) = 0 then new.commission_rate_bps
      else round(sum(item.original_commission_cents)::numeric * 10000 / sum(item.commissionable_amount_cents))::integer
    end,
    coalesce(jsonb_agg(
      jsonb_build_object(
        'productId', item.product_id,
        'rateBps', item.commission_rate_bps,
        'ruleId', item.commission_rule_id,
        'excluded', item.commission_excluded,
        'reason', item.commission_exclusion_reason
      ) order by item.id
    ), '[]'::jsonb)
  into total_commission, weighted_rate, rule_snapshot
  from public.distributor_sale_items item
  where item.sale_id = new.id;

  update public.distributor_sales
  set original_commission_amount_cents = total_commission,
      commission_rate_bps = greatest(0, least(weighted_rate, 10000))
  where id = new.id;

  if total_commission > 0 then
    insert into public.distributor_commission_ledger(
      distributor_id, order_id, commission_id, entry_type, amount_cents, currency,
      reason_code, reason, source_type, source_reference, created_by,
      recovery_status, recovered_cents, remaining_cents, metadata, idempotency_key
    ) values (
      new.distributor_id, new.storefront_order_id, new.id, 'commission_earned',
      total_commission, new.currency, 'verified_paid_sale',
      'Commission earned from a verified paid sale.', 'system', new.order_reference,
      new.recorded_by, 'not_applicable', 0, 0,
      jsonb_build_object(
        'weighted_commission_rate_bps', weighted_rate,
        'commissionable_revenue_cents', new.original_commissionable_revenue_cents,
        'product_rules', rule_snapshot
      ),
      'commission:' || new.id::text
    ) on conflict (idempotency_key) do nothing;
  end if;
  return new;
end
$$;

drop trigger if exists record_distributor_commission_earned_after_sale on public.distributor_sales;
create trigger record_distributor_commission_earned_after_sale
after insert on public.distributor_sales
for each row execute function private.record_distributor_commission_earned();

revoke all on function private.record_distributor_commission_earned() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Operational event history, notifications, receipts, and audit automation
-- ---------------------------------------------------------------------------

create or replace function private.enqueue_distributor_notification(
  target_distributor_id uuid,
  target_type public.distributor_notification_type,
  target_title_en text,
  target_title_es text,
  target_body_en text,
  target_body_es text,
  target_action_path text,
  target_idempotency_key text,
  target_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.distributor_notifications(
    distributor_id, notification_type, title_en, title_es, body_en, body_es,
    action_path, idempotency_key, metadata
  ) values (
    target_distributor_id, target_type, left(target_title_en, 300), left(target_title_es, 300),
    left(target_body_en, 1000), left(target_body_es, 1000), left(target_action_path, 500),
    left(target_idempotency_key, 500), coalesce(target_metadata, '{}'::jsonb)
  ) on conflict (idempotency_key) do nothing
$$;

revoke all on function private.enqueue_distributor_notification(uuid, public.distributor_notification_type, text, text, text, text, text, text, jsonb) from public, anon, authenticated;

create or replace function private.notify_distributor_sale()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.distributor_sales sale
    where sale.distributor_id = new.distributor_id and sale.id <> new.id
  ) then
    perform private.enqueue_distributor_notification(
      new.distributor_id, 'first_sale',
      'Your first attributed sale is in', 'Tu primera venta atribuida llegó',
      'Review the hold date and commission details for this order.',
      'Revisa la fecha de retención y el detalle de comisión de esta orden.',
      '/distributor/sales', 'first-sale:' || new.distributor_id::text,
      jsonb_build_object('saleId', new.id, 'orderReference', new.order_reference)
    );
  end if;
  return new;
end
$$;

create trigger notify_distributor_first_sale_after_insert
after insert on public.distributor_sales
for each row execute function private.notify_distributor_sale();

create or replace function private.notify_distributor_adjustment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.entry_type not in ('commission_earned', 'legacy_balance') then
    perform private.enqueue_distributor_notification(
      new.distributor_id, 'commission_adjusted',
      'A commission was adjusted', 'Una comisión fue ajustada',
      new.reason, new.reason, '/distributor/commissions',
      'commission-adjusted:' || new.id::text,
      jsonb_build_object('ledgerEntryId', new.id, 'amountCents', new.amount_cents, 'reasonCode', new.reason_code)
    );
  end if;
  return new;
end
$$;

create trigger notify_distributor_adjustment_after_insert
after insert on public.distributor_commission_ledger
for each row execute function private.notify_distributor_adjustment();

create or replace function private.notify_growth_asset()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_row record;
begin
  if new.approval_status = 'approved'
    and new.published_at <= now()
    and (
      tg_op = 'INSERT'
      or (
        tg_op = 'UPDATE'
        and (old.approval_status is distinct from 'approved' or old.published_at is distinct from new.published_at)
      )
    )
  then
    for account_row in select id from public.distributor_accounts where status = 'active' loop
      perform private.enqueue_distributor_notification(
        account_row.id, 'new_resource',
        'New approved resource', 'Nuevo recurso aprobado',
        new.title, new.title, '/distributor/growth',
        'new-resource:' || new.id::text || ':' || account_row.id::text,
        jsonb_build_object('assetId', new.id, 'language', new.language, 'assetType', new.asset_type)
      );
    end loop;
  end if;
  return new;
end
$$;

create trigger notify_growth_asset_after_publish
after insert or update on public.distributor_growth_assets
for each row execute function private.notify_growth_asset();

create or replace function private.track_distributor_dispute_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.distributor_dispute_status_history(
      dispute_id, from_status, to_status, changed_by, public_reason, metadata
    ) values (
      new.id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status,
      (select auth.uid()),
      case when tg_op = 'INSERT' then null else new.public_resolution end,
      jsonb_build_object('source', case when (select public.portal_is_admin()) then 'admin' else 'distributor' end)
    );

    perform private.enqueue_distributor_notification(
      new.distributor_id, 'dispute_updated',
      'Dispute status updated', 'Estado de aclaración actualizado',
      'The dispute is now ' || replace(new.status::text, '_', ' ') || '.',
      'La aclaración ahora está en estado ' || replace(new.status::text, '_', ' ') || '.',
      '/distributor/disputes',
      'dispute-status:' || new.id::text || ':' || new.status::text,
      jsonb_build_object('disputeId', new.id, 'status', new.status)
    );
  end if;
  return new;
end
$$;

create trigger track_distributor_dispute_status_after_change
after insert or update of status on public.distributor_disputes
for each row execute function private.track_distributor_dispute_status();

create or replace function private.increment_distributor_asset_download()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.distributor_growth_assets
  set download_count = download_count + 1
  where id = new.asset_id;
  return new;
end
$$;

create trigger increment_distributor_asset_download_after_insert
after insert on public.distributor_asset_downloads
for each row execute function private.increment_distributor_asset_download();

create or replace function private.create_distributor_payout_receipt()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_row public.distributor_accounts%rowtype;
  receipt_items jsonb;
  receipt_number_value text;
begin
  if new.status <> 'paid' or new.paid_at is null then return new; end if;

  select * into account_row from public.distributor_accounts where id = new.distributor_id;
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'ledgerEntryId', item.ledger_entry_id,
      'applicationType', item.application_type,
      'amountCents', item.amount_cents,
      'orderReference', sale.order_reference,
      'reason', ledger.reason,
      'entryType', ledger.entry_type
    ) order by item.created_at, item.id
  ), '[]'::jsonb)
  into receipt_items
  from public.distributor_payout_ledger_items item
  left join public.distributor_commission_ledger ledger on ledger.id = item.ledger_entry_id
  left join public.distributor_sales sale on sale.id = ledger.commission_id
  where item.payout_id = new.id;

  receipt_number_value := 'EBL-' || to_char(new.paid_at at time zone 'UTC', 'YYYY') || '-' || upper(substr(replace(new.id::text, '-', ''), 1, 10));
  insert into public.distributor_payout_receipts(payout_id, distributor_id, receipt_number, snapshot)
  values (
    new.id,
    new.distributor_id,
    receipt_number_value,
    jsonb_build_object(
      'receiptNumber', receipt_number_value,
      'distributorId', new.distributor_id,
      'distributorName', account_row.display_name,
      'periodStart', new.period_start,
      'periodEnd', new.period_end,
      'currency', new.currency,
      'grossCommissionCents', new.gross_commission_cents,
      'positiveAdjustmentsCents', new.positive_adjustments_cents,
      'negativeAdjustmentsCents', new.negative_adjustments_cents,
      'recoveriesAppliedCents', new.recoveries_applied_cents,
      'totalCents', new.amount_cents,
      'provider', new.provider,
      'externalReference', new.external_reference,
      'paidAt', new.paid_at,
      'status', new.status,
      'items', receipt_items
    )
  ) on conflict (payout_id) do nothing;
  return new;
end
$$;

create trigger create_distributor_payout_receipt_after_paid
after insert or update of status, paid_at on public.distributor_payouts
for each row execute function private.create_distributor_payout_receipt();

insert into public.distributor_payout_receipts(payout_id, distributor_id, receipt_number, snapshot)
select
  payout.id,
  payout.distributor_id,
  'EBL-' || to_char(payout.paid_at at time zone 'UTC', 'YYYY') || '-' || upper(substr(replace(payout.id::text, '-', ''), 1, 10)),
  jsonb_build_object(
    'receiptNumber', 'EBL-' || to_char(payout.paid_at at time zone 'UTC', 'YYYY') || '-' || upper(substr(replace(payout.id::text, '-', ''), 1, 10)),
    'distributorId', payout.distributor_id,
    'distributorName', account.display_name,
    'periodStart', payout.period_start,
    'periodEnd', payout.period_end,
    'currency', payout.currency,
    'grossCommissionCents', payout.gross_commission_cents,
    'positiveAdjustmentsCents', payout.positive_adjustments_cents,
    'negativeAdjustmentsCents', payout.negative_adjustments_cents,
    'recoveriesAppliedCents', payout.recoveries_applied_cents,
    'totalCents', payout.amount_cents,
    'provider', payout.provider,
    'externalReference', payout.external_reference,
    'paidAt', payout.paid_at,
    'status', payout.status,
    'items', '[]'::jsonb,
    'historicalBackfill', true
  )
from public.distributor_payouts payout
join public.distributor_accounts account on account.id = payout.distributor_id
where payout.status = 'paid' and payout.paid_at is not null
on conflict (payout_id) do nothing;

create or replace function private.record_storefront_attribution_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_time timestamptz;
  refund_delta integer;
begin
  if new.distributor_id is null then return new; end if;

  if tg_op = 'INSERT' then
    event_time := coalesce(new.created_at, now());
    insert into public.distributor_attribution_events(
      id, event_type, distributor_id, campaign_id, partner_link_id, sub_id,
      anonymous_visitor_id, session_id, order_id, occurred_at, channel,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      consent_state, attribution_window_days, metadata, idempotency_key
    ) values
    (
      gen_random_uuid(), 'order_created', new.distributor_id, new.distributor_campaign_id,
      new.distributor_partner_link_id, new.distributor_sub_id, new.distributor_visitor_id,
      new.distributor_session_id, new.id, event_time, new.channel,
      new.distributor_utm_source, new.distributor_utm_medium, new.distributor_utm_campaign,
      new.distributor_utm_term, new.distributor_utm_content, 'essential',
      coalesce((select account.attribution_window_days from public.distributor_accounts account where account.id = new.distributor_id), 30),
      jsonb_build_object('orderReference', new.order_reference, 'status', new.status),
      'order-created:' || new.id::text
    ),
    (
      gen_random_uuid(), 'checkout_completed', new.distributor_id, new.distributor_campaign_id,
      new.distributor_partner_link_id, new.distributor_sub_id, new.distributor_visitor_id,
      new.distributor_session_id, new.id, event_time, new.channel,
      new.distributor_utm_source, new.distributor_utm_medium, new.distributor_utm_campaign,
      new.distributor_utm_term, new.distributor_utm_content, 'essential',
      coalesce((select account.attribution_window_days from public.distributor_accounts account where account.id = new.distributor_id), 30),
      jsonb_build_object('orderReference', new.order_reference, 'status', new.status),
      'checkout-completed:' || new.id::text
    )
    on conflict (idempotency_key) do nothing;
  end if;

  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid' or old.paid_at is distinct from new.paid_at) then
    insert into public.distributor_attribution_events(
      id, event_type, distributor_id, campaign_id, partner_link_id, sub_id,
      anonymous_visitor_id, session_id, order_id, occurred_at, channel,
      utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      consent_state, attribution_window_days, metadata, idempotency_key
    ) values (
      gen_random_uuid(), 'order_paid', new.distributor_id, new.distributor_campaign_id,
      new.distributor_partner_link_id, new.distributor_sub_id, new.distributor_visitor_id,
      new.distributor_session_id, new.id, coalesce(new.paid_at, now()), new.channel,
      new.distributor_utm_source, new.distributor_utm_medium, new.distributor_utm_campaign,
      new.distributor_utm_term, new.distributor_utm_content, 'essential',
      coalesce((select account.attribution_window_days from public.distributor_accounts account where account.id = new.distributor_id), 30),
      jsonb_build_object('orderReference', new.order_reference, 'netRevenueCents', greatest(new.subtotal_cents - coalesce(new.discount_cents, 0) - coalesce(new.refunded_cents, 0), 0)),
      'order-paid:' || new.id::text || ':' || coalesce(new.paid_at::text, 'unknown')
    ) on conflict (idempotency_key) do nothing;
  end if;

  if new.status = 'cancelled' and (tg_op = 'INSERT' or old.status is distinct from 'cancelled') then
    insert into public.distributor_attribution_events(
      id, event_type, distributor_id, campaign_id, partner_link_id, sub_id,
      anonymous_visitor_id, session_id, order_id, occurred_at, channel,
      consent_state, attribution_window_days, metadata, idempotency_key
    ) values (
      gen_random_uuid(), 'order_cancelled', new.distributor_id, new.distributor_campaign_id,
      new.distributor_partner_link_id, new.distributor_sub_id, new.distributor_visitor_id,
      new.distributor_session_id, new.id, now(), new.channel, 'essential',
      coalesce((select account.attribution_window_days from public.distributor_accounts account where account.id = new.distributor_id), 30),
      jsonb_build_object('orderReference', new.order_reference), 'order-cancelled:' || new.id::text
    ) on conflict (idempotency_key) do nothing;
  end if;

  refund_delta := case when tg_op = 'INSERT' then coalesce(new.refunded_cents, 0) else greatest(coalesce(new.refunded_cents, 0) - coalesce(old.refunded_cents, 0), 0) end;
  if refund_delta > 0 then
    insert into public.distributor_attribution_events(
      id, event_type, distributor_id, campaign_id, partner_link_id, sub_id,
      anonymous_visitor_id, session_id, order_id, occurred_at, channel,
      consent_state, attribution_window_days, metadata, idempotency_key
    ) values (
      gen_random_uuid(), 'refund_created', new.distributor_id, new.distributor_campaign_id,
      new.distributor_partner_link_id, new.distributor_sub_id, new.distributor_visitor_id,
      new.distributor_session_id, new.id, now(), new.channel, 'essential',
      coalesce((select account.attribution_window_days from public.distributor_accounts account where account.id = new.distributor_id), 30),
      jsonb_build_object('orderReference', new.order_reference, 'refundEventCents', refund_delta, 'refundedTotalCents', new.refunded_cents),
      'refund:' || new.id::text || ':' || new.refunded_cents::text
    ) on conflict (idempotency_key) do nothing;
  end if;

  if new.status = 'chargeback' and (tg_op = 'INSERT' or old.status is distinct from 'chargeback') then
    insert into public.distributor_attribution_events(
      id, event_type, distributor_id, campaign_id, partner_link_id, sub_id,
      anonymous_visitor_id, session_id, order_id, occurred_at, channel,
      consent_state, attribution_window_days, metadata, idempotency_key
    ) values (
      gen_random_uuid(), 'chargeback_created', new.distributor_id, new.distributor_campaign_id,
      new.distributor_partner_link_id, new.distributor_sub_id, new.distributor_visitor_id,
      new.distributor_session_id, new.id, now(), new.channel, 'essential',
      coalesce((select account.attribution_window_days from public.distributor_accounts account where account.id = new.distributor_id), 30),
      jsonb_build_object('orderReference', new.order_reference), 'chargeback:' || new.id::text
    ) on conflict (idempotency_key) do nothing;
  end if;
  return new;
end
$$;

create trigger record_storefront_attribution_events_after_change
after insert or update of status, paid_at, refunded_cents on public.storefront_orders
for each row execute function private.record_storefront_attribution_events();

revoke all on function private.notify_distributor_sale() from public, anon, authenticated;
revoke all on function private.notify_distributor_adjustment() from public, anon, authenticated;
revoke all on function private.notify_growth_asset() from public, anon, authenticated;
revoke all on function private.track_distributor_dispute_status() from public, anon, authenticated;
revoke all on function private.increment_distributor_asset_download() from public, anon, authenticated;
revoke all on function private.create_distributor_payout_receipt() from public, anon, authenticated;
revoke all on function private.record_storefront_attribution_events() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Full-set dashboard and reporting RPCs (security invoker + RLS)
-- ---------------------------------------------------------------------------

create or replace function public.get_distributor_premium_dashboard(
  target_distributor_id uuid default null,
  start_at timestamptz default null,
  end_at timestamptz default null,
  metric_currency text default 'USD'
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_distributor_id uuid := public.portal_distributor_id();
  caller_is_admin boolean := public.portal_is_admin();
  scoped_distributor_id uuid;
  range_start timestamptz := coalesce(start_at, date_trunc('month', now()));
  range_end timestamptz := coalesce(end_at, now());
  range_duration interval;
  prior_start timestamptz;
  settings_row public.distributor_portal_settings%rowtype;
  account_row public.distributor_accounts%rowtype;
  payment_row public.distributor_onboarding_payment_profiles%rowtype;
  manager_json jsonb;
  legacy_metrics jsonb;
  traffic_current jsonb;
  traffic_prior jsonb;
  commerce_current jsonb;
  commerce_prior jsonb;
  top_product_json jsonb;
  top_product_conversion_json jsonb;
  top_campaign_json jsonb;
  top_channel_json jsonb;
  onboarding_json jsonb;
  goals_json jsonb;
  unread_notifications integer;
  open_disputes integer;
  campaign_count integer;
  active_link_count integer;
  available_cents bigint;
  payout_minimum bigint;
  next_payout_date date;
  next_payout_reason text;
begin
  if range_end <= range_start then
    raise exception 'end_at must be after start_at' using errcode = '22007';
  end if;
  if range_end - range_start > interval '400 days' then
    raise exception 'dashboard range cannot exceed 400 days' using errcode = '22023';
  end if;
  if metric_currency !~ '^[A-Z]{3}$' then
    raise exception 'invalid metric currency' using errcode = '22023';
  end if;

  scoped_distributor_id := case when caller_is_admin then coalesce(target_distributor_id, caller_distributor_id) else caller_distributor_id end;
  if scoped_distributor_id is null then
    raise exception 'distributor access denied' using errcode = '42501';
  end if;
  if not caller_is_admin and target_distributor_id is not null and target_distributor_id <> caller_distributor_id then
    raise exception 'distributor access denied' using errcode = '42501';
  end if;

  select * into settings_row from public.distributor_portal_settings where singleton;
  select * into account_row from public.distributor_accounts where id = scoped_distributor_id;
  if not found then raise exception 'distributor account not found' using errcode = 'P0002'; end if;

  select * into payment_row
  from public.distributor_onboarding_payment_profiles payment
  where payment.distributor_id = scoped_distributor_id;

  select case when manager.id is null then null else jsonb_build_object(
    'id', manager.id,
    'displayName', manager.display_name,
    'title', manager.title,
    'email', manager.email,
    'phone', manager.phone,
    'whatsapp', manager.whatsapp,
    'responseTimeEn', manager.response_time_en,
    'responseTimeEs', manager.response_time_es,
    'avatarPath', manager.avatar_path
  ) end
  into manager_json
  from (values (account_row.partner_manager_id)) selected(id)
  left join public.distributor_partner_managers manager on manager.id = selected.id;

  select to_jsonb(metrics) into legacy_metrics
  from public.get_distributor_dashboard_metrics(scoped_distributor_id, null, null, metric_currency) metrics;
  legacy_metrics := coalesce(legacy_metrics, '{}'::jsonb);

  range_duration := range_end - range_start;
  prior_start := range_start - range_duration;

  select jsonb_build_object(
    'clicks', count(*) filter (where event.event_type = 'referral_link_clicked'),
    'uniqueClicks', count(distinct event.session_id) filter (where event.event_type = 'referral_link_clicked' and event.session_id is not null),
    'uniqueVisitors', count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted'),
    'productViews', count(*) filter (where event.event_type = 'product_viewed' and event.consent_state = 'accepted'),
    'checkouts', count(distinct event.session_id) filter (where event.event_type = 'checkout_started' and event.consent_state = 'accepted'),
    'completedCheckouts', count(distinct event.order_id) filter (where event.event_type = 'checkout_completed'),
    'paidOrders', count(distinct event.order_id) filter (where event.event_type = 'order_paid'),
    'visitorToCheckoutBps', case
      when count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted') = 0 then null
      else round(
        count(distinct event.session_id) filter (where event.event_type = 'checkout_started' and event.consent_state = 'accepted')::numeric
        * 10000
        / count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted')
      )::integer
    end,
    'checkoutToPaidBps', case
      when count(distinct event.session_id) filter (where event.event_type = 'checkout_started' and event.consent_state = 'accepted') = 0 then null
      else round(
        count(distinct event.order_id) filter (where event.event_type = 'order_paid')::numeric
        * 10000
        / count(distinct event.session_id) filter (where event.event_type = 'checkout_started' and event.consent_state = 'accepted')
      )::integer
    end,
    'visitorToPaidBps', case
      when count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted') = 0 then null
      else round(
        count(distinct event.order_id) filter (where event.event_type = 'order_paid')::numeric
        * 10000
        / count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted')
      )::integer
    end,
    'clickToPaidBps', case
      when count(*) filter (where event.event_type = 'referral_link_clicked') = 0 then null
      else round(
        count(distinct event.order_id) filter (where event.event_type = 'order_paid')::numeric
        * 10000
        / count(*) filter (where event.event_type = 'referral_link_clicked')
      )::integer
    end
  ) into traffic_current
  from public.distributor_attribution_events event
  where event.distributor_id = scoped_distributor_id
    and event.occurred_at >= greatest(range_start, settings_row.analytics_started_at)
    and event.occurred_at < range_end;

  select jsonb_build_object(
    'clicks', count(*) filter (where event.event_type = 'referral_link_clicked'),
    'uniqueClicks', count(distinct event.session_id) filter (where event.event_type = 'referral_link_clicked' and event.session_id is not null),
    'uniqueVisitors', count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted'),
    'productViews', count(*) filter (where event.event_type = 'product_viewed' and event.consent_state = 'accepted'),
    'checkouts', count(distinct event.session_id) filter (where event.event_type = 'checkout_started' and event.consent_state = 'accepted'),
    'completedCheckouts', count(distinct event.order_id) filter (where event.event_type = 'checkout_completed'),
    'paidOrders', count(distinct event.order_id) filter (where event.event_type = 'order_paid')
  ) into traffic_prior
  from public.distributor_attribution_events event
  where event.distributor_id = scoped_distributor_id
    and event.occurred_at >= greatest(prior_start, settings_row.analytics_started_at)
    and event.occurred_at < range_start;

  select jsonb_build_object(
    'paidOrders', count(*) filter (where sale.status not in ('voided', 'reversed')),
    'grossRevenueCents', coalesce(sum(sale.gross_revenue_cents) filter (where sale.status not in ('voided', 'reversed')), 0),
    'refundsCents', coalesce(sum(sale.refunded_commissionable_revenue_cents), 0),
    'netAttributedRevenueCents', coalesce(sum(greatest(sale.original_commissionable_revenue_cents - sale.refunded_commissionable_revenue_cents, 0)) filter (where sale.status not in ('voided', 'reversed')), 0),
    'netCommissionCents', coalesce(sum((
      select coalesce(sum(ledger.amount_cents), 0)
      from public.distributor_commission_ledger ledger
      where ledger.commission_id = sale.id
    )), 0),
    'averageOrderValueCents', case when count(*) filter (where sale.status not in ('voided', 'reversed')) = 0 then null else round(
      coalesce(sum(greatest(sale.original_commissionable_revenue_cents - sale.refunded_commissionable_revenue_cents, 0)) filter (where sale.status not in ('voided', 'reversed')), 0)::numeric
      / count(*) filter (where sale.status not in ('voided', 'reversed'))
    )::integer end
  ) into commerce_current
  from public.distributor_sales sale
  where sale.distributor_id = scoped_distributor_id
    and sale.currency = metric_currency
    and sale.paid_at >= range_start
    and sale.paid_at < range_end;

  select jsonb_build_object(
    'paidOrders', count(*) filter (where sale.status not in ('voided', 'reversed')),
    'grossRevenueCents', coalesce(sum(sale.gross_revenue_cents) filter (where sale.status not in ('voided', 'reversed')), 0),
    'refundsCents', coalesce(sum(sale.refunded_commissionable_revenue_cents), 0),
    'netAttributedRevenueCents', coalesce(sum(greatest(sale.original_commissionable_revenue_cents - sale.refunded_commissionable_revenue_cents, 0)) filter (where sale.status not in ('voided', 'reversed')), 0),
    'netCommissionCents', coalesce(sum((
      select coalesce(sum(ledger.amount_cents), 0)
      from public.distributor_commission_ledger ledger
      where ledger.commission_id = sale.id
    )), 0),
    'averageOrderValueCents', case when count(*) filter (where sale.status not in ('voided', 'reversed')) = 0 then null else round(
      coalesce(sum(greatest(sale.original_commissionable_revenue_cents - sale.refunded_commissionable_revenue_cents, 0)) filter (where sale.status not in ('voided', 'reversed')), 0)::numeric
      / count(*) filter (where sale.status not in ('voided', 'reversed'))
    )::integer end
  ) into commerce_prior
  from public.distributor_sales sale
  where sale.distributor_id = scoped_distributor_id
    and sale.currency = metric_currency
    and sale.paid_at >= prior_start
    and sale.paid_at < range_start;

  select case when product.orders_count < settings_row.minimum_winner_orders then null else to_jsonb(product) end
  into top_product_json
  from (
    select
      coalesce(item.product_id, item.product_name, item.sku, 'unknown') as "productId",
      max(coalesce(item.product_name, item.product_id, item.sku, 'Unknown')) as "productName",
      count(distinct sale.id)::integer as orders_count,
      sum(greatest(item.commissionable_amount_cents - item.refunded_commissionable_cents, 0))::bigint as "netRevenueCents"
    from public.distributor_sale_items item
    join public.distributor_sales sale on sale.id = item.sale_id
    where sale.distributor_id = scoped_distributor_id
      and sale.paid_at >= range_start and sale.paid_at < range_end
      and sale.status not in ('voided', 'reversed')
    group by coalesce(item.product_id, item.product_name, item.sku, 'unknown')
    order by "netRevenueCents" desc, orders_count desc, "productId"
    limit 1
  ) product;

  select case when candidate.paid_orders < settings_row.minimum_winner_orders or candidate.unique_viewers = 0 then null else to_jsonb(candidate) end
  into top_product_conversion_json
  from (
    with views as (
      select event.product_id, count(distinct event.anonymous_visitor_id)::integer as unique_viewers
      from public.distributor_attribution_events event
      where event.distributor_id = scoped_distributor_id
        and event.event_type = 'product_viewed'
        and event.consent_state = 'accepted'
        and event.occurred_at >= greatest(range_start, settings_row.analytics_started_at)
        and event.occurred_at < range_end
        and event.product_id is not null
      group by event.product_id
    ), paid as (
      select item.product_id, max(coalesce(item.product_name, item.product_id)) as product_name, count(distinct sale.id)::integer as paid_orders
      from public.distributor_sale_items item
      join public.distributor_sales sale on sale.id = item.sale_id
      where sale.distributor_id = scoped_distributor_id
        and sale.paid_at >= range_start and sale.paid_at < range_end
        and sale.status not in ('voided', 'reversed')
        and item.product_id is not null
      group by item.product_id
    )
    select
      paid.product_id as "productId",
      paid.product_name as "productName",
      paid.paid_orders,
      views.unique_viewers,
      round(paid.paid_orders::numeric * 10000 / views.unique_viewers)::integer as "conversionBps"
    from paid join views using (product_id)
    order by "conversionBps" desc, paid.paid_orders desc, paid.product_id
    limit 1
  ) candidate;

  select case when campaign.paid_orders < settings_row.minimum_winner_orders then null else to_jsonb(campaign) end
  into top_campaign_json
  from (
    select
      campaign.id,
      campaign.name,
      count(distinct event.order_id)::integer as paid_orders,
      coalesce(sum(greatest(order_row.subtotal_cents - order_row.discount_cents - order_row.refunded_cents, 0)), 0)::bigint as "netRevenueCents"
    from public.distributor_campaigns campaign
    join public.distributor_attribution_events event on event.campaign_id = campaign.id and event.event_type = 'order_paid'
    left join public.storefront_orders order_row on order_row.id = event.order_id
    where campaign.distributor_id = scoped_distributor_id
      and event.occurred_at >= range_start and event.occurred_at < range_end
    group by campaign.id, campaign.name
    order by "netRevenueCents" desc, paid_orders desc, campaign.id
    limit 1
  ) campaign;

  select case when channel.paid_orders < settings_row.minimum_winner_orders then null else to_jsonb(channel) end
  into top_channel_json
  from (
    select
      coalesce(event.channel, 'direct') as channel,
      count(distinct event.order_id)::integer as paid_orders,
      coalesce(sum(greatest(order_row.subtotal_cents - order_row.discount_cents - order_row.refunded_cents, 0)), 0)::bigint as "netRevenueCents"
    from public.distributor_attribution_events event
    left join public.storefront_orders order_row on order_row.id = event.order_id
    where event.distributor_id = scoped_distributor_id
      and event.event_type = 'order_paid'
      and event.occurred_at >= range_start and event.occurred_at < range_end
    group by coalesce(event.channel, 'direct')
    order by "netRevenueCents" desc, paid_orders desc, channel
    limit 1
  ) channel;

  select jsonb_build_array(
    jsonb_build_object('key', 'identity', 'complete', account_row.email_accepted_at is not null, 'completedAt', account_row.email_accepted_at, 'actionPath', '/distributor/onboarding/profile', 'blockedReason', null),
    jsonb_build_object('key', 'contract', 'complete', exists (
      select 1 from public.distributor_onboarding_documents document
      where document.distributor_id = scoped_distributor_id and document.document_type = 'distribution_agreement' and document.status = 'approved'
    ), 'completedAt', (
      select max(document.approved_at) from public.distributor_onboarding_documents document
      where document.distributor_id = scoped_distributor_id and document.document_type = 'distribution_agreement' and document.status = 'approved'
    ), 'actionPath', '/distributor/onboarding/documents', 'blockedReason', null),
    jsonb_build_object('key', 'tax', 'complete', exists (
      select 1 from public.distributor_onboarding_documents document
      where document.distributor_id = scoped_distributor_id and document.document_type = 'tax_form' and document.status = 'approved'
    ), 'completedAt', (
      select max(document.approved_at) from public.distributor_onboarding_documents document
      where document.distributor_id = scoped_distributor_id and document.document_type = 'tax_form' and document.status = 'approved'
    ), 'actionPath', '/distributor/onboarding/documents', 'blockedReason', null),
    jsonb_build_object('key', 'payment', 'complete', payment_row.provider_status = 'configured', 'completedAt', payment_row.confirmed_at, 'actionPath', '/distributor/onboarding/payment', 'blockedReason', payment_row.last_error),
    jsonb_build_object('key', 'approval', 'complete', account_row.approved_at is not null, 'completedAt', account_row.approved_at, 'actionPath', '/distributor/onboarding', 'blockedReason', account_row.status_reason),
    jsonb_build_object('key', 'activation', 'complete', account_row.status = 'active' and account_row.onboarding_status = 'active', 'completedAt', account_row.activated_at, 'actionPath', '/distributor/onboarding', 'blockedReason', account_row.status_reason)
  ) into onboarding_json;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', goal.id,
    'metric', goal.metric,
    'targetValue', goal.target_value,
    'periodStart', goal.period_start,
    'periodEnd', goal.period_end,
    'status', goal.status,
    'reachedAt', goal.reached_at
  ) order by goal.period_end, goal.id), '[]'::jsonb)
  into goals_json
  from public.distributor_goals goal
  where goal.distributor_id = scoped_distributor_id and goal.status = 'active';

  select count(*)::integer into unread_notifications
  from public.distributor_notifications notification
  where notification.distributor_id = scoped_distributor_id and notification.read_at is null;

  select count(*)::integer into open_disputes
  from public.distributor_disputes dispute
  where dispute.distributor_id = scoped_distributor_id and dispute.status not in ('approved', 'rejected', 'closed');

  select count(*)::integer into campaign_count from public.distributor_campaigns campaign where campaign.distributor_id = scoped_distributor_id and campaign.status <> 'archived';
  select count(*)::integer into active_link_count from public.distributor_partner_links link where link.distributor_id = scoped_distributor_id and link.active and (link.expires_at is null or link.expires_at > now());

  available_cents := coalesce((legacy_metrics ->> 'payable_cents')::bigint, 0);
  payout_minimum := coalesce(account_row.payout_minimum_cents, settings_row.payout_minimum_cents, 10000);
  if account_row.status <> 'active' then
    next_payout_reason := 'account_not_active';
  elsif payment_row.provider_status is distinct from 'configured' then
    next_payout_reason := 'payment_method_required';
  elsif open_disputes > 0 then
    next_payout_reason := 'open_dispute';
  elsif available_cents < payout_minimum then
    next_payout_reason := 'minimum_not_reached';
  elsif settings_row.payout_schedule = 'manual' then
    next_payout_reason := 'manual_schedule';
  else
    next_payout_date := make_date(extract(year from now())::integer, extract(month from now())::integer, settings_row.payout_day);
    if next_payout_date <= current_date then next_payout_date := (next_payout_date + interval '1 month')::date; end if;
    next_payout_reason := 'scheduled';
  end if;

  return jsonb_build_object(
    'account', jsonb_build_object(
      'id', account_row.id,
      'displayName', account_row.display_name,
      'status', account_row.status,
      'onboardingStatus', account_row.onboarding_status,
      'referralCode', account_row.referral_code,
      'commissionRateBps', account_row.commission_rate_bps,
      'attributionWindowDays', account_row.attribution_window_days,
      'commissionHoldDays', account_row.commission_hold_days,
      'payoutMinimumCents', account_row.payout_minimum_cents,
      'taxStatus', account_row.tax_status,
      'countryCode', account_row.country_code,
      'entityType', account_row.entity_type
    ),
    'period', jsonb_build_object(
      'startAt', range_start,
      'endAt', range_end,
      'priorStartAt', prior_start,
      'timeZone', 'America/Denver',
      'analyticsStartedAt', settings_row.analytics_started_at,
      'analyticsAvailable', range_end > settings_row.analytics_started_at,
      'attributionModel', settings_row.attribution_model
    ),
    'traffic', coalesce(traffic_current, '{}'::jsonb),
    'trafficPrior', coalesce(traffic_prior, '{}'::jsonb),
    'commerce', coalesce(commerce_current, '{}'::jsonb),
    'commercePrior', coalesce(commerce_prior, '{}'::jsonb),
    'financial', jsonb_build_object(
      'availableCents', available_cents,
      'pendingCents', coalesce((legacy_metrics ->> 'pending_commission_cents')::bigint, 0),
      'inPayoutCents', coalesce((legacy_metrics ->> 'in_payout_commission_cents')::bigint, 0),
      'pendingAdjustmentsCents', coalesce((legacy_metrics ->> 'pending_recovery_cents')::bigint, 0),
      'totalPaidCents', coalesce((legacy_metrics ->> 'paid_commission_cents')::bigint, 0),
      'minimumCents', payout_minimum,
      'amountToMinimumCents', greatest(payout_minimum - available_cents, 0),
      'progressBps', case when payout_minimum = 0 then 10000 else least(round(available_cents::numeric * 10000 / payout_minimum)::integer, 10000) end,
      'nextPayoutDate', next_payout_date,
      'nextPayoutReason', next_payout_reason,
      'paymentProvider', payment_row.provider,
      'paymentStatus', payment_row.provider_status,
      'paymentLast4', payment_row.account_last4,
      'currency', metric_currency
    ),
    'onboarding', onboarding_json,
    'bestProduct', top_product_json,
    'bestProductConversion', top_product_conversion_json,
    'bestCampaign', top_campaign_json,
    'bestChannel', top_channel_json,
    'partnerManager', manager_json,
    'goals', goals_json,
    'unreadNotifications', unread_notifications,
    'openDisputes', open_disputes,
    'campaignCount', campaign_count,
    'activeLinkCount', active_link_count,
    'featureFlags', jsonb_build_object(
      'analytics', settings_row.analytics_enabled,
      'premiumDashboard', settings_row.premium_dashboard_enabled,
      'growthCenter', settings_row.growth_center_enabled,
      'disputes', settings_row.disputes_enabled,
      'commissionRules', settings_row.commission_rules_enabled,
      'adminMfaEnforcement', settings_row.admin_mfa_enforcement_enabled
    )
  );
end
$$;

create or replace function public.get_distributor_growth_report(
  target_distributor_id uuid default null,
  start_at timestamptz default null,
  end_at timestamptz default null,
  channel_filter text default null,
  campaign_filter uuid default null,
  product_filter text default null,
  language_filter text default null,
  active_filter boolean default null
)
returns table (
  link_id uuid,
  created_at timestamptz,
  campaign_id uuid,
  campaign_name text,
  destination_path text,
  channel text,
  sub_id text,
  language text,
  active boolean,
  expires_at timestamptz,
  clicks bigint,
  unique_visitors bigint,
  checkout_starts bigint,
  paid_orders bigint,
  net_revenue_cents bigint,
  conversion_bps integer
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_distributor_id uuid := public.portal_distributor_id();
  caller_is_admin boolean := public.portal_is_admin();
  scoped_distributor_id uuid;
  range_start timestamptz := coalesce(start_at, '-infinity'::timestamptz);
  range_end timestamptz := coalesce(end_at, 'infinity'::timestamptz);
begin
  scoped_distributor_id := case when caller_is_admin then coalesce(target_distributor_id, caller_distributor_id) else caller_distributor_id end;
  if scoped_distributor_id is null or (not caller_is_admin and target_distributor_id is not null and target_distributor_id <> caller_distributor_id) then
    raise exception 'distributor access denied' using errcode = '42501';
  end if;
  if range_end <= range_start then raise exception 'invalid report range' using errcode = '22007'; end if;

  return query
  select
    link.id,
    link.created_at,
    link.campaign_id,
    campaign.name,
    link.destination_path,
    link.channel,
    link.sub_id,
    link.language,
    link.active,
    link.expires_at,
    count(*) filter (where event.event_type = 'referral_link_clicked')::bigint,
    count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted')::bigint,
    count(distinct event.session_id) filter (where event.event_type = 'checkout_started' and event.consent_state = 'accepted')::bigint,
    count(distinct event.order_id) filter (where event.event_type = 'order_paid')::bigint,
    coalesce(sum(greatest(order_row.subtotal_cents - order_row.discount_cents - order_row.refunded_cents, 0)) filter (where event.event_type = 'order_paid'), 0)::bigint,
    case
      when count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted') = 0 then null
      else round(
        count(distinct event.order_id) filter (where event.event_type = 'order_paid')::numeric * 10000
        / count(distinct event.anonymous_visitor_id) filter (where event.event_type = 'unique_visitor_recorded' and event.consent_state = 'accepted')
      )::integer
    end
  from public.distributor_partner_links link
  left join public.distributor_campaigns campaign on campaign.id = link.campaign_id
  left join public.distributor_attribution_events event
    on event.partner_link_id = link.id and event.occurred_at >= range_start and event.occurred_at < range_end
  left join public.storefront_orders order_row on order_row.id = event.order_id
  where link.distributor_id = scoped_distributor_id
    and (channel_filter is null or link.channel = channel_filter)
    and (campaign_filter is null or link.campaign_id = campaign_filter)
    and (language_filter is null or link.language = language_filter)
    and (active_filter is null or link.active = active_filter)
    and (
      product_filter is null
      or link.destination_path in ('/products/' || product_filter, '/products/' || product_filter || '/')
    )
  group by link.id, link.created_at, link.campaign_id, campaign.name, link.destination_path, link.channel, link.sub_id, link.language, link.active, link.expires_at
  order by link.created_at desc, link.id desc;
end
$$;

create or replace function public.get_distributor_profitability_report(
  start_at timestamptz default null,
  end_at timestamptz default null
)
returns table (
  product_id text,
  product_name text,
  campaign_id uuid,
  campaign_name text,
  paid_orders bigint,
  gross_revenue_cents bigint,
  discounts_cents bigint,
  refunds_cents bigint,
  product_cost_cents bigint,
  shipping_subsidy_cents bigint,
  commission_cents bigint,
  fees_cents bigint,
  estimated_margin_cents bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if not public.portal_is_admin() then raise exception 'administrator access required' using errcode = '42501'; end if;
  return query
  with item_costs as (
    select
      item.*,
      sale.paid_at,
      sale.distributor_id,
      order_row.distributor_campaign_id,
      coalesce(cost.unit_cost_cents, 0) as unit_cost_cents,
      coalesce(cost.shipping_subsidy_cents, 0) as item_shipping_subsidy_cents,
      coalesce(cost.fee_rate_bps, 0) as fee_rate_bps,
      coalesce(cost.fixed_fee_cents, 0) as fixed_fee_cents
    from public.distributor_sale_items item
    join public.distributor_sales sale on sale.id = item.sale_id
    join public.storefront_orders order_row on order_row.id = sale.storefront_order_id
    left join lateral (
      select product_cost.*
      from public.distributor_product_costs product_cost
      where product_cost.product_id = coalesce(item.product_id, '')
        and (product_cost.sku is null or product_cost.sku = item.sku)
        and product_cost.effective_from <= sale.paid_at
        and (product_cost.effective_until is null or product_cost.effective_until > sale.paid_at)
      order by (product_cost.sku is not null) desc, product_cost.effective_from desc, product_cost.id desc
      limit 1
    ) cost on true
    where sale.status not in ('voided', 'reversed')
      and sale.paid_at >= coalesce(start_at, '-infinity'::timestamptz)
      and sale.paid_at < coalesce(end_at, 'infinity'::timestamptz)
  )
  select
    coalesce(item_costs.product_id, item_costs.product_name, item_costs.sku, 'unknown'),
    max(coalesce(item_costs.product_name, item_costs.product_id, item_costs.sku, 'Unknown')),
    item_costs.distributor_campaign_id,
    max(campaign.name),
    count(distinct item_costs.sale_id)::bigint,
    sum(item_costs.gross_amount_cents)::bigint,
    sum(item_costs.allocated_discount_cents)::bigint,
    sum(item_costs.refunded_commissionable_cents)::bigint,
    sum(item_costs.unit_cost_cents * item_costs.quantity)::bigint,
    sum(item_costs.item_shipping_subsidy_cents * item_costs.quantity)::bigint,
    sum(item_costs.original_commission_cents - item_costs.commission_reversed_cents)::bigint,
    sum(round(greatest(item_costs.commissionable_amount_cents - item_costs.refunded_commissionable_cents, 0)::numeric * item_costs.fee_rate_bps / 10000)::integer + item_costs.fixed_fee_cents)::bigint,
    sum(
      greatest(item_costs.commissionable_amount_cents - item_costs.refunded_commissionable_cents, 0)
      - (item_costs.unit_cost_cents * item_costs.quantity)
      - (item_costs.item_shipping_subsidy_cents * item_costs.quantity)
      - (item_costs.original_commission_cents - item_costs.commission_reversed_cents)
      - (round(greatest(item_costs.commissionable_amount_cents - item_costs.refunded_commissionable_cents, 0)::numeric * item_costs.fee_rate_bps / 10000)::integer + item_costs.fixed_fee_cents)
    )::bigint
  from item_costs
  left join public.distributor_campaigns campaign on campaign.id = item_costs.distributor_campaign_id
  group by coalesce(item_costs.product_id, item_costs.product_name, item_costs.sku, 'unknown'), item_costs.distributor_campaign_id
  order by 13 desc, 1, 3;
end
$$;

revoke all on function public.get_distributor_premium_dashboard(uuid, timestamptz, timestamptz, text) from public, anon;
revoke all on function public.get_distributor_growth_report(uuid, timestamptz, timestamptz, text, uuid, text, text, boolean) from public, anon;
revoke all on function public.get_distributor_profitability_report(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_distributor_premium_dashboard(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.get_distributor_growth_report(uuid, timestamptz, timestamptz, text, uuid, text, text, boolean) to authenticated;
grant execute on function public.get_distributor_profitability_report(timestamptz, timestamptz) to authenticated;

create policy "distributors read own sale item snapshots"
on public.distributor_sale_items for select to authenticated
using (
  exists (
    select 1 from public.distributor_sales sale
    where sale.id = distributor_sale_items.sale_id
      and sale.distributor_id = (select public.portal_distributor_id())
  )
  or (select public.portal_is_admin())
);

create or replace function public.get_distributor_commission_details_page(
  target_distributor_id uuid default null,
  page_size integer default 25,
  cursor_created_at timestamptz default null,
  cursor_id uuid default null,
  start_at timestamptz default null,
  end_at timestamptz default null,
  search_text text default null
)
returns table (
  id uuid,
  distributor_id uuid,
  created_at timestamptz,
  order_reference text,
  paid_at timestamptz,
  net_revenue_cents integer,
  commission_rate_bps integer,
  original_commission_cents integer,
  net_commission_cents bigint,
  hold_until timestamptz,
  public_status text,
  payout_id uuid,
  adjustment_reason text,
  remaining_cents bigint,
  items jsonb
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_distributor_id uuid := public.portal_distributor_id();
  caller_is_admin boolean := public.portal_is_admin();
  scoped_distributor_id uuid;
  normalized_search text := nullif(trim(search_text), '');
begin
  if page_size < 1 or page_size > 100 then raise exception 'page_size must be between 1 and 100' using errcode = '22023'; end if;
  if (cursor_created_at is null) <> (cursor_id is null) then raise exception 'cursor requires timestamp and id' using errcode = '22023'; end if;
  scoped_distributor_id := case when caller_is_admin then coalesce(target_distributor_id, caller_distributor_id) else caller_distributor_id end;
  if scoped_distributor_id is null or (not caller_is_admin and target_distributor_id is not null and target_distributor_id <> caller_distributor_id) then
    raise exception 'distributor access denied' using errcode = '42501';
  end if;

  return query
  select
    sale.id,
    sale.distributor_id,
    sale.created_at,
    sale.order_reference,
    sale.paid_at,
    greatest(sale.original_commissionable_revenue_cents - sale.refunded_commissionable_revenue_cents, 0),
    sale.commission_rate_bps,
    sale.original_commission_amount_cents,
    coalesce(ledger.net_cents, 0)::bigint,
    sale.hold_until,
    case
      when dispute.id is not null then 'in_dispute'
      when sale.status = 'paid' then 'deposited'
      when sale.status = 'in_payout' then 'scheduled'
      when sale.status in ('voided', 'reversed') and coalesce(ledger.net_cents, 0) <= 0 then 'rejected'
      when sale.status in ('voided', 'reversed') then 'adjusted'
      when coalesce(ledger.net_cents, 0) <= 0 then 'requires_action'
      when sale.status = 'approved' or sale.hold_until <= now() then 'available'
      when sale.status = 'pending' then 'on_hold'
      else 'under_review'
    end,
    payout.id,
    adjustment.reason,
    greatest(coalesce(ledger.net_cents, 0) - coalesce(paid_items.applied_cents, 0), 0)::bigint,
    coalesce(items.items, '[]'::jsonb)
  from public.distributor_sales sale
  left join lateral (
    select sum(entry.amount_cents)::bigint as net_cents
    from public.distributor_commission_ledger entry
    where entry.commission_id = sale.id
  ) ledger on true
  left join lateral (
    select sum(item.amount_cents)::bigint as applied_cents, max(item.payout_id) as payout_id
    from public.distributor_payout_ledger_items item
    join public.distributor_commission_ledger entry on entry.id = item.ledger_entry_id
    where entry.commission_id = sale.id and item.amount_cents > 0
  ) paid_items on true
  left join public.distributor_payouts payout on payout.id = paid_items.payout_id
  left join lateral (
    select entry.reason
    from public.distributor_commission_ledger entry
    where entry.commission_id = sale.id and entry.entry_type not in ('commission_earned', 'legacy_balance')
    order by entry.created_at desc, entry.id desc limit 1
  ) adjustment on true
  left join lateral (
    select dispute_row.id
    from public.distributor_disputes dispute_row
    where dispute_row.sale_id = sale.id and dispute_row.status not in ('approved', 'rejected', 'closed')
    order by dispute_row.created_at desc limit 1
  ) dispute on true
  left join lateral (
    select jsonb_agg(jsonb_build_object(
      'id', item.id,
      'productId', item.product_id,
      'productName', item.product_name,
      'variantName', item.variant_name,
      'quantity', item.quantity,
      'netRevenueCents', greatest(item.commissionable_amount_cents - item.refunded_commissionable_cents, 0),
      'commissionRateBps', item.commission_rate_bps,
      'commissionCents', item.original_commission_cents - item.commission_reversed_cents,
      'excluded', item.commission_excluded,
      'exclusionReason', item.commission_exclusion_reason
    ) order by item.id) as items
    from public.distributor_sale_items item where item.sale_id = sale.id
  ) items on true
  where sale.distributor_id = scoped_distributor_id
    and (start_at is null or sale.paid_at >= start_at)
    and (end_at is null or sale.paid_at < end_at)
    and (cursor_created_at is null or (sale.created_at, sale.id) < (cursor_created_at, cursor_id))
    and (normalized_search is null or sale.order_reference ilike '%' || normalized_search || '%')
  order by sale.created_at desc, sale.id desc
  limit page_size + 1;
end
$$;

revoke all on function public.get_distributor_commission_details_page(uuid, integer, timestamptz, uuid, timestamptz, timestamptz, text) from public, anon;
grant execute on function public.get_distributor_commission_details_page(uuid, integer, timestamptz, uuid, timestamptz, timestamptz, text) to authenticated;

-- New administrative configuration and financial surfaces require aal2 at the
-- database boundary. The global admin-MFA flag controls the legacy admin area;
-- these new high-risk writes are protected immediately.
drop policy "admins update distributor portal settings" on public.distributor_portal_settings;
create policy "admins update distributor portal settings"
on public.distributor_portal_settings for update to authenticated
using ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2')
with check ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2');

drop policy "admins manage partner managers" on public.distributor_partner_managers;
create policy "admins manage partner managers"
on public.distributor_partner_managers for all to authenticated
using ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2')
with check ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2');

drop policy "admins manage growth assets" on public.distributor_growth_assets;
create policy "admins manage growth assets"
on public.distributor_growth_assets for all to authenticated
using ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2')
with check ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2');

drop policy "admins manage distributor copy" on public.distributor_approved_copy;
create policy "admins manage distributor copy"
on public.distributor_approved_copy for all to authenticated
using ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2')
with check ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2');

drop policy "admins create distributor commission rules" on public.distributor_commission_rules;
create policy "admins create distributor commission rules"
on public.distributor_commission_rules for insert to authenticated
with check ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2' and created_by = (select auth.uid()));

drop policy "admins create distributor product costs" on public.distributor_product_costs;
create policy "admins create distributor product costs"
on public.distributor_product_costs for insert to authenticated
with check ((select public.portal_is_admin()) and (select auth.jwt() ->> 'aal') = 'aal2' and created_by = (select auth.uid()));

-- Optionally enforce aal2 across every legacy admin RPC after administrators
-- have enrolled. Until enabled, existing administrators can still reach the
-- MFA enrollment UI and are never permanently locked out.
create or replace function public.portal_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (public.portal_has_role('admin') or public.portal_has_role('super_admin'))
    and (
      not coalesce((select settings.admin_mfa_enforcement_enabled from public.distributor_portal_settings settings where settings.singleton), false)
      or coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
    )
$$;

revoke all on function public.portal_is_admin() from public, anon;
grant execute on function public.portal_is_admin() to authenticated;

comment on table public.distributor_attribution_events is 'Privacy-minimized, idempotent distributor funnel events. No full IP address or buyer PII is stored.';
comment on table public.distributor_commission_rules is 'Append-only, effective-dated product or collection commission rules. Sales retain a per-item rule snapshot.';
comment on table public.distributor_product_costs is 'Administrative-only product cost history. Never exposed to distributor RPCs or policies.';
comment on function public.get_distributor_premium_dashboard(uuid, timestamptz, timestamptz, text) is 'RLS-aware full-set premium distributor dashboard with real visitor conversion, prior-period comparisons, financial state separation, onboarding, and next payout explanation.';
comment on function public.get_distributor_growth_report(uuid, timestamptz, timestamptz, text, uuid, text, text, boolean) is 'RLS-aware complete filtered partner-link report; does not paginate or export only the visible browser page.';
