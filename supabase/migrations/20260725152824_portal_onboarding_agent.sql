-- Encore Bio Labs portal onboarding agent
-- Production migration version synchronized with the connected Supabase project.
--
-- Automatically activates verified, fully onboarded clients when their account
-- is matched to a trusted invitation, claimed intake, or paid order. Only
-- exceptions remain in the administrator review queue. Every decision is
-- server-authoritative, explainable, and retained for audit.

create table if not exists public.portal_invitations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  email text not null check (length(btrim(email)) between 3 and 254),
  preferred_language text not null default 'English'
    check (preferred_language in ('English', 'Spanish')),
  approval_mode text not null default 'automatic'
    check (approval_mode in ('automatic', 'manual')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  auth_user_id uuid references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists portal_invitations_pending_email_uidx
  on public.portal_invitations(lower(email))
  where status = 'pending';
create unique index if not exists portal_invitations_auth_user_uidx
  on public.portal_invitations(auth_user_id)
  where auth_user_id is not null;
create index if not exists portal_invitations_created_by_idx
  on public.portal_invitations(created_by, created_at desc);

create table if not exists public.portal_onboarding_evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  outcome text not null check (outcome in ('auto_approved', 'manual_review')),
  matched_source text not null
    check (matched_source in ('invitation', 'public_intake', 'paid_order', 'unmatched')),
  flags text[] not null default '{}',
  evidence jsonb not null default '{}'::jsonb
);

create index if not exists portal_onboarding_evaluations_user_created_idx
  on public.portal_onboarding_evaluations(user_id, created_at desc);
create index if not exists portal_onboarding_evaluations_manual_review_idx
  on public.portal_onboarding_evaluations(created_at desc)
  where outcome = 'manual_review';

alter table public.portal_invitations enable row level security;
alter table public.portal_onboarding_evaluations enable row level security;

drop policy if exists "admins read portal invitations" on public.portal_invitations;
create policy "admins read portal invitations"
  on public.portal_invitations for select to authenticated
  using ((select public.portal_is_admin()));

drop policy if exists "clients read own onboarding evaluations" on public.portal_onboarding_evaluations;
create policy "clients read own onboarding evaluations"
  on public.portal_onboarding_evaluations for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.portal_is_admin())
  );

-- New public-schema tables may require explicit Data API grants. Writes remain
-- restricted to the decision function and the server-side invitation handler.
revoke all on public.portal_invitations, public.portal_onboarding_evaluations from anon, authenticated, service_role;
grant select on public.portal_invitations, public.portal_onboarding_evaluations to authenticated;
grant select, insert, update on public.portal_invitations to service_role;
grant select, insert on public.portal_onboarding_evaluations to service_role;

