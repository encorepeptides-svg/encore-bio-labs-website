# Encore CloseOS ← Encore Bio Labs website: integration handoff

**Audience:** OpenAI Codex working in `/Users/hector/Documents/Codex/Encore_CloseOS_v1_0`.
**Author:** engineering work on `/Users/hector/Documents/encore-bio-labs-website`.
**Date:** 2026-08-04.
**Status:** informational. Nothing here has been built into CloseOS. One item (§5) is a business and legal decision that only the owner can make.

This document exists because the website repo just shipped a feature that overlaps directly with CloseOS: an AI that writes a bilingual follow-up message to an inbound lead. CloseOS is building the same capability at a larger scale. Read §5 before writing any code that sends a message.

---

## 1. Read this first — the one-paragraph summary

The website already has a working, deployed, compliance-gated AI follow-up drafter (`draft-followup`), a lead database with timestamped consent records (`crm_leads`, `crm_intake_submissions`), and a published set of promises to the customer about what an Encore message will never contain. CloseOS should consume all three rather than rebuild them. There is one **unresolved conflict**: CloseOS's stated objective includes recommending "approved products and protocols," and the website's intake page promises every lead in writing that Encore provides "No dosing guidance or protocols, ever." Both statements cannot be true on the same channel to the same person. §5 lays out the facts and options and deliberately does not choose.

---

## 2. Supabase project details

The website runs on a **single existing Supabase project**. CloseOS's `README_START_HERE.md` milestone 3 says to run `14_DATABASE/001_closeos_schema.sql` in a **new** Supabase project.

| Item | Value |
|---|---|
| Project ref | `rrrkjohvxbsahxxevzcg` |
| Project URL | `https://rrrkjohvxbsahxxevzcg.supabase.co` |
| Functions base | `https://rrrkjohvxbsahxxevzcg.supabase.co/functions/v1/` |
| Browser publishable key | `sb_publishable_JgR_u_-_ADV029BOMGjRng_nK2kclR9` (already public; safe in a browser bundle) |
| Service-role key | **not in this document.** It lives only in Supabase project secrets and Vercel env. Never put it in a browser bundle or a prompt. |
| Deployed Edge Functions | `draft-followup`, `communications`, `shipping-checkout` |
| Auth model | Supabase Auth. Admin authority = a row in `public.user_roles` with `role in ('admin','super_admin')`, OR the legacy `app_metadata.role = 'crm_admin'` JWT claim (transitional — see `supabase/migrations/20260803120000_crm_admin_uses_user_roles.sql`) |

**Decision CloseOS must make explicitly, not by default:** same project or separate project.

- **Same project** — CloseOS reads `crm_leads` directly, one identity for a person, consent records are automatically shared, no sync layer. Cost: CloseOS tables land in a schema that also serves a public website, and a mistake in CloseOS RLS is a mistake on live customer data.
- **Separate project** — blast-radius isolation, but you now need a lead-identity sync (phone/email matching), a consent mirror, and a story for what happens when the two disagree about whether someone opted out. An opt-out that exists in one project and not the other is a compliance failure, not an inconvenience.

If you choose separate projects, treat **consent as one-way replicated from the website into CloseOS, never merged**, and treat any missing consent record as "no consent."

---

## 3. What the website already provides — consume, do not reimplement

### 3.1 The `draft-followup` Edge Function contract

Source: `supabase/functions/draft-followup/index.ts` in the website repo.
Purpose: given a CRM lead id, return **one research-use-only follow-up message, in the lead's language, that a human then reads, edits, and sends by hand.** The function never sends anything. That review step is the compliance control.

**Endpoint**

```
POST https://rrrkjohvxbsahxxevzcg.supabase.co/functions/v1/draft-followup
```

**Auth:** `verify_jwt` is enabled. The Supabase gateway rejects a request with no `Authorization` header before the function runs. The function then independently verifies the caller is a CRM admin. A CloseOS server calling this must present a real admin session JWT — a service-role key is not an admin *user*, and `auth.getUser()` will not resolve one.

**Request**

```jsonc
// headers: authorization: Bearer <admin session JWT>, apikey: <publishable key>, content-type: application/json
{
  "leadId": "a3f1c2d4-1111-4222-8333-444455556666",  // required, must be a UUID
  "channel": "whatsapp"                                // "whatsapp" | "email"; anything else is treated as "whatsapp"
}
```

