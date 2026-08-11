# Public intake notification — options and recommendation

**Status:** proposal only. Nothing in this document has been implemented. The owner picks an option before any wiring happens.

## The defect

`public.submit_public_intake(jsonb)` (`supabase/migrations/202607230001_secure_public_intake_handoff.sql`) inserts the lead, the intake submission, the timeline events and the product interests, then returns the lead id. There is no notification of any kind — no email, no push, no badge, no log line anyone watches. The only way to learn that a lead exists is to open `/crm-admin`, which was itself broken (the `app_metadata.role = 'crm_admin'` gate). Six real leads sat unseen for four days.

## Constraints this codebase imposes

- **Email delivery is broken today.** The `communications` Edge Function is the only outbound-email path, it calls Zoho's HTTPS Mail API, and none of the `ZOHO_*` secrets are set on the project. Even after the refresh-token fix, email works only once the owner creates a Zoho self-client and sets the secrets. **An email-only notification would notify nobody on the day it ships.**
- **No webhook plumbing exists.** Nothing in `supabase/migrations/` or `supabase/schema.sql` uses `pg_net`, `net.http_post`, `supabase_functions.http_request`, or database webhooks. Choosing a trigger-calls-HTTP design means introducing that extension and its failure modes from scratch.
- **`submit_public_intake` is `security definer` and runs inside the visitor's request.** Anything slow or fallible added to its transaction becomes a way for a public, unauthenticated caller to make intake submission slow or fail. Notification must never be able to lose a lead.
- **There is an in-app notification table already.** `public.notifications` (`202607120002_client_portal_phase1.sql`) has `user_id`, `type`, `title`, `body`, `action_path`, `metadata`, `read_at`, with RLS letting a user read their own rows. It is per-user and the portal already renders it.
- **WhatsApp is an established channel for this business.** `src/lib/whatsapp.ts` holds a real staffed number (`+1 915 359 5448`) used across the site for customer contact.
- **Edge Functions are already the app's server-side pattern** — `communications` and `shipping-checkout`, invoked via `supabase.functions.invoke`.

## Options

### Option 1 — Postgres `AFTER INSERT` trigger on `crm_leads` calling a webhook via `pg_net`

Enable `pg_net`, add a trigger that fires `net.http_post` to an Edge Function or a third-party endpoint.

- **Pro:** fires for every lead however it was created, including direct inserts and future code paths. Cannot be forgotten by a caller.
- **Pro:** `pg_net` is async — it queues the request and does not block the transaction.
- **Con:** new extension, new failure surface. `pg_net` failures are silent by default; you need to watch `net._http_response` to know a notification was dropped, which is a second unwatched thing.
- **Con:** the endpoint URL and any shared secret have to live somewhere the trigger can read (a settings table or a `ALTER DATABASE ... SET` GUC). Awkward to rotate, easy to get wrong.
- **Con:** hardest of the three to test locally.

### Option 2 — Edge Function invoked by the client after `submit_public_intake` returns

The intake page calls the RPC, then invokes a `notify-intake` Edge Function (or extends `communications` with a `notify_intake` action) with the returned lead id.

- **Pro:** matches the pattern already in the codebase; no new extension, no new secret-distribution problem — Edge Function secrets are managed the normal way.
- **Pro:** notification cannot delay or fail the lead insert. The lead is already committed before the invoke.
- **Pro:** easy to add multiple channels behind one function later.
- **Con:** a caller that skips the invoke — a browser closed the instant the RPC returns, a network blip, a future code path that calls the RPC directly — produces a silent miss. **This is the same class of bug as the original defect.**
- **Con:** the function must re-read the lead server-side by id with the service role. Never trust a notification payload assembled in the browser.

### Option 3 — Write a durable notification row inside `submit_public_intake`, drain it out of band

Have the RPC insert a row into a small `crm_lead_alerts` table (or an admin `notifications` row per admin) in the *same transaction* as the lead, then have something separate deliver it: a Scheduled Function / cron every few minutes, plus an unread badge in the CRM and portal admin UI.

- **Pro:** the alert is committed atomically with the lead. It is impossible to have a lead with no pending alert — the exact guarantee the incident needed.
- **Pro:** delivery becomes retryable and observable. A stuck alert is a visible row, not a lost HTTP request.
- **Pro:** the in-app badge works **today**, with no Zoho, no `pg_net`, no external service. Email/WhatsApp become additional drains added later without redesign.
- **Pro:** reuses the existing `notifications` table shape and the CRM page this incident already fixed.
- **Con:** most code of the three: a table (or a fan-out to admin `notifications` rows), a drain job, and a UI badge.
- **Con:** in-app-only alerting has latency equal to how often someone looks. Needs at least one push channel to be a real fix.

## Recommendation

**Option 3 as the backbone, with Option 2's Edge Function as the delivery drain.**

The lesson of this incident is not "we picked the wrong channel", it is "a lead could exist with no record that anyone needed to look at it". Only Option 3 makes that state unrepresentable, because the alert row commits in the same transaction as the lead. Options 1 and 2 both reduce to a fire-and-forget HTTP call whose loss is invisible.

Concretely, in this order:

1. **Durable alert + visible badge (ship first, no external dependency).** Add `public.crm_lead_alerts` (`lead_id`, `created_at`, `delivered_at`, `attempts`, `last_error`, `channel`) and insert one row inside `submit_public_intake` alongside the existing timeline-event inserts. Surface the undelivered count on `/crm-admin` and in the portal admin surface. This alone would have capped the four-day gap at "next time an admin opens the CRM".
2. **Push channel that works today.** Deliver via a `notify-intake` Edge Function on a schedule (every 2–5 minutes) that reads undelivered alerts with the service role, sends, and stamps `delivered_at`. For a channel that works before Zoho is fixed, the two realistic choices are a WhatsApp Business API message to the number already in `src/lib/whatsapp.ts`, or a webhook to whatever chat app the team actually watches. **Owner decision required — this is the one open question.** Do not default to email.
3. **Email as an added drain, once Zoho works.** After `ZOHO_OAUTH_CLIENT_ID` / `_SECRET` / `_REFRESH_TOKEN` are set and a test send succeeds, add email as a second channel on the same alert rows. Email is a nice-to-have here, never the only channel.
4. **Optionally add the Option 1 trigger later** as a belt-and-braces catch for leads created outside the RPC. Only worth it if direct `crm_leads` inserts become a real path.

## Bilingual note

Steps 1 and 2 introduce user-facing strings (the CRM badge label, and the notification body if it is ever shown to a client). Per `AGENTS.md`, every one of them ships in both `src/locales/en/` and `src/locales/es/`. Staff-only alert text sent to the owner's phone is internal and does not need a Spanish variant, but anything rendered in the app does.

## What the owner needs to decide

1. **Which push channel for step 2** — WhatsApp Business API, a team chat webhook, or SMS. This is the blocker; everything else follows from it.
2. Whether the alert badge belongs on `/crm-admin` only, or also in the portal admin surface.
3. Whether to also add the `pg_net` trigger (step 4) or leave direct `crm_leads` inserts uncovered.
