-- Targeted indexes for the daily reconciliation monitor. Partial predicates
-- keep write overhead bounded while avoiding full scans as histories grow.

create index if not exists distributor_events_order_paid_monitor_idx
  on public.distributor_attribution_events(order_id)
  where event_type = 'order_paid' and order_id is not null;

create index if not exists distributor_payment_events_monitor_idx
  on public.distributor_payment_events(processing_status, received_at desc)
  include (storefront_order_id, provider, event_type, error_code)
  where processing_status in ('failed', 'processed');

create index if not exists distributor_ledger_recovery_monitor_idx
  on public.distributor_commission_ledger(recovery_status, created_at)
  include (distributor_id, remaining_cents)
  where recovery_status in ('pending', 'partial') and remaining_cents > 0;

comment on index public.distributor_events_order_paid_monitor_idx is
  'Supports reconciliation of attributed paid orders to immutable order_paid events.';
comment on index public.distributor_payment_events_monitor_idx is
  'Supports reconciliation of failed and processed provider payment events.';
comment on index public.distributor_ledger_recovery_monitor_idx is
  'Supports monitoring of stale outstanding negative-balance recoveries.';