**Success — HTTP 200**

```jsonc
{
  "draft": "Hola Ana, ...",   // the message text; for channel=email the first line is "Subject: ..."
  "locale": "es",             // derived from crm_leads.preferred_language, NOT from the request
  "channel": "whatsapp",
  "model": "gpt-4o-mini"      // from OPENAI_MODEL env var
}
```

**Failure — every non-2xx returns the same JSON envelope**

```jsonc
{
  "error": "human-readable sentence, safe to show an operator",
  "code": "machine-readable code",
  "detail": "optional upstream detail, truncated to 300 chars",
  "blocked": true   // present only on code=guardrail_blocked
}
```

| HTTP | `code` | Meaning |
|---|---|---|
| 400 | `bad_request_body` | Body was not readable JSON |
| 401 | `no_token` | No bearer token |
| 401 | `invalid_session` | Token present but not a valid session |
| 403 | `not_admin` | Valid session, not a CRM admin |
| 404 | `lead_not_found` | Lead id valid but no such row |
| 405 | `method_not_allowed` | Not POST |
| 422 | `missing_lead_id` / `invalid_lead_id` | Lead id absent or not a UUID |
| 422 | `model_refused` | The model declined to write it |
| 422 | `guardrail_blocked` | **Draft crossed the RUO boundary and was discarded.** See §3.2 |
| 500 | `role_lookup_failed` | Role check itself errored |
| 500 | `lead_query_failed` | Lead query errored (distinct from not-found) |
| 500 | `unexpected_error` | Anything else |
| 502 | `openai_http_<status>`, `openai_bad_request`, `openai_malformed`, `empty_completion`, `truncated_completion`, `openai_unreachable` | Upstream model problems |
| 503 | `missing_openai_key` / `missing_service_credentials` | Function not configured |
| 504 | `openai_timeout` | Model did not answer within 30s |

**CORS:** `OPTIONS` returns `204` with `access-control-allow-origin` echoing the request origin and `access-control-allow-headers` echoing `access-control-request-headers`.

> **Incident note worth internalizing.** This function shipped with `OPTIONS` returning a `204` that carried a JSON body. `204` is a null-body status: the `Response` constructor throws a `TypeError`, the platform returns a bodiless `500` with **no** access-control headers, the browser blocks the real POST, and the client SDK reports only an opaque fetch failure. Every CloseOS Edge Function and webhook must (a) never put a body on 204/205/304, and (b) compute CORS headers *before* any code that can throw, so an error response is still readable by the browser. The same bug existed in the `communications` function and was silently breaking the public contact form.

**Client wrapper reference implementation:** `src/lib/crm/draftFollowUp.ts` + `src/lib/crm/draftFollowUp.test.ts`. Copy its error handling. In particular: `error.context` from `@supabase/functions-js` is a `Response` **only** for `FunctionsHttpError`. For `FunctionsFetchError` it is the raw fetch exception. Calling `.json()` on it unconditionally is what produced the production error `e.json is not a function`.

### 3.2 The compliance guardrail patterns — the highest-value thing to reuse

Two layers, both in `supabase/functions/draft-followup/index.ts`.

**Layer 1 — prompt-level absolute rules.** The system prompt states them as legal boundaries, not style preferences: never state or imply a dose, amount, strength, frequency, schedule, duration, cycle, protocol, or route of administration; never give use or preparation instructions or personal health direction; never promise, predict, or imply an outcome; never diagnose or comment on the person's health, body, weight, symptoms, sleep, or energy; never present products as for human or animal consumption.

**Layer 2 — a deterministic post-generation reject list.** The generated text is regex-scanned and **discarded entirely** if it matches. The prompt is guidance; this is the enforcement.

```ts
const PROHIBITED = [
  /\b\d+\s*(mg|mcg|µg|ug|iu|ui|ml|cc)\b.{0,40}\b(daily|weekly|day|week|dia|día|semana|dose|dosis|inject|inyect)/i,
  /\b(dose|dosage|dosing|dosis|dosificaci[oó]n|posolog[ií]a)\b/i,
  /\b(protocol|protocolo|regimen|r[eé]gimen|titrat|titulaci[oó]n|stack|ciclo|cycle)\b/i,
  /\b(inject|injection|inyect|inyecci[oó]n|subcutaneous|subcut[aá]nea|intramuscular)\b/i,
  /\b(veces al d[ií]a|times (a|per) day|twice daily|once weekly|una vez por semana)\b/i,
  /\b(will (help|cure|treat|reduce|lose)|te ayudar[aá] a|va a (curar|bajar|eliminar)|guaranteed|garantizado)\b/i,
]
```

