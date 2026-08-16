-- Complement the range-first dashboard index with event-first and direct-link
-- access paths. The direct-link index is important for administrator reports,
-- where RLS intentionally does not inject a distributor_id predicate.
create index if not exists distributor_events_type_range_idx
on public.distributor_attribution_events(distributor_id, event_type, occurred_at)
include (anonymous_visitor_id, session_id, order_id, consent_state);

create index if not exists distributor_events_link_direct_idx
on public.distributor_attribution_events(partner_link_id, occurred_at)
include (event_type, anonymous_visitor_id, session_id, order_id, consent_state)
where partner_link_id is not null;

comment on index public.distributor_events_type_range_idx is
  'Supports consented funnel counts by distributor, event type, and semi-open period.';
comment on index public.distributor_events_link_direct_idx is
  'Supports per-link growth reporting for distributors and administrators.';
