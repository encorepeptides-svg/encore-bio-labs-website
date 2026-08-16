-- Encore Bio Labs distributor portal — storefront attribution, commissions, and payout ledger.
-- Payouts are recorded here; this migration never initiates an external bank transfer.

create type public.distributor_account_status as enum ('pending', 'active', 'suspended', 'archived');
create type public.distributor_referral_stage as enum ('inquiry', 'qualified', 'converted', 'rejected');
create type public.distributor_sale_status as enum ('pending', 'approved', 'in_payout', 'paid', 'voided');
create type public.distributor_payout_status as enum ('draft', 'processing', 'paid', 'failed', 'cancelled');

create table public.distributor_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  display_name text not null,
  referral_code text not null unique check (referral_code ~ '^[A-Z0-9][A-Z0-9_-]{2,31}$'),
  status public.distributor_account_status not null default 'pending',
  commission_rate_bps integer not null default 2500 check (commission_rate_bps between 0 and 10000),
  customer_discount_rate_bps integer not null default 500 check (customer_discount_rate_bps between 0 and 10000),
  customer_discount_max_cents integer not null default 2500 check (customer_discount_max_cents >= 0),
  customer_discount_first_order_only boolean not null default true,
  customer_discount_enabled boolean not null default true,
  attribution_window_days integer not null default 30 check (attribution_window_days between 1 and 180),
  commission_hold_days integer not null default 30 check (commission_hold_days between 0 and 180),
  payout_minimum_cents integer not null default 10000 check (payout_minimum_cents >= 0),
  payout_provider text not null default 'manual',
  payout_account_reference text,
  tax_status text not null default 'pending',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

alter table public.storefront_orders
  add column distributor_id uuid references public.distributor_accounts(id) on delete set null,
  add column referral_code text,
  add column attribution_source text,
  add column attributed_at timestamptz,
  add column distributor_offer_validated_at timestamptz,
  add column distributor_customer_fingerprint text,
  add column distributor_discount_rate_bps integer not null default 0 check (distributor_discount_rate_bps between 0 and 10000),
  add column distributor_discount_max_cents integer not null default 0 check (distributor_discount_max_cents >= 0),
  add column distributor_discount_first_order_only boolean not null default true,
  add column distributor_discount_eligible boolean not null default false,
  add column distributor_discount_eligibility text not null default 'not_requested' check (distributor_discount_eligibility in ('not_requested', 'eligible', 'invalid_code', 'disabled', 'already_redeemed', 'better_promotion')),
  add column distributor_discount_no_benefit_reason text,
  add column distributor_benefit_type text not null default 'none' check (distributor_benefit_type in ('none', 'first_paid_purchase_discount', 'repeat_purchase_discount')),
  add column volume_discount_cents integer not null default 0 check (volume_discount_cents >= 0),
  add column distributor_discount_cents integer not null default 0 check (distributor_discount_cents >= 0),
  add column discount_source text not null default 'none' check (discount_source in ('none', 'volume_promotion', 'distributor_incentive')),
  add column other_promotion_won boolean not null default false;

