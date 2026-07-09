# Encore Bio Labs Website Review Handoff

This package contains the source code, assets, configuration, and content planning files for the Encore Bio Labs website.

## What This Is

- React + TypeScript website
- Vite build setup
- Tailwind CSS v4 styling
- Product/catalog data in `src/data/products.ts`
- FAQ data in `src/data/faq.ts`
- Research library data in `src/data/research.ts`
- Product images in `src/assets/images/products`
- Logo files in `src/assets/images/logo`

## How To Run Locally

Install dependencies:

```bash
pnpm install
```

Start the local development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Run linting:

```bash
pnpm lint
```

## Important Project Rules

- Keep product data in `src/data/products.ts`.
- Keep product images in `src/assets/images/products`.
- Keep logo assets in `src/assets/images/logo`.
- Each product should appear once.
- Product variants should live inside each product object.
- Do not duplicate product cards for different strengths.
- Preserve the main homepage sections: Navbar, Hero, Category grid, Featured products, Quality/Why Encore, How it works, FAQ, Footer.

## Suggested Review Focus

- Homepage implementation quality and responsive layout
- Internal links for Catalog, Product, FAQ, Research, Category, Intake, Quality, and Legal pages
- Product/category data integrity
- CTA consistency
- Accessibility and keyboard navigation
- Mobile spacing and sticky CTA behavior
- Bundle size and image optimization
- Compliance language consistency for research-use-only positioning

## Excluded From Package

The review archive excludes `node_modules`, `dist`, `.DS_Store`, and other generated/local files.
