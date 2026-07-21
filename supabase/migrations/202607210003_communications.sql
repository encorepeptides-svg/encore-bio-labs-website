-- Server-created inbound messages and administrative correspondence. SMTP/API secrets never enter this database.
create table if not exists public.communication_messages (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  direction text not null check (direction in ('inbound','outbound')), source text not null default 'contact_form',
  mailbox text not null default 'inbox' check (mailbox in ('inbox','sent','drafts','contact','spam','trash','archive')),
  status text not null default 'open' check (status in ('open','completed','archived')),
  is_read boolean not null default false, sender_name text not null default '', sender_email text not null default '', sender_phone text,
  recipient_email text not null default 'support@encorebiolabs.com', subject text not null, body_text text not null, locale text not null default 'en' check (locale in ('en','es')),
  assigned_to uuid references auth.users(id) on delete set null, parent_message_id uuid references public.communication_messages(id) on delete set null,
  delivery_status text not null default 'stored' check (delivery_status in ('stored','queued','sent','failed')),
  delivery_error text, attempts integer not null default 0, last_attempt_at timestamptz, metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.communication_notes (
  id uuid primary key default gen_random_uuid(), message_id uuid not null references public.communication_messages(id) on delete cascade,
  created_at timestamptz not null default now(), created_by uuid not null references auth.users(id) on delete cascade, note text not null check (char_length(note) <= 4000)
);
create index if not exists communication_messages_mailbox_created_idx on public.communication_messages(mailbox, created_at desc);
create index if not exists communication_messages_unread_idx on public.communication_messages(is_read, created_at desc) where not is_read;
alter table public.communication_messages enable row level security;
alter table public.communication_notes enable row level security;
create policy "communications admin read" on public.communication_messages for select to authenticated using (public.portal_is_admin());
create policy "communications admin update" on public.communication_messages for update to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
create policy "communication notes admin manage" on public.communication_notes for all to authenticated using (public.portal_is_admin()) with check (public.portal_is_admin());
