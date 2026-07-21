#!/usr/bin/env python3
"""
Human-QA harness for the auto-generated cutouts in
src/assets/images/products/_cutout-review/ .

Automated matting fails in predictable places on these products — glass rims,
translucent liquid, thin printed text, reflective caps. This builds a single
contact sheet that makes those failures obvious: each cutout is shown twice,
once on dark and once on a light checkerboard, so both a light halo (background
not removed) and an eaten label/edge (foreground over-removed) jump out.

    python3 scripts/qa-cutouts.py

Writes _cutout-review/_QA-contact-sheet.png and prints a per-image edge report.
No image in the live path is touched. This does NOT approve anything — a person
must look at the sheet and decide.
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
REVIEW = ROOT / "src/assets/images/products/_cutout-review"
CELL = 320
PAD = 16
DARK = (7, 23, 36)


def checker(size, a=(235, 238, 240), b=(200, 205, 210), step=16):
    img = Image.new("RGB", (size, size), a)
    d = ImageDraw.Draw(img)
    for y in range(0, size, step):
        for x in range(0, size, step):
            if (x // step + y // step) % 2:
                d.rectangle([x, y, x + step, y + step], fill=b)
    return img


def main():
    if not REVIEW.exists():
        raise SystemExit(f"No review folder yet: {REVIEW}. Run remove-product-backgrounds.py first.")
    cutouts = sorted(p for p in REVIEW.glob("*.png") if not p.name.startswith("_"))
    if not cutouts:
        raise SystemExit("No cutouts to QA in the review folder.")

    cols = 2  # dark + light per row, one product per row
    rows = len(cutouts)
    W = PAD + cols * (CELL + PAD)
    H = PAD + rows * (CELL + 28 + PAD)
    sheet = Image.new("RGB", (W, H), (18, 20, 24))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 15)
    except Exception:
        font = ImageFont.load_default()

    dark_cell = Image.new("RGB", (CELL, CELL), DARK)
    light_cell = checker(CELL)

    print(f"{'file':<26}{'edge_transp%':<14}verdict")
    print("-" * 60)
    for r, path in enumerate(cutouts):
        im = Image.open(path).convert("RGBA")
        im.thumbnail((CELL - 24, CELL - 24))
        a = im.split()[-1].load()
        w, h = im.size
        ring = [a[x, y] for x in range(0, w, max(1, w // 80)) for y in (0, h - 1)]
        ring += [a[x, y] for y in range(0, h, max(1, h // 80)) for x in (0, w - 1)]
        transp = 100 * sum(v < 16 for v in ring) / len(ring)
        verdict = "ok" if transp > 90 else ("HALO RISK" if transp < 70 else "check edges")
        print(f"{path.name:<26}{transp:<14.0f}{verdict}")

        y = PAD + r * (CELL + 28 + PAD)
        draw.text((PAD, y - 2), f"{path.name}   edge_transp={transp:.0f}%  [{verdict}]", fill=(230, 233, 236), font=font)
        for c, base in enumerate((dark_cell, light_cell)):
            x = PAD + c * (CELL + PAD)
            cell = base.copy()
            cell.paste(im, ((CELL - w) // 2, (CELL - h) // 2 + 20), im)
            sheet.paste(cell, (x, y + 20))

    out = REVIEW / "_QA-contact-sheet.png"
    sheet.save(out)
    print(f"\nContact sheet: {out.relative_to(ROOT)}")
    print("Open it and reject any cutout with a light halo (bg left behind) or an")
    print("eaten label/glass edge (foreground over-removed) before promoting it.")


if __name__ == "__main__":
    main()
