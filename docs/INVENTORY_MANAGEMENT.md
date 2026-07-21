# Inventory management

The inventory module is part of the existing authenticated admin portal at `/admin/inventory` (and `/es/admin/inventory`). It uses the existing Supabase project, portal authentication, `user_roles`, and catalog identifiers from `src/data/products.ts`.

## Database and migration

Apply `supabase/migrations/202607210001_inventory_management.sql` with the normal Supabase migration workflow:

```sh
pnpm supabase:migrations:check
pnpm supabase:migrations:push
```

The migration creates `inventory_products`, `inventory_variants`, immutable `inventory_movements`, and manual-order reference tables. Row-level security limits exact balances and history to users with `support`, `admin`, or `super_admin` roles. Settings and catalog synchronization require `admin` or `super_admin`. Public callers can execute only `public_inventory_status`, which returns a SKU and `in_stock`, `limited`, `out_of_stock`, or `inactive`; it never returns quantities, costs, or thresholds.

`inventory_adjust` locks the SKU row, validates the requested movement, updates balances, and inserts the movement in one Postgres transaction. Non-backorder SKUs cannot finish with negative available stock. Its idempotency key makes retries safe. Movement rows are protected by an update/delete trigger.

## Configuration and roles

The module uses the existing browser-safe variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not add a service-role key to a `VITE_` variable. Assign administrators through the existing `user_roles` table. `admin` and `super_admin` can manage settings and balances; `support` can view inventory and record approved movements; public visitors receive status only.

## Calculations and workflow

- On hand is physical stock.
- Reserved is stock committed to a confirmed order.
- Available is `on_hand - reserved`.
- Confirmed order: use **Reserve inventory** with the order/reference number.
- Fulfilled order: use **Fulfill reserved order**, which decreases on-hand and reserved together.
- Cancelled order: use **Release reservation**.
- Immediate sale: use **Immediate manual sale** without first reserving.

The **Record sale** dialog captures customer name, channel, reference, multiple SKU lines, notes, and either a confirmed or immediate-sale status in one database transaction. The `inventory_update_manual_order_status` RPC supports the later confirmed-to-fulfilled or confirmed-to-cancelled transition. Existing authenticated portal orders are integrated automatically: `processing` reserves, `shipped`/`delivered` fulfills, and `cancelled` releases. Per-order/SKU idempotency keys prevent duplicate fulfillment.

Use the reference number consistently. Retried order operations should reuse the same idempotency key when called programmatically. The portal generates a unique key for each explicit administrator confirmation.

## Initial stock and catalog synchronization

Opening the Inventory page securely upserts current product and variant metadata from the existing catalog; balances and settings are not overwritten. New SKUs start at zero. Select **Initial stock count** for each SKU to record the real physical count. This creates an `initial_count` movement rather than silently changing the balance.

## Storefront availability

Product ordering controls request the status for the selected SKU. Zero available inventory disables ordering and presents the existing availability/contact path. English and Spanish use the same database row and localized labels. Pending-order creation repeats the availability check before the server handoff.

## Testing

Run:

```sh
pnpm lint
pnpm exec tsc -b --pretty false
pnpm test
pnpm build
```

`src/lib/inventory.test.ts` covers movement projections, stock statuses, invalid negative projections, and bilingual public labels. Transaction locking, role policies, immutable history, and idempotency are enforced in the migration and should also be exercised against a staging Supabase project before production rollout.