Note what these patterns already handle that a from-scratch English-only implementation would miss: Spanish accented and unaccented variants, Spanish frequency phrasing, and Spanish outcome promises. CloseOS is bilingual by design; a guardrail that only fires in English is not a guardrail.

**Third layer that exists only as a process, not as code:** a human reads every draft before it leaves. CloseOS's `06_SALES_STATE_MACHINE.md` and `09_SECURITY_PRIVACY_COMPLIANCE.md` describe automation modes where that human is removed for low-risk traffic. That is the substantive difference between the two systems, and it is what makes §5 urgent rather than academic.

**A deliberate data-minimization decision to preserve.** `leadFacts()` builds the model's context from the lead record and *deliberately omits* `medical_conditions` and `medications`, with this reasoning in the source: health data must not steer message wording, because that is exactly what turns a category match into something that reads like personal health advice. CloseOS's context builder (`02_SYSTEM_ARCHITECTURE.md` §4) already says "sensitive data should not be included merely because it exists." Make that concrete by naming these two columns as never-in-prompt.

### 3.3 `crm_leads` and `crm_intake_submissions`

Defined in `supabase/migrations/202607100001_crm_schema_baseline.sql`. RLS is enabled on both; admin access is gated by `public.is_crm_admin()`.

```sql
public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text, last_name text, email text, phone text,
  city text, state text, country text,
  preferred_language text not null default 'English',   -- 'English' | 'Spanish'
  source text, campaign_source text,
  interested_products text[] not null default '{}',     -- products THEY named
  primary_goal text, budget_range text, notes text,
  status text not null default 'new',
  lead_score integer, lead_score_explanation jsonb,
  last_contacted_at timestamptz,
  consent_to_contact boolean not null default false,
  research_use_acknowledgment boolean not null default false
)

public.crm_intake_submissions (
  id uuid primary key, lead_id uuid references crm_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  age integer, sex text, weight text, height text,
  main_goal text, current_routine text,
  sleep_quality text, appetite text, energy text,
  previous_products_used text,
  medical_conditions text,   -- NEVER put in a prompt
  medications text,          -- NEVER put in a prompt
  budget text, delivery_city text, preferred_contact_method text,
  consent_to_contact boolean not null default false,
  research_use_acknowledgment boolean not null default false
)
```

**Mapping to CloseOS's `public.leads` / `public.lead_memories`:** `crm_leads.preferred_language` maps to CloseOS `language` (`English`→`en-US`, `Spanish`→`es-MX`). `crm_leads.status` is a *sales* status (`new`, `contacted`, `qualified`, `consultation_requested`, `converted`, `lost`) and is **not** the same vocabulary as the CloseOS state machine (`NEW_LEAD`…`DO_NOT_CONTACT`). Do not silently alias them; write an explicit mapping table and decide which system owns the value.

**Consent.** Both tables carry `consent_to_contact` and `research_use_acknowledgment` with a `created_at`. CloseOS's `09_SECURITY_PRIVACY_COMPLIANCE.md` §2 correctly specifies a richer per-channel consent model (`consent_events`). The website's booleans are **coarser**: they do not distinguish transactional from promotional, and they do not distinguish WhatsApp from SMS from email. Do not upgrade a coarse website consent into a fine-grained CloseOS promotional consent by assumption. Treat the website record as evidence of *transactional contact* consent only, and collect promotional consent separately.

---

## 4. Where the two systems overlap

