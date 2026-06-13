"""
Download official tool logos for all products and save to assets/products/.
Updates data/gbst-products.json with the new image paths.

Usage:
  python scripts/download-official-tool-images.py
  python scripts/download-official-tool-images.py --force --only keyword-eye picovico
  python scripts/download-official-tool-images.py --force --fix-fallbacks
"""
from __future__ import annotations

import argparse
import json
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "assets" / "products"
DATA_FILE = ROOT / "data" / "gbst-products.json"
REPORT_FILE = ROOT / "data" / "tool-image-download-report.json"

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; SEORDP/1.0)"}

# Curated slug -> official domain overrides for tricky names.
SLUG_DOMAINS: dict[str, str] = {
    "1-xrush-group-buy": "semrush.com",
    "ad-mobile-group-buy": "adplexity.com",
    "ad-ecommerce": "adplexity.com",
    "ad-adult-2023": "adplexity.com",
    "ad-native": "adplexity.com",
    "ad-push": "adplexity.com",
    "adbeat-group-buy": "adbeat.com",
    "adbeat-group-buy-plan-standard": "adbeat.com",
    "adbeat-group-buy-review-2024": "adbeat.com",
    "adheart-me-group-buy": "adheart.me",
    "adobe-group-buy": "adobe.com",
    "adplexity-group-buy": "adplexity.com",
    "adspy-group-buy": "adspy.com",
    "adspy-group-buy-unlimitted": "adspy.com",
    "adspy-social": "adspy.com",
    "advertsuite": "advertsuite.io",
    "affiliate-marketing-f-group-buy": "affiliatemarketingforum.com",
    "affiliate-marketing-forum": "affiliatemarketingforum.com",
    "ahrefs-group-buy": "ahrefs.com",
    "ahrefs": "ahrefs.com",
    "ai-content-labs": "aicontentlabs.com",
    "aiseo-ai": "aiseo.ai",
    "answerthepublic": "answerthepublic.com",
    "article-forge-group-buy-2023": "articleforge.com",
    "audio-group-buy": "storyblocks.com",
    "audioblocks": "storyblocks.com",
    "authority-labs": "authoritylabs.com",
    "big-spy-group-buy": "bigspy.com",
    "blakify-group-buy": "blakify.com",
    "brandoverflow": "brandoverflow.io",
    "bramework": "bramework.com",
    "canva": "canva.com",
    "chatgpt-plus": "openai.com",
    "claude": "claude.ai",
    "copy-ai": "copy.ai",
    "copygenius": "copygenius.io",
    "copymatic": "copymatic.ai",
    "creative-fabri": "creativefabrica.com",
    "creative-fabrica-group-buy": "creativefabrica.com",
    "crello": "crello.com",
    "deepflush": "deepflush.com",
    "denote-group-buy": "denote.net",
    "designs-ai": "designs.ai",
    "domcop-group-buy": "domcop.com",
    "domcop-group-buy-plan-power": "domcop.com",
    "doodly": "doodly.com",
    "dreamart-image-ai": "dream.ai",
    "envato-elements": "elements.envato.com",
    "epidemic-sound-group-buy": "epidemicsound.com",
    "findniche": "findniche.com",
    "fotojet": "fotojet.com",
    "frontendmasters-group-buy": "frontendmasters.com",
    "get-stencil": "getstencil.com",
    "getwsodo": "warriorplus.com",
    "gorails-group-buy": "gorails.com",
    "graphicstock": "storyblocks.com",
    "hashtagforlikes": "hashtagforlikes.com",
    "helium-10": "helium10.com",
    "helium-10-group-buy-2024": "helium10.com",
    "helloscribe-ai": "helloscribe.ai",
    "hyperwrite-ai-group-buy": "hyperwriteai.com",
    "ilovepdf-app-group-buy": "ilovepdf.com",
    "inkforall": "inkforall.com",
    "invideo": "invideo.io",
    "jenni-ai": "jenni.ai",
    "keyword-everywhere": "keywordseverywhere.com",
    "keyword-eye": "keywordeye.com",
    "keywordtool": "keywordtool.io",
    "keepa": "keepa.com",
    "lovo": "lovo.ai",
    "lsigraph": "lsigraph.com",
    "lovepik": "lovepik.com",
    "mangools": "mangools.com",
    "marmalead": "marmalead.com",
    "midjourney": "midjourney.com",
    "motion-array": "motionarray.com",
    "moz": "moz.com",
    "mrush-group-buy": "semrush.com",
    "netflix": "netflix.com",
    "niche-scraper": "nichescraper.com",
    "nichess": "nichess.com",
    "nobuna": "nobuna.com",
    "onlinetools-ai": "onlinetools.ai",
    "pacdora-group-buy": "pacdora.com",
    "peppertype": "peppertype.ai",
    "picovico": "picovico.com",
    "pixteller": "pixteller.com",
    "place-it": "placeit.net",
    "prime-video": "primevideo.com",
    "prowritingaid": "prowritingaid.com",
    "register-compass": "registercompass.com",
    "renderforest": "renderforest.com",
    "runwayml": "runwayml.com",
    "screpy": "screpy.com",
    "selleramp": "selleramp.com",
    "semrush-group-buy-2022": "semrush.com",
    "semscoop": "semscoop.com",
    "seobiliti": "seobility.net",
    "seoscout": "seoscout.com",
    "seranking-group-buy-2023": "seranking.com",
    "similarweb-group-buy": "similarweb.com",
    "slidebean": "slidebean.com",
    "smodin": "smodin.io",
    "snapied": "snapied.com",
    "spinrewriter": "spinrewriter.com",
    "steven-ai": "steven.ai",
    "terapeak": "terapeak.com",
    "texta-ai": "texta.ai",
    "theoptimizer": "theoptimizer.io",
    "tool-check-backlink": "ahrefs.com",
    "tool-check-backlink-new": "semrush.com",
    "topicmojo": "topicmojo.com",
    "tuberanker": "tuberanker.com",
    "ubersuggest": "ubersuggest.com",
    "udemy-group-buy": "udemy.com",
    "vecteezy": "vecteezy.com",
    "vidiq": "vidiq.com",
    "vidnami": "vidnami.com",
    "wave-video": "wave.video",
    "wordhero": "wordhero.co",
    "wordtune": "wordtune.com",
    "writerzen": "writerzen.net",
    "wrytly-group-buy": "wrytly.com",
    "wwe": "wwe.com",
    "zik-analytics": "zikanalytics.com",
    # User-requested refresh tools
    "crazy-egg": "crazyegg.com",
    "buzz-stream": "buzzstream.com",
    "pexda": "pexda.com",
    "cognitiveseo": "cognitiveseo.com",
    "cbengine": "cbengine.com",
    "lucidchart": "lucidchart.com",
    "unbounce": "unbounce.com",
    "indexification": "indexification.com",
    "skill-share": "skillshare.com",
    "wordai": "wordai.com",
    "wordai-group-buy": "wordai.com",
    "kwfinder-group-buy": "kwfinder.com",
    "serpstat": "serpstat.com",
    "serpstat-group-buy": "serpstat.com",
    "majestic-seo": "majestic.com",
    "majestic-seo-group-buy": "majestic.com",
    # Former placeholder tools
    "adsector": "adsector.com",
    "biq-cloud": "biq.cloud",
    "boolv-video": "boolv.video",
    "brandoverflow": "brandoverflow.io",
    "chatbotapp-ai-group-buy": "chatbotapp.ai",
    "chatgpt-group-buy-plus-pro": "openai.com",
    "closercopy": "closercopy.com",
    "copy-space-ai": "copyspace.ai",
    "deepflush": "deepflush.com",
    "ehunt-ai-group-buy": "ehunt.ai",
    "everbee-io-group-buy": "everbee.io",
    "facebook-ad-spy-group-buy": "adspy.com",
    "frase-io": "frase.io",
    "gptzero-me": "gptzero.me",
    "hashtagforlikes": "hashtagforlikes.com",
    "helium10-group-buy-12": "helium10.com",
    "humantalk-app-group-buy": "humantalk.io",
    "iamaffiliate-forum": "affiliatefix.com",
    "katteb-ai-group-buy": "katteb.com",
    "keywordinsights-ai": "keywordinsights.ai",
    "meshey-ai-group-buy": "meshey.ai",
    "minvo-pro-group-buy": "minvo.pro",
    "mokker-ai-group-buy": "mokker.ai",
    "monica-im": "monica.im",
    "murf-ai-group-buy": "murf.ai",
    "one-hour-indexing": "onehourindexing.com",
    "peppercontent-group": "peppercontent.ai",
    "pipio-group-buy": "pipio.ai",
    "pipiads-2024": "pipiads.com",
    "pippiads-group-buy-new": "pipiads.com",
    "plugins-for-wordpress-websites-with-4-95-month": "wordpress.org",
    "poweradspy-group-buy-review": "poweradspy.com",
    "revoicer-app-group-buy": "revoicer.com",
    "rewritify-ai-group-buy": "rewritify.ai",
    "rytr-me-group-buy": "rytr.me",
    "sale-tools-ebay": "ebay.com",
    "shophunter-io": "shophunter.io",
    "stockimg-ai-group-buy": "stockimg.ai",
    "switchy-io": "switchy.io",
    "talkingphotos-ai-group-buy": "talkingphotos.ai",
    "textwriter-ai": "textwriter.ai",
    "theoptimizer-io-group-buy": "theoptimizer.io",
    "toons-ai": "toons.ai",
    "turboscribe-ai-group-buy": "turboscribe.ai",
    "xrefs-agency-group-buy": "ahrefs.com",
    "artistly-ai-group-buy": "artistly.ai",
    "best-ai-studio-pactory-for-video-creation": "runwayml.com",
    "bmagic-group-buy": "brandmark.io",
    "mojo-video-group-buy": "mojo.video",
    "advertsuite": "advertsuite.io",
    "artspace-ai-group-buy": "artspace.ai",
    "operator-chatgpt-group-buy": "openai.com",
}

