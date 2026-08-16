-- Immutable distributor commission accounting.
--
-- This migration deliberately leaves the phase-one migration untouched. It
-- snapshots the original commission, backfills existing sales, and makes the
-- signed ledger (not distributor_sales.refund_cents) the accounting source of
-- truth. Historical paid payouts are never rewritten.

do $$ begin
  create type public.distributor_ledger_entry_type as enum (
    'commission_earned',
    'partial_refund_reversal',
    'full_refund_reversal',
    'chargeback',
    'chargeback_reversal',
    'manual_positive_adjustment',
    'manual_negative_adjustment',
    'legacy_balance'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.distributor_ledger_source_type as enum ('system', 'administrator', 'webhook', 'migration');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.distributor_recovery_status as enum ('not_applicable', 'pending', 'partial', 'recovered');
exception when duplicate_object then null;
end $$;

alter table public.storefront_orders
  add column if not exists refunded_cents integer not null default 0 check (refunded_cents >= 0),
  add column if not exists payment_processor text,
  add column if not exists payment_transaction_reference text;

alter table public.storefront_orders drop constraint if exists storefront_orders_status_check;
alter table public.storefront_orders add constraint storefront_orders_status_check check (
  status in (
    'pending_shipping_review', 'pending_payment', 'paid', 'partially_refunded',
    'refunded', 'chargeback', 'chargeback_reversed', 'cancelled'
  )
);

alter table public.distributor_sales
  add column if not exists original_commissionable_revenue_cents integer,
  add column if not exists original_commission_amount_cents integer,
  add column if not exists refunded_commissionable_revenue_cents integer not null default 0 check (refunded_commissionable_revenue_cents >= 0),
  add column if not exists commission_reversed_cents integer not null default 0 check (commission_reversed_cents >= 0);

update public.distributor_sales
set
  original_commissionable_revenue_cents = greatest(gross_revenue_cents - discount_cents - tax_cents - shipping_cents, 0),
  original_commission_amount_cents = floor(
    greatest(gross_revenue_cents - discount_cents - tax_cents - shipping_cents, 0)
    * commission_rate_bps::numeric / 10000
  )::integer,
  refunded_commissionable_revenue_cents = least(
    greatest(refund_cents, 0),
    greatest(gross_revenue_cents - discount_cents - tax_cents - shipping_cents, 0)
  ),
  commission_reversed_cents = greatest(
    floor(
      greatest(gross_revenue_cents - discount_cents - tax_cents - shipping_cents, 0)
      * commission_rate_bps::numeric / 10000
    )::integer - commission_amount_cents,
    0
  )
where original_commissionable_revenue_cents is null or original_commission_amount_cents is null;

alter table public.distributor_sales
  alter column original_commissionable_revenue_cents set not null,
  alter column original_commission_amount_cents set not null;

alter table public.distributor_payouts
  add column if not exists gross_commission_cents integer not null default 0 check (gross_commission_cents >= 0),
  add column if not exists positive_adjustments_cents integer not null default 0 check (positive_adjustments_cents >= 0),
  add column if not exists negative_adjustments_cents integer not null default 0 check (negative_adjustments_cents >= 0),
  add column if not exists recoveries_applied_cents integer not null default 0 check (recoveries_applied_cents >= 0);

-- Existing paid payouts retain their exact historical amount. The added
-- breakdown is initialized as gross because phase one did not retain detail.
update public.distributor_payouts
set gross_commission_cents = amount_cents
where status = 'paid'
  and gross_commission_cents = 0
  and positive_adjustments_cents = 0
  and negative_adjustments_cents = 0
  and recoveries_applied_cents = 0;

alter table public.distributor_audit_events
  add column if not exists success boolean not null default true,
  add column if not exists error_code text;

create table if not exists public.distributor_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  storefront_order_id uuid not null references public.storefront_orders(id) on delete restrict,
  provider text not null,
  provider_transaction_id text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'captured' check (status in ('pending', 'captured', 'partially_refunded', 'refunded', 'disputed', 'reversed', 'failed')),
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (provider, provider_transaction_id)
);

create table if not exists public.distributor_sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.distributor_sales(id) on delete restrict,
  storefront_order_id uuid not null references public.storefront_orders(id) on delete restrict,
  order_item_key text not null,
  sku text,
  product_name text,
  variant_name text,
  quantity integer not null check (quantity > 0),
  gross_amount_cents integer not null check (gross_amount_cents >= 0),
  allocated_discount_cents integer not null default 0 check (allocated_discount_cents >= 0),
  commissionable_amount_cents integer not null check (commissionable_amount_cents >= 0),
  original_commission_cents integer not null check (original_commission_cents >= 0),
  refunded_commissionable_cents integer not null default 0 check (refunded_commissionable_cents >= 0),
  commission_reversed_cents integer not null default 0 check (commission_reversed_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (sale_id, order_item_key),
  check (refunded_commissionable_cents <= commissionable_amount_cents),
  check (commission_reversed_cents <= original_commission_cents)
);

