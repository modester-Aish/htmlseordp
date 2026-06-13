function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...');
}

function stripTags(html) {
  return (html || '').replace(/<[^>]*>/g, '');
}

function cleanPageTitle(title) {
  return decodeHtmlEntities(stripTags(title));
}

function assetPrefix(depth) {
  return depth === 0 ? '' : '../'.repeat(depth);
}

function truncate(text, len) {
  const t = (text || '').trim();
  return t.length <= len ? t : t.slice(0, len - 3) + '...';
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function readingTime(html) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getFeaturedImageUrl(post) {
  const embedded = post._embedded?.['wp:featuredmedia']?.[0];
  if (!embedded) return null;
  const url = embedded.source_url || embedded.media_details?.sizes?.large?.source_url;
  if (!url) return null;
  const { toLocalUploadUrl } = require('./content-parser');
  return toLocalUploadUrl(url) || url;
}

function getTitle(item) {
  return cleanPageTitle(item.title?.rendered || '');
}

function getContent(item) {
  return item.content?.rendered || '';
}

function getExcerpt(item) {
  return decodeHtmlEntities(stripTags(item.excerpt?.rendered || ''));
}

const EXCLUDED_PAGE_SLUGS = [
  'shop-2',
  'refund_returns-2',
  'single-seo-tools',
  'cheapest-group-buy-seo-tools-provide-100-premium-tools',
];

const SITE_URL = 'https://seordp.net';

module.exports = {
  decodeHtmlEntities,
  stripTags,
  cleanPageTitle,
  assetPrefix,
  truncate,
  formatDate,
  readingTime,
  getFeaturedImageUrl,
  getTitle,
  getContent,
  getExcerpt,
  EXCLUDED_PAGE_SLUGS,
  SITE_URL,
};
