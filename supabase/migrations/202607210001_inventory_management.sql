-- Transactional SKU inventory for the existing Encore catalog and portal.
create table if not exists public.inventory_products (
  id uuid primary key default gen_random_uuid(),
  catalog_slug text not null unique,
  name_en text not null,
  name_es text not null,
  category text not null,
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.inventory_products(id) on delete restrict,
  sku text not null unique,
  variation_name_en text not null,
  variation_name_es text not null,
  strength numeric,
  unit_type text,
  price_cents integer not null default 0 check (price_cents >= 0),
  cost_cents integer check (cost_cents is null or cost_cents >= 0),
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  low_stock_threshold integer not null default 10 check (low_stock_threshold >= 0),
  reorder_quantity integer not null default 20 check (reorder_quantity >= 0),
  allow_backorder boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (allow_backorder or reserved <= on_hand)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.inventory_variants(id) on delete restrict,
  movement_type text not null check (movement_type in ('initial_count','receive','manual_sale','reserve','release','fulfillment','damaged','lost','sample','return','correction')),
  quantity_change_on_hand integer not null,
  quantity_change_reserved integer not null,
  previous_on_hand integer not null,
  new_on_hand integer not null,
  previous_reserved integer not null,
  new_reserved integer not null,
  balance_available_after integer not null,
  reason text not null,
  notes text,
  reference_type text,
  reference_id text,
  idempotency_key text unique,
  created_by uuid not null references auth.users(id) on delete restrict,
  administrator_label text not null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_variants_product_idx on public.inventory_variants(product_id);
create index if not exists inventory_movements_variant_created_idx on public.inventory_movements(variant_id, created_at desc);
create index if not exists inventory_movements_reference_idx on public.inventory_movements(reference_id) where reference_id is not null;

create table if not exists public.inventory_manual_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text,
  sales_channel text not null check (sales_channel in ('whatsapp','instagram','website','local_delivery','phone','other')),
  status text not null check (status in ('confirmed','fulfilled','cancelled','immediate_sale')),
  notes text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_manual_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.inventory_manual_orders(id) on delete restrict,
  variant_id uuid not null references public.inventory_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unique(order_id, variant_id)
);

alter table public.inventory_products enable row level security;
alter table public.inventory_variants enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.inventory_manual_orders enable row level security;
alter table public.inventory_manual_order_items enable row level security;

create policy "inventory staff read products" on public.inventory_products for select to authenticated using (public.portal_has_role('support') or public.portal_is_admin());
create policy "inventory staff read variants" on public.inventory_variants for select to authenticated using (public.portal_has_role('support') or public.portal_is_admin());
create policy "inventory staff read movements" on public.inventory_movements for select to authenticated using (public.portal_has_role('support') or public.portal_is_admin());
create policy "inventory staff read manual orders" on public.inventory_manual_orders for select to authenticated using (public.portal_has_role('support') or public.portal_is_admin());
create policy "inventory staff read manual items" on public.inventory_manual_order_items for select to authenticated using (public.portal_has_role('support') or public.portal_is_admin());

