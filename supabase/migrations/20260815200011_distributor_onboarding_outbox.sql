-- Recoverable distributor invitation and onboarding workflow.
-- The database commits the distributor profile, invitation, audit event, and
-- outbox work before any Supabase Auth user or email is created.

create type public.distributor_onboarding_state as enum (
  'draft',
  'invite_pending',
  'invited',
  'email_accepted',
  'documents_complete',
  'payment_configured',
  'approved',
  'active',
  'expired',
  'revoked',
  'rejected',
  'suspended'
);

create type public.distributor_invitation_delivery_status as enum (
  'pending', 'processing', 'sent', 'accepted', 'failed', 'expired', 'revoked'
);

create type public.distributor_onboarding_document_status as enum (
  'submitted', 'complete', 'approved', 'rejected'
);

create type public.distributor_onboarding_outbox_status as enum (
  'pending', 'processing', 'completed', 'failed', 'blocked'
);

alter table public.distributor_accounts
  alter column user_id drop not null,
  add column email text,
  add column preferred_language text not null default 'English'
    check (preferred_language in ('English', 'Spanish')),
  add column onboarding_status public.distributor_onboarding_state not null default 'draft',
  add column invited_at timestamptz,
  add column email_accepted_at timestamptz,
  add column password_configured_at timestamptz,
  add column documents_completed_at timestamptz,
  add column payment_configured_at timestamptz,
  add column approved_at timestamptz,
  add column approved_by uuid references auth.users(id),
  add column activated_at timestamptz,
  add column activated_by uuid references auth.users(id),
  add column revoked_at timestamptz,
  add column rejected_at timestamptz,
  add column suspended_at timestamptz,
  add column status_reason text,
  add column onboarding_metadata jsonb not null default '{}'::jsonb;

update public.distributor_accounts account
set
  email = lower(auth_user.email),
  preferred_language = case
    when auth_user.raw_user_meta_data ->> 'preferred_language' = 'Spanish' then 'Spanish'
    else 'English'
  end,
  password_configured_at = case
    when nullif(auth_user.encrypted_password, '') is not null then coalesce(auth_user.updated_at, account.updated_at)
    else null
  end,
  email_accepted_at = auth_user.email_confirmed_at,
  onboarding_status = case
    when account.status = 'active' then 'active'::public.distributor_onboarding_state
    when account.status = 'suspended' then 'suspended'::public.distributor_onboarding_state
    when account.status = 'archived' then 'revoked'::public.distributor_onboarding_state
    when auth_user.email_confirmed_at is not null then 'email_accepted'::public.distributor_onboarding_state
    else 'invited'::public.distributor_onboarding_state
  end,
  invited_at = account.created_at,
  approved_at = case when account.status = 'active' then account.updated_at else null end,
  activated_at = case when account.status = 'active' then account.updated_at else null end,
  suspended_at = case when account.status = 'suspended' then account.updated_at else null end,
  revoked_at = case when account.status = 'archived' then account.updated_at else null end,
  onboarding_metadata = jsonb_build_object(
    'backfilled', true,
    'legacy_account_status', account.status,
    'backfilled_at', now()
  )
from auth.users auth_user
where auth_user.id = account.user_id;

alter table public.distributor_accounts
  alter column email set not null;

create unique index distributor_accounts_email_unique_idx
  on public.distributor_accounts (lower(email));
create index distributor_accounts_onboarding_status_idx
  on public.distributor_accounts (onboarding_status, updated_at desc);

create table public.distributor_onboarding_invitations (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  email text not null check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  auth_user_id uuid references auth.users(id) on delete restrict,
  status public.distributor_invitation_delivery_status not null default 'pending',
  token_reference_hash text check (token_reference_hash is null or length(token_reference_hash) = 64),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  expires_at timestamptz not null default (now() + interval '72 hours'),
  last_resend_at timestamptz,
  resend_count integer not null default 0 check (resend_count between 0 and 20),
  accepted_at timestamptz,
  password_configured_at timestamptz,
  documents_completed_at timestamptz,
  payment_configured_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  activated_at timestamptz,
  activated_by uuid references auth.users(id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id),
  rejected_at timestamptz,
  rejected_by uuid references auth.users(id),
  suspended_at timestamptz,
  suspended_by uuid references auth.users(id),
  reason text,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique check (length(idempotency_key) between 8 and 200)
);

create unique index distributor_onboarding_one_open_invitation_idx
  on public.distributor_onboarding_invitations(distributor_id)
  where status in ('pending', 'processing', 'sent');
create index distributor_onboarding_invitation_email_idx
  on public.distributor_onboarding_invitations(lower(email), created_at desc);
create index distributor_onboarding_invitation_auth_user_idx
  on public.distributor_onboarding_invitations(auth_user_id)
  where auth_user_id is not null;

create table public.distributor_onboarding_events (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  invitation_id uuid references public.distributor_onboarding_invitations(id) on delete set null,
  from_state public.distributor_onboarding_state,
  to_state public.distributor_onboarding_state not null,
  event_type text not null,
  actor_id uuid references auth.users(id),
  source text not null check (source in ('admin', 'distributor', 'system', 'migration', 'provider')),
  reason text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique check (length(idempotency_key) between 8 and 240)
);

create index distributor_onboarding_events_timeline_idx
  on public.distributor_onboarding_events(distributor_id, occurred_at desc);

create table public.distributor_onboarding_outbox (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  invitation_id uuid references public.distributor_onboarding_invitations(id) on delete restrict,
  event_type text not null check (event_type in ('auth_invite', 'lifecycle_email', 'revoke_sessions')),
  payload jsonb not null default '{}'::jsonb,
  status public.distributor_onboarding_outbox_status not null default 'pending',
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 8 check (max_attempts between 1 and 20),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by uuid,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  idempotency_key text not null unique check (length(idempotency_key) between 8 and 240)
);

create index distributor_onboarding_outbox_claim_idx
  on public.distributor_onboarding_outbox(status, available_at, created_at)
  where status in ('pending', 'failed');

create table public.distributor_onboarding_documents (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  invitation_id uuid references public.distributor_onboarding_invitations(id) on delete set null,
  document_type text not null check (document_type in ('tax_form', 'distribution_agreement')),
  object_path text not null unique,
  original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  byte_size integer not null check (byte_size between 1 and 10485760),
  status public.distributor_onboarding_document_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  completed_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  rejected_at timestamptz,
  rejected_by uuid references auth.users(id),
  rejection_reason text,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique check (length(idempotency_key) between 8 and 240)
);

create unique index distributor_onboarding_one_current_document_idx
  on public.distributor_onboarding_documents(distributor_id, document_type)
  where status in ('submitted', 'complete', 'approved');
create index distributor_onboarding_documents_distributor_idx
  on public.distributor_onboarding_documents(distributor_id, submitted_at desc);

