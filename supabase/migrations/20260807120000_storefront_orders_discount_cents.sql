-- Order-value promotions: $200+ ships free, $300+ ships free 2-day express and
-- takes 10% off the subtotal. The waived shipping already records itself as
-- shipping_cents = 0, but the 10% had nowhere to live: without a column the
-- recorded total would silently disagree with the total the customer was shown,
-- and an operator reconciling a payment would have no way to see why.
--
-- Defaults to 0 so every existing order keeps its current arithmetic
-- (subtotal + import + shipping) and nothing needs backfilling.

alter table public.storefront_orders
  add column if not exists discount_cents integer not null default 0;

comment on column public.storefront_orders.discount_cents is
  'Order-value promotion discount applied to the subtotal, in cents. total_cents = subtotal_cents + import_fee_cents + shipping_cents - discount_cents.';
