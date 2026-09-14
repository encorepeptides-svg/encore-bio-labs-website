-- Stop requiring body-composition measurements to complete a client intake.
--
-- The portal no longer collects height, starting weight, current weight, waist,
-- or an appetite rating: on a research-use-only catalog those fields record a
-- human's body composition and the pharmacological effect of a GLP-1, which is
-- outcome tracking rather than laboratory work.
--
-- `portal_client_intake_is_complete` gates BOTH `submit_portal_onboarding` and
-- the `require_complete_intake_before_activation` trigger, so it has to drop
-- those five checks in the same change that removes the fields from the UI.
-- Leaving them here would make every new signup permanently incomplete and
-- silently block auto-approval.
--
-- The columns themselves are intentionally NOT dropped. Rows written while the
-- fields were collected still hold real values and the admin portal has to be
-- able to read them — the same reasoning that keeps `local_chihuahua` and
-- `import_fee_cents` in place. Purging that stored data is a separate decision.

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
      and cardinality(intake.goals) > 0
      and cardinality(intake.research_interests) > 0
      and cardinality(intake.interested_products) > 0
      and length(btrim(coalesce(intake.activity_level, ''))) > 0
      and length(btrim(coalesce(intake.exercise_frequency, ''))) > 0
      and intake.average_sleep_hours > 0
      and intake.average_sleep_hours <= 24
      and intake.water_consistency between 1 and 5
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

-- Clients parked as incomplete only because they were missing the dropped
-- measurements can be returned to review; the new definition is the authority.
update public.client_statuses status
  set status = 'pending_review',
      status_reason = null,
      updated_at = now()
  where status.status = 'onboarding_incomplete'
    and public.portal_client_intake_is_complete(status.user_id);
