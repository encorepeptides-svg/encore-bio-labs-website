# Encore Bio Labs Website

Premium biotech landing page for Encore Bio Labs, built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Lucide icons.

## Production Commands

```bash
pnpm install
pnpm lint
pnpm build
pnpm preview
```

## Production Checklist

- Accessibility: keyboard focus, skip link, labeled form controls, required fields, `aria-live` form feedback, decorative icon hiding, reduced-motion support.
- Responsive behavior: verified mobile and desktop layouts, sticky CTA spacing, section anchor offset, no horizontal overflow.
- SEO: production title, meta description, robots directive, Open Graph metadata, Twitter summary metadata, favicon, theme color.
- Image loading: lightweight SVG logo, explicit image dimensions, lazy loading below the fold, async decoding, hero video metadata preload and poster.
- Performance: only rendered featured product images are imported into the production build, unused starter assets removed, unused CSS removed.
- Animations: shared reduced-motion-aware `Reveal` component, transform/opacity-based section reveals, restrained hover motion.
- Browser compatibility: SVG logo, standard MP4 video attributes, Safari mask prefix for molecule background, no dependency on experimental browser APIs.
- Naming consistency: CTAs use review-oriented language, section IDs match navigation targets, product data remains in `src/data/products.ts`.
- Reusable components: `CTA`, `Reveal`, and `SectionHeader` keep repeated patterns consistent.
- Maintainability: section files remain isolated, product variants stay nested in product objects, build and lint are required before deployment.

## Notes

- Product data belongs in `src/data/products.ts`.
- Product images belong in `src/assets/images/products`.
- Logo assets belong in `src/assets/images/logo`.
- Hero and kit media live in `src/assets/images/hero` and `src/assets/videos`.
- The production domain is not set yet, so canonical and absolute social image URLs should be added when the deployment URL is final.

## CRM Supabase Setup

The internal CRM at `/admin/crm` uses Supabase Auth and database row-level security. Public inquiry forms can insert new records but cannot read, update, or delete CRM data.

### Create the Supabase project

1. Create a new project in Supabase.
2. Open the SQL editor.
3. For a new project, paste and run `supabase/schema.sql`. For a project that previously used the development policies, run `supabase/migrations/202607110001_production_crm_security.sql`.
4. Confirm these tables exist: `crm_leads`, `crm_intake_submissions`, `crm_timeline_events`, `crm_notes`, `crm_products_interests`, and `crm_campaign_sources`.

### Local environment variables

Create `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never add a Supabase service-role key or admin password to a `VITE_` variable; Vite values are public browser configuration.

### Create an authorized administrator

1. In Supabase Authentication, disable public user signups and create the administrator account.
2. In the SQL editor, assign the server-controlled CRM role to that user:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"crm_admin"}'::jsonb
where email = 'admin@example.com';
```

Replace the example email. Sign out and back in after changing app metadata so the JWT contains the new role.

### Run locally

```bash
pnpm install
pnpm dev
```

Open `/intake`, submit a test intake, then sign in at `/admin/crm` with the authorized Supabase account.

### Deploy to Vercel

1. Add only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings.
2. Deploy the site.
3. Test `/intake` and `/admin/crm` on the deployment URL.
4. Confirm new rows appear in Supabase table editor.

### Security model

Anonymous visitors have insert-only access to new inquiry records. CRM reads and mutations require an authenticated JWT whose server-assigned `app_metadata.role` is `crm_admin`. Verify that anonymous selects fail before production deployment.
