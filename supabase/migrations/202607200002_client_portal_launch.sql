-- Encore Bio Labs client portal — launch completion
--
-- Completes the server-authoritative client journey on top of the Phase 1
-- tables: verified-email status sync, transactional staff application review,
-- transactional support-thread creation, query indexes, and a private assigned
-- document bucket. No privileged action trusts browser-supplied roles.

-- A newly verified email must be able to proceed to onboarding. The Phase 1
-- insert trigger only sees the unverified state at account creation time.
create or replace function public.sync_portal_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.client_statuses
      set status = 'onboarding_incomplete', updated_at = now(), status_reason = null
      where user_id = new.id and status = 'unverified';

    insert into public.security_events(user_id, event_type, success, metadata)
      values(new.id, 'email_verified', true, jsonb_build_object('source', 'auth_trigger'));
  end if;
  return new;
end;
$$;

drop trigger if exists on_portal_email_confirmed on auth.users;
create trigger on_portal_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.sync_portal_email_confirmation();

-- Repair accounts confirmed before this trigger existed.
update public.client_statuses statuses
  set status = 'onboarding_incomplete', updated_at = now(), status_reason = null
  from auth.users users
  where users.id = statuses.user_id
    and users.email_confirmed_at is not null
    and statuses.status = 'unverified';

