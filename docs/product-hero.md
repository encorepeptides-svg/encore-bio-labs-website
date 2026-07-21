# Product hero environment system

Reusable `<ProductHero />` that renders a product cutout inside a single, fully
CSS/SVG-generated lit scene — no "image in a box", no baked backgrounds.

## Phase 0 audit result (why this exists)

Of 25 base product masters in `src/assets/images/products/`, **24 shipped with a
baked-in near-white studio background** (opaque RGB, no alpha; edge pixels
238–255). Only `wolverine.png` was a transparent cutout (and it carries a baked
shadow, so it is not a good hero source). Dropping a light-background PNG on the
dark hero is what produced the visible rectangular halo / hard edge. That is an
image-isolation problem, not a CSS one — the seamless effect is impossible until
the products are true transparent cutouts.

## Isolation pipeline (scripted, human-QA gated)

1. `pip install "rembg[cpu]" pillow`
2. `python3 scripts/remove-product-backgrounds.py` → transparent PNGs in
   `src/assets/images/products/_cutout-review/` (gitignored; regenerable). The
   24 baked masters process cleanly at 100% edge transparency with alpha
   matting; glass, labels, caps, and RUO text survive.
3. `python3 scripts/qa-cutouts.py` → `_QA-contact-sheet.png`, each cutout on
   dark + light so halos (bg left behind) and eaten edges (foreground
   over-removed) are obvious. **A human must approve the sheet.**
4. Promote approved files over the masters, then
   `python3 scripts/optimize-images.py` to rebuild WebP/AVIF derivatives.

Automated matting reliably fails on glass rims / translucent liquid / thin text,
so the human QA pass in step 3 is mandatory before promotion.

## `<ProductHero />` API

```tsx
<ProductHero
  imageSrc={cutout}       // required — transparent cutout, no baked bg/shadow
  imageAlt="…"            // required
  accent="#28e0c1"        // brand/product accent for every light layer
  density="medium"        // 'low' | 'medium' | 'high' foreground particles
  priority                // true only for the first above-the-fold hero (LCP)
  srcSet={…} sizes={…}    // optional responsive wiring
  imageWidth={1254} imageHeight={1254}
>
  {/* optional hero copy over a readable scrim */}
</ProductHero>
```

Layer stack (back→front), all CSS/SVG, animating only transform/opacity:
animated gradient · sci texture · molecular SVG · blurred ambient particles ·
radial light source · atmospheric haze · product (feather mask + color-matched
bloom + `screen` blend + silhouette rim-light + float) · foreground particles.
Three depth planes (blur/opacity/parallax) with a small capped scroll parallax.

Guarantees: `aspect-ratio` reserves space (no CLS); first product image is
`eager`/`fetchpriority=high`, others lazy; `prefers-reduced-motion: reduce`
freezes all motion and parallax to an intentional static scene; mobile drops
particle density before ever touching the product/lighting relationship.

Preview (dev only): `/product-hero-preview`.

## Rollout status

- System + preview: done, verified desktop/tablet/mobile, no console errors.
- Per-product rollout is gated on promoting the isolated masters (step 4 above).
  Once promoted, replace each product page's bespoke hero box with `<ProductHero>`
  passing the product image + accent; no bespoke hero markup per product.
