const { assetPrefix } = require('./utils');

/** Legacy paths → flat slug on static site */
const SLUG_ALIASES = {
  'single-tools-list': 'products',
  'single-tools-list/': 'products',
  'pages/single-tools-list': 'products',
  'refund-returns': 'return-and-refund-policy',
  'refund_returns-2': 'return-and-refund-policy',
  'small-plan': 'combo-seo-tools-small',
  'mega-plan': 'combo-mega-pack-tools',
  'lite-plan': 'combo-seo-tools-basic-plan',
  'ahrefs-combo': 'ahrefs-group-buy',
  'writer-plan': 'content-and-writting',
};

function normalizeSlug(raw) {
  let s = (raw || '').trim().replace(/^\/+|\/+$/g, '');
  if (!s || s === 'index.html') return '';
  if (s.startsWith('pages/')) s = s.slice(6);
  if (s.startsWith('products/')) s = s.slice(9);
  if (s.startsWith('blog/')) s = s.slice(5);
  return SLUG_ALIASES[s] || s;
}

function hrefHome(depth) {
  return depth === 0 ? './' : assetPrefix(depth);
}

function hrefPage(slug, depth) {
  const p = assetPrefix(depth);
  const s = normalizeSlug(slug);
  if (!s) return hrefHome(depth);
  return `${p}${s}/`;
}

function hrefProduct(slug, depth) {
  return hrefPage(slug, depth);
}

function localizeInternalLinks(html, depth) {
  if (!html) return '';
  const p = assetPrefix(depth);
  let out = html;

  out = out.replace(
    /href=["']https?:\/\/(?:www\.)?seordp\.net([^"']*)["']/gi,
    (match, pathPart) => {
      const path = (pathPart || '').split('#')[0].split('?')[0];
      const hash = (pathPart || '').includes('#') ? pathPart.slice(pathPart.indexOf('#')) : '';
      if (!path || path === '/') return `href="${hrefHome(depth)}"`;
      const slug = normalizeSlug(path.replace(/^\//, ''));
      return `href="${p}${slug}/${hash}"`;
    }
  );

  // WP plan pages often omit closing quote: href="/pages/slug">View Details
  out = out.replace(/href=["']\/pages\/([^"'#?>\s]+)\/?["']?(?=>)/gi, (match, slug) => {
    const fixed = normalizeSlug(slug);
    return `href="${p}${fixed}/"`;
  });

  out = out.replace(/href=["']\/pages\/([^"'#?]+)["']/gi, (match, slug) => {
    const fixed = normalizeSlug(slug);
    return `href="${p}${fixed}/"`;
  });

  out = out.replace(/href=["']\/blog\/([^"'#?]+)([#"']?[^"']*)["']/gi, (match, slug, extra) => {
    const fixed = normalizeSlug(slug);
    const suffix = (extra || '').startsWith('#') ? extra : '';
    return `href="${p}${fixed}/${suffix}"`;
  });

  out = out.replace(/href=["']\/([^"'#?>\s]+)\/?["']?(?=>)/gi, (match, path) => {
    if (path.startsWith('wp-content/')) return match;
    const slug = normalizeSlug(path);
    return `href="${p}${slug}/"`;
  });

  out = out.replace(/href=["']\/([^"'#?]+)["']/gi, (match, path) => {
    if (path.startsWith('wp-content/')) return match;
    const slug = normalizeSlug(path);
    return `href="${p}${slug}/"`;
  });

  Object.entries(SLUG_ALIASES).forEach(([broken, correct]) => {
    const re = new RegExp(
      `href=["'](?:https?:\\/\\/(?:www\\.)?seordp\\.net\\/)?${broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/?["']`,
      'gi'
    );
    out = out.replace(re, `href="${p}${correct}/"`);
  });

  return out;
}

module.exports = {
  SLUG_ALIASES,
  normalizeSlug,
  hrefHome,
  hrefPage,
  hrefProduct,
  localizeInternalLinks,
};
