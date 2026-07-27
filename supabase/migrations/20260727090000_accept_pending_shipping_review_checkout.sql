-- Checkout submission is now the authoritative order-creation step. Messaging
-- channels are optional follow-ups, so web checkout is a first-class source.

alter table public.storefront_orders
  drop constraint if exists storefront_orders_status_check;

update public.storefront_orders
set status = 'pending_shipping_review', updated_at = now()
where status in ('review_required', 'quote_pending');

alter table public.storefront_orders
  add constraint storefront_orders_status_check
  check (status in ('pending_shipping_review', 'pending_payment', 'paid', 'cancelled'));

alter table public.storefront_orders
  drop constraint if exists storefront_orders_channel_check;

alter table public.storefront_orders
  add constraint storefront_orders_channel_check
  check (channel in ('checkout', 'whatsapp', 'instagram'));

comment on column public.storefront_orders.status is
  'pending_shipping_review means the request was accepted and awaits manual shipping confirmation.';
