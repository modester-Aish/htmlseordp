const { SITE_URL } = require('./utils');

const DEFAULT_OG_IMAGE_URL = `${SITE_URL}/icon.svg`;
const PATH_FILE_EXT = /\.[a-z0-9][a-z0-9._-]*$/i;
const MAX_META_TITLE_LENGTH = 60;
const MAX_META_DESC_LENGTH = 155;
const GENERIC_SHORT_META_DESC = 'Access premium SEO tools at seordp.net.';
const DEFAULT_META_DESC =
  'Group buy SEO tools: Ahrefs, SEMrush, Moz Pro and 60+ premium tools at low cost. Get started at seordp.net.';

function withTrailingSlashPath(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') return '/';
  const pathOnly = cleanPath.split(/[?#]/)[0];
  if (PATH_FILE_EXT.test(pathOnly)) return cleanPath;
  return cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
}

function generateCanonicalUrl(path) {
  const base = SITE_URL.replace(/\/$/, '');
  return `${base}${withTrailingSlashPath(path || '/')}`;
}

function truncateMetaTitle(title, maxLen = MAX_META_TITLE_LENGTH) {
  const t = (title || '').trim();
  if (t.length <= maxLen) return t;
  const cut = t.substring(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > maxLen * 0.6 ? cut.substring(0, lastSpace) : cut;
}

function truncateMetaDescription(desc, maxLen = MAX_META_DESC_LENGTH) {
  const d = (desc || '').trim();
  if (d.length <= maxLen) return d;
  const cut = d.substring(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > maxLen * 0.7 ? cut.substring(0, lastSpace) : cut;
}

function ensureMinDescriptionLength(desc, fallbackSuffix = ' Get started at seordp.net.') {
  let d = (desc || '').trim();
  if (!d || d === GENERIC_SHORT_META_DESC || (d.length < 50 && d.toLowerCase().includes('seordp.net'))) {
    d = DEFAULT_META_DESC;
  }
  if (d.length >= 70) return truncateMetaDescription(d);
  const extended = (d + fallbackSuffix).trim();
  if (extended.length >= 70) return truncateMetaDescription(extended);
  return DEFAULT_META_DESC;
}

function toCanonicalPath(input) {
  if (!input) return '/';
  if (input.startsWith('http')) {
    try {
      return withTrailingSlashPath(new URL(input).pathname);
    } catch {
      return '/';
    }
  }
  return withTrailingSlashPath(input.startsWith('/') ? input : `/${input}`);
}

function absoluteAssetUrl(relativePath) {
  if (!relativePath) return DEFAULT_OG_IMAGE_URL;
  if (relativePath.startsWith('http')) return relativePath;
  const clean = relativePath.replace(/^\//, '');
  return `${SITE_URL}/${clean}`;
}

module.exports = {
  DEFAULT_OG_IMAGE_URL,
  MAX_META_TITLE_LENGTH,
  MAX_META_DESC_LENGTH,
  withTrailingSlashPath,
  generateCanonicalUrl,
  truncateMetaTitle,
  truncateMetaDescription,
  ensureMinDescriptionLength,
  toCanonicalPath,
  absoluteAssetUrl,
};
