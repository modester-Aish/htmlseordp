/**
 * Full static-site SEO audit — meta, schema, headings, images, links, sitemap, robots.
 */
const fs = require('fs');
const path = require('path');
const { SITE_URL } = require('./lib/utils');
const { generateCanonicalUrl } = require('./lib/canonical');
const { getSeoMeta } = require('./lib/seo-meta');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'css', 'js', 'assets', 'wp-content', 'tools', 'src', 'scripts', 'data']);

function walkHtml(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walkHtml(full, list);
    } else if (name === 'index.html') {
      list.push(full);
    }
  }
  return list;
}

function slugFromFile(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '';
  return rel.replace(/\/index\.html$/, '');
}

function decodeHtml(s) {
  return (s || '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'");
}

function extract(html) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? decodeHtml(m[1]).trim() : '';
  };
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    decodeHtml(m[1].replace(/<[^>]+>/g, '')).trim()
  );
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => ({
    href: m[1],
    tag: m[0],
  }));
  const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1].trim()
  );
  return {
    title: pick(/<title>([^<]*)<\/title>/i),
    description: pick(/<meta name="description" content="([^"]*)"/i),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/i),
    robots: pick(/<meta name="robots" content="([^"]*)"/i),
    lang: pick(/<html[^>]*\blang=["']([^"']+)["']/i),
    viewport: /name=["']viewport["']/i.test(html),
    ogImage: pick(/<meta property="og:image" content="([^"]*)"/i),
    ogUrl: pick(/<meta property="og:url" content="([^"]*)"/i),
    h1s,
    imgs,
    links,
    jsonLd,
    hasManifest: /<link[^>]+rel=["']manifest["']/i.test(html),
    hasFavicon: /<link[^>]+rel=["'](?:icon|shortcut icon)["']/i.test(html),
    hreflang: [...html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi)].map((m) => m[1]),
  };
}

