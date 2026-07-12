# Encore Bio Labs client portal audit

Audit date: 2026-07-12

## Current architecture

- React 19.2 and TypeScript 6 application built with Vite 8.
- Tailwind CSS 4 utilities plus shared global styles in `src/index.css`.
- Manual pathname routing in `src/App.tsx`; route bundles are lazy loaded.
- Static Vercel deployment with SPA rewrites from `vercel.json`.
- Supabase JS 2.110 is installed and initialized from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Existing PostgreSQL schema and migration files protect CRM records with Row Level Security.
- Public catalog data is centralized in `src/data/products.ts`.
- Cart data is browser-persisted; checkout submits an order inquiry rather than creating a payment-backed order.
- The CRM includes a local sample-data fallback. It must not be reused for portal authentication or production portal data.

## Reusable foundations

- Supabase Auth, PostgreSQL, RLS, Storage, and Edge Functions are the recommended backend.
- The existing Supabase browser client can be reused for managed authentication and RLS-scoped data access.
- Existing brand tokens, navigation, responsive utilities, forms, disclosure language, product data, and COA metadata can be reused.
- The existing catalog and inquiry workflow remain authoritative until a server-owned order integration is completed.

## Missing capabilities

- No client accounts, email verification UI, password recovery, portal sessions, roles, statuses, onboarding, consent history, or protected portal layouts.
- No portal database tables or private storage buckets.
- No server-owned order model connected to the existing inquiry checkout.
- No administrative application queue, portal audit log, security event log, rate-limit Edge Functions, or MFA enrollment UI.
- No CSP/security-header configuration beyond the current SPA rewrite.

## Recommended architecture

Use Supabase Auth for identity, PostgreSQL/RLS for authorization and data ownership, private Storage buckets for documents/photos, and Edge Functions for privileged actions, signed URLs, rate limiting, staff role changes, and audit-sensitive workflows. The SPA may hide or redirect unavailable screens, but RLS and Edge Functions remain the authorization boundary.

## Phase 1 file plan

- Add a portal SQL migration under `supabase/migrations`.
- Add auth/session services and an auth context under `src/lib/portal` and `src/context`.
- Add public auth pages and protected client/admin layouts under `src/components/portal`.
- Extend the existing pathname router; do not add a second application or routing system.
- Add audit and security documentation under `docs`.

## Migration risks

- The existing `crm_admin` app-metadata role differs from the new `client/support/admin/super_admin` role model. Both must coexist until CRM authorization is migrated deliberately.
- Existing checkout inquiries are not authenticated orders. Portal orders must not infer payment or fulfillment state from browser cart data.
- Public COA files currently live under `public/coa`; client-assigned or protected documents must use a private bucket instead.
- Supabase email templates and redirect allowlists must be configured before authentication is production ready.

## Security blockers and production concerns

- Environment values and an applied migration are required before account flows can operate.
- Staff MFA, rate-limited privileged Edge Functions, private bucket creation, malware scanning, and production email configuration remain deployment blockers.
- A static Vite bundle cannot safely contain a Supabase service-role key. Privileged mutations must use Edge Functions or a trusted server.
- The existing local CRM sample fallback is acceptable for the internal CRM preview only; it is prohibited for portal identity or protected data.
- Do not claim HIPAA compliance. A legal/privacy/vendor assessment is still required for health-adjacent progress data.