create table public.distributor_onboarding_payment_profiles (
  distributor_id uuid primary key references public.distributor_accounts(id) on delete restrict,
  provider text not null,
  provider_account_reference text not null,
  provider_status text not null check (provider_status in ('pending', 'configured', 'failed', 'disabled')),
  account_last4 text check (account_last4 is null or account_last4 ~ '^[0-9A-Za-z]{4}$'),
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id),
  last_provider_event_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table public.distributor_onboarding_reconciliation_issues (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null check (issue_type in ('auth_orphan', 'profile_orphan', 'ambiguous_legacy_state', 'invite_without_profile')),
  distributor_id uuid references public.distributor_accounts(id) on delete restrict,
  auth_user_id uuid references auth.users(id) on delete restrict,
  email text,
  detected_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved', 'ignored')),
  details jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  resolution text,
  unique (issue_type, distributor_id, auth_user_id, email)
);

-- Historical accounts receive an audit-safe invitation record. This preserves
-- evidence without sending mail or creating/deleting Auth users.
insert into public.distributor_onboarding_invitations(
  distributor_id, email, auth_user_id, status, invited_by, created_at, updated_at,
  sent_at, expires_at, accepted_at, password_configured_at, approved_at, activated_at,
  revoked_at, suspended_at, metadata, idempotency_key
)
select
  account.id,
  account.email,
  account.user_id,
  case
    when account.onboarding_status = 'revoked' then 'revoked'::public.distributor_invitation_delivery_status
    when account.email_accepted_at is not null then 'accepted'::public.distributor_invitation_delivery_status
    else 'sent'::public.distributor_invitation_delivery_status
  end,
  account.created_by,
  account.created_at,
  account.updated_at,
  account.invited_at,
  greatest(account.created_at + interval '72 hours', now()),
  account.email_accepted_at,
  account.password_configured_at,
  account.approved_at,
  account.activated_at,
  account.revoked_at,
  account.suspended_at,
  jsonb_build_object('backfilled', true, 'manual_review_required', account.status = 'pending'),
  'legacy:' || account.id::text
from public.distributor_accounts account;

insert into public.distributor_onboarding_events(
  distributor_id, invitation_id, from_state, to_state, event_type, actor_id,
  source, reason, occurred_at, metadata, idempotency_key
)
select
  account.id,
  invitation.id,
  null,
  account.onboarding_status,
  'legacy_distributor_backfilled',
  account.updated_by,
  'migration',
  'Preserved from legacy distributor account status.',
  account.updated_at,
  account.onboarding_metadata,
  'legacy-state:' || account.id::text
from public.distributor_accounts account
join public.distributor_onboarding_invitations invitation on invitation.distributor_id = account.id;

insert into public.distributor_onboarding_reconciliation_issues(
  issue_type, distributor_id, auth_user_id, email, details
)
select
  'ambiguous_legacy_state', account.id, account.user_id, account.email,
  jsonb_build_object(
    'legacy_status', account.status,
    'mapped_state', account.onboarding_status,
    'instruction', 'Confirm acceptance, documents, and payment before approval or activation.'
  )
from public.distributor_accounts account
where account.status = 'pending';

insert into public.distributor_onboarding_reconciliation_issues(
  issue_type, auth_user_id, email, details
)
select
  'auth_orphan', auth_user.id, lower(auth_user.email),
  jsonb_build_object(
    'distributor_invited', true,
    'instruction', 'Review manually; do not delete this historical Auth user automatically.'
  )
from auth.users auth_user
where coalesce((auth_user.raw_user_meta_data ->> 'distributor_invited')::boolean, false)
  and not exists (
    select 1 from public.distributor_accounts account where account.user_id = auth_user.id
  );

insert into public.distributor_onboarding_reconciliation_issues(
  issue_type, distributor_id, email, details
)
select
  'profile_orphan', account.id, account.email,
  jsonb_build_object(
    'onboarding_status', account.onboarding_status,
    'instruction', 'Link a verified Auth user through the recoverable invitation processor.'
  )
from public.distributor_accounts account
where account.user_id is null;

create or replace function public.distributor_onboarding_events_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'distributor onboarding events are immutable';
end
$$;

create trigger protect_distributor_onboarding_events
before update or delete on public.distributor_onboarding_events
for each row execute function public.distributor_onboarding_events_immutable();

create or replace function public.portal_onboarding_distributor_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select account.id
  from public.distributor_accounts account
  where account.user_id = (select auth.uid())
    and account.onboarding_status not in ('revoked', 'rejected', 'suspended')
  limit 1
$$;

create or replace function public.portal_distributor_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select account.id
  from public.distributor_accounts account
  where account.user_id = (select auth.uid())
    and account.onboarding_status = 'active'
    and account.status = 'active'
  limit 1
$$;

