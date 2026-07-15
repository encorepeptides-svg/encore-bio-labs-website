-- Strengthen testimonial publication: a generic "approved" flag is not enough.
-- The reviewer must document provenance and explicitly attest that the quote is
-- service-only and contains no medical or human-outcome claim.

alter table public.testimonials
  add column if not exists claim_review_passed boolean not null default false;

create or replace function public.stamp_social_proof_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and new.published_at is not null then
    new.reviewed_by := auth.uid();
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists stamp_testimonial_review on public.testimonials;
create trigger stamp_testimonial_review
  before insert or update on public.testimonials
  for each row execute function public.stamp_social_proof_review();

create or replace view public.published_testimonials
with (security_invoker = false) as
  select
    id,
    category,
    quote,
    display_name,
    approved_photo_url,
    alt_text,
    case when incentive_provided then incentive_disclosure else '' end as incentive_disclosure,
    relationship_to_business,
    sort_order
  from public.testimonials
  where status = 'approved'
    and consent_verified = true
    and claim_review_passed = true
    and submission_date is not null
    and length(btrim(consent_record_reference)) > 0
    and length(btrim(source_record_reference)) > 0
    and length(btrim(verification_notes)) > 0
    and length(btrim(relationship_to_business)) > 0
    and reviewed_by is not null
    and reviewed_at is not null
    and length(btrim(quote)) > 0
    and length(btrim(display_name)) > 0
    and (incentive_provided = false or length(btrim(incentive_disclosure)) > 0)
    and published_at is not null;

grant select on public.published_testimonials to anon, authenticated;
