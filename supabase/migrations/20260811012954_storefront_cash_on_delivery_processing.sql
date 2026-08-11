-- Cash on delivery is a first-class checkout choice. Its 5% processing charge
-- applies to merchandise after order-value discounts, excluding shipping and
-- Mexico import fees, so operators can reconcile the exact amount shown to the
-- customer even when delivery still needs manual review.

alter table public.storefront_orders
  add column if not exists processing_fee_cents integer not null default 0;

alter table public.storefront_orders
  drop constraint if exists storefront_orders_processing_fee_cents_check;

alter table public.storefront_orders
  add constraint storefront_orders_processing_fee_cents_check
  check (processing_fee_cents >= 0);

comment on column public.storefront_orders.processing_fee_cents is
  'Cash-on-delivery processing charge in cents: 5% of subtotal_cents minus discount_cents. Shipping and import fees are excluded.';
