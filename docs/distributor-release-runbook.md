# Distributor portal release runbook

## Environment map

| Layer | Staging | Production |
| --- | --- | --- |
| Supabase project | `urusywsreprdmpxvyrun` | `rrrkjohvxbsahxxevzcg` |
| Vercel project | Preview deployment of `encore-bio-labs-website` | `encore-bio-labs-website` |
| Public domain | Vercel preview URL | `https://encorebiolabs.com` |
| Commission base | 25% (`2500` basis points) | 25% (`2500` basis points) |

The repository in this workspace is `encore-checkout-fix`, connected to
`encorepeptides-svg/encore-bio-labs-website`. Production is promoted only from
a commit that has passed the same staging migrations and tests.

## Required release gates

1. Clean Git worktree and no divergence from `origin/main`.
2. TypeScript, lint, Vitest, and production build pass.
3. Apply pending migrations to staging.
4. Run the historical metrics, premium security, and daily reconciliation SQL tests.
5. Run staging reconciliation and require zero unexplained critical findings.
6. Validate the Vercel preview in English and Spanish, desktop and mobile.
7. Confirm production migration history, current data totals, previous READY deployment, and rollback target.
8. Apply the exact staging migration to production and run reconciliation.
9. Promote the verified commit to production and smoke-test the public domain.
10. Invite a real distributor only after mail and webhook secrets are configured and the operator supplies the real profile data.

## Daily reconciliation

`private.run_distributor_daily_reconciliation(text)` runs every day at 10:15
UTC through `pg_cron`. It is read-only with respect to orders, sales, ledger
entries, refunds, payouts, attribution, onboarding, and Auth. Results are stored
in `distributor_reconciliation_runs` and
`distributor_reconciliation_findings`; only administrators can read or update
their review status through RLS.

The monitor checks:

- paid attributed orders versus sales and server-side paid attribution events;
- active sales versus paid storefront orders;
- original commission credit uniqueness and refund reversal caps;
- refund-to-ledger links and payout totals/receipts;
- distributor profile-to-Auth and accepted invitation mappings;
- failed or overdue onboarding queues and payment events;
- stale negative-balance recoveries and unresolved onboarding issues.

No discrepancy is repaired automatically. Financial corrections must use an
approved compensating-entry or payout workflow.

## Operational secret gate

Before deploying or exercising `distributor-onboarding` and
`payment-accounting-webhook`, confirm the following secret names exist in the
target Supabase environment. Never place their values in Git, logs, screenshots,
or this document.

- `PORTAL_SITE_URL`
- `STOREFRONT_ALLOWED_ORIGINS`
- `DISTRIBUTOR_FINGERPRINT_PEPPER`
- `PAYMENT_ACCOUNTING_WEBHOOK_SECRET`
- `ZOHO_OAUTH_CLIENT_ID`
- `ZOHO_OAUTH_CLIENT_SECRET`
- `ZOHO_OAUTH_REFRESH_TOKEN`
- `ZOHO_MAIL_ACCOUNT_ID`
- `ZOHO_FROM_EMAIL`
- the EasyPost variables required by the live shipping function

Do not fabricate or reuse a production secret in staging. Rotate any credential
that appears in command output or source control.

## Rollback

Frontend rollback uses the last known READY production deployment in Vercel.
Record its deployment ID immediately before promotion. A frontend rollback does
not reverse database migrations.

The reconciliation migration is additive and forward-compatible. If the job
must be paused while an incident is investigated, unschedule only the named job:

```sql
select cron.unschedule(jobid)
from cron.job
where jobname = 'distributor-daily-reconciliation-v1';
```

Preserve run and finding history. Do not drop accounting, onboarding, audit, or
reconciliation data as part of a rollback. Edge Functions are rolled back by
redeploying the previously verified version after confirming its secret contract.

## Post-release verification

- `/es/distributor/login` and `/en/distributor/login` show partner-specific authentication.
- `/es/distributor` and `/en/distributor` remain protected.
- Public distributor links preserve attribution without exposing private data.
- Admin reconciliation shows the latest completed run and its counts.
- Supabase Auth, Postgres, API, and Edge Function logs contain no new release errors.
- Vercel reports the deployment READY with no new runtime error clusters.
- The first real distributor remains at the 25% default unless an audited, prospective rule explicitly overrides it.
