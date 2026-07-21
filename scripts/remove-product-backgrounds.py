#!/usr/bin/env python3
"""
Batch background removal for product master renders that shipped with a baked-in
studio background (see Phase 0 audit: 24 of 25 masters are opaque RGB).

Uses rembg (U^2-Net) with alpha matting, which handles the hard cases here —
glass vials, reflective caps, translucent liquid, thin printed labels — far
better than any near-white threshold.

    pip install "rembg[cpu]" pillow
    python3 scripts/remove-product-backgrounds.py

Outputs transparent PNGs into src/assets/images/products/_cutout-review/ .
NOTHING in the live path is overwritten. A human must QA the review folder
(run scripts/qa-cutouts.py) and only then copy approved files over the masters
and re-run scripts/optimize-images.py to rebuild the responsive derivatives.

Pass filenames to limit the run, e.g.:
    python3 scripts/remove-product-backgrounds.py retatrutide.png ghk-cu.png
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/assets/images/products"
OUT = SRC / "_cutout-review"

# The one already-clean cutout — never reprocess it.
ALREADY_CLEAN = {"wolverine.png"}


def masters(selected):
    if selected:
        return [SRC / name for name in selected]
    out = []
    for p in sorted(SRC.glob("*.png")):
        if p.name.startswith("category-") or p.name in ALREADY_CLEAN or p.parent.name == "_cutout-review":
            continue
        out.append(p)
    return out


def main():
    try:
        from rembg import remove, new_session
        from PIL import Image
        import io
    except ImportError:
        sys.exit(
            'rembg is not installed. Run:\n'
            '  pip install "rembg[cpu]" pillow\n'
            "then re-run this script."
        )

    OUT.mkdir(exist_ok=True)
    # u2netp is lighter; u2net gives cleaner glass edges. Use u2net for quality.
    session = new_session("u2net")
    files = masters(sys.argv[1:])
    if not files:
        sys.exit("No master PNGs found to process.")

    print(f"Processing {len(files)} master(s) -> {OUT.relative_to(ROOT)}/")
    for path in files:
        data = path.read_bytes()
        cut = remove(
            data,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=15,
            alpha_matting_erode_size=8,
            post_process_mask=True,
        )
        dst = OUT / path.name
        dst.write_bytes(cut)
        # Report the resulting edge transparency so obvious failures surface early.
        im = Image.open(io.BytesIO(cut)).convert("RGBA")
        w, h = im.size
        a = im.split()[-1].load()
        ring = [a[x, y] for x in range(0, w, max(1, w // 100)) for y in (0, h - 1)]
        ring += [a[x, y] for y in range(0, h, max(1, h // 100)) for x in (0, w - 1)]
        transp = 100 * sum(v < 16 for v in ring) / len(ring)
        flag = "" if transp > 90 else "  <-- REVIEW: edge not fully transparent"
        print(f"  {path.name:<26} edge_transparent={transp:4.0f}%{flag}")

    print(
        "\nDone. Next:\n"
        "  1. python3 scripts/qa-cutouts.py   # build the QA contact sheet\n"
        "  2. Eyeball every cutout (glass rims, labels, liquid, caps).\n"
        "  3. Copy only approved files over the masters in src/assets/images/products/.\n"
        "  4. python3 scripts/optimize-images.py   # rebuild WebP/AVIF derivatives\n"
    )


if __name__ == "__main__":
    main()
