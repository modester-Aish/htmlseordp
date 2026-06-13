/** Original SEORDP product copy for Product Details. Short prose. No scraped text. */

const BANNED = /groupbuyseotools|group buy seo tools|groupbuyseotools\.org|xrefs|graphics store|google drive|envato|placeit\.net/gi;

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function proseClean(text) {
  return (text || '')
    .replace(BANNED, 'SEORDP')
    .replace(/[,–—−]/g, ' ')
    .replace(/\s-\s/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugToDisplayName(slug, fallback) {
  let name = (slug || '')
    .replace(/-group-buy.*$/i, '')
    .replace(/-group.*$/i, '')
    .replace(/-combo.*$/i, '')
    .replace(/-plan.*$/i, '')
    .replace(/-202[0-9].*$/i, '')
    .replace(/-/g, ' ')
    .trim();
  if (!name || name.length < 2) name = (fallback || 'Premium Tool').toLowerCase();
  name = name
    .split(/\s+/)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
  return proseClean(name);
}

function getDisplayName(product) {
  const raw = (product.h1 || product.name || '').replace(/\s*\|\s*SEORDP.*$/i, '').trim();
  const cleaned = proseClean(
    raw
      .replace(/\s+group buy.*$/i, '')
      .replace(/\s+just with.*$/i, '')
      .replace(/\s+\d+\.?\d*\s*\$.*$/i, '')
      .trim()
  );
  if (cleaned.length > 2) return cleaned;
  return slugToDisplayName(product.slug, product.name);
}

function categoryKind(categories) {
  const c = (categories || []).join(' ').toLowerCase();
  if (/combo|pack|plan|bundle/.test(c)) return 'combo';
  if (/amazon|ebay|ecom|seller|shop|dropship/.test(c)) return 'ecom';
  if (/ai|gpt|chat|write|content|copy/.test(c)) return 'ai';
  if (/design|mockup|logo|graphic|photo|video|anim/.test(c)) return 'creative';
  if (/seo|keyword|backlink|rank|semrush|ahrefs|moz/.test(c)) return 'seo';
  return 'general';
}

const INTROS = {
  seo: [
    '{name} helps you research keywords track rankings and improve search visibility.',
    '{name} gives SEO teams the data they need for audits and competitor research.',
    '{name} is a strong pick for daily keyword and backlink work on a budget.',
  ],
  ai: [
    '{name} uses AI to speed up writing research and content planning.',
    '{name} helps creators finish drafts faster with smart suggestions.',
    '{name} brings premium AI features to your workflow through SEORDP.',
  ],
  creative: [
    '{name} helps you create visuals mockups and social assets quickly.',
    '{name} gives designers templates and export ready files in one place.',
    '{name} is ideal for brands that need fresh creative work every week.',
  ],
  ecom: [
    '{name} helps online sellers find products and grow store revenue.',
    '{name} gives marketplace sellers useful product and niche insights.',
    '{name} supports Amazon eBay and similar platforms with research tools.',
  ],
  combo: [
    '{name} bundles many premium tools into one affordable SEORDP plan.',
    '{name} lets you access a full tool stack without full retail pricing.',
    '{name} is our value pack for teams that need multiple premium apps.',
  ],
  general: [
    '{name} is a premium online tool available through SEORDP group buy access.',
    '{name} gives you shared premium access at a fraction of normal cost.',
    '{name} helps freelancers and agencies use top tools on a small budget.',
  ],
};

const FEATURES = {
  seo: ['Keyword research', 'Rank tracking', 'Site audit data'],
  ai: ['AI writing help', 'Fast content drafts', 'Simple web login'],
  creative: ['Design templates', 'HD exports', 'Quick mockups'],
  ecom: ['Product research', 'Niche ideas', 'Store insights'],
  combo: ['Many tools in one plan', 'Shared stable login', 'Low monthly fee'],
  general: ['Full premium access', 'Browser based login', 'Fast activation'],
};

const CLOSINGS = [
  'Start on SEORDP for {price} per month with instant member access.',
  'Join SEORDP today and unlock {name} without paying full retail cost.',
  'Get stable shared access to {name} through your SEORDP account.',
];

const CARD_BLURBS = [
  'Get {name} on SEORDP with instant access and a low monthly price.',
  'Shared {name} access on SEORDP with fast setup and stable login.',
  'Unlock {name} through SEORDP at a fraction of the normal cost.',
];

function pick(list, seed) {
  return list[seed % list.length];
}

/** Short HTML for Product Details section (no long articles) */
function buildShortDescription(name, kind, seed, priceFormatted) {
  const intro = proseClean(pick(INTROS[kind] || INTROS.general, seed).replace(/\{name\}/g, name));
  const feats = FEATURES[kind] || FEATURES.general;
  const items = feats.map((f) => `<li>${proseClean(f)}</li>`).join('');
  const closing = proseClean(
    pick(CLOSINGS, seed + 2)
      .replace(/\{name\}/g, name)
      .replace(/\{price\}/g, priceFormatted || '$4.99')
  );
  return `<p>${intro}</p><ul>${items}</ul><p>${closing}</p>`;
}

function buildCardBlurb(name, seed) {
  return proseClean(pick(CARD_BLURBS, seed).replace(/\{name\}/g, name));
}

/** Keep real product meta and images. Replace scraped body with custom short copy. */
function applyCustomDescription(product, priceFormatted) {
  const name = getDisplayName(product);
  const seed = hashSlug(product.slug);
  const kind = categoryKind(product.categories);
  const price = priceFormatted || '$4.99';

  return {
    ...product,
    customDescription: buildShortDescription(name, kind, seed, price),
    customShort: buildCardBlurb(name, seed),
  };
}

module.exports = {
  applyCustomDescription,
  getDisplayName,
  slugToDisplayName,
  proseClean,
  buildShortDescription,
};