# Direct image URLs when domain-based logo fetch fails (defunct sites, etc.)
DIRECT_IMAGE_URLS: dict[str, list[str]] = {
    "keyword-eye": [
        "https://ph-files.imgix.net/f5758c1f-6ac2-4a34-a4af-519e8370ba92.png?auto=format&w=512&h=512&fit=max",
    ],
    "vidnami": [
        "https://logo.clearbit.com/contentfly.com",
        "https://www.google.com/s2/favicons?domain=contentfly.com&sz=256",
    ],
    "peppercontent-group": [
        "https://logo.clearbit.com/peppercontent.ai",
        "https://www.google.com/s2/favicons?domain=peppercontent.ai&sz=256",
        "https://www.google.com/s2/favicons?domain=peppertype.ai&sz=256",
    ],
    "biq-cloud": [
        "https://logo.clearbit.com/biq.cloud",
        "https://www.google.com/s2/favicons?domain=biq.com&sz=256",
    ],
    "meshey-ai-group-buy": [
        "https://logo.clearbit.com/meshy.ai",
        "https://www.google.com/s2/favicons?domain=meshy.ai&sz=256",
    ],
    "one-hour-indexing": [
        "https://logo.clearbit.com/onehourindexing.com",
        "https://www.google.com/s2/favicons?domain=indexification.com&sz=256",
    ],
    "pipio-group-buy": [
        "https://logo.clearbit.com/pipio.ai",
        "https://www.google.com/s2/favicons?domain=synthesia.io&sz=256",
    ],
    "closercopy": [
        "https://logo.clearbit.com/closercopy.com",
        "https://www.google.com/s2/favicons?domain=closercopy.com&sz=256",
    ],
    "hashtagforlikes": [
        "https://logo.clearbit.com/all-hashtag.com",
        "https://www.google.com/s2/favicons?domain=ritetag.com&sz=256",
    ],
    "deepflush": [
        "https://logo.clearbit.com/surferseo.com",
        "https://www.google.com/s2/favicons?domain=serpstat.com&sz=256",
    ],
    "adsector": [
        "https://logo.clearbit.com/poweradspy.com",
        "https://www.google.com/s2/favicons?domain=adspy.com&sz=256",
    ],
    "closercopy": [
        "https://ph-files.imgix.net/15a72c70-acec-43d0-a2cc-09e036bc525d.png?auto=format&w=512&h=512&fit=max",
        "https://logo.clearbit.com/closercopy.com",
    ],
}

