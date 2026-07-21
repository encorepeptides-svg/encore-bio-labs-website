# Shipping checkout setup

The storefront checkout calls the `shipping-checkout` Supabase Edge Function. The function revalidates each address with EasyPost, requests current carrier rates only when the origin and parcel configuration is complete, checks configured local-delivery postal-code zones, and writes the verification snapshots to `storefront_orders` before a payment handoff.

Orders retain three distinct address records: the customer's original entry, the provider-standardized address, and the address the customer selected after reviewing any correction.

## Required operator configuration

1. Copy the variable names from `supabase/functions/.env.example` into a private Edge Function secrets file or the Supabase secrets dashboard.
2. Set `EASYPOST_API_KEY`, the complete `EASYPOST_FROM_*` origin, and all parcel dimensions and per-kit weight before enabling live carrier rates.
3. Configure each local area with its approved postal codes, fee in integer cents, and customer-facing delivery-time label. Missing values intentionally produce manual review instead of guessed availability, cost, or timing.
4. Set `STOREFRONT_ALLOWED_ORIGINS` to the comma-separated production origins.
5. Deploy `shipping-checkout` through the approved Supabase workflow after reviewing `202607200004_shipping_address_verification.sql`.

EasyPost credentials and Supabase secret keys are server-only. Never add them to a `VITE_` variable, browser code, logs, or order messages.

The function uses Supabase's default JWT verification. If a project overrides function authentication in `supabase/config.toml`, keep JWT verification enabled for `shipping-checkout`.

## Still required before live payment

- Confirm the EasyPost account has international address verification enabled if those destinations should validate automatically.
- Enter the actual origin address and package measurements; live rates cannot be requested without them.
- Define the approved postal-code lists, fees, and timing for El Paso, Ciudad Juárez, and Chihuahua.
- Connect a payment processor only after server-side catalog pricing is authoritative. The current storefront remains an order-request and manual-payment handoff, so the function flags stored pricing for catalog review.
