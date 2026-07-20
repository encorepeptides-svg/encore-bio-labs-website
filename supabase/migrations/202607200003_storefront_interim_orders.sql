-- Interim storefront orders for the WhatsApp/Instagram checkout handoff.
-- Orders are created as pending_payment before the messaging handoff and are
-- reconciled manually by an admin. The shape (reference, items, amount, status)
-- is processor-ready so a card provider can be swapped in later without a
-- model change.

create table public.storefront_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  order_reference text not null unique,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'cancelled')),
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'instagram')),
  payment_method text not null default '' ,
  items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  currency text not null default 'USD',
  locale text not null default 'en',
  contact jsonb not null default '{}'::jsonb,
  notes text not null default '',
  paid_at timestamptz,
  marked_paid_by uuid references auth.users(id)
);
create index storefront_orders_status_idx on public.storefront_orders (status, created_at desc);

alter table public.storefront_orders enable row level security;

-- Public visitors may create their own pending order record before the
-- messaging handoff. They can never read, update, or delete order data.
create policy "public may create pending orders" on public.storefront_orders
  for insert to anon, authenticated
  with check (status = 'pending_payment' and paid_at is null and marked_paid_by is null);

-- Reconciliation is a manual admin action.
create policy "admins read storefront orders" on public.storefront_orders
  for select to authenticated using (public.portal_is_admin());
create policy "admins update storefront orders" on public.storefront_orders
  for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