COMBO_LABELS: dict[str, str] = {
    "tools-group-buy": "SEO Tools Pack",
    "biggest-combo-package-for-professionals": "SEO Pro Combo",
    "popular-value-seo-tools-combo": "Value SEO Combo",
    "combo-seo-tools-standard": "SEO Standard",
    "combo-expert-seo-tools": "Expert SEO",
    "new-combo-18-seo-tools-2023": "18 SEO Tools",
    "combo-sale-tools-amazon": "Amazon Tools",
    "combo-all-sale-tools": "Sale Tools",
    "combo-creative": "Creative Combo",
    "combo-all-biggest-seo-tools": "All SEO Tools",
    "combo-seo-tools-premium": "SEO Premium",
    "combo-seo-tools-basic": "SEO Basic",
    "social-ad-tools-spy-combo": "Ad Spy Combo",
    "combo-seo-tools-small": "SEO Small Plan",
    "combo-seo-tools-basic-plan": "SEO Basic Plan",
    "combo-seo-tools-ecom-plan": "SEO Ecom Plan",
    "combo-mega-pack-tools": "Mega Pack",
    "combo-all-biggest-seo-tools": "Biggest SEO",
    "combo-creative": "Creative Pack",
    "combo-sale-tools-amazon": "Amazon Sale",
    "content-and-writting": "Writer Plan",
    "designer-plan": "Designer Plan",
}


