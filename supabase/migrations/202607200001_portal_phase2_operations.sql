-- Encore Bio Labs Client Portal — Phase 2 operations
-- Adds recommended research protocols, the admin write policies required to
-- operate orders/shipments/documents/support from the portal, and the private
-- storage bucket that backs assigned client documents.

-- Recommended research protocols assigned to a client by staff.
create table if not exists public.client_protocols (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  title text not null,
  summary text not null default '',
  body text not null default '',
  status text not null default 'active' check (status in ('draft','active','completed','archived')),
  starts_on date,
  ends_on date,
  deleted_at timestamptz
);
create index if not exists client_protocols_user_id_idx on public.client_protocols (user_id, status);
alter table public.client_protocols enable row level security;
drop policy if exists "protocols own read" on public.client_protocols;
create policy "protocols own read" on public.client_protocols for select to authenticated
  using ((user_id = auth.uid() and public.portal_is_active_client() and status <> 'draft' and deleted_at is null) or public.portal_is_admin());
drop policy if exists "protocols admin write" on public.client_protocols;
create policy "protocols admin write" on public.client_protocols for all to authenticated
  using (public.portal_is_admin()) with check (public.portal_is_admin());

-- Admin write access for order operations. Clients keep read-only access.
drop policy if exists "orders admin insert" on public.portal_orders;
create policy "orders admin insert" on public.portal_orders for insert to authenticated with check (public.portal_is_admin());
drop policy if exists "orders admin update" on public.portal_orders;
create policy "orders admin update" on public.portal_orders for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
drop policy if exists "order items admin insert" on public.portal_order_items;
create policy "order items admin insert" on public.portal_order_items for insert to authenticated with check (public.portal_is_admin());
drop policy if exists "order items admin update" on public.portal_order_items;
create policy "order items admin update" on public.portal_order_items for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
drop policy if exists "order items admin delete" on public.portal_order_items;
create policy "order items admin delete" on public.portal_order_items for delete to authenticated using (public.portal_is_admin());
drop policy if exists "shipments admin insert" on public.shipments;
create policy "shipments admin insert" on public.shipments for insert to authenticated with check (public.portal_is_admin());
drop policy if exists "shipments admin update" on public.shipments;
create policy "shipments admin update" on public.shipments for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());

-- Admin management of documents and their assignments.
drop policy if exists "documents admin write" on public.documents;
create policy "documents admin write" on public.documents for insert to authenticated with check (public.portal_is_admin());
drop policy if exists "documents admin update" on public.documents;
create policy "documents admin update" on public.documents for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
drop policy if exists "assignments admin write" on public.document_assignments;
create policy "assignments admin write" on public.document_assignments for insert to authenticated with check (public.portal_is_admin());
drop policy if exists "assignments admin update" on public.document_assignments;
create policy "assignments admin update" on public.document_assignments for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
drop policy if exists "lots admin write" on public.product_lots;
create policy "lots admin write" on public.product_lots for insert to authenticated with check (public.portal_is_admin());

-- Staff notifications to clients (order updates, protocol assignments, decisions).
drop policy if exists "notifications admin insert" on public.notifications;
create policy "notifications admin insert" on public.notifications for insert to authenticated with check (public.portal_is_admin());

-- Application review requires admins to move client statuses.
drop policy if exists "statuses admin update" on public.client_statuses;
create policy "statuses admin update" on public.client_statuses for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());

-- Support operations: staff can update thread status/assignment; audit events append from the portal.
drop policy if exists "support admin update" on public.support_threads;
create policy "support admin update" on public.support_threads for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
drop policy if exists "support client update own" on public.support_threads;
drop policy if exists "audit authenticated append" on public.audit_logs;
drop policy if exists "audit admins append" on public.audit_logs;
create policy "audit admins append" on public.audit_logs for insert to authenticated
  with check (public.portal_is_admin() and actor_id = auth.uid());

-- Private storage bucket for assigned research documents.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portal-documents', 'portal-documents', false, 10485760, array['application/pdf']::text[])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "portal documents assigned read" on storage.objects;
create policy "portal documents assigned read" on storage.objects for select to authenticated
  using (bucket_id = 'portal-documents' and (public.portal_is_admin() or exists (
    select 1 from public.documents d
    join public.document_assignments a on a.document_id = d.id
    where d.storage_path = name and d.deleted_at is null and a.user_id = auth.uid() and a.revoked_at is null
  )));
drop policy if exists "portal documents admin write" on storage.objects;
create policy "portal documents admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'portal-documents' and public.portal_is_admin());
drop policy if exists "portal documents admin delete" on storage.objects;
create policy "portal documents admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portal-documents' and public.portal_is_admin());

-- updated_at maintenance for protocol edits.
create or replace function public.touch_client_protocols() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists client_protocols_touch on public.client_protocols;
create trigger client_protocols_touch before update on public.client_protocols
for each row execute function public.touch_client_protocols();