create or replace function public.distributor_onboarding_state_can_transition(
  from_state public.distributor_onboarding_state,
  to_state public.distributor_onboarding_state,
  transition_source text
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when from_state = to_state then false
    when transition_source = 'system' then (from_state, to_state) in (
      ('draft', 'invite_pending'),
      ('invite_pending', 'invited'),
      ('invited', 'expired')
    )
    when transition_source = 'distributor' then (from_state, to_state) in (
      ('invited', 'email_accepted'),
      ('email_accepted', 'documents_complete')
    )
    when transition_source = 'provider' then (from_state, to_state) in (
      ('documents_complete', 'payment_configured')
    )
    when transition_source = 'admin' then (from_state, to_state) in (
      ('payment_configured', 'approved'),
      ('approved', 'active'),
      ('suspended', 'active'),
      ('expired', 'invite_pending'),
      ('invited', 'invite_pending'),
      ('draft', 'rejected'),
      ('invite_pending', 'rejected'),
      ('invited', 'rejected'),
      ('email_accepted', 'rejected'),
      ('documents_complete', 'rejected'),
      ('payment_configured', 'rejected'),
      ('approved', 'rejected'),
      ('invite_pending', 'revoked'),
      ('invited', 'revoked'),
      ('email_accepted', 'revoked'),
      ('documents_complete', 'revoked'),
      ('payment_configured', 'revoked'),
      ('approved', 'revoked'),
      ('active', 'revoked'),
      ('active', 'suspended'),
      ('approved', 'suspended')
    )
    else false
  end
$$;

create or replace function public.distributor_onboarding_apply_state(
  target_distributor_id uuid,
  target_state public.distributor_onboarding_state,
  transition_source text,
  transition_event text,
  transition_reason text,
  transition_actor uuid,
  transition_idempotency_key text,
  transition_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_state public.distributor_onboarding_state;
  current_invitation_id uuid;
  event_id uuid;
begin
  select onboarding_status into current_state
  from public.distributor_accounts
  where id = target_distributor_id
  for update;

  if current_state is null then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'distributor_not_found');
  end if;

  select id into current_invitation_id
  from public.distributor_onboarding_invitations
  where distributor_id = target_distributor_id
  order by created_at desc
  limit 1;

  if exists (
    select 1 from public.distributor_onboarding_events where idempotency_key = transition_idempotency_key
  ) then
    return jsonb_build_object('outcome', 'already_completed', 'state', current_state);
  end if;

  if not public.distributor_onboarding_state_can_transition(current_state, target_state, transition_source) then
    return jsonb_build_object(
      'outcome', case when current_state = target_state then 'already_completed' else 'blocked' end,
      'state', current_state,
      'reason', case when current_state = target_state then 'already_in_state' else 'invalid_transition' end
    );
  end if;

  update public.distributor_accounts
  set
    onboarding_status = target_state,
    status = case
      when target_state = 'active' then 'active'::public.distributor_account_status
      when target_state = 'suspended' then 'suspended'::public.distributor_account_status
      when target_state in ('revoked', 'rejected') then 'archived'::public.distributor_account_status
      else 'pending'::public.distributor_account_status
    end,
    invited_at = case when target_state = 'invited' then now() else invited_at end,
    email_accepted_at = case when target_state = 'email_accepted' then now() else email_accepted_at end,
    documents_completed_at = case when target_state = 'documents_complete' then now() else documents_completed_at end,
    payment_configured_at = case when target_state = 'payment_configured' then now() else payment_configured_at end,
    approved_at = case when target_state = 'approved' then now() else approved_at end,
    approved_by = case when target_state = 'approved' then transition_actor else approved_by end,
    activated_at = case when target_state = 'active' then now() else activated_at end,
    activated_by = case when target_state = 'active' then transition_actor else activated_by end,
    revoked_at = case when target_state = 'revoked' then now() else revoked_at end,
    rejected_at = case when target_state = 'rejected' then now() else rejected_at end,
    suspended_at = case when target_state = 'suspended' then now() else suspended_at end,
    status_reason = transition_reason,
    updated_by = transition_actor,
    updated_at = now()
  where id = target_distributor_id;

  update public.distributor_onboarding_invitations
  set
    accepted_at = case when target_state = 'email_accepted' then now() else accepted_at end,
    documents_completed_at = case when target_state = 'documents_complete' then now() else documents_completed_at end,
    payment_configured_at = case when target_state = 'payment_configured' then now() else payment_configured_at end,
    approved_at = case when target_state = 'approved' then now() else approved_at end,
    approved_by = case when target_state = 'approved' then transition_actor else approved_by end,
    activated_at = case when target_state = 'active' then now() else activated_at end,
    activated_by = case when target_state = 'active' then transition_actor else activated_by end,
    revoked_at = case when target_state = 'revoked' then now() else revoked_at end,
    revoked_by = case when target_state = 'revoked' then transition_actor else revoked_by end,
    rejected_at = case when target_state = 'rejected' then now() else rejected_at end,
    rejected_by = case when target_state = 'rejected' then transition_actor else rejected_by end,
    suspended_at = case when target_state = 'suspended' then now() else suspended_at end,
    suspended_by = case when target_state = 'suspended' then transition_actor else suspended_by end,
    reason = transition_reason,
    status = case
      when target_state = 'email_accepted' then 'accepted'::public.distributor_invitation_delivery_status
      when target_state = 'expired' then 'expired'::public.distributor_invitation_delivery_status
      when target_state in ('revoked', 'rejected') then 'revoked'::public.distributor_invitation_delivery_status
      else status
    end,
    updated_at = now()
  where id = current_invitation_id;

  insert into public.distributor_onboarding_events(
    distributor_id, invitation_id, from_state, to_state, event_type, actor_id,
    source, reason, metadata, idempotency_key
  ) values (
    target_distributor_id, current_invitation_id, current_state, target_state,
    transition_event, transition_actor, transition_source, transition_reason,
    coalesce(transition_metadata, '{}'::jsonb), transition_idempotency_key
  ) returning id into event_id;

  return jsonb_build_object('outcome', 'completed', 'state', target_state, 'event_id', event_id);
end
$$;

create or replace function public.admin_begin_distributor_invitation(
  distributor_name text,
  distributor_email text,
  distributor_code text,
  preferred_language text,
  operation_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  normalized_email text := lower(trim(distributor_email));
  normalized_code text := upper(trim(distributor_code));
  account_id uuid;
  invitation_id uuid;
  event_id uuid;
begin
  if actor is null or not public.portal_is_admin() then
    raise exception 'administrator permission required';
  end if;
  if nullif(trim(distributor_name), '') is null then raise exception 'display name required'; end if;
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid email'; end if;
  if normalized_code !~ '^[A-Z0-9][A-Z0-9_-]{2,31}$' then raise exception 'invalid referral code'; end if;
  if preferred_language not in ('English', 'Spanish') then raise exception 'invalid preferred language'; end if;
  if length(operation_idempotency_key) not between 8 and 200 then raise exception 'invalid idempotency key'; end if;

  select distributor_id into account_id
  from public.distributor_onboarding_invitations
  where idempotency_key = operation_idempotency_key;
  if account_id is not null then
    select id into invitation_id from public.distributor_onboarding_invitations where idempotency_key = operation_idempotency_key;
    return jsonb_build_object('outcome', 'already_completed', 'distributor_id', account_id, 'invitation_id', invitation_id);
  end if;

  if exists(select 1 from public.distributor_accounts where lower(email) = normalized_email) then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'email_already_registered');
  end if;
  if exists(select 1 from public.distributor_accounts where referral_code = normalized_code) then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'referral_code_already_registered');
  end if;

  insert into public.distributor_accounts(
    user_id, email, display_name, referral_code, status, onboarding_status,
    preferred_language, commission_rate_bps, customer_discount_rate_bps,
    customer_discount_max_cents, customer_discount_enabled,
    customer_discount_first_order_only, created_by, updated_by
  ) values (
    null, normalized_email, trim(distributor_name), normalized_code, 'pending', 'draft',
    preferred_language, 2500, 500, 2500, true, true, actor, actor
  ) returning id into account_id;

  insert into public.distributor_onboarding_invitations(
    distributor_id, email, invited_by, status, metadata, idempotency_key
  ) values (
    account_id, normalized_email, actor, 'pending',
    jsonb_build_object('source', 'admin_portal', 'preferred_language', preferred_language),
    operation_idempotency_key
  ) returning id into invitation_id;

  insert into public.distributor_onboarding_events(
    distributor_id, invitation_id, from_state, to_state, event_type, actor_id,
    source, metadata, idempotency_key
  ) values (
    account_id, invitation_id, null, 'draft', 'distributor_draft_created', actor,
    'admin', jsonb_build_object('referral_code', normalized_code),
    operation_idempotency_key || ':draft'
  ) returning id into event_id;

  perform public.distributor_onboarding_apply_state(
    account_id, 'invite_pending', 'system', 'invitation_queued', null, actor,
    operation_idempotency_key || ':queued', '{}'::jsonb
  );

  insert into public.distributor_onboarding_outbox(
    distributor_id, invitation_id, event_type, payload, idempotency_key
  ) values (
    account_id, invitation_id, 'auth_invite',
    jsonb_build_object('invitation_id', invitation_id, 'delivery_kind', 'initial'),
    operation_idempotency_key || ':auth-invite'
  );

  return jsonb_build_object(
    'outcome', 'pending',
    'distributor_id', account_id,
    'invitation_id', invitation_id,
    'event_id', event_id
  );
end
$$;

