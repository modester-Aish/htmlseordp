const {
  generateCanonicalUrl,
  truncateMetaTitle,
  ensureMinDescriptionLength,
  DEFAULT_OG_IMAGE_URL,
  MAX_META_TITLE_LENGTH,
  toCanonicalPath,
  absoluteAssetUrl,
} = require('./canonical');

const BRAND_SUFFIX = ' | SEORDP';

function escapeMeta(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatTitle(title) {
  const raw = (title || '').trim();
  if (!raw) return truncateMetaTitle('SEORDP');
  if (/SEORDP|Group Buy SEO Tools/i.test(raw)) return truncateMetaTitle(raw);
  const maxContent = MAX_META_TITLE_LENGTH - BRAND_SUFFIX.length;
  return `${truncateMetaTitle(raw, maxContent)}${BRAND_SUFFIX}`;
}

function productKeywords(name) {
  const n = name || 'SEO tool';
  return `${n} group buy, ${n} cheap, ${n} discount, buy ${n}, seo tools, group buy tools`;
}

function buildSeo({
  title,
  description,
  canonicalPath,
  keywords,
  ogType = 'website',
  ogImage,
  twitterCard = 'summary_large_image',
  robots = 'index,follow',
  articlePublished,
  articleModified,
}) {
  const metaTitle = formatTitle(title);
  const metaDescription = ensureMinDescriptionLength(description);
  const canonical = generateCanonicalUrl(toCanonicalPath(canonicalPath));
  const image = absoluteAssetUrl(ogImage || 'icon.svg');

  return {
    title: metaTitle,
    description: metaDescription,
    canonical,
    keywords,
    ogType,
    ogImage: image,
    twitterCard,
    robots,
    articlePublished,
    articleModified,
  };
}

function renderSeoTags(seo) {
  const robots = seo.robots || 'index,follow';
  const googlebot = /noindex/i.test(robots)
    ? 'noindex,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  const lines = [
    `<meta name="robots" content="${escapeMeta(robots)}">`,
    `<meta name="googlebot" content="${googlebot}">`,
    `<meta name="author" content="SEORDP">`,
    `<meta name="publisher" content="SEORDP">`,
    `<link rel="canonical" href="${escapeMeta(seo.canonical)}">`,
  ];

  if (seo.keywords) {
    lines.push(`<meta name="keywords" content="${escapeMeta(seo.keywords)}">`);
  }

  lines.push(
    `<meta property="og:title" content="${escapeMeta(seo.title)}">`,
    `<meta property="og:description" content="${escapeMeta(seo.description)}">`,
    `<meta property="og:url" content="${escapeMeta(seo.canonical)}">`,
    `<meta property="og:site_name" content="SEORDP">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta property="og:type" content="${escapeMeta(seo.ogType || 'website')}">`,
    `<meta property="og:image" content="${escapeMeta(seo.ogImage || DEFAULT_OG_IMAGE_URL)}">`,
    `<meta name="twitter:card" content="${escapeMeta(seo.twitterCard || 'summary_large_image')}">`,
    `<meta name="twitter:site" content="@seordp">`,
    `<meta name="twitter:creator" content="@seordp">`,
    `<meta name="twitter:title" content="${escapeMeta(seo.title)}">`,
    `<meta name="twitter:description" content="${escapeMeta(seo.description)}">`,
    `<meta name="twitter:image" content="${escapeMeta(seo.ogImage || DEFAULT_OG_IMAGE_URL)}">`,
    `<meta name="google-site-verification" content="7COb5S87UR-31vp9SChMAtLqfx88VrJJuFzcCzXhUq0">`
  );

  if (seo.ogType === 'article' && seo.articlePublished) {
    lines.push(`<meta property="article:published_time" content="${escapeMeta(seo.articlePublished)}">`);
  }
  if (seo.ogType === 'article' && seo.articleModified) {
    lines.push(`<meta property="article:modified_time" content="${escapeMeta(seo.articleModified)}">`);
  }

  return lines.join('\n  ');
}

module.exports = {
  escapeMeta,
  formatTitle,
  productKeywords,
  buildSeo,
  renderSeoTags,
};
