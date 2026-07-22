-- Require a fully completed client intake before review or active portal access.

create or replace function public.portal_client_intake_is_complete(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    join public.onboarding_profiles intake on intake.user_id = profile.id
    where profile.id = target_user_id
      and length(btrim(profile.legal_name)) > 0
      and length(btrim(profile.mobile)) > 0
      and length(btrim(profile.preferred_language)) > 0
      and length(btrim(profile.time_zone)) > 0
      and intake.date_of_birth is not null
      and intake.height_cm > 0
      and intake.starting_weight_kg > 0
      and intake.current_weight_kg > 0
      and intake.waist_cm > 0
      and cardinality(intake.goals) > 0
      and cardinality(intake.research_interests) > 0
      and cardinality(intake.interested_products) > 0
      and length(btrim(coalesce(intake.activity_level, ''))) > 0
      and length(btrim(coalesce(intake.exercise_frequency, ''))) > 0
      and intake.average_sleep_hours > 0
      and intake.average_sleep_hours <= 24
      and intake.water_consistency between 1 and 5
      and intake.appetite_rating between 1 and 5
      and intake.energy_rating between 1 and 5
      and intake.stress_rating between 1 and 5
      and intake.wellness_rating between 1 and 5
      and (
        intake.communication_preferences ->> 'email' = 'true'
        or intake.communication_preferences ->> 'portal' = 'true'
        or intake.communication_preferences ->> 'orders' = 'true'
        or intake.communication_preferences ->> 'checkins' = 'true'
        or intake.communication_preferences ->> 'documents' = 'true'
        or intake.communication_preferences ->> 'support' = 'true'
      )
      and (
        select count(distinct version.consent_key)
        from public.consent_acceptances acceptance
        join public.consent_versions version on version.id = acceptance.consent_version_id
        where acceptance.user_id = target_user_id
          and acceptance.active = true
          and acceptance.withdrawn_at is null
          and length(btrim(acceptance.signature_value)) > 0
          and version.active = true
          and version.consent_key in (
            'terms',
            'privacy',
            'research_use_only',
            'no_medical_advice',
            'electronic_communications',
            'progress_data'
          )
      ) = 6
  );
$$;

revoke all on function public.portal_client_intake_is_complete(uuid) from public;

create or replace function public.submit_portal_onboarding()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;
  if not public.portal_client_intake_is_complete(auth.uid()) then
    raise exception 'complete client intake required';
  end if;

  update public.onboarding_profiles
    set submitted_at = now(), updated_at = now(), decision = 'pending'
    where user_id = auth.uid() and submitted_at is null;

  update public.client_statuses
    set status = 'pending_review', status_reason = null, updated_at = now()
    where user_id = auth.uid() and status = 'onboarding_incomplete';

  insert into public.audit_logs(actor_id, actor_role, event_type, resource_type, resource_id, success)
    values(auth.uid(), 'client', 'account_submitted', 'onboarding_profile', auth.uid(), true);
end;
$$;

revoke all on function public.submit_portal_onboarding() from public;
grant execute on function public.submit_portal_onboarding() to authenticated;

create or replace function public.enforce_complete_intake_before_activation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active' and not public.portal_client_intake_is_complete(new.user_id) then
    raise exception 'complete client intake required before activation';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_complete_intake_before_activation() from public;

drop trigger if exists require_complete_intake_before_activation on public.client_statuses;
create trigger require_complete_intake_before_activation
  before insert or update of status on public.client_statuses
  for each row
  execute function public.enforce_complete_intake_before_activation();

-- Existing active or pending clients must finish the same required intake before
-- regaining portal access. This prevents legacy partial records from bypassing the rule.
update public.onboarding_profiles intake
  set submitted_at = null,
      decision = 'corrections_requested',
      decision_at = now(),
      updated_at = now()
  where not public.portal_client_intake_is_complete(intake.user_id)
    and exists (
      select 1 from public.client_statuses status
      where status.user_id = intake.user_id
        and status.status in ('active', 'pending_review')
    );

update public.client_statuses status
  set status = 'onboarding_incomplete',
      status_reason = 'Complete all required intake fields before portal access.',
      updated_at = now()
  where status.status in ('active', 'pending_review')
    and not public.portal_client_intake_is_complete(status.user_id);