create or replace function public.admin_queue_distributor_invitation_resend(
  target_distributor_id uuid,
  operation_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  invitation_record public.distributor_onboarding_invitations%rowtype;
  state_record public.distributor_onboarding_state;
begin
  if actor is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  select * into invitation_record
  from public.distributor_onboarding_invitations
  where distributor_id = target_distributor_id
  order by created_at desc limit 1 for update;
  if invitation_record.id is null then return jsonb_build_object('outcome', 'blocked', 'reason', 'invitation_not_found'); end if;
  if invitation_record.last_resend_at is not null and invitation_record.last_resend_at > now() - interval '10 minutes' then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'resend_cooldown');
  end if;
  if invitation_record.resend_count >= 20 then return jsonb_build_object('outcome', 'blocked', 'reason', 'resend_limit'); end if;
  if exists(select 1 from public.distributor_onboarding_outbox where idempotency_key = operation_idempotency_key) then
    return jsonb_build_object('outcome', 'already_completed', 'invitation_id', invitation_record.id);
  end if;

  select onboarding_status into state_record from public.distributor_accounts where id = target_distributor_id;
  if state_record not in ('invited', 'expired') then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'state_not_resendable', 'state', state_record);
  end if;

  if state_record <> 'invited' then
    perform public.distributor_onboarding_apply_state(
      target_distributor_id, 'invite_pending', 'admin', 'invitation_resend_queued', null,
      actor, operation_idempotency_key || ':state', '{}'::jsonb
    );
  end if;

  update public.distributor_onboarding_invitations
  set status = 'pending', last_resend_at = now(), resend_count = resend_count + 1,
      expires_at = now() + interval '72 hours', last_error = null, updated_at = now()
  where id = invitation_record.id;

  insert into public.distributor_onboarding_outbox(
    distributor_id, invitation_id, event_type, payload, idempotency_key
  ) values (
    target_distributor_id, invitation_record.id, 'auth_invite',
    jsonb_build_object('invitation_id', invitation_record.id, 'delivery_kind', 'resend'),
    operation_idempotency_key
  );

  return jsonb_build_object('outcome', 'pending', 'invitation_id', invitation_record.id);
end
$$;

create or replace function public.distributor_accept_invitation(operation_idempotency_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  account_id uuid;
  invitation_id uuid;
  confirmed_at timestamptz;
begin
  if actor is null then raise exception 'authentication required'; end if;
  select account.id, invitation.id, auth_user.email_confirmed_at
    into account_id, invitation_id, confirmed_at
  from public.distributor_accounts account
  join public.distributor_onboarding_invitations invitation
    on invitation.distributor_id = account.id and invitation.auth_user_id = actor
  join auth.users auth_user on auth_user.id = actor
  where account.user_id = actor
  order by invitation.created_at desc limit 1;
  if account_id is null then return jsonb_build_object('outcome', 'blocked', 'reason', 'invitation_not_linked'); end if;
  if confirmed_at is null then return jsonb_build_object('outcome', 'blocked', 'reason', 'email_not_confirmed'); end if;
  return public.distributor_onboarding_apply_state(
    account_id, 'email_accepted', 'distributor', 'invitation_email_accepted', null,
    actor, operation_idempotency_key, jsonb_build_object('invitation_id', invitation_id)
  );
end
$$;

create or replace function public.distributor_record_password_configured(operation_idempotency_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  account_id uuid;
  invitation_id uuid;
begin
  if actor is null then raise exception 'authentication required'; end if;
  if not exists(select 1 from auth.users where id = actor and nullif(encrypted_password, '') is not null) then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'password_not_configured');
  end if;
  select account.id, invitation.id into account_id, invitation_id
  from public.distributor_accounts account
  join public.distributor_onboarding_invitations invitation on invitation.distributor_id = account.id
  where account.user_id = actor and invitation.auth_user_id = actor
  order by invitation.created_at desc limit 1;
  if account_id is null then return jsonb_build_object('outcome', 'blocked', 'reason', 'invitation_not_linked'); end if;
  if exists(select 1 from public.distributor_onboarding_events where idempotency_key = operation_idempotency_key) then
    return jsonb_build_object('outcome', 'already_completed');
  end if;
  update public.distributor_accounts set password_configured_at = now(), updated_at = now() where id = account_id;
  update public.distributor_onboarding_invitations set password_configured_at = now(), updated_at = now() where id = invitation_id;
  insert into public.distributor_onboarding_events(
    distributor_id, invitation_id, from_state, to_state, event_type, actor_id,
    source, idempotency_key
  ) select account.id, invitation_id, account.onboarding_status, account.onboarding_status,
    'password_configured', actor, 'distributor', operation_idempotency_key
    from public.distributor_accounts account where account.id = account_id;
  return jsonb_build_object('outcome', 'completed');
end
$$;

create or replace function public.distributor_register_onboarding_document(
  document_kind text,
  storage_object_path text,
  source_filename text,
  source_mime_type text,
  source_byte_size integer,
  operation_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  account_id uuid;
  invitation_id uuid;
  document_id uuid;
  current_state public.distributor_onboarding_state;
  required_complete boolean;
begin
  if actor is null then raise exception 'authentication required'; end if;
  select account.id, account.onboarding_status, invitation.id
    into account_id, current_state, invitation_id
  from public.distributor_accounts account
  join public.distributor_onboarding_invitations invitation on invitation.distributor_id = account.id
  where account.user_id = actor and invitation.auth_user_id = actor
  order by invitation.created_at desc limit 1;
  if account_id is null or current_state not in ('email_accepted', 'documents_complete') then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'onboarding_state_not_ready');
  end if;
  if not exists(select 1 from public.distributor_accounts where id = account_id and password_configured_at is not null) then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'password_required');
  end if;
  if document_kind not in ('tax_form', 'distribution_agreement') then raise exception 'invalid document type'; end if;
  if source_mime_type not in ('application/pdf', 'image/jpeg', 'image/png') then raise exception 'invalid document mime type'; end if;
  if source_byte_size not between 1 and 10485760 then raise exception 'invalid document size'; end if;
  if storage_object_path !~ ('^' || account_id::text || '/[0-9a-f-]+/[^/]+$') then raise exception 'invalid document path'; end if;
  if not exists(
    select 1 from storage.objects object
    where object.bucket_id = 'distributor-onboarding-private' and object.name = storage_object_path
  ) then return jsonb_build_object('outcome', 'pending', 'reason', 'storage_object_not_visible'); end if;
  if exists(select 1 from public.distributor_onboarding_documents where idempotency_key = operation_idempotency_key) then
    select id into document_id from public.distributor_onboarding_documents where idempotency_key = operation_idempotency_key;
    return jsonb_build_object('outcome', 'already_completed', 'document_id', document_id);
  end if;

  update public.distributor_onboarding_documents
  set status = 'rejected', rejected_at = now(), rejected_by = actor,
      rejection_reason = 'Superseded by distributor upload.'
  where distributor_id = account_id and document_type = document_kind and status in ('submitted', 'complete');

  insert into public.distributor_onboarding_documents(
    distributor_id, invitation_id, document_type, object_path, original_filename,
    mime_type, byte_size, status, completed_at, metadata, idempotency_key
  ) values (
    account_id, invitation_id, document_kind, storage_object_path, left(source_filename, 240),
    source_mime_type, source_byte_size, 'complete', now(),
    jsonb_build_object('validation', 'mime_size_path_and_storage_presence'), operation_idempotency_key
  ) returning id into document_id;

  insert into public.distributor_onboarding_events(
    distributor_id, invitation_id, from_state, to_state, event_type, actor_id,
    source, metadata, idempotency_key
  ) values (
    account_id, invitation_id, current_state, current_state, 'document_completed', actor,
    'distributor', jsonb_build_object('document_id', document_id, 'document_type', document_kind),
    operation_idempotency_key || ':event'
  );

  select count(distinct document_type) = 2 into required_complete
  from public.distributor_onboarding_documents
  where distributor_id = account_id
    and document_type in ('tax_form', 'distribution_agreement')
    and status in ('complete', 'approved');

  if required_complete and current_state = 'email_accepted' then
    perform public.distributor_onboarding_apply_state(
      account_id, 'documents_complete', 'distributor', 'required_documents_complete', null,
      actor, operation_idempotency_key || ':state', '{}'::jsonb
    );
  end if;

  return jsonb_build_object('outcome', 'completed', 'document_id', document_id, 'all_required_complete', required_complete);