create table public.distributor_customer_redemptions (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  storefront_order_id uuid not null unique references public.storefront_orders(id) on delete restrict,
  customer_fingerprint text not null check (length(customer_fingerprint) = 64),
  status text not null default 'consumed' check (status in ('consumed', 'reversed')),
  consumed_at timestamptz not null default now(),
  reversed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.distributor_referrals (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  storefront_order_id uuid not null unique references public.storefront_orders(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stage public.distributor_referral_stage not null default 'inquiry',
  source text not null default 'referral_link',
  estimated_order_value_cents integer check (estimated_order_value_cents is null or estimated_order_value_cents >= 0),
  qualified_at timestamptz,
  converted_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text
);

create table public.distributor_sales (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  referral_id uuid not null unique references public.distributor_referrals(id) on delete restrict,
  storefront_order_id uuid not null unique references public.storefront_orders(id) on delete restrict,
  created_at timestamptz not null default now(),
  paid_at timestamptz not null,
  hold_until timestamptz not null,
  order_reference text not null unique,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  gross_revenue_cents integer not null check (gross_revenue_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  discount_source text not null default 'none' check (discount_source in ('none', 'volume_promotion', 'distributor_incentive')),
  distributor_discount_cents integer not null default 0 check (distributor_discount_cents >= 0),
  other_promotion_won boolean not null default false,
  refund_cents integer not null default 0 check (refund_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  commission_rate_bps integer not null check (commission_rate_bps between 0 and 10000),
  net_commissionable_revenue_cents integer generated always as (
    greatest(gross_revenue_cents - discount_cents - refund_cents - tax_cents - shipping_cents, 0)
  ) stored,
  commission_amount_cents integer generated always as (
    floor(
      greatest(gross_revenue_cents - discount_cents - refund_cents - tax_cents - shipping_cents, 0)
      * commission_rate_bps::numeric / 10000
    )::integer
  ) stored,
  status public.distributor_sale_status not null default 'pending',
  approved_at timestamptz,
  voided_at timestamptz,
  void_reason text,
  recorded_by uuid references auth.users(id)
);

create table public.distributor_payouts (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  status public.distributor_payout_status not null default 'draft',
  provider text not null default 'manual',
  external_reference text,
  paid_at timestamptz,
  failure_reason text,
  created_by uuid not null references auth.users(id),
  paid_by uuid references auth.users(id)
);

create table public.distributor_payout_items (
  payout_id uuid not null references public.distributor_payouts(id) on delete restrict,
  sale_id uuid not null unique references public.distributor_sales(id) on delete restrict,
  commission_amount_cents integer not null check (commission_amount_cents >= 0),
  created_at timestamptz not null default now(),
  primary key (payout_id, sale_id)
);

create table public.distributor_audit_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid references auth.users(id),
  distributor_id uuid references public.distributor_accounts(id) on delete set null,
  event_type text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb
);

create index distributor_accounts_user_idx on public.distributor_accounts(user_id);
create index distributor_referrals_distributor_created_idx on public.distributor_referrals(distributor_id, created_at desc);
create index distributor_referrals_stage_idx on public.distributor_referrals(distributor_id, stage);
create index distributor_sales_distributor_paid_idx on public.distributor_sales(distributor_id, paid_at desc);
create index distributor_sales_status_hold_idx on public.distributor_sales(status, hold_until);
create index distributor_payouts_distributor_created_idx on public.distributor_payouts(distributor_id, created_at desc);
create index storefront_orders_distributor_idx on public.storefront_orders(distributor_id, created_at desc) where distributor_id is not null;
create index distributor_redemptions_lookup_idx on public.distributor_customer_redemptions(customer_fingerprint, status);
create unique index distributor_redemptions_one_consumed_idx on public.distributor_customer_redemptions(customer_fingerprint) where status = 'consumed';

create or replace function public.storefront_customer_has_paid_order(
  candidate_fingerprint text,
  normalized_email text,
  normalized_phone text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    exists (
      select 1 from public.distributor_customer_redemptions
      where customer_fingerprint = candidate_fingerprint and status = 'consumed'
    )
    or exists (
      select 1 from public.storefront_orders
      where status = 'paid'
        and (
          (nullif(normalized_email, '') is not null and lower(trim(contact ->> 'email')) = normalized_email)
          or
          (length(normalized_phone) >= 7 and regexp_replace(coalesce(contact ->> 'phone', ''), '\D', '', 'g') = normalized_phone)
        )
    )
$$;

revoke all on function public.storefront_customer_has_paid_order(text, text, text) from public, anon, authenticated;
grant execute on function public.storefront_customer_has_paid_order(text, text, text) to service_role;

create or replace function public.portal_distributor_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.distributor_accounts where user_id = (select auth.uid()) limit 1
$$;

revoke all on function public.portal_distributor_id() from public;
grant execute on function public.portal_distributor_id() to authenticated;

create or replace function public.assign_storefront_distributor_attribution()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  matched_distributor public.distributor_accounts%rowtype;
  prior_redemption_id uuid;
  candidate_discount integer;
  calculated_volume_discount integer;
begin
  new.distributor_id := null;
  new.attributed_at := null;
  new.attribution_source := null;
  new.distributor_offer_validated_at := null;
  new.distributor_discount_rate_bps := 0;
  new.distributor_discount_max_cents := 0;
  new.distributor_discount_first_order_only := true;
  new.distributor_discount_eligible := false;
  new.distributor_discount_eligibility := 'not_requested';
  new.distributor_discount_no_benefit_reason := null;
  new.distributor_benefit_type := 'none';
  new.distributor_discount_cents := 0;
  new.other_promotion_won := false;

  calculated_volume_discount := case
    when new.subtotal_cents >= 100000 then round(new.subtotal_cents * 0.20)
    when new.subtotal_cents >= 50000 then round(new.subtotal_cents * 0.15)
    when new.subtotal_cents >= 30000 then round(new.subtotal_cents * 0.10)
    else 0
  end;
  new.volume_discount_cents := calculated_volume_discount;

  if nullif(trim(new.referral_code), '') is null then
    new.referral_code := null;
    new.distributor_customer_fingerprint := null;
    new.discount_source := case when calculated_volume_discount > 0 then 'volume_promotion' else 'none' end;
    new.discount_cents := calculated_volume_discount;
    new.processing_fee_cents := case when new.payment_method = 'cash_on_delivery' then round(greatest(new.subtotal_cents - new.discount_cents, 0) * 0.05) else 0 end;
    new.total_cents := case when new.shipping_cents is null then null else greatest(new.subtotal_cents + coalesce(new.import_fee_cents, 0) + new.shipping_cents - new.discount_cents + new.processing_fee_cents, 0) end;
    return new;
  end if;

  select * into matched_distributor
  from public.distributor_accounts
  where referral_code = upper(trim(new.referral_code)) and status = 'active';

  if not found then
    new.referral_code := null;
    new.distributor_customer_fingerprint := null;
    new.distributor_offer_validated_at := now();
    new.distributor_discount_eligibility := 'invalid_code';
    new.distributor_discount_no_benefit_reason := 'invalid_or_inactive_code';
    new.discount_source := case when calculated_volume_discount > 0 then 'volume_promotion' else 'none' end;
    new.discount_cents := calculated_volume_discount;
    new.processing_fee_cents := case when new.payment_method = 'cash_on_delivery' then round(greatest(new.subtotal_cents - new.discount_cents, 0) * 0.05) else 0 end;
    new.total_cents := case when new.shipping_cents is null then null else greatest(new.subtotal_cents + coalesce(new.import_fee_cents, 0) + new.shipping_cents - new.discount_cents + new.processing_fee_cents, 0) end;
    return new;
  end if;

  new.distributor_id := matched_distributor.id;
  new.referral_code := matched_distributor.referral_code;
  new.attributed_at := now();
  new.attribution_source := coalesce(nullif(trim(new.attribution_source), ''), 'referral_link');
  new.distributor_offer_validated_at := now();
  new.distributor_discount_rate_bps := matched_distributor.customer_discount_rate_bps;
  new.distributor_discount_max_cents := matched_distributor.customer_discount_max_cents;
  new.distributor_discount_first_order_only := matched_distributor.customer_discount_first_order_only;

  if not matched_distributor.customer_discount_enabled then
    new.distributor_discount_eligibility := 'disabled';
    new.distributor_discount_no_benefit_reason := 'customer_offer_disabled';
  elsif nullif(new.distributor_customer_fingerprint, '') is null then
    new.distributor_discount_eligibility := 'disabled';
    new.distributor_discount_no_benefit_reason := 'customer_identity_unavailable';
  else
    prior_redemption_id := null;
    if matched_distributor.customer_discount_first_order_only
      and public.storefront_customer_has_paid_order(
        new.distributor_customer_fingerprint,
        lower(trim(coalesce(new.contact ->> 'email', ''))),
        regexp_replace(coalesce(new.contact ->> 'phone', ''), '\D', '', 'g')
      )
    then
      prior_redemption_id := gen_random_uuid();
    end if;
    if prior_redemption_id is not null then
      new.distributor_discount_eligibility := 'already_redeemed';
      new.distributor_discount_no_benefit_reason := 'first_paid_purchase_already_used';
    else
      new.distributor_discount_eligible := true;
      new.distributor_discount_eligibility := 'eligible';
      candidate_discount := least(round(new.subtotal_cents * matched_distributor.customer_discount_rate_bps::numeric / 10000)::integer, matched_distributor.customer_discount_max_cents);
      new.distributor_discount_cents := candidate_discount;
    end if;
  end if;

  if calculated_volume_discount > 0 and calculated_volume_discount >= new.distributor_discount_cents then
    new.discount_source := 'volume_promotion';
    new.discount_cents := calculated_volume_discount;
    if new.distributor_discount_cents > 0 then
      new.other_promotion_won := true;
      new.distributor_discount_eligible := false;
      new.distributor_discount_eligibility := 'better_promotion';
      new.distributor_discount_no_benefit_reason := 'volume_promotion_was_greater_or_equal';
    end if;
  elsif new.distributor_discount_cents > 0 then
    new.discount_source := 'distributor_incentive';
    new.discount_cents := new.distributor_discount_cents;
    new.distributor_benefit_type := case when matched_distributor.customer_discount_first_order_only then 'first_paid_purchase_discount' else 'repeat_purchase_discount' end;
  else
    new.discount_source := 'none';
    new.discount_cents := 0;
  end if;
  new.processing_fee_cents := case when new.payment_method = 'cash_on_delivery' then round(greatest(new.subtotal_cents - new.discount_cents, 0) * 0.05) else 0 end;
  new.total_cents := case when new.shipping_cents is null then null else greatest(new.subtotal_cents + coalesce(new.import_fee_cents, 0) + new.shipping_cents - new.discount_cents + new.processing_fee_cents, 0) end;
  return new;
end
$$;

revoke all on function public.assign_storefront_distributor_attribution() from public, anon, authenticated;

create trigger assign_storefront_distributor_before_order
before insert on public.storefront_orders
for each row execute function public.assign_storefront_distributor_attribution();

create or replace function public.create_distributor_referral_from_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.distributor_id is not null then
    insert into public.distributor_referrals(
      distributor_id, storefront_order_id, source, estimated_order_value_cents
    ) values (
      new.distributor_id, new.id, coalesce(new.attribution_source, 'referral_link'), new.subtotal_cents
    ) on conflict (storefront_order_id) do nothing;
  end if;
  return new;
end
$$;

revoke all on function public.create_distributor_referral_from_order() from public, anon, authenticated;

create trigger create_distributor_referral_after_order
after insert on public.storefront_orders
for each row execute function public.create_distributor_referral_from_order();

create or replace function public.consume_distributor_customer_redemption()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare inserted_redemption_id uuid;
begin
  if new.status = 'paid'
    and new.paid_at is not null
    and new.discount_source = 'distributor_incentive'
    and new.distributor_discount_first_order_only
    and (old.status is distinct from 'paid' or old.paid_at is distinct from new.paid_at)
  then
    if new.distributor_id is null or nullif(new.distributor_customer_fingerprint, '') is null then
      raise exception 'paid distributor incentive requires validated attribution and customer identity';
    end if;

    insert into public.distributor_customer_redemptions(
      distributor_id, storefront_order_id, customer_fingerprint, status, consumed_at
    ) values (
      new.distributor_id, new.id, new.distributor_customer_fingerprint, 'consumed', new.paid_at
    )
    on conflict (customer_fingerprint) where status = 'consumed' do nothing
    returning id into inserted_redemption_id;

    if inserted_redemption_id is null then
      raise exception 'distributor first-purchase incentive was already redeemed';
    end if;
  elsif old.status = 'paid' and new.status <> 'paid' then
    update public.distributor_customer_redemptions
    set status = 'reversed', reversed_at = now()
    where storefront_order_id = new.id and status = 'consumed';
  end if;
  return new;
end
$$;

revoke all on function public.consume_distributor_customer_redemption() from public, anon, authenticated;

create trigger consume_distributor_redemption_after_order
after update of status, paid_at on public.storefront_orders
for each row execute function public.consume_distributor_customer_redemption();

create or replace function public.sync_distributor_sale_from_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  referral_record public.distributor_referrals%rowtype;
  account_record public.distributor_accounts%rowtype;
  sale_id uuid;
  effective_paid_at timestamptz;
  effective_shipping integer;
begin
  if new.distributor_id is null then return new; end if;

  select * into referral_record
  from public.distributor_referrals
  where storefront_order_id = new.id;
  if not found then return new; end if;

  if new.status = 'paid' and new.paid_at is not null then
    select * into account_record
    from public.distributor_accounts
    where id = new.distributor_id;
    if not found then return new; end if;

    effective_paid_at := new.paid_at;
    effective_shipping := coalesce(new.shipping_cents, 0);

    insert into public.distributor_sales(
      distributor_id, referral_id, storefront_order_id, paid_at, hold_until, order_reference,
      currency, gross_revenue_cents, discount_cents, discount_source, distributor_discount_cents, other_promotion_won, refund_cents, tax_cents, shipping_cents,
      commission_rate_bps, status, recorded_by
    ) values (
      account_record.id, referral_record.id, new.id, effective_paid_at,
      effective_paid_at + make_interval(days => account_record.commission_hold_days), new.order_reference,
      coalesce(new.currency, 'USD'), new.subtotal_cents + effective_shipping,
      coalesce(new.discount_cents, 0), new.discount_source, new.distributor_discount_cents, new.other_promotion_won, 0, 0, effective_shipping,
      account_record.commission_rate_bps, 'pending', new.marked_paid_by
    )
    on conflict (storefront_order_id) do update set
      paid_at = case when public.distributor_sales.status in ('pending', 'voided') then excluded.paid_at else public.distributor_sales.paid_at end,
      hold_until = case when public.distributor_sales.status in ('pending', 'voided') then excluded.hold_until else public.distributor_sales.hold_until end,
      order_reference = case when public.distributor_sales.status in ('pending', 'voided') then excluded.order_reference else public.distributor_sales.order_reference end,
      currency = case when public.distributor_sales.status in ('pending', 'voided') then excluded.currency else public.distributor_sales.currency end,
      gross_revenue_cents = case when public.distributor_sales.status in ('pending', 'voided') then excluded.gross_revenue_cents else public.distributor_sales.gross_revenue_cents end,
      discount_cents = case when public.distributor_sales.status in ('pending', 'voided') then excluded.discount_cents else public.distributor_sales.discount_cents end,
      discount_source = case when public.distributor_sales.status in ('pending', 'voided') then excluded.discount_source else public.distributor_sales.discount_source end,
      distributor_discount_cents = case when public.distributor_sales.status in ('pending', 'voided') then excluded.distributor_discount_cents else public.distributor_sales.distributor_discount_cents end,
      other_promotion_won = case when public.distributor_sales.status in ('pending', 'voided') then excluded.other_promotion_won else public.distributor_sales.other_promotion_won end,
      shipping_cents = case when public.distributor_sales.status in ('pending', 'voided') then excluded.shipping_cents else public.distributor_sales.shipping_cents end,
      commission_rate_bps = case
        when public.distributor_sales.status in ('pending', 'voided') then excluded.commission_rate_bps
        else public.distributor_sales.commission_rate_bps
      end,
      status = case
        when public.distributor_sales.status = 'voided' then 'pending'::public.distributor_sale_status
        else public.distributor_sales.status
      end,
      voided_at = case when public.distributor_sales.status = 'voided' then null else public.distributor_sales.voided_at end,
      void_reason = case when public.distributor_sales.status = 'voided' then null else public.distributor_sales.void_reason end,
      recorded_by = coalesce(excluded.recorded_by, public.distributor_sales.recorded_by)
    returning id into sale_id;

    update public.distributor_referrals
    set stage = 'converted', converted_at = effective_paid_at, updated_at = now()
    where id = referral_record.id;

    insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, metadata)
    values (new.marked_paid_by, account_record.id, 'sale_synced_from_paid_order', 'distributor_sale', sale_id, jsonb_build_object('order_reference', new.order_reference));
  elsif old.status = 'paid' and new.status <> 'paid' then
    update public.distributor_sales
    set status = 'voided', voided_at = now(), void_reason = 'Storefront order moved out of paid status'
    where storefront_order_id = new.id and status in ('pending', 'approved')
    returning id into sale_id;

    if sale_id is not null then
      update public.distributor_referrals
      set stage = 'qualified', converted_at = null, updated_at = now()
      where id = referral_record.id;
      insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, metadata)
      values ((select auth.uid()), new.distributor_id, 'sale_voided_from_order_status', 'distributor_sale', sale_id, jsonb_build_object('order_reference', new.order_reference, 'status', new.status));
    end if;
  end if;
  return new;
end
$$;

revoke all on function public.sync_distributor_sale_from_order() from public, anon, authenticated;

create trigger sync_distributor_sale_after_order
after update of status, paid_at, subtotal_cents, discount_cents, shipping_cents on public.storefront_orders
for each row execute function public.sync_distributor_sale_from_order();

create or replace function public.admin_upsert_distributor(
  target_user_id uuid,
  distributor_name text,
  distributor_code text,
  rate_bps integer default 2500,
  account_status public.distributor_account_status default 'active',
  discount_rate_bps integer default 500,
  discount_max_cents integer default 2500,
  discount_enabled boolean default true,
  discount_first_order_only boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid;
  normalized_code text := upper(trim(distributor_code));
begin
  if (select auth.uid()) is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if not exists(select 1 from auth.users where id = target_user_id) then raise exception 'portal user does not exist'; end if;
  if nullif(trim(distributor_name), '') is null then raise exception 'display name required'; end if;
  if normalized_code !~ '^[A-Z0-9][A-Z0-9_-]{2,31}$' then raise exception 'invalid referral code'; end if;
  if rate_bps not between 0 and 10000 then raise exception 'invalid commission rate'; end if;
  if discount_rate_bps not between 0 and 10000 then raise exception 'invalid customer discount rate'; end if;
  if discount_max_cents < 0 then raise exception 'invalid customer discount maximum'; end if;

  insert into public.distributor_accounts(
    user_id, display_name, referral_code, commission_rate_bps, status,
    customer_discount_rate_bps, customer_discount_max_cents, customer_discount_enabled, customer_discount_first_order_only,
    created_by, updated_by
  ) values (
    target_user_id, trim(distributor_name), normalized_code, rate_bps, account_status,
    discount_rate_bps, discount_max_cents, discount_enabled, discount_first_order_only,
    (select auth.uid()), (select auth.uid())
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    referral_code = excluded.referral_code,
    commission_rate_bps = excluded.commission_rate_bps,
    status = excluded.status,
    customer_discount_rate_bps = excluded.customer_discount_rate_bps,
    customer_discount_max_cents = excluded.customer_discount_max_cents,
    customer_discount_enabled = excluded.customer_discount_enabled,
    customer_discount_first_order_only = excluded.customer_discount_first_order_only,
    updated_at = now(),
    updated_by = (select auth.uid())
  returning id into account_id;

  insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, metadata)
  values ((select auth.uid()), account_id, 'distributor_upserted', 'distributor_account', account_id, jsonb_build_object('referral_code', normalized_code, 'rate_bps', rate_bps, 'status', account_status, 'discount_rate_bps', discount_rate_bps, 'discount_max_cents', discount_max_cents, 'discount_enabled', discount_enabled, 'discount_first_order_only', discount_first_order_only));
  return account_id;
end
$$;

create or replace function public.admin_reconcile_distributor_sale(target_order_reference text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare order_record public.storefront_orders%rowtype; sale_id uuid;
begin
  if (select auth.uid()) is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  select * into order_record from public.storefront_orders where order_reference = trim(target_order_reference);
  if not found then raise exception 'storefront order not found'; end if;
  if order_record.distributor_id is null then raise exception 'order has no valid distributor attribution'; end if;
  if order_record.status <> 'paid' or order_record.paid_at is null then raise exception 'order must be paid before reconciliation'; end if;

  -- Touching paid_at invokes the same trigger used by the normal paid transition.
  update public.storefront_orders set paid_at = order_record.paid_at where id = order_record.id;
  select id into sale_id from public.distributor_sales where storefront_order_id = order_record.id;
  if sale_id is null then raise exception 'sale could not be reconciled'; end if;
  return sale_id;
end
$$;

create or replace function public.admin_create_distributor_payout(
  target_distributor_id uuid,
  payout_period_start date,
  payout_period_end date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_payout_id uuid;
  payout_total integer;
  payout_provider_name text;
  minimum_cents integer;
begin
  if (select auth.uid()) is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if payout_period_end < payout_period_start then raise exception 'invalid payout period'; end if;

  select payout_provider, payout_minimum_cents into payout_provider_name, minimum_cents
  from public.distributor_accounts where id = target_distributor_id and status in ('active', 'suspended');
  if not found then raise exception 'payable distributor not found'; end if;

  update public.distributor_sales set status = 'approved', approved_at = now()
  where distributor_id = target_distributor_id and status = 'pending' and hold_until <= now();

  select coalesce(sum(commission_amount_cents), 0)::integer into payout_total
  from public.distributor_sales
  where distributor_id = target_distributor_id
    and status = 'approved'
    and paid_at::date between payout_period_start and payout_period_end;

  if payout_total = 0 then raise exception 'no approved commissions in this period'; end if;
  if payout_total < minimum_cents then raise exception 'payout minimum not reached'; end if;

  insert into public.distributor_payouts(distributor_id, period_start, period_end, amount_cents, provider, created_by)
  values (target_distributor_id, payout_period_start, payout_period_end, payout_total, payout_provider_name, (select auth.uid()))
  returning id into created_payout_id;

  insert into public.distributor_payout_items(payout_id, sale_id, commission_amount_cents)
  select created_payout_id, id, commission_amount_cents
  from public.distributor_sales
  where distributor_id = target_distributor_id and status = 'approved'
    and paid_at::date between payout_period_start and payout_period_end;

  update public.distributor_sales set status = 'in_payout'
  where id in (select sale_id from public.distributor_payout_items where payout_id = created_payout_id);

  insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, metadata)
  values ((select auth.uid()), target_distributor_id, 'payout_created', 'distributor_payout', created_payout_id, jsonb_build_object('amount_cents', payout_total));
  return created_payout_id;
end
$$;

create or replace function public.admin_mark_distributor_payout_paid(target_payout_id uuid, payment_reference text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare target_distributor_id uuid;
begin
  if (select auth.uid()) is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if nullif(trim(payment_reference), '') is null then raise exception 'external payment reference required'; end if;

  update public.distributor_payouts set
    status = 'paid', external_reference = trim(payment_reference), paid_at = now(), paid_by = (select auth.uid()), updated_at = now()
  where id = target_payout_id and status in ('draft', 'processing')
  returning distributor_id into target_distributor_id;
  if target_distributor_id is null then raise exception 'eligible payout not found'; end if;

  update public.distributor_sales set status = 'paid'
  where id in (select sale_id from public.distributor_payout_items where payout_id = target_payout_id);

  insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, metadata)
  values ((select auth.uid()), target_distributor_id, 'payout_marked_paid', 'distributor_payout', target_payout_id, jsonb_build_object('external_reference', trim(payment_reference)));
end
$$;

revoke all on function public.admin_upsert_distributor(uuid, text, text, integer, public.distributor_account_status, integer, integer, boolean, boolean) from public, anon;
revoke all on function public.admin_reconcile_distributor_sale(text) from public, anon;
revoke all on function public.admin_create_distributor_payout(uuid, date, date) from public, anon;
revoke all on function public.admin_mark_distributor_payout_paid(uuid, text) from public, anon;
grant execute on function public.admin_upsert_distributor(uuid, text, text, integer, public.distributor_account_status, integer, integer, boolean, boolean) to authenticated;
grant execute on function public.admin_reconcile_distributor_sale(text) to authenticated;
grant execute on function public.admin_create_distributor_payout(uuid, date, date) to authenticated;
grant execute on function public.admin_mark_distributor_payout_paid(uuid, text) to authenticated;

alter table public.distributor_accounts enable row level security;
alter table public.distributor_customer_redemptions enable row level security;
alter table public.distributor_referrals enable row level security;
alter table public.distributor_sales enable row level security;
alter table public.distributor_payouts enable row level security;
alter table public.distributor_payout_items enable row level security;
alter table public.distributor_audit_events enable row level security;

create policy "distributors read own account" on public.distributor_accounts for select to authenticated
  using (user_id = (select auth.uid()) or public.portal_is_admin());
create policy "distributors read own referrals" on public.distributor_referrals for select to authenticated
  using (distributor_id = (select public.portal_distributor_id()) or public.portal_is_admin());
create policy "distributors read own sales" on public.distributor_sales for select to authenticated
  using (distributor_id = (select public.portal_distributor_id()) or public.portal_is_admin());
create policy "distributors read own payouts" on public.distributor_payouts for select to authenticated
  using (distributor_id = (select public.portal_distributor_id()) or public.portal_is_admin());
create policy "distributors read own payout items" on public.distributor_payout_items for select to authenticated
  using (
    exists (
      select 1 from public.distributor_payouts payout
      where payout.id = payout_id
        and (payout.distributor_id = (select public.portal_distributor_id()) or public.portal_is_admin())
    )
  );
create policy "admins read distributor audit" on public.distributor_audit_events for select to authenticated
  using (public.portal_is_admin());
create policy "admins read distributor redemptions" on public.distributor_customer_redemptions for select to authenticated
  using (public.portal_is_admin());

-- SQL-created tables are explicitly granted to the Data API roles.
grant select on public.distributor_accounts, public.distributor_referrals, public.distributor_sales,
  public.distributor_payouts, public.distributor_payout_items, public.distributor_audit_events,
  public.distributor_customer_redemptions to authenticated;
grant select, insert, update, delete on public.distributor_accounts, public.distributor_referrals,
  public.distributor_sales, public.distributor_payouts, public.distributor_payout_items,
  public.distributor_audit_events, public.distributor_customer_redemptions to service_role;

comment on column public.distributor_accounts.commission_rate_bps is 'Basis points snapshotted onto each verified paid sale.';
comment on column public.distributor_accounts.customer_discount_rate_bps is 'Customer incentive in basis points; defaults to 5% and is revalidated server-side.';
comment on column public.storefront_orders.distributor_customer_fingerprint is 'Private one-way customer identifier. Never exposed to a distributor.';
comment on table public.distributor_customer_redemptions is 'Private paid-order ledger for concurrency-safe first-purchase incentive enforcement.';
comment on column public.distributor_sales.net_commissionable_revenue_cents is 'Product revenue after discounts, refunds, tax, and shipping are excluded.';
comment on table public.distributor_payouts is 'Internal payout ledger. External transfers must be executed and verified outside the browser.';