-- Catalog metadata may be refreshed by admins, but balances are never accepted from the browser.
create or replace function public.sync_inventory_catalog(p_products jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare p jsonb; v jsonb; product_uuid uuid;
begin
  if auth.uid() is null or not public.portal_is_admin() then raise exception 'admin_required' using errcode = '42501'; end if;
  if jsonb_typeof(p_products) <> 'array' then raise exception 'invalid_catalog'; end if;
  for p in select value from jsonb_array_elements(p_products) loop
    insert into public.inventory_products(catalog_slug,name_en,name_es,category,image_path,active)
    values(p->>'slug',p->>'name_en',coalesce(nullif(p->>'name_es',''),p->>'name_en'),p->>'category',p->>'image_path',coalesce((p->>'active')::boolean,true))
    on conflict(catalog_slug) do update set name_en=excluded.name_en,name_es=excluded.name_es,category=excluded.category,image_path=excluded.image_path,updated_at=now()
    returning id into product_uuid;
    for v in select value from jsonb_array_elements(p->'variants') loop
      insert into public.inventory_variants(product_id,sku,variation_name_en,variation_name_es,strength,unit_type,price_cents,active)
      values(product_uuid,v->>'sku',v->>'name_en',coalesce(nullif(v->>'name_es',''),v->>'name_en'),nullif(v->>'strength','')::numeric,v->>'unit_type',coalesce((v->>'price_cents')::integer,0),coalesce((v->>'active')::boolean,true))
      on conflict(sku) do update set product_id=excluded.product_id,variation_name_en=excluded.variation_name_en,variation_name_es=excluded.variation_name_es,strength=excluded.strength,unit_type=excluded.unit_type,price_cents=excluded.price_cents,updated_at=now();
    end loop;
  end loop;
end $$;

create or replace function public.inventory_adjust(
  p_variant_id uuid, p_movement_type text, p_quantity integer, p_reason text,
  p_notes text default null, p_reference_type text default null, p_reference_id text default null,
  p_idempotency_key text default null
) returns public.inventory_variants language plpgsql security definer set search_path = '' as $$
declare v public.inventory_variants; new_on_hand integer; new_reserved integer; delta_hand integer := 0; delta_reserved integer := 0; admin_label text;
begin
  if auth.uid() is null or not (public.portal_has_role('support') or public.portal_is_admin()) then raise exception 'staff_required' using errcode='42501'; end if;
  if p_idempotency_key is not null and exists(select 1 from public.inventory_movements where idempotency_key=p_idempotency_key) then
    select iv.* into v from public.inventory_movements im join public.inventory_variants iv on iv.id=im.variant_id where im.idempotency_key=p_idempotency_key;
    return v;
  end if;
  if p_quantity is null or p_quantity = 0 or (p_movement_type <> 'correction' and p_quantity < 0) then raise exception 'invalid_quantity'; end if;
  select * into v from public.inventory_variants where id=p_variant_id for update;
  if not found then raise exception 'variant_not_found'; end if;
  if not v.active then raise exception 'inactive_sku'; end if;
  if p_movement_type in ('damaged','lost','sample','correction') and coalesce(trim(p_reason),'')='' then raise exception 'reason_required'; end if;
  case p_movement_type
    when 'initial_count' then delta_hand := p_quantity - v.on_hand;
    when 'receive' then delta_hand := p_quantity;
    when 'return' then delta_hand := p_quantity;
    when 'manual_sale' then delta_hand := -p_quantity;
    when 'damaged' then delta_hand := -p_quantity;
    when 'lost' then delta_hand := -p_quantity;
    when 'sample' then delta_hand := -p_quantity;
    when 'reserve' then delta_reserved := p_quantity;
    when 'release' then delta_reserved := -p_quantity;
    when 'fulfillment' then delta_hand := -p_quantity; delta_reserved := -p_quantity;
    when 'correction' then delta_hand := p_quantity;
    else raise exception 'invalid_movement_type';
  end case;
  new_on_hand := v.on_hand + delta_hand; new_reserved := v.reserved + delta_reserved;
  if new_on_hand < 0 then raise exception 'insufficient_on_hand'; end if;
  if new_reserved < 0 then raise exception 'insufficient_reserved'; end if;
  if not v.allow_backorder and new_on_hand-new_reserved < 0 then raise exception 'insufficient_available'; end if;
  select coalesce(nullif(trim(p.preferred_name),''),nullif(trim(p.legal_name),''),p.email,auth.uid()::text) into admin_label from public.profiles p where p.id=auth.uid();
  admin_label := coalesce(admin_label, auth.uid()::text);
  update public.inventory_variants set on_hand=new_on_hand,reserved=new_reserved,updated_at=now() where id=v.id returning * into v;
  insert into public.inventory_movements(variant_id,movement_type,quantity_change_on_hand,quantity_change_reserved,previous_on_hand,new_on_hand,previous_reserved,new_reserved,balance_available_after,reason,notes,reference_type,reference_id,idempotency_key,created_by,administrator_label)
  values(v.id,p_movement_type,delta_hand,delta_reserved,v.on_hand-delta_hand,v.on_hand,v.reserved-delta_reserved,v.reserved,v.on_hand-v.reserved,coalesce(nullif(trim(p_reason),''),replace(p_movement_type,'_',' ')),nullif(trim(p_notes),''),nullif(trim(p_reference_type),''),nullif(trim(p_reference_id),''),nullif(trim(p_idempotency_key),''),auth.uid(),admin_label);
  return v;
end $$;

create or replace function public.inventory_update_settings(p_variant_ids uuid[],p_low_stock_threshold integer,p_reorder_quantity integer,p_allow_backorder boolean,p_active boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or not public.portal_is_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if p_low_stock_threshold < 0 or p_reorder_quantity < 0 then raise exception 'invalid_settings'; end if;
  update public.inventory_variants set low_stock_threshold=p_low_stock_threshold,reorder_quantity=p_reorder_quantity,allow_backorder=p_allow_backorder,active=p_active,updated_at=now() where id=any(p_variant_ids);
end $$;

-- Public callers receive status only: never balances, costs, thresholds, or history.
create or replace function public.public_inventory_status(p_skus text[])
returns table(sku text,status text) language sql stable security definer set search_path='' as $$
  select v.sku,
    case when not p.active or not v.active then 'inactive'
         when v.on_hand-v.reserved <= 0 then 'out_of_stock'
         when v.on_hand-v.reserved <= v.low_stock_threshold then 'limited'
         else 'in_stock' end
  from public.inventory_variants v join public.inventory_products p on p.id=v.product_id
  where v.sku=any(p_skus)
$$;

revoke all on function public.sync_inventory_catalog(jsonb), public.inventory_adjust(uuid,text,integer,text,text,text,text,text), public.inventory_update_settings(uuid[],integer,integer,boolean,boolean) from public;
grant execute on function public.sync_inventory_catalog(jsonb), public.inventory_adjust(uuid,text,integer,text,text,text,text,text), public.inventory_update_settings(uuid[],integer,integer,boolean,boolean) to authenticated;
revoke all on function public.public_inventory_status(text[]) from public;
grant execute on function public.public_inventory_status(text[]) to anon, authenticated;

-- Integrate the existing portal order lifecycle without deducting twice.
create or replace function public.inventory_apply_portal_order_status(p_order_id uuid, p_target_status text)
returns void language plpgsql security definer set search_path='' as $$
declare o public.portal_orders; item record; variant_uuid uuid; has_reservation boolean; has_fulfillment boolean; has_release boolean;
begin
  if auth.uid() is null or not public.portal_is_admin() then raise exception 'admin_required' using errcode='42501'; end if;
  if p_target_status not in ('review_required','processing','shipped','delivered','cancelled') then raise exception 'invalid_order_status'; end if;
  select * into o from public.portal_orders where id=p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  for item in select * from public.portal_order_items where order_id=o.id order by variant_sku loop
    select id into variant_uuid from public.inventory_variants where sku=item.variant_sku;
    if variant_uuid is null then continue; end if; -- Preserve support for existing non-catalog order lines.
    select exists(select 1 from public.inventory_movements where variant_id=variant_uuid and reference_type='portal_order' and reference_id=o.order_number and movement_type='reserve'),
           exists(select 1 from public.inventory_movements where variant_id=variant_uuid and reference_type='portal_order' and reference_id=o.order_number and movement_type='fulfillment'),
           exists(select 1 from public.inventory_movements where variant_id=variant_uuid and reference_type='portal_order' and reference_id=o.order_number and movement_type='release')
      into has_reservation,has_fulfillment,has_release;
    if p_target_status='processing' and not has_reservation then
      perform public.inventory_adjust(variant_uuid,'reserve',item.quantity,'Confirmed portal order',null,'portal_order',o.order_number,'portal-order:'||o.id||':'||variant_uuid||':reserve');
    elsif p_target_status in ('shipped','delivered') and has_reservation and not has_fulfillment then
      perform public.inventory_adjust(variant_uuid,'fulfillment',item.quantity,'Portal order fulfilled',null,'portal_order',o.order_number,'portal-order:'||o.id||':'||variant_uuid||':fulfillment');
    elsif p_target_status='cancelled' and has_reservation and not has_fulfillment and not has_release then
      perform public.inventory_adjust(variant_uuid,'release',item.quantity,'Portal order cancelled',null,'portal_order',o.order_number,'portal-order:'||o.id||':'||variant_uuid||':release');
    end if;
  end loop;
  update public.portal_orders set fulfillment_status=p_target_status,updated_at=now() where id=o.id;
end $$;

revoke all on function public.inventory_apply_portal_order_status(uuid,text) from public;
grant execute on function public.inventory_apply_portal_order_status(uuid,text) to authenticated;

create or replace function public.inventory_record_manual_order(
  p_order_number text, p_customer_name text, p_sales_channel text, p_status text, p_notes text, p_items jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare order_uuid uuid; item jsonb; variant_uuid uuid; quantity integer; movement text;
begin
  if auth.uid() is null or not (public.portal_has_role('support') or public.portal_is_admin()) then raise exception 'staff_required' using errcode='42501'; end if;
  if p_sales_channel not in ('whatsapp','instagram','website','local_delivery','phone','other') then raise exception 'invalid_sales_channel'; end if;
  if p_status not in ('confirmed','immediate_sale') then raise exception 'invalid_initial_order_status'; end if;
  if coalesce(trim(p_order_number),'')='' or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'invalid_order'; end if;
  insert into public.inventory_manual_orders(order_number,customer_name,sales_channel,status,notes,created_by)
  values(trim(p_order_number),nullif(trim(p_customer_name),''),p_sales_channel,p_status,nullif(trim(p_notes),''),auth.uid()) returning id into order_uuid;
  movement := case when p_status='confirmed' then 'reserve' else 'manual_sale' end;
  for item in select value from jsonb_array_elements(p_items) loop
    variant_uuid := (item->>'variant_id')::uuid; quantity := (item->>'quantity')::integer;
    if quantity <= 0 then raise exception 'invalid_quantity'; end if;
    insert into public.inventory_manual_order_items(order_id,variant_id,quantity) values(order_uuid,variant_uuid,quantity);
    perform public.inventory_adjust(variant_uuid,movement,quantity,case when p_status='confirmed' then 'Confirmed manual order' else 'Immediate manual sale' end,p_notes,'manual_order',trim(p_order_number),'manual-order:'||order_uuid||':'||variant_uuid||':'||movement);
  end loop;
  return order_uuid;
end $$;

create or replace function public.inventory_update_manual_order_status(p_order_id uuid,p_target_status text)
returns void language plpgsql security definer set search_path='' as $$
declare o public.inventory_manual_orders; item record; movement text;
begin
  if auth.uid() is null or not (public.portal_has_role('support') or public.portal_is_admin()) then raise exception 'staff_required' using errcode='42501'; end if;
  if p_target_status not in ('fulfilled','cancelled') then raise exception 'invalid_order_status'; end if;
  select * into o from public.inventory_manual_orders where id=p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if o.status=p_target_status then return; end if;
  if o.status<>'confirmed' then raise exception 'invalid_order_transition'; end if;
  movement := case when p_target_status='fulfilled' then 'fulfillment' else 'release' end;
  for item in select * from public.inventory_manual_order_items where order_id=o.id order by variant_id loop
    perform public.inventory_adjust(item.variant_id,movement,item.quantity,case when p_target_status='fulfilled' then 'Manual order fulfilled' else 'Manual order cancelled' end,o.notes,'manual_order',o.order_number,'manual-order:'||o.id||':'||item.variant_id||':'||movement);
  end loop;
  update public.inventory_manual_orders set status=p_target_status,updated_at=now() where id=o.id;
end $$;

revoke all on function public.inventory_record_manual_order(text,text,text,text,text,jsonb), public.inventory_update_manual_order_status(uuid,text) from public;
grant execute on function public.inventory_record_manual_order(text,text,text,text,text,jsonb), public.inventory_update_manual_order_status(uuid,text) to authenticated;

-- Immutable audit rows and protected balance columns: all mutations go through RPCs.
create or replace function public.prevent_inventory_movement_mutation() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'inventory_history_is_immutable'; end $$;
drop trigger if exists inventory_movements_immutable on public.inventory_movements;
create trigger inventory_movements_immutable before update or delete on public.inventory_movements for each row execute function public.prevent_inventory_movement_mutation();
