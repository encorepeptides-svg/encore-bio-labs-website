-- Local orders distinguish free distribution-point pickup from $10 home
-- delivery inside the server-verified 10-mile radius.

alter table public.storefront_orders
  add column if not exists local_fulfillment_method text,
  add column if not exists delivery_distance_miles numeric(7, 3);

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