end
$$;

create or replace function public.admin_review_distributor_document(
  target_document_id uuid,
  review_decision text,
  review_reason text,
  operation_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  document_record public.distributor_onboarding_documents%rowtype;
begin
  if actor is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if review_decision not in ('approved', 'rejected') then raise exception 'invalid review decision'; end if;
  if review_decision = 'rejected' and nullif(trim(review_reason), '') is null then raise exception 'rejection reason required'; end if;
  if exists(select 1 from public.distributor_onboarding_events where idempotency_key = operation_idempotency_key) then
    return jsonb_build_object('outcome', 'already_completed');
  end if;
  select * into document_record from public.distributor_onboarding_documents where id = target_document_id for update;
  if document_record.id is null then return jsonb_build_object('outcome', 'blocked', 'reason', 'document_not_found'); end if;
  if document_record.status not in ('complete', 'approved') and review_decision = 'approved' then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'document_not_complete');
  end if;
  update public.distributor_onboarding_documents
  set status = review_decision::public.distributor_onboarding_document_status,
      approved_at = case when review_decision = 'approved' then now() else null end,
      approved_by = case when review_decision = 'approved' then actor else null end,
      rejected_at = case when review_decision = 'rejected' then now() else null end,
      rejected_by = case when review_decision = 'rejected' then actor else null end,
      rejection_reason = case when review_decision = 'rejected' then trim(review_reason) else null end
  where id = target_document_id;
  insert into public.distributor_onboarding_events(
    distributor_id, invitation_id, from_state, to_state, event_type, actor_id,
    source, reason, metadata, idempotency_key
  ) select account.id, document_record.invitation_id, account.onboarding_status, account.onboarding_status,
    'document_' || review_decision, actor, 'admin', nullif(trim(review_reason), ''),
    jsonb_build_object('document_id', target_document_id, 'document_type', document_record.document_type),
    operation_idempotency_key
  from public.distributor_accounts account where account.id = document_record.distributor_id;
  return jsonb_build_object('outcome', 'completed');
end
$$;

create or replace function public.admin_confirm_distributor_payment_configuration(
  target_distributor_id uuid,
  payment_provider text,
  provider_account_reference text,
  account_last_four text,
  operation_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  current_state public.distributor_onboarding_state;
begin
  if actor is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if nullif(trim(payment_provider), '') is null or nullif(trim(provider_account_reference), '') is null then
    raise exception 'provider confirmation required';
  end if;
  if account_last_four is not null and account_last_four !~ '^[0-9A-Za-z]{4}$' then raise exception 'invalid account last four'; end if;
  if exists(select 1 from public.distributor_onboarding_events where idempotency_key = operation_idempotency_key) then
    return jsonb_build_object('outcome', 'already_completed');
  end if;
  select onboarding_status into current_state from public.distributor_accounts where id = target_distributor_id;
  if current_state <> 'documents_complete' then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'documents_not_complete', 'state', current_state);
  end if;
  if (
    select count(distinct document_type)
    from public.distributor_onboarding_documents document
    where document.distributor_id = target_distributor_id
      and document.document_type in ('tax_form', 'distribution_agreement')
      and document.status in ('complete', 'approved')
  ) <> 2 then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'documents_not_complete');
  end if;
  insert into public.distributor_onboarding_payment_profiles(
    distributor_id, provider, provider_account_reference, provider_status,
    account_last4, confirmed_at, confirmed_by, last_provider_event_at, metadata
  ) values (
    target_distributor_id, trim(payment_provider), trim(provider_account_reference), 'configured',
    nullif(account_last_four, ''), now(), actor, now(), jsonb_build_object('confirmation_source', 'admin_provider_verification')
  ) on conflict (distributor_id) do update set
    provider = excluded.provider,
    provider_account_reference = excluded.provider_account_reference,
    provider_status = 'configured',
    account_last4 = excluded.account_last4,
    confirmed_at = now(),
    confirmed_by = actor,
    last_provider_event_at = now(),
    last_error = null,
    updated_at = now();

  update public.distributor_accounts
  set payout_provider = trim(payment_provider),
      payout_account_reference = trim(provider_account_reference),
      updated_by = actor, updated_at = now()
  where id = target_distributor_id;

  return public.distributor_onboarding_apply_state(
    target_distributor_id, 'payment_configured', 'provider', 'payment_provider_confirmed', null,
    actor, operation_idempotency_key, jsonb_build_object('provider', trim(payment_provider), 'last4', nullif(account_last_four, ''))
  );
end
$$;

