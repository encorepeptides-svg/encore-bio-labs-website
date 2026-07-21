-- RLS policies filter inventory rows, while these grants make the tables
-- reachable through PostgREST on projects with auto_expose_new_tables disabled.
grant select on table
  public.inventory_products,
  public.inventory_variants,
  public.inventory_movements,
  public.inventory_manual_orders,
  public.inventory_manual_order_items
to authenticated;

-- Balance and history mutations intentionally remain RPC-only.
revoke insert, update, delete, truncate, references, trigger on table
  public.inventory_products,
  public.inventory_variants,
  public.inventory_movements,
  public.inventory_manual_orders,
  public.inventory_manual_order_items
from anon, authenticated;
