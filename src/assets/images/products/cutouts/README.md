# Production product cutouts (transparent, full-resolution)

Promoted from the rembg isolation pipeline after the QA contact sheet was
reviewed and approved. Each file is a **1254×1254 RGBA** transparent cutout of
its product render — no baked background, no baked shadow, no downscaling.

- **Source of truth** for the `ProductHero` component's product image.
- Generated from the baked masters in `../` via `scripts/remove-product-backgrounds.py`,
  QA'd via `scripts/qa-cutouts.py`. Approved contact sheet archived at
  `docs/cutout-qa/qa-contact-sheet-approved.png`.
- The QA staging/preview copies are archived (not deleted) in the gitignored
  `../_cutout-qa-archive/` folder.

## Web delivery

These PNGs are the full-res masters. For LCP-critical hero delivery, generate
optimized WebP/AVIF derivatives before wiring a product into `LAB_HERO`
(`scripts/optimize-images.py` extended to this folder) rather than shipping the
~0.85 MB PNG directly.

## Not in this batch

`../wolverine.png` is already transparent but carries a **baked shadow** and was
not part of this isolation batch — it needs its own pass before use as a hero
cutout.
