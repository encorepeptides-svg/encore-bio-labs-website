-- Bilingual portal engagement: stable research interests, private research
-- documentation images, and client-authored service review drafts.

alter table public.onboarding_profiles
  add column if not exists research_interests text[] not null default '{}',
  add column if not exists interested_products text[] not null default '{}';

alter table public.progress_photos
  add column if not exists capture_date date not null default current_date,
  add column if not exists caption text not null default '';

alter table public.testimonials
  add column if not exists submitted_by uuid references auth.users(id) on delete set null;

create index if not exists testimonials_submitted_by_created_idx
  on public.testimonials(submitted_by, created_at desc)
  where submitted_by is not null;

drop policy if exists "active clients submit testimonial drafts" on public.testimonials;
create policy "active clients submit testimonial drafts" on public.testimonials
  for insert to authenticated
  with check (
    public.portal_is_active_client()
    and submitted_by = auth.uid()
    and status = 'draft'
    and consent_verified = false
    and claim_review_passed = false
    and reviewed_by is null
    and reviewed_at is null
    and published_at is null
    and rating between 1 and 5
    and length(btrim(display_name)) between 2 and 80
    and length(btrim(quote)) between 10 and 1500
  );

drop policy if exists "clients read own testimonial drafts" on public.testimonials;
create policy "clients read own testimonial drafts" on public.testimonials
  for select to authenticated
  using (submitted_by = auth.uid());

grant select, insert on public.testimonials to authenticated;

create or replace function public.portal_has_progress_photo_consent()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.consent_acceptances acceptance
    join public.consent_versions version on version.id = acceptance.consent_version_id
    where acceptance.user_id = auth.uid()
      and acceptance.active = true
      and acceptance.withdrawn_at is null
      and version.consent_key = 'progress_photos'
      and version.active = true
  );
$$;

revoke all on function public.portal_has_progress_photo_consent() from public;
grant execute on function public.portal_has_progress_photo_consent() to authenticated;

drop policy if exists "admins read staff-shared progress photos" on public.progress_photos;
create policy "admins read staff-shared progress photos" on public.progress_photos
  for select to authenticated
  using (public.portal_is_admin() and staff_visible = true and deleted_at is null);

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
  values('progress-photos', 'progress-photos', false, 8388608, array['image/jpeg','image/png','image/webp']::text[])
  on conflict (id) do update set
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "clients upload own progress photos" on storage.objects;
create policy "clients upload own progress photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.portal_is_active_client()
    and public.portal_has_progress_photo_consent()
  );

drop policy if exists "clients read own progress photos" on storage.objects;
create policy "clients read own progress photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'progress-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        public.portal_is_admin()
        and exists (
          select 1 from public.progress_photos photo
          where photo.storage_path = storage.objects.name
            and photo.staff_visible = true
            and photo.deleted_at is null
        )
      )
    )
  );

drop policy if exists "clients delete own progress photos" on storage.objects;
create policy "clients delete own progress photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create index if not exists progress_photos_user_created_idx
  on public.progress_photos(user_id, created_at desc)
  where deleted_at is null;
