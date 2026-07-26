-- Keep inventory metadata aligned with the canonical storefront catalog while
-- preserving the existing variant rows and their stock history.
do $$
begin
  if exists (
    select 1 from public.inventory_variants where sku = 'CEREBROLYSIN-1'
  ) and exists (
    select 1 from public.inventory_variants where sku = 'CEREBROLYSIN-10MG'
  ) then
    raise exception 'Both legacy and canonical Cerebrolysin SKUs exist; reconcile inventory history before applying this migration.';
  end if;

  update public.inventory_variants as variant
  set sku = 'CEREBROLYSIN-10MG',
      variation_name_en = '10 mg',
      variation_name_es = '10 mg',
      strength = 10,
      unit_type = 'mg',
      price_cents = 6900,
      updated_at = now()
  from public.inventory_products as product
  where variant.product_id = product.id
    and product.catalog_slug = 'cerebrolysin'
    and variant.sku = 'CEREBROLYSIN-1';

  update public.inventory_variants as variant
  set variation_name_en = '50 mg',
      variation_name_es = '50 mg',
      strength = 50,
      unit_type = 'mg',
      price_cents = 4900,
      updated_at = now()
  from public.inventory_products as product
  where variant.product_id = product.id
    and product.catalog_slug = 'ahk-cu'
    and variant.sku = 'AHK-CU-50MG';

  update public.inventory_variants as variant
  set variation_name_en = '10 mg',
      variation_name_es = '10 mg',
      strength = 10,
      unit_type = 'mg',
      price_cents = 4900,
      updated_at = now()
  from public.inventory_products as product
  where variant.product_id = product.id
    and product.catalog_slug = 'kisspeptin'
    and variant.sku = 'KISSPEPTIN-10MG';
end
$$;
