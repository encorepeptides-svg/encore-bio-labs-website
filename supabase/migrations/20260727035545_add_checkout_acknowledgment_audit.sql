-- Per-order Research Use Only acknowledgment audit data.
-- Existing orders remain nullable; the shipping-checkout Edge Function requires
-- and writes the full record for every new order before messaging handoff.

-- Some production environments recorded the original storefront migrations
-- without retaining the optional storefront table. Restore the complete
-- server-owned order table when it is absent so the audit columns below can be
-- deployed without repairing migration history by hand.
create table if not exists public.storefront_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  order_reference text not null unique,
  status text not null default 'pending_payment',
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'instagram')),
  payment_method text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  currency text not null default 'USD',
  locale text not null default 'en',
  contact jsonb not null default '{}'::jsonb,
  notes text not null default '',
  paid_at timestamptz,
  marked_paid_by uuid references auth.users(id),
  destination_type text not null default '',
  original_address jsonb not null default '{}'::jsonb,
  validated_address jsonb not null default '{}'::jsonb,
  selected_address jsonb not null default '{}'::jsonb,
  address_choice text,
  address_verification jsonb not null default '{}'::jsonb,
  shipping_service jsonb,
  import_fee_cents integer not null default 0 check (import_fee_cents >= 0),
  shipping_cents integer check (shipping_cents is null or shipping_cents >= 0),
  total_cents integer check (total_cents is null or total_cents >= 0),
  shipping_review_required boolean not null default true,
  destination_acknowledged boolean not null default false,
  local_fulfillment_method text,
  delivery_distance_miles numeric(7, 3)
);

alter table public.storefront_orders enable row level security;

alter table public.storefront_orders
  drop constraint if exists storefront_orders_status_check;
alter table public.storefront_orders
  add constraint storefront_orders_status_check
  check (status in ('review_required', 'quote_pending', 'pending_payment', 'paid', 'cancelled'));

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

alter table public.storefront_orders
  drop constraint if exists storefront_orders_local_fulfillment_method_check;
alter table public.storefront_orders
  add constraint storefront_orders_local_fulfillment_method_check
  check (
    local_fulfillment_method is null
    or (
      local_fulfillment_method in ('pickup', 'home_delivery')
      and destination_type in ('local_el_paso', 'local_juarez', 'local_chihuahua')
    )
  );

alter table public.storefront_orders
  drop constraint if exists storefront_orders_delivery_distance_miles_check;
alter table public.storefront_orders
  add constraint storefront_orders_delivery_distance_miles_check
  check (delivery_distance_miles is null or delivery_distance_miles >= 0);

create index if not exists storefront_orders_status_idx
  on public.storefront_orders (status, created_at desc);
create index if not exists storefront_orders_shipping_review_idx
  on public.storefront_orders (shipping_review_required, created_at desc);

drop policy if exists "public may create pending orders" on public.storefront_orders;
drop policy if exists "admins read storefront orders" on public.storefront_orders;
drop policy if exists "admins update storefront orders" on public.storefront_orders;

create policy "admins read storefront orders" on public.storefront_orders
  for select to authenticated using (public.portal_is_admin());
create policy "admins update storefront orders" on public.storefront_orders
  for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());

revoke all on table public.storefront_orders from anon;
grant select, update on table public.storefront_orders to authenticated;
grant all on table public.storefront_orders to service_role;

alter table public.storefront_orders
  add column if not exists checkout_acknowledgment_version text,
  add column if not exists checkout_acknowledged_at timestamptz,
  add column if not exists checkout_acknowledgment_language jsonb,
  add column if not exists checkout_acknowledgment_locale text,
  add column if not exists checkout_policy_versions jsonb;

alter table public.storefront_orders
  drop constraint if exists storefront_orders_checkout_acknowledgment_complete;

alter table public.storefront_orders
  add constraint storefront_orders_checkout_acknowledgment_complete
  check (
    (
      checkout_acknowledgment_version is null
      and checkout_acknowledged_at is null
      and checkout_acknowledgment_language is null
      and checkout_acknowledgment_locale is null
      and checkout_policy_versions is null
    )
    or
    (
      length(checkout_acknowledgment_version) > 0
      and checkout_acknowledged_at is not null
      and checkout_acknowledgment_locale in ('en', 'es')
      and jsonb_typeof(checkout_acknowledgment_language) = 'array'
      and jsonb_array_length(checkout_acknowledgment_language) = 5
      and jsonb_typeof(checkout_policy_versions) = 'object'
      and checkout_policy_versions ?& array['terms', 'privacy', 'researchUseOnly', 'shippingReturns']
    )
  );

create index if not exists storefront_orders_checkout_acknowledgment_idx
  on public.storefront_orders (checkout_acknowledgment_version, checkout_acknowledged_at desc)
  where checkout_acknowledgment_version is not null;

comment on column public.storefront_orders.checkout_acknowledgment_language is
  'Exact five-statement acknowledgment language displayed for this order.';
