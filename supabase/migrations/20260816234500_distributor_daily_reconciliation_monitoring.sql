-- Daily, read-only distributor accounting and onboarding reconciliation.
--
-- Findings are snapshots: the job never changes orders, commissions, refunds,
-- payouts, invitations, or Auth users. Operators acknowledge and resolve a
-- finding only after the underlying discrepancy has been corrected through an
-- approved workflow.

create extension if not exists pg_cron;

create table if not exists public.distributor_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  source text not null default 'cron' check (length(trim(source)) between 1 and 80),
  summary jsonb not null default '{}'::jsonb,
  total_findings integer not null default 0 check (total_findings >= 0),
  critical_findings integer not null default 0 check (critical_findings >= 0),
  warning_findings integer not null default 0 check (warning_findings >= 0),
  error_code text
);

create table if not exists public.distributor_reconciliation_findings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.distributor_reconciliation_runs(id) on delete restrict,
  check_key text not null check (length(trim(check_key)) between 3 and 120),
  severity text not null check (severity in ('critical', 'warning', 'info')),
  entity_type text not null check (length(trim(entity_type)) between 2 and 80),
  entity_id text not null check (length(trim(entity_id)) between 1 and 240),
  distributor_id uuid references public.distributor_accounts(id) on delete set null,
  detected_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  acknowledged_at timestamptz,
  acknowledged_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  resolution_note text,
  unique (run_id, check_key, entity_type, entity_id)
);

create index if not exists distributor_reconciliation_runs_started_idx
  on public.distributor_reconciliation_runs(started_at desc, id desc);
create index if not exists distributor_reconciliation_findings_run_idx
  on public.distributor_reconciliation_findings(run_id, severity, status, detected_at desc, id desc);
create index if not exists distributor_reconciliation_findings_open_idx
  on public.distributor_reconciliation_findings(distributor_id, detected_at desc, id desc)
  where status <> 'resolved';

alter table public.distributor_reconciliation_runs enable row level security;
alter table public.distributor_reconciliation_findings enable row level security;

drop policy if exists "admins read distributor reconciliation runs" on public.distributor_reconciliation_runs;
create policy "admins read distributor reconciliation runs"
on public.distributor_reconciliation_runs for select to authenticated
using ((select public.portal_is_admin()));

drop policy if exists "admins update distributor reconciliation runs" on public.distributor_reconciliation_runs;
create policy "admins update distributor reconciliation runs"
on public.distributor_reconciliation_runs for update to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

drop policy if exists "admins read distributor reconciliation findings" on public.distributor_reconciliation_findings;
create policy "admins read distributor reconciliation findings"
on public.distributor_reconciliation_findings for select to authenticated
using ((select public.portal_is_admin()));

drop policy if exists "admins update distributor reconciliation findings" on public.distributor_reconciliation_findings;
create policy "admins update distributor reconciliation findings"
on public.distributor_reconciliation_findings for update to authenticated
using ((select public.portal_is_admin()))
with check ((select public.portal_is_admin()));

grant select, update on public.distributor_reconciliation_runs,
  public.distributor_reconciliation_findings to authenticated;
grant select, insert, update, delete on public.distributor_reconciliation_runs,
  public.distributor_reconciliation_findings to service_role;

create or replace function private.run_distributor_daily_reconciliation(run_source text default 'cron')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_run_id uuid;
  normalized_source text := left(coalesce(nullif(trim(run_source), ''), 'cron'), 80);
  run_summary jsonb;
