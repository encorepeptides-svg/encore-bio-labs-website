-- Keep the inventory/pricing portal synchronized with the current centralized catalog.
-- Variants removed from the website remain in history but become inactive so they
-- cannot be selected for new inventory transactions or orders.
create or replace function public.sync_inventory_catalog(p_products jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare p jsonb; v jsonb; product_uuid uuid;
begin
  if auth.uid() is null or not public.portal_is_admin() then raise exception 'admin_required' using errcode = '42501'; end if;
  if jsonb_typeof(p_products) <> 'array' then raise exception 'invalid_catalog'; end if;
  for p in select value from jsonb_array_elements(p_products) loop
    insert into public.inventory_products(catalog_slug,name_en,name_es,category,image_path,active)
    values(p->>'slug',p->>'name_en',coalesce(nullif(p->>'name_es',''),p->>'name_en'),p->>'category',p->>'image_path',coalesce((p->>'active')::boolean,true))
    on conflict(catalog_slug) do update set name_en=excluded.name_en,name_es=excluded.name_es,category=excluded.category,image_path=excluded.image_path,active=excluded.active,updated_at=now()
    returning id into product_uuid;
    for v in select value from jsonb_array_elements(p->'variants') loop
      insert into public.inventory_variants(product_id,sku,variation_name_en,variation_name_es,strength,unit_type,price_cents,active)
      values(product_uuid,v->>'sku',v->>'name_en',coalesce(nullif(v->>'name_es',''),v->>'name_en'),nullif(v->>'strength','')::numeric,v->>'unit_type',coalesce((v->>'price_cents')::integer,0),coalesce((v->>'active')::boolean,true))
      on conflict(sku) do update set product_id=excluded.product_id,variation_name_en=excluded.variation_name_en,variation_name_es=excluded.variation_name_es,strength=excluded.strength,unit_type=excluded.unit_type,price_cents=excluded.price_cents,active=excluded.active,updated_at=now();
    end loop;
    update public.inventory_variants
      set active=false,updated_at=now()
      where product_id=product_uuid
        and sku not in (select value->>'sku' from jsonb_array_elements(p->'variants'));
  end loop;
end $$;

revoke all on function public.sync_inventory_catalog(jsonb) from public;
grant execute on function public.sync_inventory_catalog(jsonb) to authenticated;
