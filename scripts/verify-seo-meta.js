const fs = require('fs');
const path = require('path');
const { SITE_URL } = require('./lib/utils');
const { loadCsvMap, getSeoMeta } = require('./lib/seo-meta');
const { generateCanonicalUrl } = require('./lib/canonical');

const ROOT = path.join(__dirname, '..');
const MIN_DESC = 70;
const MAX_TITLE = 60;
const MAX_DESC = 160;

function walkHtml(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules', 'css', 'js', 'assets', 'wp-content', 'tools', 'src', 'scripts', 'data'].includes(name)) continue;
      walkHtml(full, list);
    } else if (name === 'index.html') {
      list.push(full);
    }
  }
  return list;
}

function extractMeta(html) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
  };
  return {
    title: pick(/<title>([^<]*)<\/title>/i),
    description: pick(/<meta name="description" content="([^"]*)"/i),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/i),
    robots: pick(/<meta name="robots" content="([^"]*)"/i),
    keywords: pick(/<meta name="keywords" content="([^"]*)"/i),
    ogTitle: pick(/<meta property="og:title" content="([^"]*)"/i),
    ogDescription: pick(/<meta property="og:description" content="([^"]*)"/i),
    ogUrl: pick(/<meta property="og:url" content="([^"]*)"/i),
  };
}

function slugFromFile(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '';
  return rel.replace(/\/index\.html$/, '');
}

function expectedCanonical(slug) {
  if (!slug) return generateCanonicalUrl('/');
  return generateCanonicalUrl(`/${slug}`);
}

function main() {
  const files = walkHtml(ROOT).sort();
  const csvMap = loadCsvMap(ROOT);
  const issues = [];
  const titleMap = new Map();
  const stats = { total: files.length, ok: 0, withCsv: 0, csvMatch: 0 };

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const meta = extractMeta(html);
    const slug = slugFromFile(file);
    const rel = slug || '(home)';
    const pageIssues = [];

    if (!meta.title) pageIssues.push('missing <title>');
    if (!meta.description) pageIssues.push('missing meta description');
    if (!meta.canonical) pageIssues.push('missing canonical');
    if (!meta.ogTitle) pageIssues.push('missing og:title');
    if (!meta.ogDescription) pageIssues.push('missing og:description');

    if (meta.title && meta.title.length > MAX_TITLE) {
      pageIssues.push(`title too long (${meta.title.length} chars)`);
    }
    if (meta.description && meta.description.length < MIN_DESC) {
      pageIssues.push(`description too short (${meta.description.length} chars)`);
    }
    if (meta.description && meta.description.length > MAX_DESC) {
      pageIssues.push(`description too long (${meta.description.length} chars)`);
    }

    const expected = expectedCanonical(slug);
    if (meta.canonical && meta.canonical !== expected) {
      pageIssues.push(`canonical mismatch: got ${meta.canonical}, expected ${expected}`);
    }
    if (meta.ogUrl && meta.canonical && meta.ogUrl !== meta.canonical) {
      pageIssues.push('og:url !== canonical');
    }
    if (meta.title && meta.ogTitle && meta.title !== meta.ogTitle) {
      pageIssues.push('title !== og:title');
    }

    if (meta.title) {
      const key = meta.title.toLowerCase();
      if (!titleMap.has(key)) titleMap.set(key, []);
      titleMap.get(key).push(rel);
    }

    const csv = getSeoMeta(slug, ROOT) || (slug ? null : getSeoMeta('Seordp.net', ROOT));
    if (csv?.meta_title) {
      stats.withCsv++;
      const csvTitle = csv.meta_title.trim();
      if (meta.title && meta.title.includes(csvTitle.slice(0, Math.min(30, csvTitle.length)))) {
        stats.csvMatch++;
      } else if (!meta.title.toLowerCase().includes(csvTitle.toLowerCase().slice(0, 20))) {
        pageIssues.push(`CSV title mismatch (csv: "${csvTitle.slice(0, 50)}…")`);
      }
    }

    if (pageIssues.length) {
      issues.push({ page: rel, ...meta, issues: pageIssues });
    } else {
      stats.ok++;
    }
  }

  const dupTitles = [...titleMap.entries()].filter(([, pages]) => pages.length > 1);

  console.log('=== SEO Meta Verification ===');
  console.log(`Site: ${SITE_URL}`);
  console.log(`Pages scanned: ${stats.total}`);
  console.log(`Pages with no issues: ${stats.ok}`);
  console.log(`Pages with issues: ${issues.length}`);
  console.log(`CSV entries loaded: ${csvMap.size}`);
  console.log(`Pages with CSV meta: ${stats.withCsv}`);
  console.log(`Duplicate titles: ${dupTitles.length} groups`);

  if (dupTitles.length) {
    console.log('\n--- Duplicate titles (first 10) ---');
    dupTitles.slice(0, 10).forEach(([title, pages]) => {
      console.log(`  "${title.slice(0, 55)}${title.length > 55 ? '…' : ''}" → ${pages.length} pages`);
      console.log(`    e.g. ${pages.slice(0, 3).join(', ')}`);
    });
  }

  if (issues.length) {
    console.log('\n--- Issues by type ---');
    const byType = {};
    for (const row of issues) {
      for (const i of row.issues) {
        const type = i.split('(')[0].split(':')[0].trim();
        byType[type] = (byType[type] || 0) + 1;
      }
    }
    Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([k, v]) => console.log(`  ${v}× ${k}`));

    console.log('\n--- Sample pages with issues (first 25) ---');
    issues.slice(0, 25).forEach((row) => {
      console.log(`\n[${row.page}]`);
      console.log(`  title: ${row.title?.slice(0, 70) || '(none)'}`);
      console.log(`  desc: ${row.description?.slice(0, 80) || '(none)'}…`);
      row.issues.forEach((i) => console.log(`  ⚠ ${i}`));
    });
  } else {
    console.log('\n✓ All pages pass basic SEO meta checks.');
  }

  const reportPath = path.join(ROOT, 'data', 'seo-verify-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), stats, issues, duplicateTitles: dupTitles.map(([t, p]) => ({ title: t, pages: p })) }, null, 2)
  );
  console.log(`\nFull report: data/seo-verify-report.json`);

  process.exit(issues.length > 0 ? 1 : 0);
}

main();
