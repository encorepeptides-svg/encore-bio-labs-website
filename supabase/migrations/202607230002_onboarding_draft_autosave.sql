-- Per-account, optimistic-concurrency-protected onboarding draft autosave.

alter table public.onboarding_profiles
  add column if not exists draft_data jsonb,
  add column if not exists draft_current_step integer check (draft_current_step between 0 and 7),
  add column if not exists draft_saved_at timestamptz,
  add column if not exists draft_completed_at timestamptz;

create or replace function public.save_portal_onboarding_draft(
  draft jsonb,
  current_step integer,
  known_saved_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.onboarding_profiles%rowtype;
  saved_at timestamptz;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if current_step < 0 or current_step > 7 then raise exception 'invalid onboarding step'; end if;
  if pg_catalog.pg_column_size(draft) > 262144 then raise exception 'onboarding draft is too large'; end if;

  select * into existing from public.onboarding_profiles where user_id = auth.uid() for update;
  if not found then
    saved_at := clock_timestamp();
    insert into public.onboarding_profiles(user_id, draft_data, draft_current_step, draft_saved_at)
    values(auth.uid(), draft, current_step, saved_at);
    return jsonb_build_object('status', 'saved', 'saved_at', saved_at);
  end if;
  if existing.submitted_at is not null then
    return jsonb_build_object('status', 'completed', 'saved_at', existing.draft_saved_at);
  end if;
  if existing.draft_saved_at is not null and existing.draft_saved_at is distinct from known_saved_at then
    return jsonb_build_object('status', 'stale', 'saved_at', existing.draft_saved_at);
  end if;

  saved_at := clock_timestamp();
  update public.onboarding_profiles
    set draft_data = draft,
        draft_current_step = current_step,
        draft_saved_at = saved_at,
        draft_completed_at = null,
        updated_at = saved_at
  where user_id = auth.uid();
  return jsonb_build_object('status', 'saved', 'saved_at', saved_at);
end;
$$;

revoke all on function public.save_portal_onboarding_draft(jsonb, integer, timestamptz) from public;
grant execute on function public.save_portal_onboarding_draft(jsonb, integer, timestamptz) to authenticated;

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
        decision = 'pending',
        draft_completed_at = now(),
        draft_data = null
    where user_id = auth.uid() and submitted_at is null;

  update public.client_statuses
    set status = 'pending_review', status_reason = null, updated_at = now()
    where user_id = auth.uid() and status = 'onboarding_incomplete';

  insert into public.audit_logs(actor_id,actor_role,event_type,resource_type,resource_id,success)
    values(auth.uid(),'client','account_submitted','onboarding_profile',auth.uid(),true);
end;
$$;

revoke all on function public.submit_portal_onboarding() from public;
grant execute on function public.submit_portal_onboarding() to authenticated;
