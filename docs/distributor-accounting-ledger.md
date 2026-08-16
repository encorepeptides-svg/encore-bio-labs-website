# Distributor commission accounting ledger

The signed rows in `distributor_commission_ledger` are the accounting source of
truth. `distributor_sales.refund_cents` remains only as a compatibility cache
rebuilt by the refund transaction.

## Partial-refund calculation

Amounts are integer cents. The migration snapshots product-line gross revenue,
allocates the order discount by cumulative proportional rounding, excludes tax,
shipping, import fees, processing fees, and noncommissionable amounts, then
snapshots the original line and sale commission.

For an order-level refund, the transaction calculates the cumulative eligible
refund and the cumulative commission target:

```text
cumulative eligible = floor(original eligible revenue × cumulative gross refund / original paid total)
cumulative reversal = floor(original commission × cumulative eligible / original eligible revenue)
event reversal = cumulative reversal − commission already reversed
```

The final eligible refund assigns the exact remaining original commission, so
multiple events never over-reverse or leave a rounding cent behind. Item-level
refunds use the same cumulative rule against each selected item snapshot.

## Paid-commission recovery

A reversal never edits a paid payout. The negative ledger entry references the
original paid payout and starts with `remaining_cents = abs(amount_cents)`. New
draft payouts allocate available positive credits to pending recoveries in
oldest-first order. Each partial application is appended to
`distributor_recovery_allocations`; the ledger keeps the most recent recovery
payout plus cumulative recovered and remaining cents. The payout amount is
clamped to zero, and any remainder carries to later payouts.

## Signed payment-event contract

The processor adapter sends a normalized JSON event to
`payment-accounting-webhook`. It signs the exact raw body with HMAC-SHA256 using
`PAYMENT_ACCOUNTING_WEBHOOK_SECRET`:

```text
message:   <unix timestamp>.<raw JSON body>
headers:   x-encore-timestamp: <unix timestamp>
           x-encore-signature: v1=<lowercase hex digest>
```

Events older or newer than five minutes are rejected. Supported normalized
types are:

- `refund.created`
- `refund.updated`
- `payment.refunded`
- `chargeback.opened`
- `chargeback.lost`
- `chargeback.won`
- `chargeback.reversed`

Example payload:

```json
{
  "id": "evt_01J...",
  "type": "refund.created",
  "provider": "approved_processor",
  "order_reference": "EBL-2026-1234",
  "payment_transaction_id": "txn_external_123",
  "object_id": "refund_external_123",
  "amount_cents": 2500,
  "cumulative_amount_cents": 2500,
  "currency": "USD",
  "occurred_at": "2026-08-15T18:00:00Z",
  "reason": "Customer refund",
  "data": {}
}
```

`cumulative_amount_cents` is recommended for updated and payment-level refund
events so out-of-order deliveries can be ignored safely. External event IDs,
refund IDs, and ledger idempotency keys are unique. A failed event can be
retried; successful and ignored events return as duplicates without creating a
second movement.

## Reconciliation

After applying the migration, the following query must return no rows:

```sql
select *
from public.distributor_ledger_reconciliation
where not exactly_one_original_credit
   or not reversal_within_original
   or original_commission_amount_cents <> ledger_original_credit_cents;
```

Paid payout amounts should be captured before and after migration and compared
byte-for-byte. The migration only initializes new breakdown columns and never
changes `amount_cents` on a paid payout.