-- Staff application decisions update the application and account atomically.
create or replace function public.review_portal_application(
  target_user_id uuid,
  application_result public.application_decision,
  decision_reason text default ''
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_status public.client_account_status;
  notification_title text;
  notification_body text;
  client_language text;
begin
  if auth.uid() is null or not public.portal_is_admin() then
    raise exception 'administrator authorization required';
  end if;
  if application_result not in ('approved', 'rejected', 'corrections_requested') then
    raise exception 'unsupported application decision';
  end if;
  if application_result <> 'approved' and length(btrim(decision_reason)) < 3 then
    raise exception 'a decision reason is required';
  end if;
  if not exists (
    select 1 from public.onboarding_profiles
    where user_id = target_user_id and submitted_at is not null
  ) then
    raise exception 'submitted application not found';
  end if;

  next_status := case application_result
    when 'approved' then 'active'::public.client_account_status
    when 'corrections_requested' then 'onboarding_incomplete'::public.client_account_status
    else 'suspended'::public.client_account_status
  end;
  select lower(coalesce(preferred_language, 'english'))
    into client_language
    from public.profiles
    where id = target_user_id;

  if client_language like 'spanish%' or client_language like 'es%' then
    notification_title := case application_result
      when 'approved' then 'Tu cuenta del portal Encore está activa'
      when 'corrections_requested' then 'Tu solicitud necesita una actualización'
      else 'Hay una decisión sobre tu solicitud'
    end;
    notification_body := case application_result
      when 'approved' then 'Ya puedes usar el portal autenticado para clientes.'
      when 'corrections_requested' then 'Inicia sesión para revisar, actualizar y reenviar tu información.'
      else 'Comunícate con soporte de cuentas de Encore si tienes preguntas sobre esta decisión.'
    end;
  else
    notification_title := case application_result
      when 'approved' then 'Your Encore portal account is active'
      when 'corrections_requested' then 'Your application needs an update'
      else 'Application decision available'
    end;
    notification_body := case application_result
      when 'approved' then 'You can now use the authenticated client portal.'
      when 'corrections_requested' then 'Sign in to review, update, and resubmit your information.'
      else 'Contact Encore account support if you have questions about this decision.'
    end;
  end if;

  update public.onboarding_profiles
    set decision = application_result,
        decision_at = now(),
        decision_by = auth.uid(),
        updated_at = now(),
        submitted_at = case
          when application_result = 'corrections_requested' then null
          else submitted_at
        end
    where user_id = target_user_id;

  update public.client_statuses
    set status = next_status,
        status_reason = nullif(btrim(decision_reason), ''),
        updated_at = now(),
        updated_by = auth.uid()
    where user_id = target_user_id;

  insert into public.notifications(user_id, type, title, body, action_path, metadata)
    values(
      target_user_id,
      'application_decision',
      notification_title,
      notification_body,
      case application_result
        when 'approved' then '/portal'
        when 'corrections_requested' then '/portal/intake'
        else '/portal/support'
      end,
      jsonb_build_object('decision', application_result)
    );

  insert into public.audit_logs(actor_id, actor_role, event_type, resource_type, resource_id, success, metadata)
    values(
      auth.uid(),
      'admin',
      'portal_application_reviewed',
      'onboarding_profile',
      target_user_id,
      true,
      jsonb_build_object('decision', application_result, 'reason_provided', length(btrim(decision_reason)) > 0)
    );
end;
$$;

revoke all on function public.review_portal_application(uuid, public.application_decision, text) from public;
grant execute on function public.review_portal_application(uuid, public.application_decision, text) to authenticated;

-- Create the thread and its first message in one transaction so an empty or
-- partially created support request cannot be left behind.
create or replace function public.create_portal_support_thread(
  thread_subject text,
  thread_category text,
  initial_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_thread_id uuid;
begin
  if auth.uid() is null or not public.portal_is_active_client() then
    raise exception 'active client account required';
  end if;
  if length(btrim(thread_subject)) < 3 or length(btrim(thread_subject)) > 160 then
    raise exception 'subject must contain 3 to 160 characters';
  end if;
  if length(btrim(initial_message)) < 3 or length(btrim(initial_message)) > 5000 then
    raise exception 'message must contain 3 to 5000 characters';
  end if;
  if thread_category not in ('account', 'order', 'document', 'technical', 'other') then
    raise exception 'unsupported support category';
  end if;

  insert into public.support_threads(user_id, category, subject)
    values(auth.uid(), thread_category, btrim(thread_subject))
    returning id into created_thread_id;

  insert into public.support_messages(thread_id, author_id, message)
    values(created_thread_id, auth.uid(), btrim(initial_message));

  insert into public.audit_logs(actor_id, actor_role, event_type, resource_type, resource_id, success)
    values(auth.uid(), 'client', 'support_thread_created', 'support_thread', created_thread_id, true);

  return created_thread_id;
end;
$$;

revoke all on function public.create_portal_support_thread(text, text, text) from public;
grant execute on function public.create_portal_support_thread(text, text, text) to authenticated;

drop policy if exists "admins update support threads" on public.support_threads;
create policy "admins update support threads" on public.support_threads
  for update to authenticated
  using (public.portal_is_admin())
  with check (public.portal_is_admin());

create or replace function public.touch_portal_support_thread()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.support_threads
    set updated_at = now(),
        status = case
          when status = 'closed' then status
          when user_id = new.author_id then 'open'
          else 'waiting_on_client'
        end
    where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists on_portal_support_message_created on public.support_messages;
create trigger on_portal_support_message_created
  after insert on public.support_messages
  for each row execute function public.touch_portal_support_thread();

-- Common authenticated query paths.
create index if not exists progress_entries_user_date_idx
  on public.progress_entries(user_id, entry_date desc) where deleted_at is null;
create index if not exists weekly_checkins_user_week_idx
  on public.weekly_checkins(user_id, week_start desc);
create index if not exists portal_orders_user_created_idx
  on public.portal_orders(user_id, created_at desc) where deleted_at is null;
create index if not exists document_assignments_user_created_idx
  on public.document_assignments(user_id, created_at desc) where revoked_at is null;
create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);
create index if not exists support_threads_user_updated_idx
  on public.support_threads(user_id, updated_at desc);
create index if not exists support_messages_thread_created_idx
  on public.support_messages(thread_id, created_at);
create unique index if not exists account_deletion_requests_one_open_idx
  on public.account_deletion_requests(user_id) where status = 'requested';
create unique index if not exists data_export_requests_one_open_idx
  on public.data_export_requests(user_id) where status = 'requested';

-- Assigned documents stay private. Clients can only create short-lived signed
-- URLs for active assignments; content administrators manage the objects.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  values('portal-documents', 'portal-documents', false, 10485760, array['application/pdf']::text[])
  on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "clients read assigned portal documents" on storage.objects;
create policy "clients read assigned portal documents" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'portal-documents'
    and (
      public.portal_is_admin()
      or exists (
        select 1
        from public.documents d
        join public.document_assignments a on a.document_id = d.id
        where d.storage_path = storage.objects.name
          and d.deleted_at is null
          and a.user_id = auth.uid()
          and a.revoked_at is null
      )
    )
  );

drop policy if exists "admins insert portal documents" on storage.objects;
create policy "admins insert portal documents" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portal-documents' and public.portal_is_admin());

drop policy if exists "admins update portal documents" on storage.objects;
create policy "admins update portal documents" on storage.objects
  for update to authenticated
  using (bucket_id = 'portal-documents' and public.portal_is_admin())
  with check (bucket_id = 'portal-documents' and public.portal_is_admin());

drop policy if exists "admins delete portal documents" on storage.objects;
create policy "admins delete portal documents" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portal-documents' and public.portal_is_admin());
