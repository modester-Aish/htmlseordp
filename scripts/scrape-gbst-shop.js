/**
 * Scrape all products from groupbuyseotools.org shop (via product sitemap).
 * Downloads images locally. Saves data/gbst-products.json
 *
 * Usage: node scripts/scrape-gbst-shop.js [--limit=N] [--skip-images]
 */
const fs = require('fs');
const path = require('path');
const { fetchUrl } = require('./lib/fetch-html');
const { rebrand, rebrandTitle, stripTags } = require('./lib/rebrand');
const { sanitizeProductHtml } = require('./lib/sanitize-html');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'data', 'gbst-products.json');
const IMG_DIR = path.join(ROOT, 'assets', 'products');
const CONTENT_IMG_DIR = path.join(IMG_DIR, 'content');
const SITEMAP_URL = 'https://www.groupbuyseotools.org/product-sitemap.xml';
const BASE = 'https://www.groupbuyseotools.org';

const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 0;
const SKIP_IMAGES = args.includes('--skip-images');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function urlToSlug(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'product';
}

function extractMeta(html) {
  const title = (html.match(/<title[^>]*>([^<]+)/i) || [])[1] || '';
  const desc =
    (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [])[1] ||
    (html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i) || [])[1] ||
    '';
  const ogImage =
    (html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) || [])[1] ||
    (html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) || [])[1] ||
    '';
  const h1 =
    (html.match(/<h1[^>]*class=["'][^"']*product_title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) || [])[1] ||
    (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] ||
    '';
  const price =
    (html.match(/<span[^>]*class=["'][^"']*woocommerce-Price-amount[^"']*["'][^>]*>[\s\S]*?(\d+[.,]?\d*)/i) || [])[1] ||
    (html.match(/<bdi[^>]*>[\s\S]*?\$(\d+[.,]?\d*)/i) || [])[1] ||
    '';
  let shortDesc = '';
  const shortMatch = html.match(
    /<div[^>]*class=["'][^"']*woocommerce-product-details__short-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  );
  if (shortMatch) shortDesc = shortMatch[1];

  let longDesc = '';
  const tabIdx = html.search(/id=["']tab-description["']/i);
  if (tabIdx > -1) {
    const slice = html.slice(tabIdx);
    const end = slice.search(/id=["']tab-reviews["']/i);
    longDesc = end > -1 ? slice.slice(0, end) : slice.slice(0, 8000);
    longDesc = longDesc.replace(/^[\s\S]*?>/, '').replace(/<\/div>\s*$/i, '');
  }
  if (!longDesc || longDesc.length < 20) {
    const entryMatch = html.match(/<div[^>]*class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/article>/i);
    if (entryMatch) longDesc = entryMatch[1];
  }

  const categories = [];
  const catRe = /<a[^>]*rel=["']tag["'][^>]*>([^<]+)<\/a>/gi;
  let cm;
  while ((cm = catRe.exec(html)) !== null) categories.push(stripTags(cm[1]));

  let imageUrl = ogImage;
  if (!imageUrl) {
    const imgMatch = html.match(/<img[^>]*class=["'][^"']*wp-post-image[^"']*["'][^>]*src=["']([^"']+)["']/i);
    if (imgMatch) imageUrl = imgMatch[1];
  }
  if (!imageUrl) {
    const imgMatch2 = html.match(/<img[^>]*src=["']([^"']*wp-content\/uploads[^"']+)["']/i);
    if (imgMatch2) imageUrl = imgMatch2[1];
  }

  return {
    rawTitle: title,
    metaDescription: desc,
    name: stripTags(h1) || stripTags(title).split('|')[0].trim(),
    price: price ? price.replace(',', '.') : '4.99',
    shortDescription: shortDesc,
    description: longDesc || shortDesc,
    categories: [...new Set(categories)],
    imageUrl,
  };
}

async function downloadImageBinary(imageUrl, destPath) {
  if (!imageUrl || SKIP_IMAGES) return false;
  if (fs.existsSync(destPath)) return true;
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  return new Promise((resolve) => {
    const https = require('https');
    const http = require('http');
    const protocol = imageUrl.startsWith('https') ? https : http;
    protocol
      .get(imageUrl, { timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) {
            downloadImageBinary(loc.startsWith('http') ? loc : new URL(loc, imageUrl).href, destPath).then(resolve);
            return;
          }
        }
        if (res.statusCode !== 200) {
          resolve(false);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', async () => {
          try {
            await fs.promises.writeFile(destPath, Buffer.concat(chunks));
            resolve(true);
          } catch {
            resolve(false);
          }
        });
        res.on('error', () => resolve(false));
      })
      .on('error', () => resolve(false));
  });
}

function extFromUrl(url) {
  const m = url.match(/\.(jpe?g|png|webp|gif)(\?|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

async function processContentImages(html, slug) {
  if (!html || SKIP_IMAGES) return sanitizeProductHtml(html);
  let idx = 0;
  let out = html;
  const imgRe = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const matches = [...html.matchAll(imgRe)];
  for (const m of matches) {
    const src = m[1];
    if (!src.includes('uploads') && !src.includes('groupbuy')) continue;
    const abs = src.startsWith('http') ? src : new URL(src, BASE).href;
    const ext = extFromUrl(abs);
    const localName = `${slug}-content-${idx}.${ext}`;
    const localPath = `assets/products/content/${localName}`;
    const fullPath = path.join(ROOT, localPath);
    const ok = await downloadImageBinary(abs, fullPath);
    if (ok) {
      out = out.replace(src, localPath.replace(/\\/g, '/'));
    } else {
      out = out.replace(m[0], '');
    }
    idx++;
  }
  return sanitizeProductHtml(out);
}

async function scrapeProduct(url) {
  const html = await fetchUrl(url);
  const meta = extractMeta(html);
  const slug = urlToSlug(url);
  const name = rebrand(meta.name) || slug.replace(/-/g, ' ');
  const metaTitle = rebrandTitle(meta.rawTitle, name);
  const metaDescription = rebrand(meta.metaDescription || `${name} group buy access at affordable price. Get started at seordp.net.`).slice(0, 160);

  let localImage = '';
  if (meta.imageUrl && !SKIP_IMAGES) {
    const abs = meta.imageUrl.startsWith('http') ? meta.imageUrl : new URL(meta.imageUrl, BASE).href;
    const ext = extFromUrl(abs);
    localImage = `assets/products/${slug}.${ext}`;
    await downloadImageBinary(abs, path.join(ROOT, localImage));
    if (!fs.existsSync(path.join(ROOT, localImage))) localImage = '';
  }

  const shortDescription = await processContentImages(meta.shortDescription, slug);
  const description = await processContentImages(meta.description, slug);

  return {
    slug,
    sourceUrl: url,
    name,
    metaTitle,
    metaDescription,
    h1: name,
    price: meta.price,
    categories: meta.categories.map((c) => rebrand(c)),
    image: localImage,
    shortDescription,
    description,
  };
}

async function main() {
  console.log('Fetching product sitemap...');
  const sitemapXml = await fetchUrl(SITEMAP_URL, 60000);
  const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => !u.endsWith('/shop/') && u.includes('groupbuyseotools.org'));

  let toScrape = urls;
  if (LIMIT > 0) toScrape = urls.slice(0, LIMIT);

  console.log(`Found ${urls.length} URLs, scraping ${toScrape.length}...`);

  let existing = [];
  if (fs.existsSync(OUT_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    } catch {
      existing = [];
    }
  }
  const doneSlugs = new Set(existing.map((p) => p.slug));
  const products = [...existing];

  for (let i = 0; i < toScrape.length; i++) {
    const url = toScrape[i];
    const slug = urlToSlug(url);
    if (doneSlugs.has(slug)) {
      console.log(`  skip ${slug} (cached)`);
      continue;
    }
    try {
      console.log(`  [${i + 1}/${toScrape.length}] ${slug}`);
      const product = await scrapeProduct(url);
      products.push(product);
      doneSlugs.add(slug);
      fs.writeFileSync(OUT_FILE, JSON.stringify(products, null, 2));
      await sleep(400);
    } catch (e) {
      console.warn(`  FAIL ${slug}: ${e.message}`);
    }
  }

  console.log(`\nSaved ${products.length} products to data/gbst-products.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