create or replace function public.evaluate_portal_onboarding(target_user_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  verified_email text;
  profile_email text;
  current_status public.client_account_status;
  prior_decision_at timestamptz;
  prior_decision_by uuid;
  invitation_id uuid;
  invitation_mode text;
  matched_source text := 'unmatched';
  review_flags text[] := '{}';
  paid_order_match boolean := false;
  storefront_paid_order_match boolean := false;
  shipping_review_match boolean := false;
  public_intake_match boolean := false;
  auto_approve boolean := false;
  client_language text := 'english';
  notification_title text;
  notification_body text;
begin
  if auth.uid() is null or auth.uid() <> target_user_id then
    raise exception 'account owner authorization required';
  end if;

  select lower(btrim(coalesce(users.email, '')))
    into verified_email
    from auth.users users
    where users.id = target_user_id
      and users.email_confirmed_at is not null;

  if coalesce(verified_email, '') = '' then
    review_flags := array_append(review_flags, 'email_unverified');
  end if;

  select lower(btrim(coalesce(profile.email, ''))),
         lower(coalesce(profile.preferred_language, 'english'))
    into profile_email, client_language
    from public.profiles profile
    where profile.id = target_user_id;

  if coalesce(profile_email, '') = '' or profile_email <> coalesce(verified_email, '') then
    review_flags := array_append(review_flags, 'identity_mismatch');
  end if;

  if not public.portal_client_intake_is_complete(target_user_id) then
    review_flags := array_append(review_flags, 'intake_incomplete');
  end if;

  select status into current_status
    from public.client_statuses
    where user_id = target_user_id
    for update;

  if current_status in ('suspended', 'archived') then
    review_flags := array_append(review_flags, 'account_hold');
  end if;

  select decision_at, decision_by
    into prior_decision_at, prior_decision_by
    from public.onboarding_profiles
    where user_id = target_user_id;

  if prior_decision_at is not null or prior_decision_by is not null then
    review_flags := array_append(review_flags, 'prior_staff_review');
  end if;

  select exists (
    select 1
    from public.portal_orders portal_order
    where portal_order.user_id = target_user_id
      and portal_order.payment_status = 'paid'
      and portal_order.deleted_at is null
  ) into paid_order_match;

  -- The storefront and CRM live in some deployments but not others. Dynamic
  -- checks keep the core portal agent deployable while still using those
  -- trusted matches whenever the optional tables are available.
  if to_regclass('public.storefront_orders') is not null then
    begin
      execute $query$
        select exists (
          select 1 from public.storefront_orders storefront_order
          where storefront_order.status = 'paid'
            and lower(btrim(storefront_order.contact ->> 'email')) = $1
        )
      $query$ using coalesce(verified_email, '') into storefront_paid_order_match;

      execute $query$
        select exists (
          select 1 from public.storefront_orders storefront_order
          where storefront_order.status = 'paid'
            and storefront_order.shipping_review_required = true
            and lower(btrim(storefront_order.contact ->> 'email')) = $1
        )
      $query$ using coalesce(verified_email, '') into shipping_review_match;
    exception when undefined_table or undefined_column then
      storefront_paid_order_match := false;
      shipping_review_match := false;
    end;
  end if;
  paid_order_match := paid_order_match or storefront_paid_order_match;

  if to_regclass('public.crm_leads') is not null then
    begin
      execute $query$
        select exists (
          select 1 from public.crm_leads lead
          where lead.portal_user_id = $1
            and lower(btrim(lead.email)) = $2
        )
      $query$ using target_user_id, coalesce(verified_email, '') into public_intake_match;
    exception when undefined_table or undefined_column then
      public_intake_match := false;
    end;
  end if;

  select invitation.id, invitation.approval_mode
    into invitation_id, invitation_mode
    from public.portal_invitations invitation
    where invitation.status = 'pending'
      and invitation.expires_at > now()
      and (
        invitation.auth_user_id = target_user_id
        or (
          invitation.auth_user_id is null
          and lower(btrim(invitation.email)) = coalesce(verified_email, '')
        )
      )
    order by invitation.created_at desc
    limit 1;

  if invitation_id is not null then
    matched_source := 'invitation';
    if invitation_mode = 'manual' then
      review_flags := array_append(review_flags, 'manual_invitation');
    end if;
  elsif public_intake_match then
    matched_source := 'public_intake';
  elsif paid_order_match then
    matched_source := 'paid_order';
  end if;

  if shipping_review_match then
    review_flags := array_append(review_flags, 'shipping_review_required');
  end if;
  if matched_source = 'unmatched' then
    review_flags := array_append(review_flags, 'unmatched_signup');
  end if;

  auto_approve := cardinality(review_flags) = 0 and matched_source <> 'unmatched';

  if invitation_id is not null then
    update public.portal_invitations
      set status = 'accepted',
          accepted_by = target_user_id,
          accepted_at = now(),
          auth_user_id = coalesce(auth_user_id, target_user_id)
      where id = invitation_id;
  end if;

  if auto_approve then
    update public.onboarding_profiles
      set decision = 'approved',
          decision_at = now(),
          decision_by = null,
          updated_at = now()
      where user_id = target_user_id;

    update public.client_statuses
      set status = 'active',
          status_reason = null,
          updated_at = now(),
          updated_by = null
      where user_id = target_user_id;

    if client_language like 'spanish%' or client_language like 'es%' then
      notification_title := 'Tu cuenta del portal Encore está activa';
      notification_body := 'Verificamos automáticamente tu registro y ya puedes usar el portal para clientes.';
    else
      notification_title := 'Your Encore portal account is active';
      notification_body := 'Your verified onboarding was approved automatically, and you can now use the client portal.';
    end if;

    insert into public.notifications(user_id, type, title, body, action_path, metadata)
      values(
        target_user_id,
        'application_decision',
        notification_title,
        notification_body,
        '/portal',
        jsonb_build_object('decision', 'approved', 'decision_mode', 'automatic')
      );
  end if;

  insert into public.portal_onboarding_evaluations(user_id, outcome, matched_source, flags, evidence)
    values(
      target_user_id,
      case when auto_approve then 'auto_approved' else 'manual_review' end,
      matched_source,
      review_flags,
      jsonb_build_object(
        'email_verified', coalesce(verified_email, '') <> '',
        'intake_complete', public.portal_client_intake_is_complete(target_user_id),
        'invitation_id', invitation_id,
        'paid_order_match', paid_order_match
      )
    );

  insert into public.audit_logs(actor_id, actor_role, event_type, resource_type, resource_id, success, metadata)
    values(
      target_user_id,
      'client',
      case when auto_approve
        then 'portal_onboarding_auto_approved'
        else 'portal_onboarding_manual_review_queued'
      end,
      'onboarding_profile',
      target_user_id,
      true,
      jsonb_build_object('matched_source', matched_source, 'flags', to_jsonb(review_flags))
    );

  return case when auto_approve then 'auto_approved' else 'manual_review' end;
end;
$$;

revoke all on function public.evaluate_portal_onboarding(uuid) from public, anon, authenticated;

-- Keep the existing public RPC contract while replacing the manual-only queue
-- handoff with the deterministic decision agent.
create or replace function public.submit_portal_onboarding()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if not public.portal_client_intake_is_complete(auth.uid()) then
    raise exception 'complete client intake required';
  end if;

  update public.onboarding_profiles
    set submitted_at = now(),
        updated_at = now(),
        decision = 'pending'
    where user_id = auth.uid() and submitted_at is null;

  if not found then
    raise exception 'onboarding is already submitted';
  end if;

  update public.client_statuses
    set status = 'pending_review', status_reason = null, updated_at = now()
    where user_id = auth.uid() and status = 'onboarding_incomplete';

  perform public.evaluate_portal_onboarding(auth.uid());

  insert into public.audit_logs(actor_id,actor_role,event_type,resource_type,resource_id,success)
    values(auth.uid(),'client','account_submitted','onboarding_profile',auth.uid(),true);
end;
$$;

revoke all on function public.submit_portal_onboarding() from public, anon;
grant execute on function public.submit_portal_onboarding() to authenticated;
