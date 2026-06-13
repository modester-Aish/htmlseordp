const fs = require('fs');
const path = require('path');
const { truncateMetaTitle, ensureMinDescriptionLength, MAX_META_TITLE_LENGTH } = require('./canonical');

const BRAND_SUFFIX = ' | SEORDP';

let cache = null;

const PAGE_SEO_DEFAULTS = {
  'seordp.net': {
    title: 'Group Buy SEO Tools 2025 | Ahrefs, SEMrush & 50+ Tools',
    description:
      'Access Ahrefs, SEMrush, Moz Pro, ChatGPT Plus, Canva Pro, and 50+ premium SEO tools in one place. Built for daily SEO work with simple access and support.',
  },
  products: {
    title: 'Products | Group Buy SEO Tools',
    description:
      'Browse 400+ premium SEO and AI tools at group buy prices. Ahrefs, SEMrush, Moz Pro and more with instant access at SEORDP.',
  },
  pages: {
    title: 'SEO Tools Pricing, Plans & Information',
    description:
      'Explore group buy SEO tools pricing plans, packages, and detailed information about SEORDP services.',
  },
  blog: {
    title: 'SEO Blog - Tips, Tutorials & Best Practices',
    description:
      'Learn SEO strategies, group buy tools tutorials, and digital marketing insights from the SEORDP blog.',
  },
  'contact-us': {
    title: 'Contact Us',
    description:
      'Get in touch with SEORDP support for SEO tools, group buy plans, billing questions, or partnerships.',
  },
  'about-us': {
    title: 'About Us | Group Buy SEO Tools',
    description:
      'Learn about SEORDP — a trusted group buy SEO tools provider offering affordable access to Ahrefs, SEMrush, and 50+ premium tools.',
  },
  'dmca-policy': {
    title: 'DMCA Policy | SEORDP',
    description:
      'SEORDP DMCA copyright policy. Learn how to report copyright infringement and understand our takedown process.',
  },
  'privacy-policy-3': {
    title: 'Privacy Policy | SEORDP',
    description:
      'Read the SEORDP privacy policy to understand how we collect, use, and protect your personal information.',
  },
  'terms-of-service': {
    title: 'Terms of Service | SEORDP',
    description:
      'SEORDP terms of service — rules, responsibilities, and conditions for using our group buy SEO tools platform.',
  },
  'return-and-refund-policy': {
    title: 'Return and Refund Policy | SEORDP',
    description:
      'SEORDP return and refund policy. Learn about our 24-hour refund guarantee and how to request a refund.',
  },
  'editorial-guidelines': {
    title: 'Editorial Guidelines | SEORDP',
    description:
      'SEORDP editorial guidelines for content quality, accuracy, and standards across our SEO tools resources.',
  },
  'pricing-plans': {
    title: 'Pricing Plans – 60+ SEO Tools at Low Cost',
    description:
      'Compare SEORDP pricing plans and bundles. Get affordable access to 60+ premium SEO tools starting from $10/month.',
  },
  'get-support': {
    title: 'Get Support | SEORDP',
    description:
      'Need help with SEORDP? Contact our support team for tool access, billing, or technical assistance.',
  },
  'introduction-to-group-buy-seo-tools': {
    title: 'Introduction to Group Buy SEO Tools',
    description:
      'New to group buy SEO tools? Learn how shared access works, what tools are included, and how to get started at SEORDP.',
  },
  'seo-tools-list-2025': {
    title: 'SEO Tools List 2025 – Top Premium Tools Cheap',
    description:
      'Browse 100+ premium SEO tools in our 2025 list. Get Ahrefs, SEMrush, Moz and more at low group buy prices.',
  },
  sitemap: {
    title: 'HTML Sitemap',
    description: 'Complete sitemap of SEORDP pages and products. Browse all tools and information pages.',
  },
  search: {
    title: 'Search',
    description: 'Search SEORDP products, pages, and resources.',
  },
};

function fixEncodingArtifacts(s) {
  return (s || '').replace(/â€"/g, '-');
}

function normalizeKey(key) {
  return key
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function stripHtml(s) {
  return (s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function labelTokens(...labels) {
  const tokens = new Set();
  for (const label of labels) {
    const raw = stripHtml(label).toLowerCase();
    raw
      .replace(/group buy/gi, ' ')
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 4)
      .forEach((t) => tokens.add(t));
    const compact = raw.replace(/[^a-z0-9]/g, '');
    if (compact.length >= 4) tokens.add(compact);
  }
  return [...tokens];
}

function descriptionMatchesPage(desc, labels) {
  const d = stripHtml(desc).toLowerCase();
  if (!d || d.length < 20) return false;
  const tokens = labelTokens(...labels);
  if (!tokens.length) return true;
  return tokens.some((t) => d.includes(t));
}

function getPageDefaults(pageNameOrSlug) {
  const key = normalizeKey(pageNameOrSlug);
  return PAGE_SEO_DEFAULTS[key] || null;
}

function parseCsvLine(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i += 1;
      let val = '';
      while (i < line.length && line[i] !== '"') {
        val += line[i];
        i += 1;
      }
      if (line[i] === '"') i += 1;
      out.push(val.trim());
      if (line[i] === ',') i += 1;
    } else {
      let val = '';
      while (i < line.length && line[i] !== ',') {
        val += line[i];
        i += 1;
      }
      out.push(val.trim());
      if (line[i] === ',') i += 1;
    }
  }
  return out;
}

function loadCsvMap(root) {
  if (cache) return cache;
  const csvPath = path.join(root, 'data', 'seo-meta.csv');
  if (!fs.existsSync(csvPath)) {
    cache = new Map();
    return cache;
  }
  const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length < 4) continue;
    const [page_name, meta_title, meta_description, h1] = row;
    if (!page_name) continue;
    const entry = {
      meta_title: meta_title || '',
      meta_description: meta_description || '',
      h1: h1 || '',
    };
    map.set(normalizeKey(page_name), entry);
    map.set(page_name.trim(), entry);
  }
  cache = map;
  return map;
}