| Capability | Website today | CloseOS plan | Verdict |
|---|---|---|---|
| AI drafts a bilingual follow-up | `draft-followup`, deployed, human-in-loop | `07_FOLLOWUP_ENGINE.md` + `13_PROMPTS/07_FOLLOWUP_PROMPT.md` | **Duplicate.** CloseOS's is strictly more capable (durable workflow, cancellation, similarity control). Keep CloseOS's engine; reuse the website's *guardrail* and *prompt boundaries*. |
| Compliance/safety gate on generated text | `PROHIBITED` regex + prompt rules | `13_PROMPTS/06_VALIDATOR_PROMPT.md` (an LLM validator) | **Complementary, currently duplicated.** An LLM validator is not deterministic. Run both: regex first (cheap, cannot be talked out of it), LLM validator second. See §6. |
| Lead identity + intake data | `crm_leads`, `crm_intake_submissions` | `public.leads`, `channel_identities`, `lead_memories` | **Duplicate storage risk.** Pick one owner for a person's identity. |
| Consent + opt-out | Two booleans + timestamp | `consent_events` + DO_NOT_CONTACT state | **Website is a subset.** CloseOS's model is better; the website's records must flow *into* it, and an opt-out anywhere must apply everywhere. |
| Outbound sending | None — human copies the draft into WhatsApp/email by hand | `outbox_events`, channel adapters, auto-send allowlist | **No overlap. This is the new capability, and the entire risk delta.** |
| Product/price/inventory facts | `src/data/products.ts`, `inventory` tables, `shipping-checkout` | `products`, `inventory`, `offers`, tool executor | **Duplicate.** The website is the live source of truth for catalog and pricing today. A second catalog that drifts will produce quoted prices that do not match the website. |
| Contact-form intake | `communications` Edge Function → Zoho | Website chat channel adapter (milestone 9) | Overlap later, not now. |
| Transactional email | `communications` (Zoho OAuth) | not yet specified | Reuse `communications`; do not add a second sender identity. |

**The single most expensive duplication to avoid** is the catalog/pricing tool. If CloseOS quotes from its own `products` table while the website sells from `src/data/products.ts`, the two will disagree within a release cycle, and the customer sees it.

---

## 5. CRITICAL — unresolved compliance conflict. Owner decision required.

**Do not resolve this by writing code. Escalate it.**

### 5.1 The two statements

**CloseOS, `README_START_HERE.md`, line 7 (system objective):**

> "...recommend only approved products and protocols matched to the client's goal..."

Reinforced in `13_PROMPTS/00_MASTER_SYSTEM_PROMPT.md`:

> "Product and protocol recommendations must come from active approved catalog and protocol records matched to the client's stated goal."
> "Repeat approved protocol instructions exactly enough to preserve meaning..."

And the schema provisions for it: `14_DATABASE/001_closeos_schema.sql` defines `public.approved_protocols` and `public.protocol_products`.

**The live website, intake page, shown to every lead before they submit** (`src/locales/en/intake.ts`, `src/locales/es/intake.ts`):

> "No dosing guidance or protocols, ever"
> "Nunca incluye guías de dosificación ni protocolos"

> "Outputs are educational research summaries only. The intake does not provide use instructions, personal health direction, dosing guidance, or promised outcomes."
> "Los resultados son únicamente resúmenes educativos de investigación. Este formulario no proporciona instrucciones de uso, orientación de salud personal, guías de dosificación ni resultados garantizados."

And the consent the lead actively checks:

> "I understand this intake does not provide medical advice, diagnosis, treatment, prescriptions, dosing guidance, or use instructions."

### 5.2 Why this is not a wording nitpick

1. **Every lead has consented to the narrow version, with a timestamp.** `crm_intake_submissions.research_use_acknowledgment` and `consent_to_contact` are stored with `created_at`. The checkout flow goes further: `supabase/migrations/20260727035545_add_checkout_acknowledgment_audit.sql` adds `checkout_acknowledged_at`, `checkout_acknowledgment_version`, `checkout_acknowledgment_locale`, and `checkout_acknowledgment_language` (jsonb) to `storefront_orders`, so the **exact acknowledgment text the buyer saw**, in their language, is stored per order — including "Encore Bio Labs does not provide medical advice, treatment recommendations, dosing instructions, or administration guidance" / "Encore Bio Labs no proporciona consejos médicos, recomendaciones de tratamiento, dosis ni instrucciones de administración" (`supabase/functions/shipping-checkout/index.ts`). There is a written, dated, per-person record of exactly what was promised.

2. **CloseOS's channel is the same person, on the phone number they gave the website.** A lead who reads "no dosing guidance or protocols, ever" on the intake page and then receives a protocol over WhatsApp has been told two different things by one company, and the record shows the company knew.

3. **Automation removes the reviewer.** The website's drafter is safe partly because a human reads every message. `02_SYSTEM_ARCHITECTURE.md` §8 defines `LOW_RISK_AUTO` and `SALES_AUTO`; `README_START_HERE.md` milestone 7 enables automation for a low-risk allowlist. If "recommend an approved protocol" ever lands inside an auto-send path, the site's written promise is being broken by a machine, at volume, with no one reading it.

