-- Server-authoritative shipping verification snapshots for storefront orders.
-- Public browser inserts are removed: the shipping-checkout Edge Function
-- revalidates the address and transport availability before creating a row.

alter table public.storefront_orders
  drop constraint if exists storefront_orders_status_check;

alter table public.storefront_orders
  add constraint storefront_orders_status_check
  check (status in ('review_required', 'quote_pending', 'pending_payment', 'paid', 'cancelled'));

alter table public.storefront_orders
  add column if not exists destination_type text not null default '',
  add column if not exists original_address jsonb not null default '{}'::jsonb,
  add column if not exists validated_address jsonb not null default '{}'::jsonb,
  add column if not exists selected_address jsonb not null default '{}'::jsonb,
  add column if not exists address_choice text,
  add column if not exists address_verification jsonb not null default '{}'::jsonb,
  add column if not exists shipping_service jsonb,
  add column if not exists import_fee_cents integer not null default 0 check (import_fee_cents >= 0),
  add column if not exists shipping_cents integer check (shipping_cents is null or shipping_cents >= 0),
  add column if not exists total_cents integer check (total_cents is null or total_cents >= 0),
  add column if not exists shipping_review_required boolean not null default true,
  add column if not exists destination_acknowledged boolean not null default false;

alter table public.storefront_orders
  drop constraint if exists storefront_orders_destination_type_check;
alter table public.storefront_orders
  add constraint storefront_orders_destination_type_check
  check (destination_type in ('', 'us', 'mexico', 'local_el_paso', 'local_juarez', 'local_chihuahua', 'international'));

alter table public.storefront_orders
  drop constraint if exists storefront_orders_address_choice_check;
alter table public.storefront_orders
  add constraint storefront_orders_address_choice_check
  check (address_choice is null or address_choice in ('recommended', 'original'));

drop policy if exists "public may create pending orders" on public.storefront_orders;

create index if not exists storefront_orders_shipping_review_idx
  on public.storefront_orders (shipping_review_required, created_at desc);
