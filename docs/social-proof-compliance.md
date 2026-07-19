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
| Backend | `supabase/migrations/202607150001_social_proof.sql`, `202607150002_testimonial_publication_gates.sql`, `202607180001_import_research_peptide_reviews.sql` | Tables, RLS, publication gates, storage buckets, and draft-only review import |

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

1. Apply the migrations in filename order to the target Supabase project (SQL
   editor or CLI):
   1. `202607150001_social_proof.sql`
   2. `202607150002_testimonial_publication_gates.sql`
   3. `202607180001_import_research_peptide_reviews.sql`
2. Confirm the site runtime has `VITE_SUPABASE_URL` and the public
   `VITE_SUPABASE_ANON_KEY`. Never expose the service-role key in Vite or the
   browser.
3. Grant the reviewing user an administrator role **server-side**. In the
   Supabase SQL editor, replace the UUID below with the reviewer’s Auth user ID:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('00000000-0000-0000-0000-000000000000'::uuid, 'admin'::public.portal_role)
   on conflict (user_id, role) do nothing;
   ```

   `admin` and `super_admin` can access `/admin/content`; `client` and `support`
   cannot. An existing `client` role does not need to be removed. Sign out and
   back in after assigning the role so the portal reloads authorization.
4. Confirm the two storage buckets exist: `compliance-private` (private) and
   `social-proof-public` (public). The migration creates them.

## Administrator review and publication runbook

The imported file is named `research_peptide_mock_reviews.json`. Its 50 rows are
inserted with explicit `draft` status and unknown incentive status. The import
does not provide publication consent, identity/provenance verification,
relationship or incentive evidence, claim approval, a reviewing administrator,
or publication stamps. Do not approve an entry merely because it was imported.
If an entry is synthetic or cannot be tied to a genuine reviewer and original
submission, leave it in draft or reject/archive it.

For each genuine review:

1. Sign in at `/client-login`, then open **Content** in the administrator
   navigation (the route is `/admin/content`). Select **Testimonials**.
2. Compare the displayed title, text, name, rating, date, category, product, and
   verified-purchase flag with the original source. Do not rewrite or infer
   missing facts.
3. Record the submission date, source record reference, and private verification
   notes that identify what was checked. A filename by itself is not proof that
   the reviewer or submission is genuine.
4. Store the permission evidence privately, enter its consent record reference,
   and check **Consent verified** only after confirming permission to publish the
   exact review and display name.
5. Enter the reviewer’s relationship to Encore as a public disclosure. Verify
   whether any incentive was provided. Choose **No** only with evidence; if
   **Yes**, enter the required public incentive disclosure. Leave **Unknown**
   selected until this is established.
6. Check **Claim review passed** only after a qualified reviewer confirms the
   quote is eligible service feedback and contains no prohibited or
   unsubstantiated medical, human-outcome, purity, testing, or product-performance
   claim. Otherwise leave the review unpublished.
7. Use the **Publication readiness** checklist to resolve every administrator
   prerequisite. **Approve & publish** remains disabled until they are complete.
8. Click **Approve & publish**. Supabase changes the status to `approved`, records
   the authenticated reviewing administrator and review time, and stores the
   publication timestamp. The public site still returns the row only if every
   predicate in `published_testimonials` passes.

To verify publication without exposing private compliance fields, query only the
public view:

```sql
select id, display_name, review_title, review_date
from public.published_testimonials
order by sort_order;
```

Use **Unpublish** to clear the publication stamp or **Archive** to remove the
entry from publication. Neither action deletes the private review record.

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