begin
  insert into public.distributor_reconciliation_runs(source)
  values (normalized_source)
  returning id into current_run_id;

  begin
    -- Paid, attributed orders must have exactly one accounting sale.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'paid_order_without_sale', 'critical', 'storefront_order',
      orders.id::text, orders.distributor_id,
      jsonb_build_object('orderReference', orders.order_reference, 'paidAt', orders.paid_at)
    from public.storefront_orders orders
    where orders.status = 'paid'
      and orders.distributor_id is not null
      and not exists (
        select 1 from public.distributor_sales sales where sales.storefront_order_id = orders.id
      );

    -- A live sale may never point to an unpaid or missing storefront order.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'active_sale_without_paid_order', 'critical', 'distributor_sale',
      sales.id::text, sales.distributor_id,
      jsonb_build_object('orderId', sales.storefront_order_id, 'saleStatus', sales.status, 'orderStatus', orders.status)
    from public.distributor_sales sales
    left join public.storefront_orders orders on orders.id = sales.storefront_order_id
    where sales.status <> 'voided'
      and orders.status is distinct from 'paid';

    -- The accounting view proves original-credit uniqueness and reversal caps.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'ledger_original_credit_count', 'critical', 'distributor_sale',
      ledger.sale_id::text, ledger.distributor_id,
      jsonb_build_object('orderReference', ledger.order_reference, 'ledgerNetCents', ledger.ledger_net_cents)
    from public.distributor_ledger_reconciliation ledger
    where not ledger.exactly_one_original_credit;

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'ledger_reversal_exceeds_original', 'critical', 'distributor_sale',
      ledger.sale_id::text, ledger.distributor_id,
      jsonb_build_object('orderReference', ledger.order_reference, 'ledgerNetCents', ledger.ledger_net_cents)
    from public.distributor_ledger_reconciliation ledger
    where not ledger.reversal_within_original;

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'duplicate_original_commission_credit', 'critical', 'distributor_sale',
      commission_id::text, (array_agg(distributor_id order by distributor_id))[1],
      jsonb_build_object('creditCount', count(*), 'amountCents', sum(amount_cents))
    from public.distributor_commission_ledger
    where commission_id is not null
      and entry_type in ('commission_earned', 'legacy_balance')
    group by commission_id
    having count(*) > 1;

    -- Refund reversals must link to their immutable ledger entry.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'refund_without_ledger_reversal', 'critical', 'distributor_refund',
      refunds.id::text, refunds.distributor_id,
      jsonb_build_object('saleId', refunds.sale_id, 'commissionReversedCents', refunds.commission_reversed_cents)
    from public.distributor_refunds refunds
    left join public.distributor_commission_ledger ledger on ledger.id = refunds.ledger_entry_id
    where refunds.commission_reversed_cents > 0
      and (ledger.id is null or ledger.amount_cents <> -refunds.commission_reversed_cents);

    -- A payout total is a projection of its immutable ledger items.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'payout_total_mismatch', 'critical', 'distributor_payout',
      payouts.id::text, payouts.distributor_id,
      jsonb_build_object(
        'storedAmountCents', payouts.amount_cents,
        'ledgerAmountCents', greatest(coalesce(sum(items.amount_cents), 0), 0)
      )
    from public.distributor_payouts payouts
    left join public.distributor_payout_ledger_items items on items.payout_id = payouts.id
    group by payouts.id, payouts.distributor_id, payouts.amount_cents
    having payouts.amount_cents <> greatest(coalesce(sum(items.amount_cents), 0), 0);

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'paid_payout_without_receipt', 'critical', 'distributor_payout',
      payouts.id::text, payouts.distributor_id,
      jsonb_build_object('paidAt', payouts.paid_at, 'amountCents', payouts.amount_cents)
    from public.distributor_payouts payouts
    where payouts.status = 'paid'
      and not exists (
        select 1 from public.distributor_payout_receipts receipts where receipts.payout_id = payouts.id
      );

    -- Auth mappings are checked only for known distributor records/invitations.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'distributor_account_without_auth_user', 'critical', 'distributor_account',
      accounts.id::text, accounts.id,
      jsonb_build_object('userId', accounts.user_id, 'email', accounts.email)
    from public.distributor_accounts accounts
    left join auth.users users on users.id = accounts.user_id
    where accounts.user_id is not null and users.id is null;

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'accepted_invitation_without_account_profile', 'critical', 'distributor_invitation',
      invitations.id::text, invitations.distributor_id,
      jsonb_build_object('authUserId', invitations.auth_user_id, 'email', invitations.email)
    from public.distributor_onboarding_invitations invitations
    where invitations.status = 'accepted'
      and invitations.auth_user_id is not null
      and not exists (
        select 1 from public.distributor_accounts accounts where accounts.user_id = invitations.auth_user_id
      );

    -- Operational queues surface failures and stalled retry windows.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'invitation_delivery_failed', 'warning', 'distributor_invitation',
      invitations.id::text, invitations.distributor_id,
      jsonb_build_object('status', invitations.status, 'lastError', invitations.last_error)
    from public.distributor_onboarding_invitations invitations
    where invitations.status = 'failed';

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'onboarding_outbox_failed',
      case when outbox.status = 'blocked' or outbox.attempts >= outbox.max_attempts then 'critical' else 'warning' end,
      'distributor_onboarding_outbox', outbox.id::text, outbox.distributor_id,
      jsonb_build_object('status', outbox.status, 'attempts', outbox.attempts, 'maxAttempts', outbox.max_attempts, 'lastError', outbox.last_error)
    from public.distributor_onboarding_outbox outbox
    where outbox.status in ('failed', 'blocked');

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'onboarding_outbox_overdue', 'warning', 'distributor_onboarding_outbox',
      outbox.id::text, outbox.distributor_id,
      jsonb_build_object('status', outbox.status, 'availableAt', outbox.available_at, 'lockedAt', outbox.locked_at)
    from public.distributor_onboarding_outbox outbox
    where (outbox.status = 'pending' and outbox.available_at < now() - interval '15 minutes')
       or (outbox.status = 'processing' and outbox.locked_at < now() - interval '30 minutes');

    -- Provider events must either fail visibly or resolve to an order.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'payment_event_failed', 'critical', 'distributor_payment_event',
      events.id::text, orders.distributor_id,
      jsonb_build_object('provider', events.provider, 'eventType', events.event_type, 'errorCode', events.error_code)
    from public.distributor_payment_events events
    left join public.storefront_orders orders on orders.id = events.storefront_order_id
    where events.processing_status = 'failed';

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'processed_payment_event_without_order', 'critical', 'distributor_payment_event',
      events.id::text, null,
      jsonb_build_object('provider', events.provider, 'eventType', events.event_type, 'externalEventId', events.external_event_id)
    from public.distributor_payment_events events
    where events.processing_status = 'processed'
      and events.storefront_order_id is null;

    -- Server-side paid attribution is required for every attributed paid order.
    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'paid_order_without_paid_attribution_event', 'warning', 'storefront_order',
      orders.id::text, orders.distributor_id,
      jsonb_build_object('orderReference', orders.order_reference, 'paidAt', orders.paid_at)
    from public.storefront_orders orders
    where orders.status = 'paid'
      and orders.distributor_id is not null
      and not exists (
        select 1
        from public.distributor_attribution_events events
        where events.order_id = orders.id and events.event_type = 'order_paid'
      );

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'stale_negative_balance_recovery', 'warning', 'commission_ledger_entry',
      ledger.id::text, ledger.distributor_id,
      jsonb_build_object('remainingCents', ledger.remaining_cents, 'createdAt', ledger.created_at, 'recoveryStatus', ledger.recovery_status)
    from public.distributor_commission_ledger ledger
    where ledger.recovery_status in ('pending', 'partial')
      and ledger.remaining_cents > 0
      and ledger.created_at < now() - interval '30 days';

    insert into public.distributor_reconciliation_findings(
      run_id, check_key, severity, entity_type, entity_id, distributor_id, details
    )
    select current_run_id, 'unresolved_onboarding_reconciliation_issue', 'warning', 'onboarding_reconciliation_issue',
      issues.id::text, issues.distributor_id,
      jsonb_build_object('issueType', issues.issue_type, 'email', issues.email, 'detectedAt', issues.detected_at)
    from public.distributor_onboarding_reconciliation_issues issues
    where issues.status in ('open', 'reviewed');

    select jsonb_build_object(
      'checksWithFindings', coalesce((select jsonb_object_agg(grouped.check_key, grouped.finding_count) from (
        select check_key, count(*) as finding_count
        from public.distributor_reconciliation_findings
        where run_id = current_run_id
        group by check_key
      ) grouped), '{}'::jsonb),
      'severity', jsonb_build_object(
        'critical', count(*) filter (where severity = 'critical'),
        'warning', count(*) filter (where severity = 'warning'),
        'info', count(*) filter (where severity = 'info')
      )
    )
    into run_summary
    from public.distributor_reconciliation_findings
    where run_id = current_run_id;

    update public.distributor_reconciliation_runs
    set completed_at = now(),
        status = 'completed',
        summary = run_summary,
        total_findings = (select count(*) from public.distributor_reconciliation_findings where run_id = current_run_id),
        critical_findings = (select count(*) from public.distributor_reconciliation_findings where run_id = current_run_id and severity = 'critical'),
        warning_findings = (select count(*) from public.distributor_reconciliation_findings where run_id = current_run_id and severity = 'warning')
    where id = current_run_id;

    insert into public.distributor_audit_events(
      actor_id, distributor_id, event_type, resource_type, resource_id, metadata
    ) values (
      null, null, 'daily_reconciliation_completed', 'distributor_reconciliation_run', current_run_id,
      run_summary || jsonb_build_object('source', normalized_source)
    );
  exception when others then
    update public.distributor_reconciliation_runs
    set completed_at = now(), status = 'failed', error_code = sqlstate,
        summary = jsonb_build_object('message', left(sqlerrm, 500))
    where id = current_run_id;
    raise;
  end;

  return current_run_id;
end
$$;

revoke all on function private.run_distributor_daily_reconciliation(text) from public, anon, authenticated;
grant execute on function private.run_distributor_daily_reconciliation(text) to service_role;

do $$
declare scheduled_job record;
begin
  for scheduled_job in
    select jobid from cron.job where jobname = 'distributor-daily-reconciliation-v1'
  loop
    perform cron.unschedule(scheduled_job.jobid);
  end loop;

  perform cron.schedule(
    'distributor-daily-reconciliation-v1',
    '15 10 * * *',
    'select private.run_distributor_daily_reconciliation(''cron'');'
  );
end
$$;

comment on table public.distributor_reconciliation_runs is
  'Immutable execution history for the daily distributor reconciliation monitor.';
comment on table public.distributor_reconciliation_findings is
  'Read-only discrepancy snapshots. The monitor never changes financial or onboarding source records.';
comment on function private.run_distributor_daily_reconciliation(text) is
  'Runs read-only distributor financial, attribution, onboarding, and Auth consistency checks.';
