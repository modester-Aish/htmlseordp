"""
Replace product images that contain the groupbuyseotools.org watermark
with clean official tool logos.
"""
from __future__ import annotations

import glob
import json
import os
import re
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "assets" / "products"
DATA_FILE = ROOT / "data" / "gbst-products.json"

SLUG_DOMAINS = {
    "1-xrush-group-buy": "semrush.com",
    "ad-mobile-group-buy": "adplexity.com",
    "adbeat-group-buy-plan-standard": "adbeat.com",
    "adobe-group-buy": "adobe.com",
    "blakify-group-buy": "blakify.com",
    "denote-group-buy": "denote.net",
    "domcop-group-buy-plan-power": "domcop.com",
    "domcop-group-buy": "domcop.com",
    "frontendmasters-group-buy": "frontendmasters.com",
    "getwsodo": "warriorplus.com",
    "gorails-group-buy": "gorails.com",
    "helium-10-group-buy-2024": "helium10.com",
    "helium-10": "helium10.com",
    "ilovepdf-app-group-buy": "ilovepdf.com",
    "keepa": "keepa.com",
    "lsigraph": "lsigraph.com",
    "mrush-group-buy": "semrush.com",
    "pacdora-group-buy": "pacdora.com",
    "register-compass": "registercompass.com",
    "screpy": "screpy.com",
    "semrush-group-buy-2022": "semrush.com",
    "spinrewriter": "spinrewriter.com",
    "tuberanker": "tuberanker.com",
    "wwe": "wwe.com",
}

COMBO_SLUGS = {
    "biggest-combo-package-for-professionals": "SEO Pro Combo",
    "combo-all-biggest-seo-tools": "All SEO Tools",
    "combo-creative": "Creative Combo",
    "combo-expert-seo-tools": "Expert SEO Combo",
    "combo-seo-tools-basic": "SEO Basic Combo",
    "combo-seo-tools-premium": "SEO Premium Combo",
    "combo-seo-tools-standard": "SEO Standard Combo",
    "popular-value-seo-tools-combo": "Value SEO Combo",
    "tools-group-buy": "SEO Tools Pack",
}


def has_watermark(path: Path) -> bool:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    top_h = max(12, int(h * 0.12))
    region = im.crop((0, 0, w, top_h))
    px = list(region.getdata())
    redish = sum(1 for r, g, b in px if r > 170 and g < 120 and b < 120)
    whitish = sum(1 for r, g, b in px if r > 220 and g > 220 and b > 220)
    return (redish / len(px)) > 0.02 and (whitish / len(px)) > 0.15


def download_logo(domain: str) -> Image.Image | None:
    headers = {"User-Agent": "Mozilla/5.0"}
    sources = [
        f"https://logo.clearbit.com/{domain}",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=256",
        (
            "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON"
            f"&fallback_opts=TYPE,SIZE,URL&url=https://{domain}&size=256"
        ),
    ]
    for url in sources:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as res:
                data = res.read()
                if len(data) < 200:
                    continue
                img = Image.open(BytesIO(data))
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGBA")
                return img
        except Exception:
            continue
    return None


def make_combo_image(label: str, size: int = 512) -> Image.Image:
    img = Image.new("RGB", (size, size), "#0f172a")
    draw = ImageDraw.Draw(img)
    for y in range(size):
        shade = int(15 + (y / size) * 35)
        draw.line([(0, y), (size, y)], fill=(14, shade + 100, shade + 120))
    draw.rounded_rectangle((40, 40, size - 40, size - 40), radius=28, fill="#14b8a6")
    draw.rounded_rectangle((56, 56, size - 56, size - 56), radius=20, fill="#0f172a")
    try:
        font = ImageFont.truetype("arial.ttf", 34)
    except OSError:
        font = ImageFont.load_default()
    words = label.split()
    line1 = " ".join(words[:2])
    line2 = " ".join(words[2:]) if len(words) > 2 else ""
    text = line1 if not line2 else f"{line1}\n{line2}"
    bbox = draw.multiline_textbbox((0, 0), text, font=font, align="center", spacing=8)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.multiline_text(
        ((size - tw) / 2, (size - th) / 2),
        text,
        font=font,
        fill="#f8fafc",
        align="center",
        spacing=8,
    )
    return img


def save_like_original(img: Image.Image, dest: Path) -> None:
    ext = dest.suffix.lower()
    canvas = Image.new("RGB", (512, 512), "#ffffff")
    logo = img.convert("RGBA")
    logo.thumbnail((420, 420), Image.Resampling.LANCZOS)
    x = (512 - logo.width) // 2
    y = (512 - logo.height) // 2
    if logo.mode == "RGBA":
        canvas.paste(logo, (x, y), logo)
    else:
        canvas.paste(logo, (x, y))
    if ext == ".webp":
        canvas.save(dest, format="WEBP", quality=90)
    elif ext in (".jpg", ".jpeg"):
        canvas.save(dest, format="JPEG", quality=90)
    else:
        canvas.save(dest, format="PNG")


def slug_from_filename(filename: str) -> str:
    return re.sub(r"\.(png|jpe?g|webp|gif)$", "", filename, flags=re.I)


def main() -> None:
    updated_paths: dict[str, str] = {}
    replaced = 0
    skipped = 0
    failed = []

    for fp in sorted(IMG_DIR.glob("*.*")):
        if fp.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
            continue
        if not has_watermark(fp):
            continue

        slug = slug_from_filename(fp.name)
        print(f"Replacing watermarked image: {fp.name}")

        if slug in COMBO_SLUGS:
            img = make_combo_image(COMBO_SLUGS[slug])
        elif slug in SLUG_DOMAINS:
            img = download_logo(SLUG_DOMAINS[slug])
            if img is None:
                failed.append(fp.name)
                print(f"  ! could not download logo for {slug}")
                continue
        else:
            guessed = slug.replace("-group-buy", "").replace("-plan-standard", "")
            guessed = guessed.replace("-group-buy-2024", "").replace("-group-buy-2022", "")
            guessed = re.sub(r"^\d+-", "", guessed)
            domain = f"{guessed}.com"
            img = download_logo(domain)
            if img is None:
                failed.append(fp.name)
                print(f"  ! could not download logo for guessed domain {domain}")
                continue

        save_like_original(img, fp)
        updated_paths[slug] = f"assets/products/{fp.name}"
        replaced += 1

    if DATA_FILE.exists():
        products = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        for product in products:
            slug = product.get("slug")
            if slug in updated_paths:
                product["image"] = updated_paths[slug]
        DATA_FILE.write_text(json.dumps(products, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nDone. Replaced: {replaced}, Failed: {len(failed)}")
    if failed:
        print("Failed files:", ", ".join(failed))


if __name__ == "__main__":
    main()
