# Consent documents and production body hashes

Each file here is one consent record captured during portal onboarding. Its
frontmatter (`consent_key`, `version`) matches a row in
`public.consent_versions`, whose `body_hash` currently holds the placeholder
`configure-production-hash`.

## Workflow to replace the placeholder hashes

1. **Owner review.** Read each document (English and Spanish must match in
   meaning). Edit freely — these are drafts assembled from existing site
   language and are **not** legal advice; have counsel review if required.
2. **Approve.** Change `status: draft` to `status: approved` in each file's
   frontmatter. The generator refuses to run while any file is a draft.
3. **Generate.** Run `node scripts/generate-consent-hashes.mjs` and paste the
   emitted SQL into the production Supabase SQL editor. The final `select`
   must return zero rows (no placeholders left).
4. **Never edit an approved file silently.** A changed document is a new
   consent version: copy it, bump `version`, insert a new
   `consent_versions` row, and re-run the generator for that version.

Notes:

- The hash covers the whole file (frontmatter included), so key, version,
  title, and both language bodies are all bound by it.
- The `terms` and `privacy` documents record acceptance *by reference* to the
  published legal pages at a named version. If counsel prefers hashing the
  full page text instead, inline that text here before approving.