def is_combo_slug(slug: str) -> bool:
    return (
        slug in COMBO_LABELS
        or slug.startswith("combo-")
        or "combo" in slug
        or slug.endswith("-plan")
        or "package" in slug
        or slug == "tools-group-buy"
    )


def guess_domains(slug: str) -> list[str]:
    domains: list[str] = []
    if slug in SLUG_DOMAINS:
        domains.append(SLUG_DOMAINS[slug])

    cleaned = slug
    cleaned = re.sub(r"-group-buy(-\d{4})?$", "", cleaned)
    cleaned = re.sub(r"-review-\d{4}$", "", cleaned)
    cleaned = re.sub(r"-plan-[a-z0-9-]+$", "", cleaned)
    cleaned = re.sub(r"-unlimitted$", "", cleaned)
    cleaned = re.sub(r"^\d+-", "", cleaned)

    compact = cleaned.replace("-", "")
    hyphen = cleaned

    for base in {compact, hyphen}:
        if not base:
            continue
        for tld in ("com", "io", "ai", "net", "co", "app"):
            domains.append(f"{base}.{tld}")

    seen: set[str] = set()
    out: list[str] = []
    for item in domains:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def fetch_from_url(url: str) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15) as res:
            data = res.read()
            if len(data) < 180:
                return None
            Image.open(BytesIO(data)).verify()
            return data
    except Exception:
        return None


def fetch_logo_bytes(domain: str) -> bytes | None:
    sources = [
        f"https://logo.clearbit.com/{domain}",
        f"https://www.google.com/s2/favicons?domain={domain}&sz=256",
        (
            "https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON"
            f"&fallback_opts=TYPE,SIZE,URL&url=https://{domain}&size=256"
        ),
        f"https://icons.duckduckgo.com/ip3/{domain}.ico",
        f"https://{domain}/apple-touch-icon.png",
        f"https://www.{domain}/apple-touch-icon.png",
        f"https://{domain}/favicon.ico",
        f"https://www.{domain}/favicon.ico",
    ]
    for url in sources:
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=15) as res:
                data = res.read()
                if len(data) < 180:
                    continue
                Image.open(BytesIO(data)).verify()
                return data
        except Exception:
            continue
    return None


def save_logo_png(raw: bytes, dest: Path) -> None:
    img = Image.open(BytesIO(raw))
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")
    canvas = Image.new("RGB", (512, 512), "#ffffff")
    logo = img.copy()
    logo.thumbnail((420, 420), Image.Resampling.LANCZOS)
    x = (512 - logo.width) // 2
    y = (512 - logo.height) // 2
    if logo.mode == "RGBA":
        canvas.paste(logo, (x, y), logo)
    else:
        canvas.paste(logo, (x, y))
    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dest, format="PNG", optimize=True)


def make_placeholder(label: str, dest: Path) -> None:
    size = 512
    img = Image.new("RGB", (size, size), "#0f172a")
    draw = ImageDraw.Draw(img)
    for y in range(size):
        shade = int(20 + (y / size) * 40)
        draw.line([(0, y), (size, y)], fill=(14, shade + 90, shade + 110))

    draw.rounded_rectangle((48, 48, size - 48, size - 48), radius=28, fill="#14b8a6")
    draw.rounded_rectangle((64, 64, size - 64, size - 64), radius=20, fill="#0f172a")

    words = label.split()
    line1 = " ".join(words[:2]) if words else "Tool"
    line2 = " ".join(words[2:4]) if len(words) > 2 else ""
    text = line1 if not line2 else f"{line1}\n{line2}"

    try:
        font = ImageFont.truetype("arial.ttf", 34)
    except OSError:
        font = ImageFont.load_default()

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
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, format="PNG", optimize=True)


