-- Migration version synchronized with the connected Supabase project.
-- Cover the accepted_by foreign key so account deletion and invitation audit
-- maintenance do not require a full table scan.
create index if not exists portal_invitations_accepted_by_idx
  on public.portal_invitations(accepted_by);