create or replace function public.admin_transition_distributor_onboarding(
  target_distributor_id uuid,
  requested_action text,
  action_reason text,
  operation_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  target_state public.distributor_onboarding_state;
  current_state public.distributor_onboarding_state;
  transition_result jsonb;
  event_kind text;
begin
  if actor is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if requested_action in ('revoke', 'reject', 'suspend') and nullif(trim(action_reason), '') is null then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'reason_required');
  end if;
  target_state := case requested_action
    when 'approve' then 'approved'::public.distributor_onboarding_state
    when 'activate' then 'active'::public.distributor_onboarding_state
    when 'reactivate' then 'active'::public.distributor_onboarding_state
    when 'revoke' then 'revoked'::public.distributor_onboarding_state
    when 'reject' then 'rejected'::public.distributor_onboarding_state
    when 'suspend' then 'suspended'::public.distributor_onboarding_state
    else null
  end;
  if target_state is null then raise exception 'invalid onboarding action'; end if;
  select onboarding_status into current_state from public.distributor_accounts where id = target_distributor_id;
  if requested_action = 'approve' and (
    not exists(
      select 1 from public.distributor_onboarding_payment_profiles payment
      where payment.distributor_id = target_distributor_id and payment.provider_status = 'configured'
    ) or (
      select count(distinct document_type) from public.distributor_onboarding_documents document
      where document.distributor_id = target_distributor_id
        and document.document_type in ('tax_form', 'distribution_agreement')
        and document.status = 'approved'
    ) <> 2
  ) then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'documents_or_payment_not_approved');
  end if;

  event_kind := 'distributor_' || requested_action;
  transition_result := public.distributor_onboarding_apply_state(
    target_distributor_id, target_state, 'admin', event_kind, nullif(trim(action_reason), ''),
    actor, operation_idempotency_key, '{}'::jsonb
  );
  if transition_result ->> 'outcome' <> 'completed' then return transition_result; end if;

  insert into public.distributor_onboarding_outbox(
    distributor_id, invitation_id, event_type, payload, idempotency_key
  )
  select target_distributor_id, invitation.id, 'lifecycle_email',
    jsonb_build_object('template', requested_action, 'reason', nullif(trim(action_reason), '')),
    operation_idempotency_key || ':email'
  from public.distributor_onboarding_invitations invitation
  where invitation.distributor_id = target_distributor_id
  order by invitation.created_at desc limit 1
  on conflict (idempotency_key) do nothing;

  if requested_action in ('revoke', 'suspend') then
    insert into public.distributor_onboarding_outbox(
      distributor_id, invitation_id, event_type, payload, idempotency_key
    )
    select target_distributor_id, invitation.id, 'revoke_sessions', '{}'::jsonb,
      operation_idempotency_key || ':sessions'
    from public.distributor_onboarding_invitations invitation
    where invitation.distributor_id = target_distributor_id
    order by invitation.created_at desc limit 1
    on conflict (idempotency_key) do nothing;
  end if;

  return transition_result || jsonb_build_object('delivery', 'pending');
end
$$;

create or replace function public.admin_update_distributor_commercial_terms(
  target_distributor_id uuid,
  distributor_name text,
  distributor_code text,
  rate_bps integer,
  discount_rate_bps integer,
  discount_max_cents integer,
  discount_enabled boolean,
  discount_first_order_only boolean,
  operation_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare actor uuid := (select auth.uid());
begin
  if actor is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if nullif(trim(distributor_name), '') is null then raise exception 'display name required'; end if;
  if upper(trim(distributor_code)) !~ '^[A-Z0-9][A-Z0-9_-]{2,31}$' then raise exception 'invalid referral code'; end if;
  if rate_bps not between 0 and 10000 or discount_rate_bps not between 0 and 10000 or discount_max_cents < 0 then
    raise exception 'invalid commercial terms';
  end if;
  if exists(select 1 from public.distributor_onboarding_events where idempotency_key = operation_idempotency_key) then
    return jsonb_build_object('outcome', 'already_completed');
  end if;
  update public.distributor_accounts set
    display_name = trim(distributor_name), referral_code = upper(trim(distributor_code)),
    commission_rate_bps = rate_bps, customer_discount_rate_bps = discount_rate_bps,
    customer_discount_max_cents = discount_max_cents,
    customer_discount_enabled = discount_enabled,
    customer_discount_first_order_only = discount_first_order_only,
    updated_by = actor, updated_at = now()
  where id = target_distributor_id;
  if not found then return jsonb_build_object('outcome', 'blocked', 'reason', 'distributor_not_found'); end if;
  insert into public.distributor_onboarding_events(
    distributor_id, from_state, to_state, event_type, actor_id, source, metadata, idempotency_key
  ) select account.id, account.onboarding_status, account.onboarding_status,
    'commercial_terms_updated', actor, 'admin',
    jsonb_build_object('referral_code', account.referral_code, 'commission_rate_bps', account.commission_rate_bps),
    operation_idempotency_key
  from public.distributor_accounts account where account.id = target_distributor_id;
  return jsonb_build_object('outcome', 'completed');
end
$$;

create or replace function public.service_claim_distributor_onboarding_outbox(worker_id uuid, batch_size integer default 10)
returns setof public.distributor_onboarding_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) <> 'service_role' then raise exception 'service role required'; end if;
  return query
  with claimed as (
    select outbox.id
    from public.distributor_onboarding_outbox outbox
    where outbox.status in ('pending', 'failed')
      and outbox.available_at <= now()
      and outbox.attempts < outbox.max_attempts
    order by outbox.created_at
    for update skip locked
    limit greatest(1, least(batch_size, 25))
  )
  update public.distributor_onboarding_outbox outbox
  set status = 'processing', attempts = attempts + 1,
      locked_at = now(), locked_by = worker_id, updated_at = now()
  from claimed
  where outbox.id = claimed.id
  returning outbox.*;
end
$$;

