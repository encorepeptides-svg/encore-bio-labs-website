-- Direct portal registration policy
--
-- A client is activated automatically after verifying their email, completing
-- the required intake and consents, and selecting at least one product of
-- interest. Human review is reserved for identity conflicts, existing account
-- holds, or a prior staff decision.

alter table public.portal_onboarding_evaluations
  drop constraint if exists portal_onboarding_evaluations_matched_source_check;

alter table public.portal_onboarding_evaluations
  add constraint portal_onboarding_evaluations_matched_source_check
  check (matched_source in ('invitation', 'public_intake', 'paid_order', 'direct_signup', 'unmatched'));

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
  matched_source text := 'direct_signup';
  review_flags text[] := '{}';
  intake_complete boolean := false;
  product_interest boolean := false;
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

  intake_complete := public.portal_client_intake_is_complete(target_user_id);
  select cardinality(coalesce(intake.interested_products, '{}'::text[])) > 0
    into product_interest
    from public.onboarding_profiles intake
    where intake.user_id = target_user_id;

  if not intake_complete or not coalesce(product_interest, false) then
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

  select invitation.id
    into invitation_id
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
  elsif public_intake_match then
    matched_source := 'public_intake';
  elsif paid_order_match then
    matched_source := 'paid_order';
  end if;

  -- Matching and shipping information remain useful audit evidence, but they
  -- no longer create routine approval work for a completed, verified signup.
  auto_approve := cardinality(review_flags) = 0;

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
      notification_body := 'Tu correo y registro están verificados. Ya puedes usar el portal para clientes.';
    else
      notification_title := 'Your Encore portal account is active';
      notification_body := 'Your email and onboarding are verified. You can now use the client portal.';
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
        'intake_complete', intake_complete,
        'product_interest', product_interest,
        'invitation_id', invitation_id,
        'paid_order_match', paid_order_match,
        'shipping_review_match', shipping_review_match
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

revoke all on function public.evaluate_portal_onboarding(uuid) from public, anon, authenticated, service_role;

-- Reconfirm the only public entrypoint: a signed-in client can submit their own
-- completed onboarding, which then invokes the private evaluator above.
revoke all on function public.submit_portal_onboarding() from public, anon, service_role;
grant execute on function public.submit_portal_onboarding() to authenticated;