def process_product(product: dict, force: bool = False) -> dict:
    slug = product["slug"]
    name = product.get("name") or slug.replace("-", " ").title()
    dest = IMG_DIR / f"{slug}.png"
    result = {"slug": slug, "name": name, "image": f"assets/products/{slug}.png", "source": "", "status": "failed"}

    if force and dest.exists():
        dest.unlink()

    if not force and dest.exists() and dest.stat().st_size > 5000:
        result["source"] = "cached"
        result["status"] = "ok"
        return result

    if is_combo_slug(slug):
        label = COMBO_LABELS.get(slug, name[:24])
        make_placeholder(label, dest)
        result["source"] = "generated-combo"
        result["status"] = "ok"
        return result

    for url in DIRECT_IMAGE_URLS.get(slug, []):
        raw = fetch_from_url(url)
        if raw:
            save_logo_png(raw, dest)
            result["source"] = url
            result["status"] = "ok"
            return result

    for domain in guess_domains(slug):
        raw = fetch_logo_bytes(domain)
        if raw:
            save_logo_png(raw, dest)
            result["source"] = domain
            result["status"] = "ok"
            return result

    make_placeholder(name[:28], dest)
    result["source"] = "generated-fallback"
    result["status"] = "fallback"
    return result


def load_fallback_slugs() -> list[str]:
    if not REPORT_FILE.exists():
        return []
    report = json.loads(REPORT_FILE.read_text(encoding="utf-8"))
    return [item["slug"] for item in report if item.get("status") == "fallback"]


PRIORITY_SLUGS = [
    "keyword-eye",
    "picovico",
    "terapeak",
    "crazy-egg",
    "buzz-stream",
    "pexda",
    "cognitiveseo",
    "cbengine",
    "lucidchart",
    "unbounce",
    "indexification",
    "skill-share",
    "wordai",
    "wordai-group-buy",
    "keywordtool",
    "kwfinder-group-buy",
    "serpstat",
    "serpstat-group-buy",
    "majestic-seo",
    "majestic-seo-group-buy",
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Re-download even if image exists")
    parser.add_argument("--only", nargs="*", help="Only process these slugs")
    parser.add_argument("--fix-fallbacks", action="store_true", help="Re-download former placeholder tools")
    args = parser.parse_args()

    products = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    slug_filter: set[str] | None = None
    if args.only:
        slug_filter = set(args.only)
    elif args.fix_fallbacks or args.force:
        slug_filter = set(PRIORITY_SLUGS) | set(load_fallback_slugs())

    if slug_filter is not None:
        products = [p for p in products if p["slug"] in slug_filter]

    print(f"Downloading official images for {len(products)} tools...")

    existing_report = {}
    if REPORT_FILE.exists():
        for item in json.loads(REPORT_FILE.read_text(encoding="utf-8")):
            existing_report[item["slug"]] = item

    results: dict[str, dict] = dict(existing_report)
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = {pool.submit(process_product, p, args.force or bool(slug_filter)): p["slug"] for p in products}
        done = 0
        for fut in as_completed(futures):
            done += 1
            item = fut.result()
            results[item["slug"]] = item
            print(f"  [{done}/{len(products)}] {item['slug']} -> {item['source']} ({item['status']})")

    all_products = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for product in all_products:
        slug = product["slug"]
        if slug in results:
            product["image"] = results[slug]["image"]

    ok = sum(1 for r in results.values() if r["status"] == "ok")
    fallback = sum(1 for r in results.values() if r["status"] == "fallback")

    DATA_FILE.write_text(json.dumps(all_products, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_FILE.write_text(json.dumps(list(results.values()), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Done. Official logos: {ok}, fallback placeholders: {fallback}, processed: {len(products)}")
    print(f"Updated {DATA_FILE.name} and saved report to {REPORT_FILE.name}")


if __name__ == "__main__":
    main()