4. **The words are already on the deterministic block list.** `PROHIBITED` rejects `protocol|protocolo|regimen|régimen|titrat|titulación|stack|ciclo|cycle` and `dose|dosage|dosing|dosis|dosificación|posología`. Today the website's own AI **cannot** emit the word "protocol." A CloseOS message that recommends a protocol would be blocked outright by the guardrail the website already ships. The two systems' safety layers currently contradict each other.

5. **The conflict is partly internal to CloseOS.** Its master prompt says *both* "Repeat approved protocol instructions exactly enough to preserve meaning" *and* "never invent or personalize a dose, cycle, stack" and "Do not diagnose or decide clinical suitability." Whether "matched to the client's stated goal" is personalization is exactly the ambiguity. `09_SECURITY_PRIVACY_COMPLIANCE.md` §1 lists "Personalize dosing or treatment" and "Determine medical candidacy" as prohibited. A reasonable reader can defend either reading of the current documents, which is itself the problem.

### 5.3 The risk, stated plainly

An automated channel sending what the site promises it never sends creates exposure on three fronts at once: **regulatory** (a research-use-only supplier providing use instructions is a different regulatory posture than one that does not), **advertising-policy** (the repo's own `AGENTS.md` forbids "dosing/reconstitution/injection instructions" and says policy-conscious language wins when it conflicts with conversion pressure), and **consumer-protection** (a documented, timestamped promise contradicted by the company's own messages). The volume and the audit log that makes CloseOS trustworthy are the same volume and audit log that would make a violation easy to demonstrate.

### 5.4 Options — for the owner to choose, not the engineer

- **A. Narrow CloseOS to match the site.** Drop "protocols" from the objective, drop or repurpose `approved_protocols`/`protocol_products`, and let CloseOS recommend *categories and products* only — exactly the boundary `draft-followup` enforces. Lowest risk, no site changes, no re-consent. Cost: removes a capability the roadmap and schema were built around.
- **B. Widen the site to match CloseOS.** Change the intake and checkout copy, re-version the acknowledgments, and re-consent leads before any protocol content reaches them. This is a **legal** change, not a copy change: it needs counsel, new disclosure text in **both** English and Spanish, and a defensible position on what "protocol" means for a research-use-only supplier. Historical leads consented to the old text and cannot be retroactively moved.
- **C. Split the channel by consent.** Keep the current promise as the default for everyone, and gate protocol content behind a separate, explicit, later opt-in with its own disclosure and its own consent record. Most complex to build (per-lead capability flags on every generation path, plus a hard interlock so an ungated lead can never receive gated content), but it is the only option that keeps existing promises intact while preserving the capability.
- **D. Redefine "protocol" as non-personalized reference content.** If "approved protocol" means published, product-level, non-individualized reference material and never "here is what *you* should do," the conflict may be narrower than it looks. This still requires counsel to confirm that the site's flat "no protocols, ever" survives it, and requires the word choice in customer-facing text to change regardless.

**Recommended sequencing regardless of choice:** do not enable any auto-send path that can emit protocol or dosing content until this is decided in writing. Shadow mode (README milestone 6) is unaffected — a human still reads everything.

---

## 6. Recommendation: share the guardrail layer, do not maintain it twice

**The problem with two copies.** The regex list, the absolute-rules prompt text, and the "never put `medical_conditions` in a prompt" rule currently live in one file in the website repo. If CloseOS copies them, there are two copies, and the day someone adds a Spanish phrasing to one is the day the two systems start disagreeing about what is safe. A compliance rule that exists in two places is a compliance rule that is enforced in one and a half.

### 6.1 Concrete proposal

**Step 1 — extract to a versioned, dependency-free module.** Create `encore-compliance` as a small package (either an npm package published privately, or a git submodule/subtree consumed by both repos). It must have **zero runtime dependencies** so it can run unchanged in a Deno Edge Function, a Node/Next.js server, and a vitest run.

```
encore-compliance/
  src/
    version.ts        // POLICY_VERSION = 'ruo-2026-08-04' — stamped into every audit row
    prohibited.ts     // the PROHIBITED patterns, EN + ES, one exported array
    boundaries.ts     // the ABSOLUTE RULES prompt text, EN + ES
    redact.ts         // NEVER_IN_PROMPT = ['medical_conditions','medications', ...]
    check.ts          // screen(text) -> { ok, matched, patternId, policyVersion }
  test/
    corpus.en.json    // must-block / must-pass examples
    corpus.es.json    // same, Spanish — parity is enforced by test, not by hope
```

