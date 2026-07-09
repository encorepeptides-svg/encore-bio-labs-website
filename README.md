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

The internal CRM at `/admin/crm` uses Supabase when these environment variables are present and development mode is enabled. If they are missing, the CRM falls back to local demo mode with localStorage.

### Create the Supabase project

1. Create a new project in Supabase.
2. Open the SQL editor.
3. Paste and run the SQL from `supabase/schema.sql`.
4. Confirm these tables exist: `crm_leads`, `crm_intake_submissions`, `crm_timeline_events`, `crm_notes`, `crm_products_interests`, and `crm_campaign_sources`.

### Local environment variables

Create `.env.local`:

```bash
VITE_CRM_ADMIN_PASSWORD=your-local-admin-password
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PUBLIC_CRM_DEV_MODE=true
```

`VITE_PUBLIC_CRM_DEV_MODE=true` is only for local or staging MVP testing. Without it, the frontend will stay in local demo mode even if Supabase URL/key are present.

### Run locally

```bash
pnpm install
pnpm dev
```

Open `/intake`, submit a test intake, then open `/admin/crm` and unlock it with `VITE_CRM_ADMIN_PASSWORD`.

### Deploy to Vercel

1. Add the same Vite environment variables in Vercel Project Settings.
2. Deploy the site.
3. Test `/intake` and `/admin/crm` on the deployment URL.
4. Confirm new rows appear in Supabase table editor.

### Security warning

The SQL file includes temporary anon read/write policies for MVP development. Before production, remove those dev policies and replace them with authenticated admin-only Row Level Security policies. Do not expose CRM lead data publicly.
