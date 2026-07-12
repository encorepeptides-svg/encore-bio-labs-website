#!/usr/bin/env python3
"""
Generates responsive WebP + AVIF variants for the site's large source images.

Usage: python3 scripts/optimize-images.py

For each source image below, writes {stem}-{width}.webp and {stem}-{width}.avif
next to the original, at widths capped to the image's native resolution (no
upscaling). Originals are left untouched on disk.
"""
import os
from pathlib import Path
from PIL import Image
import pillow_avif  # noqa: F401  (registers AVIF plugin with Pillow)

TARGET_WIDTHS = [720, 1000, 1400]
WEBP_QUALITY = 80
AVIF_QUALITY = 55

def widths_for(native_width: int) -> list[int]:
    widths = [w for w in TARGET_WIDTHS if w <= native_width]
    if native_width < TARGET_WIDTHS[-1] and native_width not in widths:
        widths.append(native_width)
    return sorted(set(widths))


def main() -> None:
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    product_sources = sorted(
        str(path.relative_to(root))
        for path in (Path(root) / "src/assets/images/products").glob("*.png")
    )
    sources = [*product_sources, "src/assets/images/hero/encore-kit-hero.png"]
    report = []

    for rel_path in sources:
        src_path = os.path.join(root, rel_path)
        im = Image.open(src_path)
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
        native_w, native_h = im.size
        stem, _ = os.path.splitext(src_path)
        original_kb = os.path.getsize(src_path) / 1024

        for width in widths_for(native_w):
            height = round(native_h * (width / native_w))
            resized = im if width == native_w else im.resize((width, height), Image.LANCZOS)

            webp_path = f"{stem}-{width}.webp"
            resized.save(webp_path, format="WEBP", quality=WEBP_QUALITY, method=6)
            webp_kb = os.path.getsize(webp_path) / 1024

            avif_path = f"{stem}-{width}.avif"
            resized.save(avif_path, format="AVIF", quality=AVIF_QUALITY)
            avif_kb = os.path.getsize(avif_path) / 1024

            report.append((os.path.relpath(webp_path, root), original_kb, webp_kb, avif_kb))

    print(f"{'file':<70}{'orig KB':>10}{'webp KB':>10}{'avif KB':>10}")
    for name, orig_kb, webp_kb, avif_kb in report:
        print(f"{name:<70}{orig_kb:>10.0f}{webp_kb:>10.0f}{avif_kb:>10.0f}")


if __name__ == "__main__":
    main()