**Step 2 — one function, called from both sides.**

```ts
export type ScreenResult =
  | { ok: true;  policyVersion: string }
  | { ok: false; policyVersion: string; patternId: string; matched: string }

export function screen(text: string): ScreenResult
```

Website: `draft-followup` replaces its inline `PROHIBITED.find(...)` with `screen(draft)`.
CloseOS: the writer's output goes through `screen()` **before** the LLM validator in `13_PROMPTS/06_VALIDATOR_PROMPT.md`. Deterministic first — it is cheaper, it cannot be argued out of its position by clever input, and it is not subject to prompt injection. The LLM validator then catches what regex cannot (tone, unsupported claims, invented facts, repetition).

**Step 3 — a shared must-block corpus, bilingual, enforced in CI.** Every phrase that should be blocked goes in the corpus in both languages, and both repos run it. `17_EVALS/` is the natural home for CloseOS's side. This is where the project convention that *everything ships in English and Spanish* stops being a copy rule and becomes a safety rule: an English-only block list on a Spanish-speaking channel is a hole, not a gap.

**Step 4 — stamp the policy version into every audit row.** CloseOS `09_SECURITY_PRIVACY_COMPLIANCE.md` §9 already requires `policy version` in the audit log. Have `screen()` return it so the value is never typed by hand. When the guardrails change, every message ever sent can be attributed to the exact rule set in force at the time.

**Step 5 — make the boundary text itself shared.** The "ABSOLUTE RULES" block in the website's system prompt and the "HEALTH AND SAFETY" block in `13_PROMPTS/00_MASTER_SYSTEM_PROMPT.md` are two statements of the same policy that have already drifted. Export one canonical bilingual block from `boundaries.ts` and inject it into both system prompts. Whatever §5 is decided, it will be a change to this one block — which is the argument for building it before the decision, not after.

### 6.2 What should *not* be shared

Sales strategy, tone, style examples, state machine, follow-up cadence, and the writer prompts. Those are business logic and should stay per-system. Sharing them would couple a website admin tool to a full conversational sales platform for no safety benefit.

---

## 7. Concrete next steps for CloseOS

1. **Do not** rebuild follow-up drafting from zero — read `supabase/functions/draft-followup/index.ts` and `src/lib/crm/draftFollowUp.ts` first, and lift the guardrails and the error-envelope shape.
2. Decide same-project vs separate-project Supabase (§2) and write the decision down, including the consent-replication rule.
3. Build `encore-compliance` (§6) before the first CloseOS message generator, not after.
4. Never place `crm_intake_submissions.medical_conditions` or `.medications` in any prompt or memory record.
5. Adopt the CORS/null-body-status rules from §3.1 in every CloseOS Edge Function and webhook.
6. **Escalate §5 to the owner and get the answer in writing before any auto-send path can emit protocol or dosing content.**
7. Do not stand up a second catalog/pricing source of truth without a sync plan against the website's.

---

## 8. Files referenced in the website repo

| Path | What it is |
|---|---|
| `supabase/functions/draft-followup/index.ts` | The drafter: contract, prompt boundaries, `PROHIBITED` list, auth check |
| `src/lib/crm/draftFollowUp.ts` | Browser client wrapper; reference error handling for `functions.invoke` |
| `src/lib/crm/draftFollowUp.test.ts` | Error-path tests, including the non-Response `context` case |
| `src/components/crm/LeadDetailDrawer.tsx` | The staff UI; shows how a draft is reviewed before sending |
| `supabase/migrations/202607100001_crm_schema_baseline.sql` | `crm_leads`, `crm_intake_submissions` |
| `supabase/migrations/20260803120000_crm_admin_uses_user_roles.sql` | Current admin-authority definition |
| `supabase/migrations/20260727035545_add_checkout_acknowledgment_audit.sql` | Timestamped checkout acknowledgment records |
| `src/locales/en/intake.ts`, `src/locales/es/intake.ts` | The exact promises made to leads (§5) |
| `supabase/functions/communications/index.ts` | Zoho transactional email sender |
| `AGENTS.md` | Project rules, incl. bilingual parity and the advertising-policy boundary |
