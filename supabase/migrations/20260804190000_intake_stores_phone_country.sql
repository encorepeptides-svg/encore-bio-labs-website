-- The public intake never asked which country a phone number belonged to, and
-- submit_public_intake hard-coded 'United States' for every lead. Mexican and US
-- mobile numbers are both 10 digits, so an operator opening WhatsApp from a
-- stored number was dialling +1 against numbers that were mostly +52 — a valid
-- number, wrong person.
--
-- The form now asks. This teaches the RPC to store the answer, falling back to
-- the old hard-coded value so a client running the previous bundle keeps working
-- through the deploy.

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
  submitted_country text := btrim(coalesce(submission ->> 'country', ''));
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

  -- Only the markets Encore actually ships to. An unrecognized value falls back
  -- rather than raising, so a stale client cannot start failing submissions.
  if submitted_country not in ('Mexico', 'United States') then
    submitted_country := 'United States';
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
    submitted_country,
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
