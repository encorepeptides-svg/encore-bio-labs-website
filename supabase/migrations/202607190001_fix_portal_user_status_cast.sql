-- Ensure Auth invitations can create the related portal records.
-- PostgreSQL otherwise resolves the CASE expression as text instead of the
-- client_account_status enum expected by client_statuses.status.
create or replace function public.handle_new_portal_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    legal_name,
    preferred_name,
    mobile,
    preferred_language
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'legal_name', ''),
    coalesce(new.raw_user_meta_data ->> 'preferred_name', ''),
    coalesce(new.raw_user_meta_data ->> 'mobile', ''),
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'English')
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'client'::public.portal_role);

  insert into public.client_statuses (user_id, status)
  values (
    new.id,
    case
      when new.email_confirmed_at is null
        then 'unverified'::public.client_account_status
      else 'onboarding_incomplete'::public.client_account_status
    end
  );

  return new;
end
$$;
