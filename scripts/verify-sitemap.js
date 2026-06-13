const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/gbst-products.json'), 'utf8'));
const html = fs.readFileSync(path.join(ROOT, 'sitemap/index.html'), 'utf8');
const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

const productSlugs = new Set(products.map((p) => p.slug));
const htmlProductLinks = new Set(
  [...html.matchAll(/href="\.\.\/([^"]+)\/index\.html"/g)]
    .map((m) => m[1])
    .filter((s) => productSlugs.has(s))
);

const xmlLocs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const xmlProductLocs = xmlLocs.filter((u) => {
  const slug = u.replace('https://seordp.net/', '').replace(/\/$/, '');
  return productSlugs.has(slug);
});

const missingHtml = products.filter((p) => !htmlProductLinks.has(p.slug)).map((p) => p.slug);
const missingXml = products.filter((p) => !xmlProductLocs.some((u) => u.includes(`/${p.slug}/`))).map((p) => p.slug);

const diskProducts = products.filter((p) => fs.existsSync(path.join(ROOT, p.slug, 'index.html')));

console.log('=== Sitemap verification ===');
console.log('Catalog products:', products.length);
console.log('Built product pages on disk:', diskProducts.length);
console.log('HTML sitemap product links:', htmlProductLinks.size);
console.log('XML sitemap product URLs:', xmlProductLocs.length);
console.log('XML total URLs:', xmlLocs.length);
console.log('Missing in HTML sitemap:', missingHtml.length);
console.log('Missing in XML sitemap:', missingXml.length);
if (missingHtml.length) console.log('  HTML missing:', missingHtml.slice(0, 15).join(', '));
if (missingXml.length) console.log('  XML missing:', missingXml.slice(0, 15).join(', '));

const ok = missingHtml.length === 0 && missingXml.length === 0 && htmlProductLinks.size === products.length;
console.log(ok ? '\n✓ All products are in both sitemaps.' : '\n✗ Sitemap mismatch — rebuild or fix generateSitemap.');
process.exit(ok ? 0 : 1);