function resetSeoMetaCache() {
  cache = null;
}

function getSeoMeta(pageNameOrSlug, root) {
  const map = loadCsvMap(root);
  const trimmed = (pageNameOrSlug || '').trim();
  let row = map.get(trimmed) || map.get(normalizeKey(trimmed)) || null;
  if (!row) return null;
  return {
    meta_title: fixEncodingArtifacts(row.meta_title.trim()),
    meta_description: fixEncodingArtifacts(row.meta_description),
    h1: fixEncodingArtifacts(row.h1),
  };
}

function slugQualifier(slug) {
  if (!slug) return '';
  if (slug.includes('-group-buy-')) {
    return slug
      .split('-group-buy-')[1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  if (slug.endsWith('-group-buy')) {
    return 'Plans';
  }
  if (slug.endsWith('-renew')) return 'Renew';
  if (slug.endsWith('-new') || slug.endsWith('-2')) return 'New';
  const yearMatch = slug.match(/-(\d{4})$/);
  if (yearMatch) return yearMatch[1];
  return '';
}

function resolveProductTitle(product) {
  const name = product.h1 || product.name || product.slug;
  let title = (product.metaTitle || `${name} | Group Buy SEO Tools`).replace(/\s*\|\s*SEORDP\s*$/i, '').trim();

  const qualifier = slugQualifier(product.slug);
  if (qualifier && !title.toLowerCase().includes(qualifier.toLowerCase())) {
    const qualSuffix = ` – ${qualifier}`;
    const needsBrand = !/SEORDP|Group Buy SEO Tools/i.test(title);
    const brandLen = needsBrand ? BRAND_SUFFIX.length : 0;
    const maxBase = MAX_META_TITLE_LENGTH - brandLen - qualSuffix.length;
    title = truncateMetaTitle(title, maxBase) + qualSuffix;
  }

  return title;
}

function pickProductDescription(product, priceFormatted) {
  const name = product.h1 || product.name || product.slug;
  const labels = [name, product.name, product.slug, product.slug.replace(/-/g, ' ')];
  const candidates = [product.metaDescription, product.customShort, product.shortDescription].map(stripHtml);

  for (const c of candidates) {
    if (c && descriptionMatchesPage(c, labels)) return c;
  }

  const price = priceFormatted || '$4.99';
  return `Get ${name} group buy access at ${price}/month on SEORDP. Instant activation, shared premium SEO tool access, and affordable monthly pricing for freelancers and agencies.`;
}

function enrichProduct(product, root) {
  const seo = getSeoMeta(product.slug, root) || getSeoMeta(product.name, root);
  const base = { ...product };
  const labels = [product.name, product.slug, product.h1, product.slug.replace(/-/g, ' ')];

  if (seo?.meta_title) base.metaTitle = seo.meta_title;
  if (seo?.meta_description && descriptionMatchesPage(seo.meta_description, labels)) {
    base.metaDescription = seo.meta_description;
  }
  if (seo?.h1) base.h1 = seo.h1;

  if (!base.metaTitle && base.name) base.metaTitle = `${base.name} | Group Buy SEO Tools`;
  if (!base.h1) base.h1 = base.name;
  return base;
}

function buildProductSeo(product, priceFormatted) {
  const name = product.h1 || product.name;
  const title = resolveProductTitle(product);
  const description = ensureMinDescriptionLength(pickProductDescription(product, priceFormatted));
  return { title, description, name };
}

function getVerifiedPageSeo(csvKey, root, extraLabels = []) {
  const key = csvKey || '';
  const defaults = getPageDefaults(normalizeKey(key)) || getPageDefaults(key);
  const seo = getSeoMeta(key, root);
  const labels = [key, defaults?.title, ...extraLabels].filter(Boolean);

  const title = seo?.meta_title || defaults?.title || key;
  let description = seo?.meta_description || defaults?.description || '';
  if (!descriptionMatchesPage(description, labels)) {
    description = defaults?.description || description;
  }
  return {
    title,
    description: ensureMinDescriptionLength(description || title),
  };
}

function buildPageSeoFromWp(item, root, csvKey) {
  const slug = item.slug || '';
  const defaults = getPageDefaults(csvKey || slug);
  const seo = getSeoMeta(csvKey || slug, root);
  const pageTitle = stripHtml(item.title?.rendered || '') || defaults?.title || slug;
  const labels = [csvKey, slug, pageTitle, defaults?.title].filter(Boolean);

  let title = seo?.meta_title || defaults?.title || pageTitle;
  let rawDesc = stripHtml(seo?.meta_description || item.excerpt?.rendered || '');

  if (!descriptionMatchesPage(rawDesc, labels)) {
    rawDesc = defaults?.description || rawDesc;
  }
  if (!descriptionMatchesPage(rawDesc, labels)) {
    rawDesc = defaults?.description || `Learn about ${pageTitle} on SEORDP. Affordable group buy access to premium SEO tools.`;
  }

  const description = ensureMinDescriptionLength(rawDesc || title);
  return { title, description };
}

module.exports = {
  getSeoMeta,
  getPageDefaults,
  getVerifiedPageSeo,
  enrichProduct,
  loadCsvMap,
  resetSeoMetaCache,
  buildProductSeo,
  buildPageSeoFromWp,
  descriptionMatchesPage,
  resolveProductTitle,
  pickProductDescription,
};
