-- Encore Bio Labs — Social proof (testimonials + before/after transformation media)
--
-- Compliance model: the base tables hold sensitive consent/verification fields
-- and are readable ONLY by content admins (server-assigned role). The public
-- site never queries the base tables; it reads two SECURITY DEFINER views that
-- expose ONLY publishable rows and ONLY non-sensitive columns. Approval is
-- therefore server-authoritative: flipping a client flag cannot publish a row.
--
-- Apply in the Supabase SQL editor (or via the CLI) against the target project.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.content_status as enum ('draft', 'review', 'approved', 'rejected', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.testimonial_category as enum ('service', 'documentation', 'fulfillment', 'support');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.page_placement as enum ('home', 'retatrutide', 'catalog', 'about');
exception when duplicate_object then null; end $$;

-- Content admin check. The role is assigned server-side with the service-role
-- key (never in the browser / Vite env). Mirrors the existing is_crm_admin()
-- pattern and also honors portal admins.
create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('crm_admin', 'content_admin'), false)
    or exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')
    );
$$;

revoke all on function public.is_content_admin() from public;
grant execute on function public.is_content_admin() to authenticated;

-- Testimonials -------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status public.content_status not null default 'draft',
  category public.testimonial_category not null default 'service',
  quote text not null default '',
  display_name text not null default '',
  approved_photo_url text,          -- public optimized derivative
  original_photo_path text,         -- private original (compliance bucket)
  submission_date date,
  consent_verified boolean not null default false,
  consent_record_reference text not null default '',
  relationship_to_business text not null default '',
  incentive_provided boolean not null default false,
  incentive_disclosure text not null default '',
  source_record_reference text not null default '',
  verification_notes text not null default '',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  sort_order integer not null default 0,
  alt_text text not null default ''
);

-- Transformation media -----------------------------------------------------
create table if not exists public.transformation_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status public.content_status not null default 'draft',
  before_image_url text not null default '',      -- public derivative
  after_image_url text not null default '',       -- public derivative
  original_before_path text,                      -- private original
  original_after_path text,                       -- private original
  before_capture_date date,
  after_capture_date date,
  image_owner text not null default '',
  subject_consent_verified boolean not null default false,
  consent_record_reference text not null default '',
  original_files_verified boolean not null default false,
  edits_disclosure text not null default '',
  accompanying_claim text not null default '',
  claim_evidence_reference text not null default '',
  typical_outcome_evidence_reference text not null default '',  -- internal, gate only
  typical_outcome_disclosure text not null default '',          -- approved public text
  product_or_service_referenced text not null default '',
  concurrent_factors_disclosure text not null default '',
  reviewer uuid references auth.users(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  sort_order integer not null default 0,
  before_alt_text text not null default '',
  after_alt_text text not null default '',
  -- Explicit per-page publication approval. Never auto-populated.
  approved_placements public.page_placement[] not null default '{}'
);

-- Base-table RLS: content admins only. The public role gets NOTHING here.
alter table public.testimonials enable row level security;
alter table public.transformation_media enable row level security;

drop policy if exists "content admins manage testimonials" on public.testimonials;
create policy "content admins manage testimonials" on public.testimonials
  for all to authenticated using (public.is_content_admin()) with check (public.is_content_admin());

drop policy if exists "content admins manage transformations" on public.transformation_media;
create policy "content admins manage transformations" on public.transformation_media
  for all to authenticated using (public.is_content_admin()) with check (public.is_content_admin());

-- Public views: SECURITY DEFINER so they bypass base-table RLS, but return
-- ONLY publishable rows and ONLY safe columns. This is the public read path.
create or replace view public.published_testimonials
with (security_invoker = false) as
  select
    id,
    category,
    quote,
    display_name,
    approved_photo_url,
    alt_text,
    case when incentive_provided then incentive_disclosure else '' end as incentive_disclosure,
    relationship_to_business,
    sort_order
  from public.testimonials
  where status = 'approved'
    and consent_verified = true
    and length(btrim(quote)) > 0
    and length(btrim(display_name)) > 0
    and (incentive_provided = false or length(btrim(incentive_disclosure)) > 0)
    and published_at is not null;

create or replace view public.published_transformations
with (security_invoker = false) as
  select
    id,
    before_image_url,
    after_image_url,
    before_alt_text,
    after_alt_text,
    before_capture_date,
    after_capture_date,
    edits_disclosure,
    accompanying_claim,
    typical_outcome_disclosure,
    concurrent_factors_disclosure,
    product_or_service_referenced,
    approved_placements,
    sort_order
  from public.transformation_media
  where status = 'approved'
    and subject_consent_verified = true
    and original_files_verified = true
    and length(btrim(before_image_url)) > 0
    and length(btrim(after_image_url)) > 0
    and before_capture_date is not null
    and after_capture_date is not null
    and length(btrim(accompanying_claim)) > 0
    and length(btrim(claim_evidence_reference)) > 0
    and length(btrim(typical_outcome_evidence_reference)) > 0
    and coalesce(array_length(approved_placements, 1), 0) > 0
    and published_at is not null;

grant select on public.published_testimonials to anon, authenticated;
grant select on public.published_transformations to anon, authenticated;

-- Storage buckets ----------------------------------------------------------
-- Private: original uploads + consent documents. Never public.
insert into storage.buckets (id, name, public)
  values ('compliance-private', 'compliance-private', false)
  on conflict (id) do nothing;
-- Public: optimized derivatives that are cleared for publication.
insert into storage.buckets (id, name, public)
  values ('social-proof-public', 'social-proof-public', true)
  on conflict (id) do nothing;

-- Private bucket: content admins only, for every operation.
drop policy if exists "content admins read private compliance" on storage.objects;
create policy "content admins read private compliance" on storage.objects
  for select to authenticated
  using (bucket_id = 'compliance-private' and public.is_content_admin());

drop policy if exists "content admins write private compliance" on storage.objects;
create policy "content admins write private compliance" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'compliance-private' and public.is_content_admin());

drop policy if exists "content admins update private compliance" on storage.objects;
create policy "content admins update private compliance" on storage.objects
  for update to authenticated
  using (bucket_id = 'compliance-private' and public.is_content_admin());

drop policy if exists "content admins delete private compliance" on storage.objects;
create policy "content admins delete private compliance" on storage.objects
  for delete to authenticated
  using (bucket_id = 'compliance-private' and public.is_content_admin());

-- Public derivatives: world-readable, admin-writable.
drop policy if exists "public reads social proof derivatives" on storage.objects;
create policy "public reads social proof derivatives" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'social-proof-public');

drop policy if exists "content admins write social proof derivatives" on storage.objects;
create policy "content admins write social proof derivatives" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'social-proof-public' and public.is_content_admin());

drop policy if exists "content admins update social proof derivatives" on storage.objects;
create policy "content admins update social proof derivatives" on storage.objects
  for update to authenticated
  using (bucket_id = 'social-proof-public' and public.is_content_admin());

drop policy if exists "content admins delete social proof derivatives" on storage.objects;
create policy "content admins delete social proof derivatives" on storage.objects
  for delete to authenticated
  using (bucket_id = 'social-proof-public' and public.is_content_admin());
