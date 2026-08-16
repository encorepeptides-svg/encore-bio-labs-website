-- Recompile the metrics RPC with unambiguous CTE column references.
-- The original definition is also corrected for clean installations.
create or replace function public.get_distributor_dashboard_metrics(
  target_distributor_id uuid default null,
  start_at timestamptz default null,
  end_at timestamptz default null,
  metric_currency text default 'USD'
)
returns table (
  currency text,
  active_distributors_count bigint,
  total_orders_attributed bigint,
  total_orders_paid bigint,
  total_orders_refunded bigint,
  total_sales bigint,
  gross_attributed_revenue_cents bigint,
  refunds_total_cents bigint,
  net_attributed_revenue_cents bigint,
  original_commission_cents bigint,
  positive_adjustments_cents bigint,
  negative_adjustments_cents bigint,
  refund_reversals_cents bigint,
  chargeback_debits_cents bigint,
  chargeback_reversals_cents bigint,
  net_commission_cents bigint,
  pending_commission_cents bigint,
  approved_commission_cents bigint,
  in_payout_commission_cents bigint,
  paid_commission_cents bigint,
  pending_recovery_cents bigint,
  payable_cents bigint,
  payout_count bigint,
  last_paid_payout_at timestamptz,
  average_order_value_cents bigint,
  order_payment_rate_bps integer
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_distributor_id uuid := public.portal_distributor_id();
  caller_is_admin boolean := public.portal_is_admin();
  scoped_distributor_id uuid;
  normalized_currency text := upper(trim(metric_currency));
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if start_at is not null and end_at is not null and end_at <= start_at then
    raise exception 'end_at must be greater than start_at' using errcode = '22023';
  end if;
  if normalized_currency !~ '^[A-Z]{3}$' then
    raise exception 'metric_currency must be a three-letter ISO code' using errcode = '22023';
  end if;

  if caller_is_admin then
    scoped_distributor_id := target_distributor_id;
  else
    if caller_distributor_id is null then
      raise exception 'distributor account required' using errcode = '42501';
    end if;
    if target_distributor_id is not null and target_distributor_id <> caller_distributor_id then
      raise exception 'distributor access denied' using errcode = '42501';
    end if;
    scoped_distributor_id := caller_distributor_id;
  end if;

  return query
  with
  scoped_accounts as materialized (
    select account.id, account.status
    from public.distributor_accounts account
    where scoped_distributor_id is null or account.id = scoped_distributor_id
  ),
  filtered_referrals as materialized (
    select referral.id, referral.distributor_id
    from public.distributor_referrals referral
    join scoped_accounts account on account.id = referral.distributor_id
    where (start_at is null or referral.created_at >= start_at)
      and (end_at is null or referral.created_at < end_at)
  ),
  referral_metrics as (
    select
      count(*)::bigint as attributed_count,
      count(*) filter (
        where exists (
          select 1
          from public.distributor_sales paid_sale
          where paid_sale.referral_id = referral.id
        )
      )::bigint as paid_count,
      count(*) filter (
        where exists (
          select 1
          from public.distributor_sales refunded_sale
          join public.distributor_commission_ledger refund_entry
            on refund_entry.commission_id = refunded_sale.id
           and refund_entry.entry_type in ('partial_refund_reversal', 'full_refund_reversal')
          where refunded_sale.referral_id = referral.id
        )
      )::bigint as refunded_count
    from filtered_referrals referral
  ),
  filtered_sales as materialized (
    select sale.*
    from public.distributor_sales sale
    join scoped_accounts account on account.id = sale.distributor_id
    where sale.currency = normalized_currency
      and (start_at is null or sale.paid_at >= start_at)
      and (end_at is null or sale.paid_at < end_at)
  ),
  sale_metrics as (
    select
      count(*)::bigint as sale_count,
      coalesce(sum(sale.original_commissionable_revenue_cents), 0)::bigint as gross_revenue,
      coalesce(sum(sale.refunded_commissionable_revenue_cents), 0)::bigint as refunds,
      coalesce(sum(greatest(
        sale.original_commissionable_revenue_cents - sale.refunded_commissionable_revenue_cents,
        0
      )), 0)::bigint as net_revenue
    from filtered_sales sale
  ),
  filtered_ledger as materialized (
    select ledger.*
    from public.distributor_commission_ledger ledger
    join scoped_accounts account on account.id = ledger.distributor_id
    where ledger.currency = normalized_currency
      and (start_at is null or ledger.created_at >= start_at)
      and (end_at is null or ledger.created_at < end_at)
  ),
  ledger_metrics as (
    select
      coalesce(sum(ledger.amount_cents) filter (
        where ledger.entry_type in ('commission_earned', 'legacy_balance')
      ), 0)::bigint as original_commission,
      coalesce(sum(ledger.amount_cents) filter (
        where ledger.entry_type in ('manual_positive_adjustment', 'chargeback_reversal')
      ), 0)::bigint as positive_adjustments,
      abs(coalesce(sum(ledger.amount_cents) filter (
        where ledger.entry_type in ('manual_negative_adjustment', 'chargeback')
      ), 0))::bigint as negative_adjustments,
      abs(coalesce(sum(ledger.amount_cents) filter (
        where ledger.entry_type in ('partial_refund_reversal', 'full_refund_reversal')
      ), 0))::bigint as refund_reversals,
      abs(coalesce(sum(ledger.amount_cents) filter (
        where ledger.entry_type = 'chargeback'
      ), 0))::bigint as chargeback_debits,
      coalesce(sum(ledger.amount_cents) filter (
        where ledger.entry_type = 'chargeback_reversal'
      ), 0)::bigint as chargeback_reversals,
      coalesce(sum(ledger.amount_cents), 0)::bigint as net_commission
    from filtered_ledger ledger
  ),
  allocated_positive as materialized (
    select
      item.ledger_entry_id,
      coalesce(sum(item.amount_cents) filter (where item.amount_cents > 0), 0)::bigint as amount_cents
    from public.distributor_payout_ledger_items item
    join public.distributor_payouts payout on payout.id = item.payout_id
    join scoped_accounts account on account.id = payout.distributor_id
    group by item.ledger_entry_id
  ),
  commission_current as materialized (
    select
      sale.id,
      sale.status,
      coalesce(sum(ledger.amount_cents), 0)::bigint as net_commission_cents,
      coalesce(sum(allocated.amount_cents), 0)::bigint as allocated_positive_cents
    from public.distributor_commission_ledger ledger
    join scoped_accounts account on account.id = ledger.distributor_id
    join public.distributor_sales sale on sale.id = ledger.commission_id
    left join allocated_positive allocated on allocated.ledger_entry_id = ledger.id
    where ledger.currency = normalized_currency
    group by sale.id, sale.status
  ),
  commission_status_metrics as (
    select
      coalesce(sum(greatest(current_commission.net_commission_cents - current_commission.allocated_positive_cents, 0)) filter (
        where current_commission.status = 'pending'
      ), 0)::bigint as pending_commission,
      coalesce(sum(greatest(current_commission.net_commission_cents - current_commission.allocated_positive_cents, 0)) filter (
        where current_commission.status = 'approved'
      ), 0)::bigint as approved_commission
    from commission_current current_commission
  ),
  current_balance as (
    select
      coalesce(sum(balance.pending_recovery_cents), 0)::bigint as pending_recovery,
      coalesce(sum(balance.payable_cents), 0)::bigint as payable
    from public.distributor_commission_balances balance
    join scoped_accounts account on account.id = balance.distributor_id
    where balance.currency = normalized_currency
  ),
  payout_activity as (
    select
      count(*)::bigint as payout_count,
      coalesce(sum(payout.amount_cents) filter (
        where payout.status in ('draft', 'processing')
      ), 0)::bigint as in_payout
    from public.distributor_payouts payout
    join scoped_accounts account on account.id = payout.distributor_id
    where payout.currency = normalized_currency
      and (start_at is null or payout.created_at >= start_at)
      and (end_at is null or payout.created_at < end_at)
  ),
  paid_payout_metrics as (
    select
      coalesce(sum(payout.amount_cents), 0)::bigint as paid_commission,
      max(payout.paid_at) as last_paid_at
    from public.distributor_payouts payout
    join scoped_accounts account on account.id = payout.distributor_id
    where payout.currency = normalized_currency
      and payout.status = 'paid'
      and payout.paid_at is not null
      and (start_at is null or payout.paid_at >= start_at)
      and (end_at is null or payout.paid_at < end_at)
  )
  select
    normalized_currency,
    count(*) filter (where account.status = 'active')::bigint,
    referral.attributed_count,
    referral.paid_count,
    referral.refunded_count,
    sales.sale_count,
    sales.gross_revenue,
    sales.refunds,
    sales.net_revenue,
    ledger.original_commission,
    ledger.positive_adjustments,
    ledger.negative_adjustments,
    ledger.refund_reversals,
    ledger.chargeback_debits,
    ledger.chargeback_reversals,
    ledger.net_commission,
    commission_status.pending_commission,
    commission_status.approved_commission,
    payout_activity.in_payout,
    paid_payout.paid_commission,
    balance.pending_recovery,
    balance.payable,
    payout_activity.payout_count,
    paid_payout.last_paid_at,
    case when sales.sale_count = 0 then null
      else round(sales.gross_revenue::numeric / sales.sale_count)::bigint
    end,
    case when referral.attributed_count = 0 then null
      else round(referral.paid_count::numeric * 10000 / referral.attributed_count)::integer
    end
  from scoped_accounts account
  cross join referral_metrics referral
  cross join sale_metrics sales
  cross join ledger_metrics ledger
  cross join commission_status_metrics commission_status
  cross join current_balance balance
  cross join payout_activity
  cross join paid_payout_metrics paid_payout
  group by
    referral.attributed_count, referral.paid_count, referral.refunded_count,
    sales.sale_count, sales.gross_revenue, sales.refunds, sales.net_revenue,
    ledger.original_commission, ledger.positive_adjustments, ledger.negative_adjustments,
    ledger.refund_reversals, ledger.chargeback_debits, ledger.chargeback_reversals,
    ledger.net_commission, commission_status.pending_commission,
    commission_status.approved_commission, payout_activity.in_payout,
    paid_payout.paid_commission, balance.pending_recovery, balance.payable,
    payout_activity.payout_count, paid_payout.last_paid_at;
end
$$;
