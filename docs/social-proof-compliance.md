# Social proof: testimonials & before/after transformation media

Compliance-gated, data-driven sections. **They ship empty and stay hidden** until
approved, publishable records exist. No sample content, fake names, placeholder
quotes, stock photos, generated before/after images, empty cards, or
"coming soon" states are ever rendered.

## Architecture

| Layer | File(s) | Role |
| --- | --- | --- |
| Typed models | `src/data/socialProof/types.ts` | Full admin records + safe `Published*` projections |
| Publication gates | `src/data/socialProof/guards.ts` | Single source of truth for "may this render?" (defense-in-depth) |
| Local fallback | `src/data/socialProof/localRecords.ts` | Empty arrays — used only when Supabase is unconfigured |
| Provider (seam) | `src/lib/socialProof/provider.ts` | Reads Supabase public views; swap here for any future CMS |
| Sections | `src/components/social-proof/*` | Presentation only; render `null` when empty |
| Admin | `src/components/portal/SocialProofAdmin.tsx` | Content-admin CRUD, wired at `/admin/content` |
| Backend | `supabase/migrations/202607150001_social_proof.sql` | Tables, RLS, public views, storage buckets |

Content records are kept strictly separate from presentation. Adding future
content never requires touching the page components.

## Why approval is server-authoritative

The base tables (`public.testimonials`, `public.transformation_media`) hold the
sensitive consent/verification fields and are readable **only** by content
admins via RLS (`is_content_admin()`). The public site never queries them. It
reads two `security definer` views — `published_testimonials` and
`published_transformations` — that expose **only publishable rows and only
non-sensitive columns**. Consent references, verification notes, source
references, and original file paths are never selected into a public view, so
they cannot reach the browser. Flipping a client-side flag cannot publish a row;
the row must satisfy the view's `WHERE` clause on the server.

The TypeScript guards in `guards.ts` mirror those same rules as a second layer.
Testimonials also require a dated source record, consent reference, documented
relationship, reviewer stamp, verification notes, and an explicit
`claim_review_passed` attestation. This keeps medical, body-transformation,
dosing, side-effect, and other human-outcome claims out of the public service
feedback component.

### Transformation page placement

A transformation is **never auto-placed**. `approved_placements` is an explicit
per-page approval list; the `home` / `retatrutide` / etc. section only shows a
record whose array contains that placement (checked in the view/query). The
Retatrutide research page therefore requires a separate, explicit approval per
record.

## Deploying the backend

1. Apply `supabase/migrations/202607150001_social_proof.sql`, followed by
   `202607150002_testimonial_publication_gates.sql`, to the target Supabase
   project (SQL editor or CLI).
2. Grant a reviewer the content-admin role **server-side** with the service-role
   key (never in Vite env). Either:
   - set `app_metadata.role = 'content_admin'` on the auth user, or
   - insert `('admin' | 'super_admin')` into `public.user_roles`.
3. Confirm the two storage buckets exist: `compliance-private` (private) and
   `social-proof-public` (public). The migration creates them.

## Image pipeline (originals private, derivatives public)

The admin uploads **originals** to the private `compliance-private` bucket
(consent documents belong there too — it is not publicly readable). Public
columns (`approved_photo_url`, `before_image_url`, `after_image_url`) must hold
only **cleared, optimized derivatives** in `social-proof-public`.

Derivative generation runs server-side (a Supabase Edge Function is the intended
home) and must obey these evidentiary rules:

- Preserve the original file untouched in the private bucket.
- Generate responsive **WebP/AVIF** derivatives (normalize dimensions and aspect
  ratio) **without reshaping a person's body**.
- **No** generative fill, body retouching, slimming, enlargement, skin
  reconstruction, or background changes that alter the evidentiary meaning.
- Any permissible crop / exposure / color correction is recorded on the content
  record (e.g. in `edits_disclosure`).

Until the Edge Function is deployed, an admin may attach an externally-prepared,
compliant derivative URL to the public column; the private original is still
uploaded and retained for the audit trail.

## Rendering contract (initial empty state)

Both sections are mounted on the home page and render `null` while their
collections are empty, so the page flows straight from "How it works" to the FAQ
with no reserved blank space. The same holds for any future placement.