function parseJsonLd(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function flattenGraph(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj.flatMap(flattenGraph);
  if (obj['@graph']) return flattenGraph(obj['@graph']);
  return [obj];
}

function main() {
  const files = walkHtml(ROOT).sort();
  const builtSlugs = new Set(files.map(slugFromFile).filter(Boolean));
  builtSlugs.add(''); // home

  const report = {
    generatedAt: new Date().toISOString(),
    site: SITE_URL,
    stats: { pages: files.length },
    sections: {},
    issues: [],
  };

  const counters = {
    missingTitle: 0,
    missingDesc: 0,
    missingCanonical: 0,
    titleTooLong: 0,
    descTooShort: 0,
    descTooLong: 0,
    canonicalMismatch: 0,
    ogCanonicalMismatch: 0,
    titleOgMismatch: 0,
    noH1: 0,
    multipleH1: 0,
    noJsonLd: 0,
    invalidJsonLd: 0,
    imgNoAlt: 0,
    imgEmptyAlt: 0,
    ogImageRelative: 0,
    noindex: 0,
    missingLang: 0,
    missingViewport: 0,
    descContentMismatch: 0,
  };

  const titleDup = new Map();
  const descDup = new Map();
  const brokenInternal = new Map();
  const slugSet = new Set([...builtSlugs]);

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const slug = slugFromFile(file);
    const rel = slug || '(home)';
    const meta = extract(html);
    const pageIssues = [];

    if (!meta.title) {
      counters.missingTitle++;
      pageIssues.push('missing title');
    } else if (meta.title.length > 60) counters.titleTooLong++;

    if (!meta.description) {
      counters.missingDesc++;
      pageIssues.push('missing description');
    } else {
      if (meta.description.length < 70) counters.descTooShort++;
      if (meta.description.length > 160) counters.descTooLong++;
    }

    if (!meta.canonical) {
      counters.missingCanonical++;
      pageIssues.push('missing canonical');
    } else {
      const expected = generateCanonicalUrl(slug ? `/${slug}` : '/');
      if (meta.canonical !== expected) {
        counters.canonicalMismatch++;
        pageIssues.push(`canonical mismatch (${meta.canonical})`);
      }
    }

    if (meta.ogUrl && meta.canonical && meta.ogUrl !== meta.canonical) counters.ogCanonicalMismatch++;
    if (meta.title && meta.ogUrl && meta.title !== extract(html).title) {
      const ogT = html.match(/<meta property="og:title" content="([^"]*)"/i);
      if (ogT && decodeHtml(ogT[1]) !== meta.title) {
        counters.titleOgMismatch++;
        pageIssues.push('title !== og:title');
      }
    }

    if (!meta.lang) {
      counters.missingLang++;
      pageIssues.push('missing html lang');
    }
    if (!meta.viewport) {
      counters.missingViewport++;
      pageIssues.push('missing viewport');
    }
    if (/noindex/i.test(meta.robots)) counters.noindex++;

    if (meta.h1s.length === 0) {
      counters.noH1++;
      pageIssues.push('no h1');
    } else if (meta.h1s.length > 1) counters.multipleH1++;

    if (meta.jsonLd.length === 0) {
      counters.noJsonLd++;
      pageIssues.push('no JSON-LD');
    } else {
      for (const block of meta.jsonLd) {
        if (!parseJsonLd(block)) {
          counters.invalidJsonLd++;
          pageIssues.push('invalid JSON-LD');
          break;
        }
      }
    }

    for (const img of meta.imgs) {
      if (!/\balt=/.test(img)) counters.imgNoAlt++;
      else if (/\balt=["']\s*["']/.test(img)) counters.imgEmptyAlt++;
    }

    if (meta.ogImage && !/^https?:\/\//i.test(meta.ogImage)) counters.ogImageRelative++;

    // Description relevance heuristic for product-like slugs
    if (slug && meta.description && meta.title) {
      const core = slug.replace(/-group-buy.*/, '').replace(/^\d+-/, '').split('-')[0];
      if (core.length >= 4) {
        const d = meta.description.toLowerCase();
        const t = meta.title.toLowerCase();
        if (t.includes(core) && !d.includes(core)) counters.descContentMismatch++;
      }
    }

    if (meta.title) {
      const k = meta.title.toLowerCase();
      if (!titleDup.has(k)) titleDup.set(k, []);
      titleDup.get(k).push(rel);
    }
    if (meta.description) {
      const k = meta.description.toLowerCase().slice(0, 80);
      if (!descDup.has(k)) descDup.set(k, []);
      descDup.get(k).push(rel);
    }

    for (const { href } of meta.links) {
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
      if (/^https?:\/\//i.test(href)) continue;
      let target = href.replace(/^\.\.\//, '').replace(/^\.\//, '').replace(/^\//, '');
      target = target.split(/[?#]/)[0].replace(/\/$/, '');
      if (!target || target.endsWith('.css') || target.endsWith('.js') || target.endsWith('.ico') || target.endsWith('.svg') || target.endsWith('.json')) continue;
      const parts = slug ? slug.split('/') : [];
      let resolved = target;
      if (href.startsWith('../')) {
        const up = (href.match(/\.\.\//g) || []).length;
        const baseParts = parts.slice(0, Math.max(0, parts.length - up));
        const rest = href.replace(/^(\.\.\/)+/, '').split(/[?#]/)[0].replace(/\/$/, '');
        resolved = [...baseParts, rest].filter(Boolean).join('/');
      } else if (href.startsWith('./')) {
        resolved = [...parts, target].filter(Boolean).join('/');
      }
      if (!slugSet.has(resolved) && !fs.existsSync(path.join(ROOT, resolved, 'index.html')) && resolved !== 'index.html') {
        const key = `${rel} → ${href}`;
        brokenInternal.set(key, (brokenInternal.get(key) || 0) + 1);
      }
    }

    if (pageIssues.length) report.issues.push({ page: rel, issues: pageIssues });
  }

  // robots.txt
  const robotsPath = path.join(ROOT, 'robots.txt');
  const robotsIssues = [];
  if (!fs.existsSync(robotsPath)) robotsIssues.push('robots.txt missing');
  else {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    if (!/Sitemap:\s*https?:\/\//i.test(robots)) robotsIssues.push('robots.txt missing Sitemap directive');
    if (!/^User-agent:/im.test(robots)) robotsIssues.push('robots.txt missing User-agent');
  }

  // sitemap.xml vs built pages
  const sitemapIssues = [];
  const xmlPath = path.join(ROOT, 'sitemap.xml');
  let xmlUrls = [];
  if (!fs.existsSync(xmlPath)) sitemapIssues.push('sitemap.xml missing');
  else {
    const xml = fs.readFileSync(xmlPath, 'utf8');
    xmlUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const xmlSlugs = new Set(
      xmlUrls.map((u) => {
        try {
          const p = new URL(u).pathname.replace(/^\/|\/$/g, '');
          return p;
        } catch {
          return '';
        }
      })
    );
    const notInXml = [...builtSlugs].filter((s) => s && !xmlSlugs.has(s));
    const inXmlNotBuilt = [...xmlSlugs].filter((s) => s && !builtSlugs.has(s));
    if (notInXml.length) sitemapIssues.push(`${notInXml.length} built pages missing from sitemap.xml`);
    if (inXmlNotBuilt.length) sitemapIssues.push(`${inXmlNotBuilt.length} sitemap URLs without built page`);
    report.sections.sitemap = { xmlUrlCount: xmlUrls.length, notInXml: notInXml.slice(0, 20), inXmlNotBuilt: inXmlNotBuilt.slice(0, 20) };
  }

  // manifest + root assets
  const rootAssets = [];
  if (!fs.existsSync(path.join(ROOT, 'manifest.json'))) rootAssets.push('manifest.json missing');
  if (!fs.existsSync(path.join(ROOT, 'favicon.ico'))) rootAssets.push('favicon.ico missing');
  if (!fs.existsSync(path.join(ROOT, 'icon.svg'))) rootAssets.push('icon.svg missing');

  const dupTitles = [...titleDup.entries()].filter(([, p]) => p.length > 1);
  const dupDescs = [...descDup.entries()].filter(([, p]) => p.length > 1);

  // Product schema sample
  let productSchemaCount = 0;
  let productWithOffer = 0;
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const blocks = extract(html).jsonLd;
    for (const b of blocks) {
      const graph = flattenGraph(parseJsonLd(b));
      for (const node of graph) {
        if (node['@type'] === 'Product' || (Array.isArray(node['@type']) && node['@type'].includes('Product'))) {
          productSchemaCount++;
          if (node.offers) productWithOffer++;
        }
      }
    }
  }

  report.sections.meta = { ...counters };
  report.sections.duplicates = { titleGroups: dupTitles.length, descGroups: dupDescs.length };
  report.sections.duplicateTitles = dupTitles.slice(0, 15).map(([t, p]) => ({ title: t, pages: p }));
  report.sections.duplicateDescriptions = dupDescs.slice(0, 10).map(([d, p]) => ({ descPreview: d.slice(0, 60), count: p.length, pages: p.slice(0, 5) }));
  report.sections.robots = { ok: robotsIssues.length === 0, issues: robotsIssues };
  report.sections.sitemapIssues = sitemapIssues;
  report.sections.rootAssets = rootAssets;
  report.sections.internalBrokenLinks = [...brokenInternal.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([link, count]) => ({ link, count }));
  report.sections.schema = { productPagesWithSchema: productSchemaCount, withOffers: productWithOffer };
  report.sections.hreflang = { pagesWithHreflang: files.filter((f) => extract(fs.readFileSync(f, 'utf8')).hreflang.length).length };

  const outPath = path.join(ROOT, 'data', 'seo-full-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log('=== FULL SEO AUDIT ===');
  console.log(`Site: ${SITE_URL}`);
  console.log(`Pages: ${files.length}`);
  console.log('\n--- Meta & Head ---');
  Object.entries(counters).forEach(([k, v]) => {
    if (v > 0) console.log(`  ${v}× ${k}`);
  });
  console.log('\n--- Duplicates ---');
  console.log(`  ${dupTitles.length} duplicate title groups`);
  console.log(`  ${dupDescs.length} duplicate description groups`);
  console.log('\n--- Technical ---');
  console.log(`  robots.txt: ${robotsIssues.length ? robotsIssues.join('; ') : 'OK'}`);
  console.log(`  sitemap.xml URLs: ${xmlUrls.length}`);
  console.log(`  sitemap issues: ${sitemapIssues.length ? sitemapIssues.join('; ') : 'OK'}`);
  console.log(`  root assets: ${rootAssets.length ? rootAssets.join(', ') : 'OK'}`);
  console.log(`  hreflang pages: ${report.sections.hreflang.pagesWithHreflang} (expected 0 for single-locale)`);
  console.log('\n--- Schema ---');
  console.log(`  Product schema nodes: ${productSchemaCount}`);
  console.log(`  With offers: ${productWithOffer}`);
  console.log('\n--- Images ---');
  console.log(`  img missing alt: ${counters.imgNoAlt}`);
  console.log(`  img empty alt: ${counters.imgEmptyAlt}`);
  console.log('\n--- Internal links ---');
  console.log(`  Unique broken internal link patterns: ${brokenInternal.size}`);
  brokenInternal.size &&
    [...brokenInternal.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([k, c]) => console.log(`    ${c}× ${k}`));
  console.log(`\nPages with any issue: ${report.issues.length}`);
  console.log(`Report: data/seo-full-report.json`);

  const critical =
    counters.missingTitle ||
    counters.missingDesc ||
    counters.missingCanonical ||
    counters.canonicalMismatch ||
    counters.noH1 ||
    counters.invalidJsonLd ||
    robotsIssues.length ||
    rootAssets.length;
  process.exit(critical ? 1 : 0);
}

main();