create table if not exists public.distributor_commission_ledger (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  order_id uuid references public.storefront_orders(id) on delete restrict,
  order_item_id uuid references public.distributor_sale_items(id) on delete restrict,
  commission_id uuid references public.distributor_sales(id) on delete restrict,
  payment_transaction_id uuid references public.distributor_payment_transactions(id) on delete restrict,
  entry_type public.distributor_ledger_entry_type not null,
  amount_cents integer not null check (amount_cents <> 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  reason_code text not null,
  reason text not null,
  source_type public.distributor_ledger_source_type not null,
  source_reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  original_payout_id uuid references public.distributor_payouts(id) on delete restrict,
  recovery_payout_id uuid references public.distributor_payouts(id) on delete restrict,
  recovery_status public.distributor_recovery_status not null default 'not_applicable',
  recovered_cents integer not null default 0 check (recovered_cents >= 0),
  remaining_cents integer not null default 0 check (remaining_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  check (
    (amount_cents > 0 and recovery_status = 'not_applicable' and recovered_cents = 0 and remaining_cents = 0)
    or
    (amount_cents < 0 and recovery_status <> 'not_applicable' and recovered_cents + remaining_cents = abs(amount_cents))
  )
);

create table if not exists public.distributor_refunds (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references public.distributor_accounts(id) on delete restrict,
  storefront_order_id uuid not null references public.storefront_orders(id) on delete restrict,
  sale_id uuid not null references public.distributor_sales(id) on delete restrict,
  payment_transaction_id uuid references public.distributor_payment_transactions(id) on delete restrict,
  ledger_entry_id uuid references public.distributor_commission_ledger(id) on delete restrict,
  provider text not null default 'manual',
  external_refund_id text not null,
  external_event_id text,
  gross_order_cents integer not null check (gross_order_cents >= 0),
  refund_event_cents integer not null check (refund_event_cents > 0),
  refunded_total_cents integer not null check (refunded_total_cents > 0),
  remaining_order_cents integer not null check (remaining_order_cents >= 0),
  original_commission_cents integer not null check (original_commission_cents >= 0),
  commission_reversed_cents integer not null check (commission_reversed_cents >= 0),
  commission_reversed_total_cents integer not null check (commission_reversed_total_cents >= 0),
  commission_remaining_cents integer not null check (commission_remaining_cents >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  reason_code text not null,
  public_reason text not null,
  internal_notes text,
  source_type public.distributor_ledger_source_type not null,
  created_by uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  unique (provider, external_refund_id, refunded_total_cents),
  check (refunded_total_cents <= gross_order_cents),
  check (refund_event_cents <= refunded_total_cents),
  check (commission_reversed_total_cents <= original_commission_cents),
  check (commission_reversed_cents <= commission_reversed_total_cents),
  check (commission_reversed_total_cents + commission_remaining_cents = original_commission_cents)
);

create table if not exists public.distributor_refund_items (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references public.distributor_refunds(id) on delete restrict deferrable initially deferred,
  sale_item_id uuid not null references public.distributor_sale_items(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  refund_amount_cents integer not null check (refund_amount_cents >= 0),
  commissionable_refund_cents integer not null check (commissionable_refund_cents >= 0),
  commission_reversal_cents integer not null check (commission_reversal_cents >= 0),
  created_at timestamptz not null default now(),
  unique (refund_id, sale_item_id)
);

create table if not exists public.distributor_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  event_type text not null,
  storefront_order_id uuid references public.storefront_orders(id) on delete restrict,
  payment_transaction_id uuid references public.distributor_payment_transactions(id) on delete restrict,
  external_object_id text,
  amount_cents integer,
  cumulative_amount_cents integer,
  currency text,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received' check (processing_status in ('received', 'processed', 'ignored', 'failed')),
  error_code text,
  payload jsonb not null default '{}'::jsonb,
  unique (provider, external_event_id)
);

create table if not exists public.distributor_payout_ledger_items (
  id uuid primary key default gen_random_uuid(),
  payout_id uuid not null references public.distributor_payouts(id) on delete restrict,
  ledger_entry_id uuid not null references public.distributor_commission_ledger(id) on delete restrict,
  amount_cents integer not null check (amount_cents <> 0),
  application_type text not null check (application_type in ('commission', 'positive_adjustment', 'negative_adjustment', 'recovery')),
  created_at timestamptz not null default now(),
  unique (payout_id, ledger_entry_id)
);

create table if not exists public.distributor_recovery_allocations (
  id uuid primary key default gen_random_uuid(),
  ledger_entry_id uuid not null references public.distributor_commission_ledger(id) on delete restrict,
  payout_id uuid not null references public.distributor_payouts(id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  created_at timestamptz not null default now(),
  unique (ledger_entry_id, payout_id)
);

create index if not exists distributor_ledger_distributor_created_idx on public.distributor_commission_ledger(distributor_id, created_at desc);
create index if not exists distributor_ledger_commission_idx on public.distributor_commission_ledger(commission_id, created_at);
create index if not exists distributor_ledger_pending_recovery_idx on public.distributor_commission_ledger(distributor_id, currency, created_at) where amount_cents < 0 and remaining_cents > 0;
create index if not exists distributor_refunds_order_created_idx on public.distributor_refunds(storefront_order_id, created_at);
create index if not exists distributor_sale_items_sale_idx on public.distributor_sale_items(sale_id);
create index if not exists distributor_payment_events_object_idx on public.distributor_payment_events(provider, external_object_id);
create index if not exists distributor_payout_ledger_payout_idx on public.distributor_payout_ledger_items(payout_id);
create index if not exists distributor_recovery_allocations_entry_idx on public.distributor_recovery_allocations(ledger_entry_id, created_at);

create or replace function public.protect_distributor_ledger()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'commission ledger entries cannot be deleted';
  end if;

  if (to_jsonb(new) - array['recovery_payout_id', 'recovery_status', 'recovered_cents', 'remaining_cents']::text[])
     is distinct from
     (to_jsonb(old) - array['recovery_payout_id', 'recovery_status', 'recovered_cents', 'remaining_cents']::text[])
  then
    raise exception 'commission ledger entries are immutable; insert a compensating entry';
  end if;

  if new.amount_cents >= 0
     or new.recovered_cents < old.recovered_cents
     or new.remaining_cents > old.remaining_cents
     or new.recovered_cents + new.remaining_cents <> abs(new.amount_cents)
  then
    raise exception 'invalid recovery state transition';
  end if;
  return new;
end
$$;

drop trigger if exists protect_distributor_ledger_update on public.distributor_commission_ledger;
create trigger protect_distributor_ledger_update
before update on public.distributor_commission_ledger
for each row execute function public.protect_distributor_ledger();

drop trigger if exists protect_distributor_ledger_delete on public.distributor_commission_ledger;
create trigger protect_distributor_ledger_delete
before delete on public.distributor_commission_ledger
for each row execute function public.protect_distributor_ledger();

create or replace function public.protect_distributor_accounting_detail()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'accounting detail is append-only';
end
$$;

drop trigger if exists protect_distributor_refunds_update_delete on public.distributor_refunds;
create trigger protect_distributor_refunds_update_delete
before update or delete on public.distributor_refunds
for each row execute function public.protect_distributor_accounting_detail();

drop trigger if exists protect_distributor_refund_items_update_delete on public.distributor_refund_items;
create trigger protect_distributor_refund_items_update_delete
before update or delete on public.distributor_refund_items
for each row execute function public.protect_distributor_accounting_detail();

drop trigger if exists protect_distributor_recovery_allocations_update_delete on public.distributor_recovery_allocations;
create trigger protect_distributor_recovery_allocations_update_delete
before update or delete on public.distributor_recovery_allocations
for each row execute function public.protect_distributor_accounting_detail();

create or replace function public.snapshot_distributor_sale_items(target_sale_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  with sale_order as (
    select
      sale.id as sale_id,
      sale.storefront_order_id,
      sale.discount_cents,
      sale.original_commission_amount_cents,
      sale.original_commissionable_revenue_cents,
      order_row.items
    from public.distributor_sales sale
    join public.storefront_orders order_row on order_row.id = sale.storefront_order_id
    where sale.id = target_sale_id
  ), raw_items as (
    select
      sale_order.*,
      item.value as item,
      item.ordinality::integer as item_number,
      greatest(coalesce((item.value ->> 'quantity')::integer, 1), 1) as quantity,
      greatest(coalesce((item.value ->> 'line_total_cents')::integer, 0), 0) as gross_amount_cents
    from sale_order
    cross join lateral jsonb_array_elements(sale_order.items) with ordinality as item(value, ordinality)
  ), running as (
    select
      raw_items.*,
      sum(gross_amount_cents) over (order by item_number)::bigint as cumulative_gross,
      (sum(gross_amount_cents) over ())::bigint as total_gross
    from raw_items
  ), discounted as (
    select
      running.*,
      case when total_gross = 0 then 0 else
        floor(least(discount_cents, total_gross::integer)::numeric * cumulative_gross / total_gross)::integer
        - floor(least(discount_cents, total_gross::integer)::numeric * (cumulative_gross - gross_amount_cents) / total_gross)::integer
      end as allocated_discount_cents
    from running
  ), commission_running as (
    select
      discounted.*,
      greatest(gross_amount_cents - allocated_discount_cents, 0) as item_commissionable,
      sum(greatest(gross_amount_cents - allocated_discount_cents, 0)) over (order by item_number)::bigint as cumulative_commissionable
    from discounted
  )
  insert into public.distributor_sale_items(
    sale_id, storefront_order_id, order_item_key, sku, product_name, variant_name,
    quantity, gross_amount_cents, allocated_discount_cents, commissionable_amount_cents,
    original_commission_cents, metadata
  )
  select
    sale_id,
    storefront_order_id,
    coalesce(nullif(item ->> 'id', ''), coalesce(nullif(item ->> 'sku', ''), 'item') || ':' || item_number::text),
    nullif(item ->> 'sku', ''),
    nullif(item ->> 'product', ''),
    nullif(item ->> 'variant', ''),
    quantity,
    gross_amount_cents,
    allocated_discount_cents,
    item_commissionable,
    case when original_commissionable_revenue_cents = 0 then 0 else
      floor(original_commission_amount_cents::numeric * cumulative_commissionable / original_commissionable_revenue_cents)::integer
      - floor(original_commission_amount_cents::numeric * (cumulative_commissionable - item_commissionable) / original_commissionable_revenue_cents)::integer
    end,
    item
  from commission_running
  on conflict (sale_id, order_item_key) do nothing
$$;

create or replace function public.record_distributor_commission_earned()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.snapshot_distributor_sale_items(new.id);
  if new.original_commission_amount_cents > 0 then
    insert into public.distributor_commission_ledger(
      distributor_id, order_id, commission_id, entry_type, amount_cents, currency,
      reason_code, reason, source_type, source_reference, created_by,
      recovery_status, recovered_cents, remaining_cents, metadata, idempotency_key
    ) values (
      new.distributor_id, new.storefront_order_id, new.id, 'commission_earned',
      new.original_commission_amount_cents, new.currency, 'verified_paid_sale',
      'Commission earned from a verified paid sale.', 'system', new.order_reference,
      new.recorded_by, 'not_applicable', 0, 0,
      jsonb_build_object('commission_rate_bps', new.commission_rate_bps, 'commissionable_revenue_cents', new.original_commissionable_revenue_cents),
      'commission:' || new.id::text
    ) on conflict (idempotency_key) do nothing;
  end if;
  return new;
end
$$;

drop trigger if exists record_distributor_commission_earned_after_sale on public.distributor_sales;
create trigger record_distributor_commission_earned_after_sale
after insert on public.distributor_sales
for each row execute function public.record_distributor_commission_earned();

create or replace function public.recalculate_distributor_payout(target_payout_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  payout_status public.distributor_payout_status;
  gross_cents integer;
  positive_cents integer;
  negative_cents integer;
  recovery_cents integer;
begin
  select status into payout_status from public.distributor_payouts where id = target_payout_id for update;
  if payout_status is null then raise exception 'payout not found'; end if;
  if payout_status = 'paid' then raise exception 'paid payouts are immutable'; end if;

  select
    coalesce(sum(case when item.application_type = 'commission' then item.amount_cents else 0 end), 0)::integer,
    coalesce(sum(case when item.application_type = 'positive_adjustment' then item.amount_cents else 0 end), 0)::integer,
    abs(coalesce(sum(case when item.application_type = 'negative_adjustment' then item.amount_cents else 0 end), 0))::integer,
    abs(coalesce(sum(case when item.application_type = 'recovery' then item.amount_cents else 0 end), 0))::integer
  into gross_cents, positive_cents, negative_cents, recovery_cents
  from public.distributor_payout_ledger_items item
  where item.payout_id = target_payout_id;

  update public.distributor_payouts
  set
    gross_commission_cents = gross_cents,
    positive_adjustments_cents = positive_cents,
    negative_adjustments_cents = negative_cents,
    recoveries_applied_cents = recovery_cents,
    amount_cents = greatest(gross_cents + positive_cents - negative_cents - recovery_cents, 0),
    updated_at = now()
  where id = target_payout_id;
end
$$;

create or replace function public.apply_distributor_recovery_to_payout(target_ledger_entry_id uuid, target_payout_id uuid default null)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  ledger_row public.distributor_commission_ledger%rowtype;
  payout_row public.distributor_payouts%rowtype;
  available_cents integer;
  applied_cents integer;
  application_kind text;
begin
  select * into ledger_row from public.distributor_commission_ledger where id = target_ledger_entry_id for update;
  if not found or ledger_row.amount_cents >= 0 or ledger_row.remaining_cents = 0 then return 0; end if;

  if target_payout_id is null then
    select * into payout_row
    from public.distributor_payouts
    where distributor_id = ledger_row.distributor_id and currency = ledger_row.currency and status = 'draft'
    order by created_at desc
    limit 1 for update;
  else
    select * into payout_row
    from public.distributor_payouts
    where id = target_payout_id and distributor_id = ledger_row.distributor_id and currency = ledger_row.currency and status = 'draft'
    for update;
  end if;
  if not found then return 0; end if;

  select greatest(coalesce(sum(amount_cents), 0), 0)::integer
  into available_cents
  from public.distributor_payout_ledger_items
  where payout_id = payout_row.id;

  applied_cents := least(ledger_row.remaining_cents, available_cents);
  if applied_cents <= 0 then return 0; end if;
  application_kind := case when ledger_row.original_payout_id is null then 'negative_adjustment' else 'recovery' end;

  insert into public.distributor_payout_ledger_items(payout_id, ledger_entry_id, amount_cents, application_type)
  values (payout_row.id, ledger_row.id, -applied_cents, application_kind)
  on conflict (payout_id, ledger_entry_id) do nothing;
  if not found then return 0; end if;

  insert into public.distributor_recovery_allocations(ledger_entry_id, payout_id, amount_cents)
  values (ledger_row.id, payout_row.id, applied_cents)
  on conflict (ledger_entry_id, payout_id) do nothing;

  update public.distributor_commission_ledger
  set
    recovery_payout_id = payout_row.id,
    recovered_cents = recovered_cents + applied_cents,
    remaining_cents = remaining_cents - applied_cents,
    recovery_status = case when remaining_cents - applied_cents = 0 then 'recovered'::public.distributor_recovery_status else 'partial'::public.distributor_recovery_status end
  where id = ledger_row.id;

  perform public.recalculate_distributor_payout(payout_row.id);
  return applied_cents;
end
$$;

create or replace function public.refresh_distributor_sale_accounting_state(target_sale_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare net_commission integer;
begin
  select coalesce(sum(amount_cents), 0)::integer into net_commission
  from public.distributor_commission_ledger where commission_id = target_sale_id;
  if net_commission <= 0 then
    update public.distributor_sales
    set status = 'reversed', voided_at = coalesce(voided_at, now()), void_reason = coalesce(void_reason, 'Commission fully reversed in ledger')
    where id = target_sale_id and status <> 'reversed';
  else
    update public.distributor_sales sale
    set
      status = case
        when exists(
          select 1
          from public.distributor_payout_items item
          join public.distributor_payouts payout on payout.id = item.payout_id
          where item.sale_id = sale.id and payout.status = 'paid'
        ) then 'paid'::public.distributor_sale_status
        when sale.hold_until <= now() then 'approved'::public.distributor_sale_status
        else 'pending'::public.distributor_sale_status
      end,
      voided_at = null,
      void_reason = null
    where sale.id = target_sale_id and sale.status = 'reversed';
  end if;
end
$$;

create or replace function public.record_distributor_refund_internal(
  target_order_reference text,
  refund_event_cents integer,
  target_external_refund_id text,
  target_external_event_id text,
  target_payment_transaction_id uuid,
  target_reason_code text,
  target_public_reason text,
  target_internal_notes text,
  target_source_type public.distributor_ledger_source_type,
  target_source_reference text,
  target_created_by uuid,
  target_occurred_at timestamptz,
  target_refund_items jsonb,
  target_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
<<refund_operation>>
declare
  order_row public.storefront_orders%rowtype;
  sale_row public.distributor_sales%rowtype;
  sale_item_row public.distributor_sale_items%rowtype;
  input_item jsonb;
  refund_id uuid := gen_random_uuid();
  ledger_id uuid := gen_random_uuid();
  original_payout uuid;
  gross_order integer;
  previous_refunded integer;
  next_refunded integer;
  cumulative_eligible integer;
  eligible_event integer := 0;
  target_reversed integer;
  reversal_event integer := 0;
  item_amount integer;
  item_quantity integer;
  previous_item_quantity integer;
  item_eligible integer;
  item_target_reversed integer;
  single_order_item_id uuid;
  seen_item_ids uuid[] := '{}'::uuid[];
  full_refund boolean;
  existing_result jsonb;
begin
  select jsonb_build_object(
    'ok', true, 'duplicate', true, 'refundId', id,
    'commissionReversedCents', commission_reversed_cents,
    'commissionRemainingCents', commission_remaining_cents
  ) into existing_result
  from public.distributor_refunds where idempotency_key = target_idempotency_key;
  if existing_result is not null then return existing_result; end if;

  if refund_event_cents <= 0 then raise exception 'refund amount must be positive'; end if;
  if nullif(trim(target_external_refund_id), '') is null then raise exception 'external refund reference required'; end if;
  if nullif(trim(target_public_reason), '') is null then raise exception 'public refund reason required'; end if;

  select * into order_row from public.storefront_orders where order_reference = trim(target_order_reference) for update;
  if not found then raise exception 'storefront order not found'; end if;
  select * into sale_row from public.distributor_sales where storefront_order_id = order_row.id for update;
  if not found then raise exception 'distributor sale not found'; end if;

  gross_order := greatest(coalesce(
    order_row.total_cents,
    order_row.subtotal_cents - coalesce(order_row.discount_cents, 0) + coalesce(order_row.shipping_cents, 0) + coalesce(order_row.import_fee_cents, 0) + coalesce(order_row.processing_fee_cents, 0)
  ), 0);
  if gross_order = 0 then raise exception 'paid order amount is unavailable'; end if;

  select coalesce(sum(refund_event_cents), 0)::integer into previous_refunded
  from public.distributor_refunds where storefront_order_id = order_row.id;
  next_refunded := previous_refunded + refund_event_cents;
  if next_refunded > gross_order then raise exception 'refund exceeds the remaining paid order amount'; end if;

  perform public.snapshot_distributor_sale_items(sale_row.id);
  if jsonb_typeof(coalesce(target_refund_items, '[]'::jsonb)) = 'array' and jsonb_array_length(coalesce(target_refund_items, '[]'::jsonb)) > 0 then
    for input_item in select value from jsonb_array_elements(target_refund_items)
    loop
      select * into sale_item_row
      from public.distributor_sale_items
      where sale_id = sale_row.id
        and (
          id::text = nullif(input_item ->> 'order_item_id', '')
          or order_item_key = nullif(input_item ->> 'order_item_key', '')
        )
      for update;
      if not found then raise exception 'refunded sale item not found'; end if;

      if sale_item_row.id = any(seen_item_ids) then raise exception 'refunded sale item is duplicated'; end if;
      seen_item_ids := array_append(seen_item_ids, sale_item_row.id);
      select coalesce(sum(quantity), 0)::integer into previous_item_quantity
      from public.distributor_refund_items
      where sale_item_id = sale_item_row.id;

      item_quantity := greatest(coalesce((input_item ->> 'quantity')::integer, 0), 0);
      if item_quantity = 0 or previous_item_quantity + item_quantity > sale_item_row.quantity then raise exception 'invalid refunded item quantity'; end if;
      item_amount := coalesce(
        (input_item ->> 'amount_cents')::integer,
        floor(sale_item_row.commissionable_amount_cents::numeric * item_quantity / sale_item_row.quantity)::integer
      );
      if item_amount < 0 then raise exception 'refunded item amount cannot be negative'; end if;
      item_eligible := least(item_amount, sale_item_row.commissionable_amount_cents - sale_item_row.refunded_commissionable_cents);
      item_target_reversed := case
        when sale_item_row.refunded_commissionable_cents + item_eligible >= sale_item_row.commissionable_amount_cents then sale_item_row.original_commission_cents
        when sale_item_row.commissionable_amount_cents = 0 then 0
        else floor(
          sale_item_row.original_commission_cents::numeric
          * (sale_item_row.refunded_commissionable_cents + item_eligible)
          / sale_item_row.commissionable_amount_cents
        )::integer
      end;

      insert into public.distributor_refund_items(
        refund_id, sale_item_id, quantity, refund_amount_cents,
        commissionable_refund_cents, commission_reversal_cents
      ) values (
        refund_id, sale_item_row.id, item_quantity, item_amount,
        item_eligible, item_target_reversed - sale_item_row.commission_reversed_cents
      );

      update public.distributor_sale_items
      set
        refunded_commissionable_cents = refunded_commissionable_cents + item_eligible,
        commission_reversed_cents = item_target_reversed
      where id = sale_item_row.id;
      eligible_event := eligible_event + item_eligible;
      reversal_event := reversal_event + item_target_reversed - sale_item_row.commission_reversed_cents;
    end loop;
    if eligible_event > refund_event_cents then raise exception 'item refund allocation exceeds refund amount'; end if;
    cumulative_eligible := sale_row.refunded_commissionable_revenue_cents + eligible_event;
    target_reversed := sale_row.commission_reversed_cents + reversal_event;
  else
    cumulative_eligible := least(
      sale_row.original_commissionable_revenue_cents,
      floor(sale_row.original_commissionable_revenue_cents::numeric * next_refunded / gross_order)::integer
    );
    eligible_event := greatest(cumulative_eligible - sale_row.refunded_commissionable_revenue_cents, 0);
    target_reversed := case
      when next_refunded = gross_order or cumulative_eligible = sale_row.original_commissionable_revenue_cents then sale_row.original_commission_amount_cents
      when sale_row.original_commissionable_revenue_cents = 0 then 0
      else floor(
        sale_row.original_commission_amount_cents::numeric * cumulative_eligible
        / sale_row.original_commissionable_revenue_cents
      )::integer
    end;
    reversal_event := greatest(target_reversed - sale_row.commission_reversed_cents, 0);
  end if;

  target_reversed := least(target_reversed, sale_row.original_commission_amount_cents);
  reversal_event := least(reversal_event, sale_row.original_commission_amount_cents - sale_row.commission_reversed_cents);
  full_refund := next_refunded = gross_order or target_reversed = sale_row.original_commission_amount_cents;

  select case when count(*) = 1 then (array_agg(sale_item_id))[1] else null end
  into single_order_item_id
  from public.distributor_refund_items refund_item
  where refund_item.refund_id = refund_operation.refund_id;

  select payout.id into original_payout
  from public.distributor_payout_items item
  join public.distributor_payouts payout on payout.id = item.payout_id
  where item.sale_id = sale_row.id and payout.status = 'paid'
  order by payout.paid_at desc nulls last limit 1;

  if reversal_event > 0 then
    insert into public.distributor_commission_ledger(
      id, distributor_id, order_id, order_item_id, commission_id, payment_transaction_id,
      entry_type, amount_cents, currency, reason_code, reason, source_type,
      source_reference, created_by, original_payout_id, recovery_status,
      recovered_cents, remaining_cents, metadata, idempotency_key, created_at
    ) values (
      ledger_id, sale_row.distributor_id, order_row.id, single_order_item_id, sale_row.id, target_payment_transaction_id,
      (case when full_refund then 'full_refund_reversal' else 'partial_refund_reversal' end)::public.distributor_ledger_entry_type,
      -reversal_event, sale_row.currency, target_reason_code, trim(target_public_reason), target_source_type,
      target_source_reference, target_created_by, original_payout, 'pending', 0, reversal_event,
      jsonb_build_object('external_refund_id', target_external_refund_id, 'external_event_id', target_external_event_id, 'refund_event_cents', refund_event_cents),
      target_idempotency_key, coalesce(target_occurred_at, now())
    );
  else
    ledger_id := null;
  end if;

  insert into public.distributor_refunds(
    id, distributor_id, storefront_order_id, sale_id, payment_transaction_id,
    ledger_entry_id, provider, external_refund_id, external_event_id, gross_order_cents,
    refund_event_cents, refunded_total_cents, remaining_order_cents,
    original_commission_cents, commission_reversed_cents, commission_reversed_total_cents,
    commission_remaining_cents, currency, reason_code, public_reason, internal_notes,
    source_type, created_by, occurred_at, metadata, idempotency_key
  ) values (
    refund_id, sale_row.distributor_id, order_row.id, sale_row.id, target_payment_transaction_id,
    ledger_id, coalesce(nullif(split_part(target_source_reference, ':', 1), ''), 'manual'),
    trim(target_external_refund_id), target_external_event_id, gross_order,
    refund_event_cents, next_refunded, gross_order - next_refunded,
    sale_row.original_commission_amount_cents, reversal_event, target_reversed,
    sale_row.original_commission_amount_cents - target_reversed, sale_row.currency,
    target_reason_code, trim(target_public_reason), nullif(trim(target_internal_notes), ''),
    target_source_type, target_created_by, coalesce(target_occurred_at, now()),
    jsonb_build_object('commissionable_refund_cents', eligible_event), target_idempotency_key
  );

  update public.distributor_sales
  set
    refund_cents = cumulative_eligible,
    refunded_commissionable_revenue_cents = cumulative_eligible,
    commission_reversed_cents = target_reversed
  where id = sale_row.id;

  update public.storefront_orders
  set
    refunded_cents = next_refunded,
    status = case when order_row.status = 'cancelled' then 'cancelled' when full_refund then 'refunded' else 'partially_refunded' end,
    updated_at = now()
  where id = order_row.id;

  if ledger_id is not null then perform public.apply_distributor_recovery_to_payout(ledger_id, null); end if;
  perform public.refresh_distributor_sale_accounting_state(sale_row.id);

  return jsonb_build_object(
    'ok', true,
    'duplicate', false,
    'refundId', refund_id,
    'ledgerEntryId', ledger_id,
    'grossOrderCents', gross_order,
    'refundEventCents', refund_event_cents,
    'refundedTotalCents', next_refunded,
    'remainingOrderCents', gross_order - next_refunded,
    'originalCommissionCents', sale_row.original_commission_amount_cents,
    'commissionReversedCents', reversal_event,
    'commissionReversedTotalCents', target_reversed,
    'commissionRemainingCents', sale_row.original_commission_amount_cents - target_reversed
  );
end
$$;

create or replace function public.preview_distributor_refund(
  target_order_reference text,
  target_refund_cents integer,
  target_refund_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  order_row public.storefront_orders%rowtype;
  sale_row public.distributor_sales%rowtype;
  sale_item_row public.distributor_sale_items%rowtype;
  input_item jsonb;
  gross_order integer;
  previous_refunded integer;
  next_refunded integer;
  target_eligible integer;
  target_reversed integer;
  item_quantity integer;
  previous_item_quantity integer;
  item_amount integer;
  item_eligible integer;
  item_target_reversed integer;
  preview_reversal integer := 0;
  original_payout_id uuid;
  draft_payout_id uuid;
  available_cents integer := 0;
  seen_item_ids uuid[] := '{}'::uuid[];
begin
  if (select auth.uid()) is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if target_refund_cents <= 0 then raise exception 'refund amount must be positive'; end if;
  select * into order_row from public.storefront_orders where order_reference = trim(target_order_reference);
  if not found then raise exception 'storefront order not found'; end if;
  select * into sale_row from public.distributor_sales where storefront_order_id = order_row.id;
  if not found then raise exception 'distributor sale not found'; end if;
  gross_order := greatest(coalesce(order_row.total_cents, order_row.subtotal_cents - coalesce(order_row.discount_cents, 0) + coalesce(order_row.shipping_cents, 0) + coalesce(order_row.import_fee_cents, 0) + coalesce(order_row.processing_fee_cents, 0)), 0);
  select coalesce(sum(refund_event_cents), 0)::integer into previous_refunded from public.distributor_refunds where storefront_order_id = order_row.id;
  next_refunded := previous_refunded + target_refund_cents;
  if next_refunded > gross_order then raise exception 'refund exceeds the remaining paid order amount'; end if;
  if jsonb_typeof(coalesce(target_refund_items, '[]'::jsonb)) = 'array' and jsonb_array_length(coalesce(target_refund_items, '[]'::jsonb)) > 0 then
    for input_item in select value from jsonb_array_elements(target_refund_items)
    loop
      select * into sale_item_row from public.distributor_sale_items
      where sale_id = sale_row.id and (id::text = nullif(input_item ->> 'order_item_id', '') or order_item_key = nullif(input_item ->> 'order_item_key', ''));
      if not found then raise exception 'refunded sale item not found'; end if;
      if sale_item_row.id = any(seen_item_ids) then raise exception 'refunded sale item is duplicated'; end if;
      seen_item_ids := array_append(seen_item_ids, sale_item_row.id);
      select coalesce(sum(quantity), 0)::integer into previous_item_quantity
      from public.distributor_refund_items
      where sale_item_id = sale_item_row.id;
      item_quantity := greatest(coalesce((input_item ->> 'quantity')::integer, 0), 0);
      if item_quantity = 0 or previous_item_quantity + item_quantity > sale_item_row.quantity then raise exception 'invalid refunded item quantity'; end if;
      item_amount := coalesce((input_item ->> 'amount_cents')::integer, floor(sale_item_row.commissionable_amount_cents::numeric * item_quantity / sale_item_row.quantity)::integer);
      if item_amount < 0 then raise exception 'refunded item amount cannot be negative'; end if;
      item_eligible := least(item_amount, sale_item_row.commissionable_amount_cents - sale_item_row.refunded_commissionable_cents);
      item_target_reversed := case
        when sale_item_row.refunded_commissionable_cents + item_eligible >= sale_item_row.commissionable_amount_cents then sale_item_row.original_commission_cents
        when sale_item_row.commissionable_amount_cents = 0 then 0
        else floor(sale_item_row.original_commission_cents::numeric * (sale_item_row.refunded_commissionable_cents + item_eligible) / sale_item_row.commissionable_amount_cents)::integer
      end;
      preview_reversal := preview_reversal + item_target_reversed - sale_item_row.commission_reversed_cents;
    end loop;
    target_reversed := least(sale_row.commission_reversed_cents + preview_reversal, sale_row.original_commission_amount_cents);
  else
    target_eligible := least(sale_row.original_commissionable_revenue_cents, floor(sale_row.original_commissionable_revenue_cents::numeric * next_refunded / gross_order)::integer);
    target_reversed := case
      when next_refunded = gross_order or target_eligible = sale_row.original_commissionable_revenue_cents then sale_row.original_commission_amount_cents
      when sale_row.original_commissionable_revenue_cents = 0 then 0
      else floor(sale_row.original_commission_amount_cents::numeric * target_eligible / sale_row.original_commissionable_revenue_cents)::integer
    end;
  end if;
  select payout.id into original_payout_id
  from public.distributor_payout_items item
  join public.distributor_payouts payout on payout.id = item.payout_id
  where item.sale_id = sale_row.id and payout.status = 'paid'
  order by payout.paid_at desc nulls last limit 1;
  select payout.id into draft_payout_id
  from public.distributor_payouts payout
  where payout.distributor_id = sale_row.distributor_id
    and payout.currency = sale_row.currency
    and payout.status = 'draft'
  order by payout.created_at desc limit 1;
  if draft_payout_id is not null then
    select greatest(coalesce(sum(amount_cents), 0), 0)::integer into available_cents
    from public.distributor_payout_ledger_items
    where payout_id = draft_payout_id;
  end if;
  return jsonb_build_object(
    'grossOrderCents', gross_order,
    'alreadyRefundedCents', previous_refunded,
    'refundEventCents', target_refund_cents,
    'refundedTotalCents', next_refunded,
    'remainingOrderCents', gross_order - next_refunded,
    'originalCommissionCents', sale_row.original_commission_amount_cents,
    'alreadyReversedCents', sale_row.commission_reversed_cents,
    'newAdjustmentCents', greatest(target_reversed - sale_row.commission_reversed_cents, 0),
    'netCommissionCents', sale_row.original_commission_amount_cents - target_reversed,
    'affectedPayoutId', coalesce(draft_payout_id, original_payout_id),
    'pendingRecoveryCents', greatest(target_reversed - sale_row.commission_reversed_cents - available_cents, 0)
  );
end
$$;

create or replace function public.admin_record_distributor_refund(
  target_order_reference text,
  target_refund_cents integer,
  target_external_refund_id text,
  target_reason_code text,
  target_public_reason text,
  target_internal_notes text default null,
  target_refund_items jsonb default '[]'::jsonb,
  target_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  sale_row public.distributor_sales%rowtype;
  result jsonb;
  account_id uuid;
begin
  if actor is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  select sale.* into sale_row
  from public.distributor_sales sale
  where sale.order_reference = trim(target_order_reference);
  account_id := sale_row.distributor_id;
  begin
    result := public.record_distributor_refund_internal(
      target_order_reference, target_refund_cents, target_external_refund_id, null, null,
      coalesce(nullif(trim(target_reason_code), ''), 'customer_refund'), target_public_reason,
      target_internal_notes, 'administrator', 'manual:' || target_external_refund_id,
      actor, now(), target_refund_items,
      coalesce(nullif(trim(target_idempotency_key), ''), 'admin-refund:' || target_external_refund_id)
    );
    insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, success, metadata)
    values (actor, account_id, 'refund_recorded', 'distributor_refund', (result ->> 'refundId')::uuid, true, result);
    return result;
  exception when others then
    insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, success, error_code, metadata)
    values (actor, account_id, 'refund_record_failed', 'distributor_refund', false, sqlstate, jsonb_build_object('order_reference', target_order_reference, 'refund_cents', target_refund_cents, 'error', sqlerrm));
    return jsonb_build_object('ok', false, 'error', sqlerrm, 'code', sqlstate);
  end;
end
$$;

create or replace function public.preview_distributor_adjustment(
  target_distributor_id uuid,
  target_sale_id uuid,
  target_direction text,
  target_amount_cents integer,
  target_payout_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  original_commission integer := 0;
  current_net integer := 0;
  original_payout_id uuid;
  draft_payout_id uuid;
  available_cents integer := 0;
  signed_amount integer;
  currency_code text := 'USD';
begin
  if (select auth.uid()) is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if target_amount_cents <= 0 then raise exception 'adjustment amount must be positive'; end if;
  if target_direction not in ('positive', 'negative') then raise exception 'adjustment direction is invalid'; end if;
  signed_amount := case when target_direction = 'positive' then target_amount_cents else -target_amount_cents end;
  if target_sale_id is not null then
    select original_commission_amount_cents into original_commission from public.distributor_sales where id = target_sale_id and distributor_id = target_distributor_id;
    if not found then raise exception 'related distributor sale not found'; end if;
    select currency into currency_code from public.distributor_sales where id = target_sale_id;
    select coalesce(sum(amount_cents), 0)::integer into current_net from public.distributor_commission_ledger where commission_id = target_sale_id;
    select payout.id into original_payout_id
    from public.distributor_payout_items item
    join public.distributor_payouts payout on payout.id = item.payout_id
    where item.sale_id = target_sale_id and payout.status = 'paid'
    order by payout.paid_at desc nulls last limit 1;
  end if;
  if target_payout_id is not null then
    select id into draft_payout_id
    from public.distributor_payouts
    where id = target_payout_id and distributor_id = target_distributor_id
      and currency = currency_code and status = 'draft';
    if not found then raise exception 'requested draft payout is not eligible'; end if;
  elsif target_direction = 'negative' then
    select id into draft_payout_id
    from public.distributor_payouts
    where distributor_id = target_distributor_id and currency = currency_code and status = 'draft'
    order by created_at desc limit 1;
  end if;
  if draft_payout_id is not null then
    select greatest(coalesce(sum(amount_cents), 0), 0)::integer into available_cents
    from public.distributor_payout_ledger_items
    where payout_id = draft_payout_id;
  end if;
  return jsonb_build_object(
    'originalCommissionCents', original_commission,
    'alreadyReversedCents', greatest(original_commission - current_net, 0),
    'newAdjustmentCents', signed_amount,
    'netCommissionCents', current_net + signed_amount,
    'affectedPayoutId', coalesce(draft_payout_id, original_payout_id),
    'pendingRecoveryCents', case when signed_amount < 0 then greatest(abs(signed_amount) - available_cents, 0) else 0 end
  );
end
$$;

create or replace function public.admin_create_distributor_adjustment(
  target_distributor_id uuid,
  target_sale_id uuid,
  target_direction text,
  target_amount_cents integer,
  target_reason_code text,
  target_reason text,
  target_payout_id uuid default null,
  target_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  sale_row public.distributor_sales%rowtype;
  ledger_id uuid := gen_random_uuid();
  signed_amount integer;
  entry_kind public.distributor_ledger_entry_type;
  original_payout uuid;
  order_id uuid;
  currency_code text := 'USD';
  key_value text;
begin
  if actor is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  begin
    if target_amount_cents <= 0 then raise exception 'adjustment amount must be positive'; end if;
    if target_direction not in ('positive', 'negative') then raise exception 'adjustment direction is invalid'; end if;
    if nullif(trim(target_reason_code), '') is null then raise exception 'adjustment reason code required'; end if;
    if nullif(trim(target_reason), '') is null then raise exception 'adjustment explanation required'; end if;
    if not exists(select 1 from public.distributor_accounts where id = target_distributor_id) then raise exception 'distributor not found'; end if;
    if target_sale_id is not null then
      select * into sale_row from public.distributor_sales where id = target_sale_id and distributor_id = target_distributor_id;
      if not found then raise exception 'related distributor sale not found'; end if;
      order_id := sale_row.storefront_order_id;
      currency_code := sale_row.currency;
      select payout.id into original_payout from public.distributor_payout_items item join public.distributor_payouts payout on payout.id = item.payout_id where item.sale_id = sale_row.id and payout.status = 'paid' order by payout.paid_at desc nulls last limit 1;
    end if;
    signed_amount := case when target_direction = 'positive' then target_amount_cents else -target_amount_cents end;
    entry_kind := (case when target_direction = 'positive' then 'manual_positive_adjustment' else 'manual_negative_adjustment' end)::public.distributor_ledger_entry_type;
    key_value := coalesce(nullif(trim(target_idempotency_key), ''), 'admin-adjustment:' || ledger_id::text);
    insert into public.distributor_commission_ledger(
      id, distributor_id, order_id, commission_id, entry_type, amount_cents, currency,
      reason_code, reason, source_type, source_reference, created_by, original_payout_id,
      recovery_status, recovered_cents, remaining_cents, metadata, idempotency_key
    ) values (
      ledger_id, target_distributor_id, order_id, target_sale_id, entry_kind, signed_amount,
      currency_code, trim(target_reason_code), trim(target_reason), 'administrator',
      'admin:' || actor::text, actor, case when signed_amount < 0 then original_payout else null end,
      (case when signed_amount < 0 then 'pending' else 'not_applicable' end)::public.distributor_recovery_status,
      0, case when signed_amount < 0 then target_amount_cents else 0 end,
      jsonb_build_object('requested_payout_id', target_payout_id), key_value
    );
    if signed_amount < 0 then
      perform public.apply_distributor_recovery_to_payout(ledger_id, target_payout_id);
    elsif target_payout_id is not null then
      if not exists(
        select 1 from public.distributor_payouts
        where id = target_payout_id and distributor_id = target_distributor_id
          and currency = currency_code and status = 'draft'
      ) then raise exception 'requested draft payout is not eligible'; end if;
      insert into public.distributor_payout_ledger_items(payout_id, ledger_entry_id, amount_cents, application_type)
      values (target_payout_id, ledger_id, signed_amount, 'positive_adjustment');
      perform public.recalculate_distributor_payout(target_payout_id);
    end if;
    if target_sale_id is not null then perform public.refresh_distributor_sale_accounting_state(target_sale_id); end if;
    insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, success, metadata)
    values (actor, target_distributor_id, 'manual_adjustment_recorded', 'distributor_ledger', ledger_id, true, jsonb_build_object('direction', target_direction, 'amount_cents', target_amount_cents, 'reason_code', target_reason_code));
    return jsonb_build_object('ok', true, 'ledgerEntryId', ledger_id, 'amountCents', signed_amount);
  exception when others then
    insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, success, error_code, metadata)
    values (actor, target_distributor_id, 'manual_adjustment_failed', 'distributor_ledger', false, sqlstate, jsonb_build_object('direction', target_direction, 'amount_cents', target_amount_cents, 'reason_code', target_reason_code, 'error', sqlerrm));
    return jsonb_build_object('ok', false, 'error', sqlerrm, 'code', sqlstate);
  end;
end
$$;

create or replace function public.record_distributor_chargeback_internal(
  target_order_reference text,
  target_amount_cents integer,
  target_is_reversal boolean,
  target_payment_transaction_id uuid,
  target_reason_code text,
  target_reason text,
  target_source_type public.distributor_ledger_source_type,
  target_source_reference text,
  target_created_by uuid,
  target_occurred_at timestamptz,
  target_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_row public.storefront_orders%rowtype;
  sale_row public.distributor_sales%rowtype;
  ledger_id uuid := gen_random_uuid();
  original_payout uuid;
  gross_order integer;
  refunded_reversal integer;
  chargeback_net integer;
  outstanding_chargeback integer;
  exposed_commission integer;
  proportional_commission integer;
  movement_cents integer;
begin
  if exists(select 1 from public.distributor_commission_ledger where idempotency_key = target_idempotency_key) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  if target_amount_cents <= 0 then raise exception 'chargeback amount must be positive'; end if;
  select * into order_row from public.storefront_orders where order_reference = trim(target_order_reference) for update;
  if not found then raise exception 'storefront order not found'; end if;
  select * into sale_row from public.distributor_sales where storefront_order_id = order_row.id for update;
  if not found then raise exception 'distributor sale not found'; end if;
  gross_order := greatest(coalesce(order_row.total_cents, order_row.subtotal_cents - coalesce(order_row.discount_cents, 0) + coalesce(order_row.shipping_cents, 0) + coalesce(order_row.import_fee_cents, 0) + coalesce(order_row.processing_fee_cents, 0)), 1);
  select
    abs(coalesce(sum(amount_cents) filter (where entry_type in ('partial_refund_reversal', 'full_refund_reversal')), 0))::integer,
    coalesce(sum(amount_cents) filter (where entry_type in ('chargeback', 'chargeback_reversal')), 0)::integer
  into refunded_reversal, chargeback_net
  from public.distributor_commission_ledger where commission_id = sale_row.id;
  outstanding_chargeback := abs(least(chargeback_net, 0));
  exposed_commission := greatest(sale_row.original_commission_amount_cents - refunded_reversal - outstanding_chargeback, 0);
  proportional_commission := floor(sale_row.original_commission_amount_cents::numeric * least(target_amount_cents, gross_order) / gross_order)::integer;
  movement_cents := case when target_is_reversal then least(proportional_commission, outstanding_chargeback) else least(proportional_commission, exposed_commission) end;
  if movement_cents = 0 then return jsonb_build_object('ok', true, 'duplicate', false, 'amountCents', 0, 'reason', 'no_commission_exposure'); end if;
  select payout.id into original_payout from public.distributor_payout_items item join public.distributor_payouts payout on payout.id = item.payout_id where item.sale_id = sale_row.id and payout.status = 'paid' order by payout.paid_at desc nulls last limit 1;
  insert into public.distributor_commission_ledger(
    id, distributor_id, order_id, commission_id, payment_transaction_id, entry_type,
    amount_cents, currency, reason_code, reason, source_type, source_reference,
    created_by, original_payout_id, recovery_status, recovered_cents,
    remaining_cents, metadata, idempotency_key, created_at
  ) values (
    ledger_id, sale_row.distributor_id, order_row.id, sale_row.id, target_payment_transaction_id,
    (case when target_is_reversal then 'chargeback_reversal' else 'chargeback' end)::public.distributor_ledger_entry_type,
    case when target_is_reversal then movement_cents else -movement_cents end,
    sale_row.currency, target_reason_code, target_reason, target_source_type,
    target_source_reference, target_created_by, case when target_is_reversal then null else original_payout end,
    (case when target_is_reversal then 'not_applicable' else 'pending' end)::public.distributor_recovery_status,
    0, case when target_is_reversal then 0 else movement_cents end,
    jsonb_build_object('chargeback_amount_cents', target_amount_cents, 'refund_commission_already_reversed_cents', refunded_reversal),
    target_idempotency_key, coalesce(target_occurred_at, now())
  );
  update public.storefront_orders set status = case when target_is_reversal then case when refunded_cents > 0 then 'partially_refunded' else 'chargeback_reversed' end else 'chargeback' end, updated_at = now() where id = order_row.id;
  if not target_is_reversal then perform public.apply_distributor_recovery_to_payout(ledger_id, null); end if;
  perform public.refresh_distributor_sale_accounting_state(sale_row.id);
  return jsonb_build_object('ok', true, 'duplicate', false, 'ledgerEntryId', ledger_id, 'amountCents', case when target_is_reversal then movement_cents else -movement_cents end);
end
$$;

create or replace function public.record_distributor_payment_event(
  target_provider text,
  target_event_id text,
  target_event_type text,
  target_order_reference text,
  target_provider_transaction_id text,
  target_external_object_id text,
  target_amount_cents integer,
  target_cumulative_amount_cents integer,
  target_currency text,
  target_occurred_at timestamptz,
  target_reason text,
  target_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_id uuid := gen_random_uuid();
  order_row public.storefront_orders%rowtype;
  transaction_id uuid;
  result jsonb;
  previous_refunded integer;
  delta_cents integer;
  existing_event_status text;
begin
  insert into public.distributor_payment_events(
    id, provider, external_event_id, event_type, external_object_id, amount_cents,
    cumulative_amount_cents, currency, occurred_at, payload
  ) values (
    event_id, trim(target_provider), trim(target_event_id), trim(target_event_type),
    target_external_object_id, target_amount_cents, target_cumulative_amount_cents,
    upper(coalesce(nullif(target_currency, ''), 'USD')), target_occurred_at, coalesce(target_payload, '{}'::jsonb)
  ) on conflict (provider, external_event_id) do nothing;
  if not found then
    select id, processing_status into event_id, existing_event_status
    from public.distributor_payment_events
    where provider = trim(target_provider) and external_event_id = trim(target_event_id)
    for update;
    if existing_event_status <> 'failed' then return jsonb_build_object('ok', true, 'duplicate', true); end if;
    update public.distributor_payment_events
    set processing_status = 'received', error_code = null, processed_at = null,
        received_at = now(), payload = coalesce(target_payload, '{}'::jsonb)
    where id = event_id;
  end if;

  begin
    select * into order_row from public.storefront_orders where order_reference = trim(target_order_reference) for update;
    if not found then raise exception 'storefront order not found'; end if;
    update public.distributor_payment_events set storefront_order_id = order_row.id where id = event_id;
    if nullif(trim(target_provider_transaction_id), '') is not null then
      insert into public.distributor_payment_transactions(
        storefront_order_id, provider, provider_transaction_id, amount_cents,
        currency, status, captured_at, metadata
      ) values (
        order_row.id, trim(target_provider), trim(target_provider_transaction_id),
        greatest(coalesce(order_row.total_cents, order_row.subtotal_cents), 0), upper(coalesce(nullif(target_currency, ''), 'USD')),
        'captured', order_row.paid_at, jsonb_build_object('created_from_event', target_event_id)
      ) on conflict (provider, provider_transaction_id) do update set updated_at = now()
      returning id into transaction_id;
      update public.distributor_payment_events set payment_transaction_id = transaction_id where id = event_id;
    end if;

    if target_event_type in ('refund.created', 'refund.updated', 'payment.refunded') then
      select coalesce(sum(refund_event_cents), 0)::integer into previous_refunded from public.distributor_refunds where storefront_order_id = order_row.id;
      delta_cents := case
        when target_cumulative_amount_cents is not null then greatest(target_cumulative_amount_cents - previous_refunded, 0)
        when target_event_type in ('refund.updated', 'payment.refunded') then greatest(coalesce(target_amount_cents, 0) - previous_refunded, 0)
        else greatest(coalesce(target_amount_cents, 0), 0)
      end;
      if delta_cents = 0 then
        result := jsonb_build_object('ok', true, 'ignored', true, 'reason', 'out_of_order_or_already_applied');
      else
        result := public.record_distributor_refund_internal(
          order_row.order_reference, delta_cents, coalesce(nullif(target_external_object_id, ''), target_event_id),
          target_event_id, transaction_id, 'processor_refund', coalesce(nullif(target_reason, ''), 'Payment processor refund.'),
          null, 'webhook', trim(target_provider) || ':' || target_event_id, null,
          target_occurred_at, '[]'::jsonb, 'webhook:' || trim(target_provider) || ':' || target_event_id
        );
      end if;
    elsif target_event_type in ('chargeback.opened', 'chargeback.lost') then
      result := public.record_distributor_chargeback_internal(
        order_row.order_reference, target_amount_cents, false, transaction_id,
        'processor_chargeback', coalesce(nullif(target_reason, ''), 'Payment chargeback opened.'),
        'webhook', trim(target_provider) || ':' || target_event_id, null,
        target_occurred_at, 'webhook:' || trim(target_provider) || ':' || target_event_id
      );
    elsif target_event_type in ('chargeback.won', 'chargeback.reversed') then
      result := public.record_distributor_chargeback_internal(
        order_row.order_reference, target_amount_cents, true, transaction_id,
        'processor_chargeback_reversal', coalesce(nullif(target_reason, ''), 'Payment chargeback reversed.'),
        'webhook', trim(target_provider) || ':' || target_event_id, null,
        target_occurred_at, 'webhook:' || trim(target_provider) || ':' || target_event_id
      );
    else
      result := jsonb_build_object('ok', true, 'ignored', true, 'reason', 'unsupported_event_type');
    end if;

    update public.distributor_payment_events
    set processing_status = case when coalesce((result ->> 'ignored')::boolean, false) then 'ignored' else 'processed' end,
        processed_at = now()
    where id = event_id;
    return result || jsonb_build_object('eventId', event_id, 'duplicate', false);
  exception when others then
    update public.distributor_payment_events set processing_status = 'failed', error_code = sqlstate, processed_at = now() where id = event_id;
    return jsonb_build_object('ok', false, 'eventId', event_id, 'error', sqlerrm, 'code', sqlstate);
  end;
end
$$;

-- Phase-one sale creation now automatically receives its immutable earned
-- entry via record_distributor_commission_earned_after_sale. Cancellations of a
-- captured payment create a full compensating refund instead of editing a paid
-- commission or payout.
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
  remaining_order_refund integer;
begin
  if new.distributor_id is null then return new; end if;
  select * into referral_record from public.distributor_referrals where storefront_order_id = new.id;
  if not found then return new; end if;

  if new.status = 'paid' and new.paid_at is not null then
    select * into account_record from public.distributor_accounts where id = new.distributor_id;
    if not found then return new; end if;
    effective_paid_at := new.paid_at;
    effective_shipping := coalesce(new.shipping_cents, 0);
    insert into public.distributor_sales(
      distributor_id, referral_id, storefront_order_id, paid_at, hold_until,
      order_reference, currency, gross_revenue_cents, discount_cents,
      discount_source, distributor_discount_cents, other_promotion_won,
      refund_cents, tax_cents, shipping_cents, commission_rate_bps, status, recorded_by,
      original_commissionable_revenue_cents, original_commission_amount_cents
    ) values (
      account_record.id, referral_record.id, new.id, effective_paid_at,
      effective_paid_at + make_interval(days => account_record.commission_hold_days),
      new.order_reference, coalesce(new.currency, 'USD'), new.subtotal_cents + effective_shipping,
      coalesce(new.discount_cents, 0), new.discount_source, new.distributor_discount_cents,
      new.other_promotion_won, 0, 0, effective_shipping, account_record.commission_rate_bps,
      'pending', new.marked_paid_by,
      greatest(new.subtotal_cents - coalesce(new.discount_cents, 0), 0),
      floor(greatest(new.subtotal_cents - coalesce(new.discount_cents, 0), 0) * account_record.commission_rate_bps::numeric / 10000)::integer
    ) on conflict (storefront_order_id) do update set
      paid_at = case when public.distributor_sales.status in ('pending', 'voided', 'reversed') then excluded.paid_at else public.distributor_sales.paid_at end,
      hold_until = case when public.distributor_sales.status in ('pending', 'voided', 'reversed') then excluded.hold_until else public.distributor_sales.hold_until end,
      status = case when public.distributor_sales.status in ('voided', 'reversed') then 'pending' else public.distributor_sales.status end,
      voided_at = case when public.distributor_sales.status in ('voided', 'reversed') then null else public.distributor_sales.voided_at end,
      void_reason = case when public.distributor_sales.status in ('voided', 'reversed') then null else public.distributor_sales.void_reason end,
      recorded_by = coalesce(excluded.recorded_by, public.distributor_sales.recorded_by)
    returning id into sale_id;
    update public.distributor_referrals set stage = 'converted', converted_at = effective_paid_at, updated_at = now() where id = referral_record.id;
  elsif old.status = 'paid' and new.status = 'cancelled' then
    select greatest(coalesce(old.total_cents, old.subtotal_cents - coalesce(old.discount_cents, 0) + coalesce(old.shipping_cents, 0) + coalesce(old.import_fee_cents, 0) + coalesce(old.processing_fee_cents, 0)) - coalesce(old.refunded_cents, 0), 0)
    into remaining_order_refund;
    if remaining_order_refund > 0 then
      perform public.record_distributor_refund_internal(
        old.order_reference, remaining_order_refund, 'cancel:' || old.id::text, null, null,
        'captured_order_cancelled', 'Captured order cancelled.', null, 'system',
        'system:order-cancellation', (select auth.uid()), now(), '[]'::jsonb,
        'order-cancellation:' || old.id::text
      );
    end if;
    update public.distributor_referrals set stage = 'qualified', converted_at = null, updated_at = now() where id = referral_record.id;
  end if;
  return new;
end
$$;

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
    if new.distributor_id is null or nullif(new.distributor_customer_fingerprint, '') is null then raise exception 'paid distributor incentive requires validated attribution and customer identity'; end if;
    insert into public.distributor_customer_redemptions(distributor_id, storefront_order_id, customer_fingerprint, status, consumed_at)
    values (new.distributor_id, new.id, new.distributor_customer_fingerprint, 'consumed', new.paid_at)
    on conflict (customer_fingerprint) where status = 'consumed' do nothing returning id into inserted_redemption_id;
    if inserted_redemption_id is null then raise exception 'distributor first-purchase incentive was already redeemed'; end if;
  elsif old.status in ('paid', 'partially_refunded', 'chargeback', 'chargeback_reversed') and new.status in ('refunded', 'cancelled') then
    update public.distributor_customer_redemptions set status = 'reversed', reversed_at = now() where storefront_order_id = new.id and status = 'consumed';
  end if;
  return new;
end
$$;

-- Replace payout generation with ledger allocation. Credits are included once,
-- pending negative entries are recovered oldest-first, partial recovery is
-- carried forward, and the resulting payout can never be negative.
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
  payout_provider_name text;
  minimum_cents integer;
  credit record;
  debit record;
  positive_total integer := 0;
  applied integer;
begin
  if (select auth.uid()) is null or not public.portal_is_admin() then raise exception 'administrator permission required'; end if;
  if payout_period_end < payout_period_start then raise exception 'invalid payout period'; end if;
  select payout_provider, payout_minimum_cents into payout_provider_name, minimum_cents from public.distributor_accounts where id = target_distributor_id and status in ('active', 'suspended') for update;
  if not found then raise exception 'payable distributor not found'; end if;
  update public.distributor_sales set status = 'approved', approved_at = coalesce(approved_at, now()) where distributor_id = target_distributor_id and status = 'pending' and hold_until <= now();
  insert into public.distributor_payouts(distributor_id, period_start, period_end, amount_cents, provider, created_by)
  values (target_distributor_id, payout_period_start, payout_period_end, 0, payout_provider_name, (select auth.uid())) returning id into created_payout_id;

  for credit in
    select ledger.*
    from public.distributor_commission_ledger ledger
    left join public.distributor_sales sale on sale.id = ledger.commission_id
    where ledger.distributor_id = target_distributor_id
      and ledger.amount_cents > 0
      and not exists(select 1 from public.distributor_payout_ledger_items existing where existing.ledger_entry_id = ledger.id and existing.amount_cents > 0)
      and (
        (ledger.entry_type in ('commission_earned', 'legacy_balance') and sale.status = 'approved' and sale.paid_at::date between payout_period_start and payout_period_end)
        or (ledger.entry_type in ('manual_positive_adjustment', 'chargeback_reversal') and ledger.created_at::date <= payout_period_end)
      )
    order by ledger.created_at, ledger.id
  loop
    insert into public.distributor_payout_ledger_items(payout_id, ledger_entry_id, amount_cents, application_type)
    values (created_payout_id, credit.id, credit.amount_cents, case when credit.entry_type in ('commission_earned', 'legacy_balance') then 'commission' else 'positive_adjustment' end);
    positive_total := positive_total + credit.amount_cents;
  end loop;
  if positive_total = 0 then delete from public.distributor_payouts where id = created_payout_id; raise exception 'no approved commissions or credits in this period'; end if;

  for debit in
    select id from public.distributor_commission_ledger
    where distributor_id = target_distributor_id and amount_cents < 0 and remaining_cents > 0
    order by created_at, id
  loop
    applied := public.apply_distributor_recovery_to_payout(debit.id, created_payout_id);
    exit when applied = 0;
  end loop;
  perform public.recalculate_distributor_payout(created_payout_id);
  if (select amount_cents from public.distributor_payouts where id = created_payout_id) > 0
     and positive_total < minimum_cents
     and not exists(select 1 from public.distributor_payout_ledger_items where payout_id = created_payout_id and amount_cents < 0)
  then
    raise exception 'payout minimum not reached';
  end if;

  insert into public.distributor_payout_items(payout_id, sale_id, commission_amount_cents)
  select created_payout_id, ledger.commission_id, ledger.amount_cents
  from public.distributor_payout_ledger_items item
  join public.distributor_commission_ledger ledger on ledger.id = item.ledger_entry_id
  where item.payout_id = created_payout_id and item.application_type = 'commission' and ledger.commission_id is not null
  on conflict (sale_id) do nothing;
  update public.distributor_sales set status = 'in_payout' where id in (select sale_id from public.distributor_payout_items where payout_id = created_payout_id);
  insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, metadata)
  select (select auth.uid()), target_distributor_id, 'payout_created', 'distributor_payout', created_payout_id,
    jsonb_build_object('gross_commission_cents', gross_commission_cents, 'positive_adjustments_cents', positive_adjustments_cents, 'negative_adjustments_cents', negative_adjustments_cents, 'recoveries_applied_cents', recoveries_applied_cents, 'amount_cents', amount_cents)
  from public.distributor_payouts where id = created_payout_id;
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
  perform public.recalculate_distributor_payout(target_payout_id);
  update public.distributor_payouts set status = 'paid', external_reference = trim(payment_reference), paid_at = now(), paid_by = (select auth.uid()), updated_at = now()
  where id = target_payout_id and status in ('draft', 'processing') returning distributor_id into target_distributor_id;
  if target_distributor_id is null then raise exception 'eligible payout not found'; end if;
  update public.distributor_sales set status = 'paid' where id in (select sale_id from public.distributor_payout_items where payout_id = target_payout_id) and status = 'in_payout';
  insert into public.distributor_audit_events(actor_id, distributor_id, event_type, resource_type, resource_id, metadata)
  values ((select auth.uid()), target_distributor_id, 'payout_marked_paid', 'distributor_payout', target_payout_id, jsonb_build_object('external_reference', trim(payment_reference)));
end
$$;

-- Backfill existing sales. legacy_balance identifies migrated opening balances;
-- known refund_cents values receive a separate compensating entry. ON CONFLICT
-- makes the backfill safe to execute again without duplicating balances.
select public.snapshot_distributor_sale_items(id) from public.distributor_sales;

insert into public.distributor_commission_ledger(
  distributor_id, order_id, commission_id, entry_type, amount_cents, currency,
  reason_code, reason, source_type, source_reference, created_by,
  recovery_status, recovered_cents, remaining_cents, metadata, idempotency_key, created_at
)
select
  sale.distributor_id, sale.storefront_order_id, sale.id, 'legacy_balance',
  sale.original_commission_amount_cents, sale.currency, 'phase_one_backfill',
  'Opening commission balance migrated from the phase-one distributor sale.',
  'migration', sale.order_reference, sale.recorded_by, 'not_applicable', 0, 0,
  jsonb_build_object('migration', '20260815185425', 'original_status', sale.status),
  'legacy:' || sale.id::text, sale.created_at
from public.distributor_sales sale
where sale.original_commission_amount_cents > 0
on conflict (idempotency_key) do nothing;

-- Preserve which opening credits were already included in phase-one payouts so
-- the new payout allocator cannot pay them a second time.
insert into public.distributor_payout_ledger_items(payout_id, ledger_entry_id, amount_cents, application_type)
select item.payout_id, ledger.id, item.commission_amount_cents, 'commission'
from public.distributor_payout_items item
join public.distributor_commission_ledger ledger
  on ledger.commission_id = item.sale_id and ledger.entry_type = 'legacy_balance'
on conflict (payout_id, ledger_entry_id) do nothing;

insert into public.distributor_commission_ledger(
  distributor_id, order_id, commission_id, entry_type, amount_cents, currency,
  reason_code, reason, source_type, source_reference, created_by,
  original_payout_id, recovery_status, recovered_cents, remaining_cents,
  metadata, idempotency_key
)
select
  sale.distributor_id, sale.storefront_order_id, sale.id,
  (case when sale.refund_cents >= sale.original_commissionable_revenue_cents then 'full_refund_reversal' else 'partial_refund_reversal' end)::public.distributor_ledger_entry_type,
  -sale.commission_reversed_cents, sale.currency, 'legacy_refund_backfill',
  'Known historical refund reconstructed during ledger migration.', 'migration', sale.order_reference,
  sale.recorded_by,
  (select payout.id from public.distributor_payout_items item join public.distributor_payouts payout on payout.id = item.payout_id where item.sale_id = sale.id and payout.status = 'paid' order by payout.paid_at desc nulls last limit 1),
  'pending', 0, sale.commission_reversed_cents,
  jsonb_build_object('migration', '20260815185425', 'legacy_refund_cents', sale.refund_cents),
  'legacy-refund:' || sale.id::text
from public.distributor_sales sale
where sale.commission_reversed_cents > 0
on conflict (idempotency_key) do nothing;

do $$
declare pending_entry record;
begin
  for pending_entry in
    select id from public.distributor_commission_ledger
    where amount_cents < 0 and remaining_cents > 0 and source_type = 'migration'
    order by created_at, id
  loop
    perform public.apply_distributor_recovery_to_payout(pending_entry.id, null);
  end loop;
end
$$;

insert into public.distributor_refunds(
  distributor_id, storefront_order_id, sale_id, ledger_entry_id, provider,
  external_refund_id, gross_order_cents, refund_event_cents, refunded_total_cents,
  remaining_order_cents, original_commission_cents, commission_reversed_cents,
  commission_reversed_total_cents, commission_remaining_cents, currency,
  reason_code, public_reason, source_type, created_by, occurred_at, metadata,
  idempotency_key
)
select
  sale.distributor_id,
  sale.storefront_order_id,
  sale.id,
  ledger.id,
  'migration',
  'legacy:' || sale.id::text,
  greatest(
    coalesce(order_row.total_cents, order_row.subtotal_cents - coalesce(order_row.discount_cents, 0) + coalesce(order_row.shipping_cents, 0) + coalesce(order_row.import_fee_cents, 0) + coalesce(order_row.processing_fee_cents, 0)),
    sale.refund_cents
  ),
  sale.refund_cents,
  sale.refund_cents,
  greatest(
    coalesce(order_row.total_cents, order_row.subtotal_cents - coalesce(order_row.discount_cents, 0) + coalesce(order_row.shipping_cents, 0) + coalesce(order_row.import_fee_cents, 0) + coalesce(order_row.processing_fee_cents, 0)),
    sale.refund_cents
  ) - sale.refund_cents,
  sale.original_commission_amount_cents,
  sale.commission_reversed_cents,
  sale.commission_reversed_cents,
  sale.original_commission_amount_cents - sale.commission_reversed_cents,
  sale.currency,
  'legacy_refund_backfill',
  'Historical refund reconstructed during accounting migration.',
  'migration',
  sale.recorded_by,
  sale.created_at,
  jsonb_build_object('migration', '20260815185425', 'reconstructed', true),
  'legacy-refund-record:' || sale.id::text
from public.distributor_sales sale
join public.storefront_orders order_row on order_row.id = sale.storefront_order_id
join public.distributor_commission_ledger ledger on ledger.idempotency_key = 'legacy-refund:' || sale.id::text
where sale.refund_cents > 0 and sale.commission_reversed_cents > 0
on conflict (idempotency_key) do nothing;

create or replace view public.distributor_commission_balances
with (security_invoker = true)
as
with allocated as (
  select ledger_entry_id, coalesce(sum(amount_cents) filter (where amount_cents > 0), 0)::bigint as allocated_positive_cents
  from public.distributor_payout_ledger_items
  group by ledger_entry_id
)
select
  ledger.distributor_id,
  ledger.currency,
  coalesce(sum(ledger.amount_cents) filter (where ledger.entry_type in ('commission_earned', 'legacy_balance')), 0)::bigint as gross_commission_cents,
  abs(coalesce(sum(ledger.amount_cents) filter (where ledger.entry_type in ('partial_refund_reversal', 'full_refund_reversal')), 0))::bigint as refund_reversals_cents,
  coalesce(sum(ledger.amount_cents) filter (where ledger.entry_type in ('manual_positive_adjustment', 'manual_negative_adjustment')), 0)::bigint as manual_adjustments_cents,
  coalesce(sum(ledger.amount_cents), 0)::bigint as net_commission_cents,
  coalesce(sum(ledger.recovered_cents), 0)::bigint as recovered_cents,
  coalesce(sum(ledger.remaining_cents), 0)::bigint as pending_recovery_cents,
  greatest(
    coalesce(sum(greatest(ledger.amount_cents - coalesce(allocated.allocated_positive_cents, 0), 0)) filter (where ledger.amount_cents > 0), 0)
    - coalesce(sum(ledger.remaining_cents), 0),
    0
  )::bigint as payable_cents
from public.distributor_commission_ledger ledger
left join allocated on allocated.ledger_entry_id = ledger.id
group by ledger.distributor_id, ledger.currency;

create or replace view public.distributor_adjustments_public
with (security_invoker = true)
as
select
  ledger.id,
  ledger.distributor_id,
  ledger.created_at,
  sale.order_reference,
  ledger.entry_type,
  ledger.amount_cents,
  ledger.currency,
  ledger.reason_code,
  ledger.reason,
  ledger.original_payout_id,
  ledger.recovery_payout_id,
  ledger.recovery_status,
  ledger.recovered_cents,
  ledger.remaining_cents
from public.distributor_commission_ledger ledger
left join public.distributor_sales sale on sale.id = ledger.commission_id
where ledger.entry_type not in ('commission_earned', 'legacy_balance');

create or replace view public.distributor_ledger_reconciliation
with (security_invoker = true)
as
select
  sale.id as sale_id,
  sale.order_reference,
  sale.distributor_id,
  sale.original_commission_amount_cents,
  coalesce(sum(ledger.amount_cents) filter (where ledger.entry_type in ('commission_earned', 'legacy_balance')), 0)::bigint as ledger_original_credit_cents,
  abs(coalesce(sum(ledger.amount_cents) filter (where ledger.entry_type in ('partial_refund_reversal', 'full_refund_reversal')), 0))::bigint as ledger_refund_reversal_cents,
  coalesce(sum(ledger.amount_cents), 0)::bigint as ledger_net_cents,
  abs(coalesce(sum(ledger.amount_cents) filter (where ledger.entry_type in ('partial_refund_reversal', 'full_refund_reversal')), 0)) <= sale.original_commission_amount_cents as reversal_within_original,
  count(*) filter (where ledger.entry_type in ('commission_earned', 'legacy_balance')) = 1 as exactly_one_original_credit
from public.distributor_sales sale
left join public.distributor_commission_ledger ledger on ledger.commission_id = sale.id
group by sale.id, sale.order_reference, sale.distributor_id, sale.original_commission_amount_cents;

alter table public.distributor_payment_transactions enable row level security;
alter table public.distributor_sale_items enable row level security;
alter table public.distributor_commission_ledger enable row level security;
alter table public.distributor_refunds enable row level security;
alter table public.distributor_refund_items enable row level security;
alter table public.distributor_payment_events enable row level security;
alter table public.distributor_payout_ledger_items enable row level security;
alter table public.distributor_recovery_allocations enable row level security;

create policy "distributors read own commission ledger" on public.distributor_commission_ledger for select to authenticated
  using (distributor_id = (select public.portal_distributor_id()) or public.portal_is_admin());
create policy "admins read distributor payment transactions" on public.distributor_payment_transactions for select to authenticated
  using (public.portal_is_admin());
create policy "admins read distributor sale items" on public.distributor_sale_items for select to authenticated
  using (public.portal_is_admin());
create policy "admins read distributor refunds" on public.distributor_refunds for select to authenticated
  using (public.portal_is_admin());
create policy "admins read distributor refund items" on public.distributor_refund_items for select to authenticated
  using (public.portal_is_admin());
create policy "admins read distributor payment events" on public.distributor_payment_events for select to authenticated
  using (public.portal_is_admin());
create policy "distributors read own payout ledger items" on public.distributor_payout_ledger_items for select to authenticated
  using (exists(select 1 from public.distributor_payouts payout where payout.id = payout_id and (payout.distributor_id = (select public.portal_distributor_id()) or public.portal_is_admin())));
create policy "distributors read own recovery allocations" on public.distributor_recovery_allocations for select to authenticated
  using (exists(select 1 from public.distributor_commission_ledger ledger where ledger.id = ledger_entry_id and (ledger.distributor_id = (select public.portal_distributor_id()) or public.portal_is_admin())));

grant select on public.distributor_commission_ledger, public.distributor_payout_ledger_items,
  public.distributor_recovery_allocations, public.distributor_commission_balances,
  public.distributor_adjustments_public, public.distributor_ledger_reconciliation to authenticated;
grant select on public.distributor_payment_transactions, public.distributor_sale_items,
  public.distributor_refunds, public.distributor_refund_items, public.distributor_payment_events to authenticated;
grant select, insert, update, delete on public.distributor_payment_transactions, public.distributor_sale_items,
  public.distributor_commission_ledger, public.distributor_refunds, public.distributor_refund_items,
  public.distributor_payment_events, public.distributor_payout_ledger_items,
  public.distributor_recovery_allocations to service_role;

revoke all on function public.snapshot_distributor_sale_items(uuid) from public, anon, authenticated;
revoke all on function public.record_distributor_commission_earned() from public, anon, authenticated;
revoke all on function public.recalculate_distributor_payout(uuid) from public, anon, authenticated;
revoke all on function public.apply_distributor_recovery_to_payout(uuid, uuid) from public, anon, authenticated;
revoke all on function public.refresh_distributor_sale_accounting_state(uuid) from public, anon, authenticated;
revoke all on function public.record_distributor_refund_internal(text, integer, text, text, uuid, text, text, text, public.distributor_ledger_source_type, text, uuid, timestamptz, jsonb, text) from public, anon, authenticated;
revoke all on function public.record_distributor_chargeback_internal(text, integer, boolean, uuid, text, text, public.distributor_ledger_source_type, text, uuid, timestamptz, text) from public, anon, authenticated;
revoke all on function public.record_distributor_payment_event(text, text, text, text, text, text, integer, integer, text, timestamptz, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_distributor_payment_event(text, text, text, text, text, text, integer, integer, text, timestamptz, text, jsonb) to service_role;

revoke all on function public.preview_distributor_refund(text, integer, jsonb) from public, anon;
revoke all on function public.admin_record_distributor_refund(text, integer, text, text, text, text, jsonb, text) from public, anon;
revoke all on function public.preview_distributor_adjustment(uuid, uuid, text, integer, uuid) from public, anon;
revoke all on function public.admin_create_distributor_adjustment(uuid, uuid, text, integer, text, text, uuid, text) from public, anon;
grant execute on function public.preview_distributor_refund(text, integer, jsonb) to authenticated;
grant execute on function public.admin_record_distributor_refund(text, integer, text, text, text, text, jsonb, text) to authenticated;
grant execute on function public.preview_distributor_adjustment(uuid, uuid, text, integer, uuid) to authenticated;
grant execute on function public.admin_create_distributor_adjustment(uuid, uuid, text, integer, text, text, uuid, text) to authenticated;

comment on table public.distributor_commission_ledger is 'Immutable source of truth for every distributor commission credit, reversal, chargeback, and adjustment.';
comment on column public.distributor_sales.refund_cents is 'Compatibility cache derived from refund records; never the accounting source of truth.';
comment on view public.distributor_ledger_reconciliation is 'Pre/post backfill reconciliation: original credit equality, duplicate detection, and reversal cap.';
comment on table public.distributor_recovery_allocations is 'Append-only history of partial recovery amounts applied across one or more future payouts.';

-- Operational reconciliation after migration:
-- select * from public.distributor_ledger_reconciliation
-- where not exactly_one_original_credit or not reversal_within_original
--    or original_commission_amount_cents <> ledger_original_credit_cents;
-- select id, amount_cents, gross_commission_cents, positive_adjustments_cents,
--        negative_adjustments_cents, recoveries_applied_cents
-- from public.distributor_payouts where status = 'paid';