create or replace function public.service_complete_distributor_onboarding_outbox(
  target_outbox_id uuid,
  worker_id uuid,
  succeeded boolean,
  failure_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare exhausted boolean;
begin
  if (select auth.role()) <> 'service_role' then raise exception 'service role required'; end if;
  select attempts >= max_attempts into exhausted
  from public.distributor_onboarding_outbox
  where id = target_outbox_id and locked_by = worker_id and status = 'processing';
  if exhausted is null then return jsonb_build_object('outcome', 'already_completed'); end if;
  update public.distributor_onboarding_outbox
  set status = case when succeeded then 'completed'::public.distributor_onboarding_outbox_status
                    when exhausted then 'blocked'::public.distributor_onboarding_outbox_status
                    else 'failed'::public.distributor_onboarding_outbox_status end,
      processed_at = case when succeeded then now() else null end,
      last_error = case when succeeded then null else left(coalesce(failure_message, 'unknown failure'), 1000) end,
      available_at = case when succeeded or exhausted then available_at
                          else now() + make_interval(secs => least(3600, (power(2, attempts)::integer * 30))) end,
      locked_at = null, locked_by = null, updated_at = now()
  where id = target_outbox_id and locked_by = worker_id and status = 'processing';
  return jsonb_build_object('outcome', case when succeeded then 'completed' when exhausted then 'blocked' else 'pending' end);
end
$$;

create or replace function public.service_link_distributor_auth_user(
  target_invitation_id uuid,
  target_auth_user_id uuid,
  reference_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_record public.distributor_onboarding_invitations%rowtype;
  auth_email text;
begin
  if (select auth.role()) <> 'service_role' then raise exception 'service role required'; end if;
  select * into invitation_record from public.distributor_onboarding_invitations where id = target_invitation_id for update;
  if invitation_record.id is null then return jsonb_build_object('outcome', 'blocked', 'reason', 'invitation_not_found'); end if;
  select lower(email) into auth_email from auth.users where id = target_auth_user_id;
  if auth_email is null or auth_email <> invitation_record.email then
    return jsonb_build_object('outcome', 'blocked', 'reason', 'auth_email_mismatch');
  end if;
  if exists(
    select 1 from public.distributor_accounts
    where user_id = target_auth_user_id and id <> invitation_record.distributor_id
  ) then return jsonb_build_object('outcome', 'blocked', 'reason', 'auth_user_already_linked'); end if;
  update public.distributor_accounts
  set user_id = target_auth_user_id, updated_at = now()
  where id = invitation_record.distributor_id
    and (user_id is null or user_id = target_auth_user_id);
  if not found then return jsonb_build_object('outcome', 'blocked', 'reason', 'profile_link_conflict'); end if;
  update public.distributor_onboarding_invitations
  set auth_user_id = target_auth_user_id, token_reference_hash = reference_hash,
      status = 'processing', last_error = null, updated_at = now()
  where id = target_invitation_id;
  return jsonb_build_object('outcome', 'completed', 'distributor_id', invitation_record.distributor_id);
end
$$;

create or replace function public.service_mark_distributor_invitation_delivery(
  target_invitation_id uuid,
  succeeded boolean,
  failure_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_record public.distributor_onboarding_invitations%rowtype;
  transition_result jsonb;
begin
  if (select auth.role()) <> 'service_role' then raise exception 'service role required'; end if;
  select * into invitation_record from public.distributor_onboarding_invitations where id = target_invitation_id for update;
  if invitation_record.id is null then return jsonb_build_object('outcome', 'blocked', 'reason', 'invitation_not_found'); end if;
  if not succeeded then
    update public.distributor_onboarding_invitations
    set status = 'failed', last_error = left(coalesce(failure_message, 'delivery failed'), 1000), updated_at = now()
    where id = target_invitation_id;
    update public.distributor_accounts
    set onboarding_metadata = onboarding_metadata || jsonb_build_object('last_invitation_error', left(coalesce(failure_message, 'delivery failed'), 1000)),
        updated_at = now()
    where id = invitation_record.distributor_id;
    return jsonb_build_object('outcome', 'pending');
  end if;
  update public.distributor_onboarding_invitations
  set status = 'sent', sent_at = now(), expires_at = now() + interval '72 hours',
      last_error = null, updated_at = now()
  where id = target_invitation_id;
  select public.distributor_onboarding_apply_state(
    invitation_record.distributor_id, 'invited', 'system', 'invitation_delivered', null,
    null, 'delivery:' || target_invitation_id::text || ':' || extract(epoch from now())::bigint::text,
    '{}'::jsonb
  ) into transition_result;
  return transition_result;
end
$$;

create or replace function public.service_revoke_distributor_sessions(target_distributor_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
  removed_count integer;
begin
  if (select auth.role()) <> 'service_role' then raise exception 'service role required'; end if;
  select user_id into target_user_id from public.distributor_accounts where id = target_distributor_id;
  if target_user_id is null then return jsonb_build_object('outcome', 'already_completed'); end if;
  delete from auth.sessions where user_id = target_user_id;
  get diagnostics removed_count = row_count;
  return jsonb_build_object('outcome', 'completed', 'sessions_removed', removed_count);
end
$$;

create or replace function public.service_expire_distributor_invitations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_record record;
  expired_count integer := 0;
begin
  if (select auth.role()) <> 'service_role' then raise exception 'service role required'; end if;
  for invitation_record in
    select invitation.id, invitation.distributor_id
    from public.distributor_onboarding_invitations invitation
    join public.distributor_accounts account on account.id = invitation.distributor_id
    where invitation.status = 'sent' and invitation.expires_at <= now()
      and account.onboarding_status = 'invited'
    for update of invitation skip locked
  loop
    perform public.distributor_onboarding_apply_state(
      invitation_record.distributor_id, 'expired', 'system', 'invitation_expired', null,
      null, 'expired:' || invitation_record.id::text, '{}'::jsonb
    );
    expired_count := expired_count + 1;
  end loop;
  return expired_count;
end
$$;

create view public.distributor_onboarding_admin_v
with (security_invoker = true)
as
select
  account.id as distributor_id,
  account.display_name,
  account.email,
  account.referral_code,
  account.onboarding_status,
  account.status as account_status,
  account.preferred_language,
  account.created_at,
  account.invited_at,
  account.email_accepted_at,
  account.password_configured_at,
  account.documents_completed_at,
  account.payment_configured_at,
  account.approved_at,
  account.activated_at,
  account.revoked_at,
  account.rejected_at,
  account.suspended_at,
  account.status_reason,
  invitation.id as invitation_id,
  invitation.status as invitation_status,
  invitation.sent_at,
  invitation.expires_at,
  invitation.last_resend_at,
  invitation.resend_count,
  invitation.last_error as invitation_error,
  outbox.attempts as outbox_attempts,
  outbox.status as outbox_status,
  outbox.last_error as outbox_error,
  coalesce(document_stats.complete_count, 0)::integer as documents_complete_count,
  coalesce(document_stats.approved_count, 0)::integer as documents_approved_count,
  payment.provider as payment_provider,
  payment.provider_status as payment_status,
  payment.account_last4 as payment_last4,
  payment.confirmed_at as payment_confirmed_at
from public.distributor_accounts account
left join lateral (
  select source.* from public.distributor_onboarding_invitations source
  where source.distributor_id = account.id order by source.created_at desc limit 1
) invitation on true
left join lateral (
  select source.attempts, source.status, source.last_error
  from public.distributor_onboarding_outbox source
  where source.distributor_id = account.id
  order by source.created_at desc limit 1
) outbox on true
left join lateral (
  select
    count(*) filter (where status in ('complete', 'approved')) as complete_count,
    count(*) filter (where status = 'approved') as approved_count
  from public.distributor_onboarding_documents source where source.distributor_id = account.id
) document_stats on true
left join public.distributor_onboarding_payment_profiles payment on payment.distributor_id = account.id;

create view public.distributor_onboarding_reconciliation_v
with (security_invoker = true)
as
select
  issue.id, issue.issue_type, issue.distributor_id, issue.auth_user_id, issue.email,
  issue.detected_at, issue.status, issue.details, issue.reviewed_at, issue.reviewed_by,
  issue.resolution
from public.distributor_onboarding_reconciliation_issues issue;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values (
  'distributor-onboarding-private', 'distributor-onboarding-private', false, 10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.distributor_onboarding_invitations enable row level security;
alter table public.distributor_onboarding_events enable row level security;
alter table public.distributor_onboarding_outbox enable row level security;
alter table public.distributor_onboarding_documents enable row level security;
alter table public.distributor_onboarding_payment_profiles enable row level security;
alter table public.distributor_onboarding_reconciliation_issues enable row level security;

drop policy if exists "distributors read own account" on public.distributor_accounts;
create policy "distributors read own account" on public.distributor_accounts
for select to authenticated
using (user_id = (select auth.uid()) or public.portal_is_admin());

create policy "onboarding invitations own or admin read"
on public.distributor_onboarding_invitations for select to authenticated
using (auth_user_id = (select auth.uid()) or public.portal_is_admin());

create policy "onboarding events own or admin read"
on public.distributor_onboarding_events for select to authenticated
using (
  public.portal_is_admin() or distributor_id = (select public.portal_onboarding_distributor_id())
);

create policy "onboarding documents own or admin read"
on public.distributor_onboarding_documents for select to authenticated
using (
  public.portal_is_admin() or distributor_id = (select public.portal_onboarding_distributor_id())
);

create policy "onboarding payment own or admin read"
on public.distributor_onboarding_payment_profiles for select to authenticated
using (
  public.portal_is_admin() or distributor_id = (select public.portal_onboarding_distributor_id())
);

create policy "admins read distributor onboarding outbox"
on public.distributor_onboarding_outbox for select to authenticated
using (public.portal_is_admin());

create policy "admins read distributor reconciliation issues"
on public.distributor_onboarding_reconciliation_issues for select to authenticated
using (public.portal_is_admin());

drop policy if exists "distributors upload own onboarding documents" on storage.objects;
create policy "distributors upload own onboarding documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'distributor-onboarding-private'
  and exists (
    select 1 from public.distributor_accounts account
    where account.id::text = (storage.foldername(name))[1]
      and account.user_id = (select auth.uid())
      and account.onboarding_status in ('email_accepted', 'documents_complete')
  )
);

drop policy if exists "distributors read own onboarding documents" on storage.objects;
create policy "distributors read own onboarding documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'distributor-onboarding-private'
  and (
    (storage.foldername(name))[1] = (select public.portal_onboarding_distributor_id())::text
    or public.portal_is_admin()
  )
);

drop policy if exists "distributors delete replaceable onboarding documents" on storage.objects;
create policy "distributors delete replaceable onboarding documents"
on storage.objects for delete to authenticated
using (
  bucket_id = 'distributor-onboarding-private'
  and exists (
    select 1 from public.distributor_accounts account
    where account.id::text = (storage.foldername(name))[1]
      and account.user_id = (select auth.uid())
      and account.onboarding_status in ('email_accepted', 'documents_complete')
  )
  and not exists (
    select 1 from public.distributor_onboarding_documents document
    where document.object_path = storage.objects.name and document.status = 'approved'
  )
);

drop policy if exists "admins manage onboarding documents" on storage.objects;
create policy "admins manage onboarding documents"
on storage.objects for all to authenticated
using (bucket_id = 'distributor-onboarding-private' and public.portal_is_admin())
with check (bucket_id = 'distributor-onboarding-private' and public.portal_is_admin());

revoke all on function public.distributor_onboarding_events_immutable() from public, anon, authenticated;
revoke all on function public.portal_onboarding_distributor_id() from public, anon;
revoke all on function public.portal_distributor_id() from public, anon;
revoke all on function public.distributor_onboarding_state_can_transition(public.distributor_onboarding_state, public.distributor_onboarding_state, text) from public, anon, authenticated;
revoke all on function public.distributor_onboarding_apply_state(uuid, public.distributor_onboarding_state, text, text, text, uuid, text, jsonb) from public, anon, authenticated;
revoke all on function public.admin_begin_distributor_invitation(text, text, text, text, text) from public, anon;
revoke all on function public.admin_queue_distributor_invitation_resend(uuid, text) from public, anon;
revoke all on function public.distributor_accept_invitation(text) from public, anon;
revoke all on function public.distributor_record_password_configured(text) from public, anon;
revoke all on function public.distributor_register_onboarding_document(text, text, text, text, integer, text) from public, anon;
revoke all on function public.admin_review_distributor_document(uuid, text, text, text) from public, anon;
revoke all on function public.admin_confirm_distributor_payment_configuration(uuid, text, text, text, text) from public, anon;
revoke all on function public.admin_transition_distributor_onboarding(uuid, text, text, text) from public, anon;
revoke all on function public.admin_update_distributor_commercial_terms(uuid, text, text, integer, integer, integer, boolean, boolean, text) from public, anon;
revoke all on function public.service_claim_distributor_onboarding_outbox(uuid, integer) from public, anon, authenticated;
revoke all on function public.service_complete_distributor_onboarding_outbox(uuid, uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.service_link_distributor_auth_user(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.service_mark_distributor_invitation_delivery(uuid, boolean, text) from public, anon, authenticated;
revoke all on function public.service_revoke_distributor_sessions(uuid) from public, anon, authenticated;
revoke all on function public.service_expire_distributor_invitations() from public, anon, authenticated;
revoke all on function public.admin_upsert_distributor(uuid, text, text, integer, public.distributor_account_status, integer, integer, boolean, boolean) from anon, authenticated;

grant execute on function public.portal_onboarding_distributor_id() to authenticated;
grant execute on function public.portal_distributor_id() to authenticated;
grant execute on function public.admin_begin_distributor_invitation(text, text, text, text, text) to authenticated;
grant execute on function public.admin_queue_distributor_invitation_resend(uuid, text) to authenticated;
grant execute on function public.distributor_accept_invitation(text) to authenticated;
grant execute on function public.distributor_record_password_configured(text) to authenticated;
grant execute on function public.distributor_register_onboarding_document(text, text, text, text, integer, text) to authenticated;
grant execute on function public.admin_review_distributor_document(uuid, text, text, text) to authenticated;
grant execute on function public.admin_confirm_distributor_payment_configuration(uuid, text, text, text, text) to authenticated;
grant execute on function public.admin_transition_distributor_onboarding(uuid, text, text, text) to authenticated;
grant execute on function public.admin_update_distributor_commercial_terms(uuid, text, text, integer, integer, integer, boolean, boolean, text) to authenticated;
grant execute on function public.service_claim_distributor_onboarding_outbox(uuid, integer) to service_role;
grant execute on function public.service_complete_distributor_onboarding_outbox(uuid, uuid, boolean, text) to service_role;
grant execute on function public.service_link_distributor_auth_user(uuid, uuid, text) to service_role;
grant execute on function public.service_mark_distributor_invitation_delivery(uuid, boolean, text) to service_role;
grant execute on function public.service_revoke_distributor_sessions(uuid) to service_role;
grant execute on function public.service_expire_distributor_invitations() to service_role;

revoke all on public.distributor_onboarding_invitations, public.distributor_onboarding_events,
  public.distributor_onboarding_outbox, public.distributor_onboarding_documents,
  public.distributor_onboarding_payment_profiles, public.distributor_onboarding_reconciliation_issues
from anon, authenticated;
grant select on public.distributor_onboarding_invitations, public.distributor_onboarding_events,
  public.distributor_onboarding_outbox, public.distributor_onboarding_documents,
  public.distributor_onboarding_payment_profiles, public.distributor_onboarding_reconciliation_issues
to authenticated;
grant select, insert, update, delete on public.distributor_onboarding_invitations,
  public.distributor_onboarding_outbox, public.distributor_onboarding_documents,
  public.distributor_onboarding_payment_profiles, public.distributor_onboarding_reconciliation_issues
to service_role;
grant select, insert on public.distributor_onboarding_events to service_role;
grant select on public.distributor_onboarding_admin_v, public.distributor_onboarding_reconciliation_v to authenticated, service_role;

comment on table public.distributor_onboarding_outbox is
  'Durable server work. Payloads contain references only; invitation links, tokens, passwords, and service credentials are never stored.';
comment on table public.distributor_onboarding_events is
  'Append-only distributor onboarding state and operational audit trail.';
comment on table public.distributor_onboarding_payment_profiles is
  'Minimal payout-provider confirmation metadata; no bank account or card number is stored.';
