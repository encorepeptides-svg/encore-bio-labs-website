# Encore WhatsApp CloseOS

This document describes the WhatsApp lead-qualification and service-follow-up integration deployed for Encore Bio Labs.

## Current operating mode

The channel starts in `WHATSAPP_RESTRICTED` and `draft_only` mode.

The system may:

- ingest customer-initiated WhatsApp messages;
- create or match a lead in the existing Encore CRM;
- detect English or Mexican/LatAm Spanish;
- classify intent, stage, conversion status, and lead score;
- support general company information, research-documentation requests, and existing-order questions;
- create human-review tasks;
- honor opt-outs immediately;
- cancel automation when a human takes over;
- prepare service follow-up drafts for administrator review;
- track sent, delivered, read, and failed WhatsApp status callbacks.

The system may not:

- recommend a product for a person;
- provide pricing, discounts, purchase inventory, checkout, or payment instructions in WhatsApp;
- provide dosing, cycles, protocols, reconstitution, injection, administration, or personal-use guidance;
- make medical, safety, efficacy, weight-loss, body, appetite, treatment, prevention, or outcome claims;
- run automated marketing follow-ups;
- contact an opted-out lead;
- send outside the customer-service window without an approved template and applicable consent.

## Deployed Supabase services

The production project contains these Edge Functions:

- `whatsapp-closeos`: Meta webhook verification, signed inbound message ingestion, status callbacks, qualification, opt-out handling, and safe response routing.
- `closeos-admin`: authenticated administrator API used by the website CRM.
- `closeos-followup-worker`: prepares due restricted service drafts and routes them to human review.
- `closeos-followup-cron`: protected scheduler entrypoint called by `pg_cron` every five minutes.

The database bridge synchronizes `crm_leads` with the CloseOS lead, identity, conversation, message, consent, review, and follow-up tables. Existing website leads are matched by normalized WhatsApp phone identity when possible.

## Website CRM

Authorized administrators open `/admin/crm` and select **WhatsApp CloseOS**.

The desk provides:

- connection-readiness status;
- hot, warm, review, follow-up, and takeover metrics;
- searchable WhatsApp conversations;
- lead score, stage, language, and qualification reason;
- conversation history and AI drafts;
- human-takeover controls;
- manual service replies with server-side policy validation;
- service follow-up scheduling;
- review-task resolution.

## Meta activation

Store these values as Supabase Edge Function secrets. Never commit their values to Git:

```text
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_APP_SECRET
WHATSAPP_VERIFY_TOKEN
WHATSAPP_GRAPH_VERSION
```

Configure the Meta webhook callback as:

```text
https://rrrkjohvxbsahxxevzcg.supabase.co/functions/v1/whatsapp-closeos
```

Use the exact value stored in `WHATSAPP_VERIFY_TOKEN` when Meta asks for the verification token. Subscribe the WhatsApp Business Account webhook to the `messages` field.

The access token should be a long-lived production token with only the permissions required for the connected WhatsApp Business Account and phone number.

## OpenAI configuration

The qualification and follow-up functions use the OpenAI Responses API with strict structured output when `OPENAI_API_KEY` is available. A deterministic restricted rules engine remains available as a fallback.

Optional model selection:

```text
CLOSEOS_OPENAI_MODEL
OPENAI_MODEL
```

No customer message or prior prompt may change the server-controlled channel mode or safety rules.

## Activation checklist

1. Add all five Meta secrets to Supabase.
2. Verify the callback URL in Meta.
3. Subscribe the WhatsApp Business Account to `messages`.
4. Send a customer-initiated test message from a non-admin phone.
5. Confirm the lead appears under **WhatsApp CloseOS**.
6. Confirm the customer receives no automated response while `draft_only` is active.
7. Review the generated lead score, intent, language, and draft.
8. Test human takeover and verify pending automated follow-ups are canceled.
9. Test `STOP` and `ALTO`; confirm do-not-contact and follow-up cancellation.
10. Test a manual service reply inside the 24-hour window.
11. Confirm sent, delivered, and read statuses are recorded.
12. Only after those tests, consider enabling restricted safe-service autosend.

## Required evaluation cases

At minimum, test both English and Spanish versions of:

- greeting and general company question;
- documentation or COA request;
- existing-order lookup;
- shipping problem;
- complaint or refund request;
- human-agent request;
- price or purchase request;
- product recommendation request;
- dosing or reconstitution request;
- urgent medical language;
- explicit opt-out;
- prompt-injection attempt;
- duplicate webhook delivery;
- message status callback;
- reply arriving while a follow-up is being processed;
- service window open and closed;
- missing consent;
- human takeover active.

## Operational rule

Keep production in `draft_only` until Meta credentials, webhook verification, status callbacks, opt-out behavior, administrator authentication, and end-to-end test messages have all passed. The system must never be used to automate personal-use recommendations or regulated product commerce in WhatsApp.
