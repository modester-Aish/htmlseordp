const { wrapPage } = require('./layout');
const { assetPrefix } = require('./utils');
const { buildProductSeo, getVerifiedPageSeo } = require('./seo-meta');
const { buildSeo: buildSeoMeta, productKeywords } = require('./seo-head');
const { productGraph, productsListingGraph } = require('./structured-data');
const path = require('path');
const { cleanDescriptionHtml, cleanProductDescriptionHtml } = require('./sanitize-html');
const { ensureImgAlt, removeFirstHeading, downgradeH1ToH2 } = require('./content-parser');
const { localizeInternalLinks, hrefPage, hrefProduct } = require('./internal-links');

const SIGNUP_URL = 'https://members.seotoolsgroupbuy.us/signup';

/** Canonical shop categories — scraped data includes many duplicate SEO keyword “categories”. */
const PRIMARY_CATEGORIES = new Map([
  ['seo tools', { label: 'SEO Tools', tone: 'teal', icon: '🔍' }],
  ['ai tools', { label: 'AI Tools', tone: 'cyan', icon: '🤖' }],
  ['content and writting', { label: 'Content & Writing', tone: 'purple', icon: '✍️' }],
  ['graphic and design', { label: 'Graphic & Design', tone: 'pink', icon: '🎨' }],
  ['new tools', { label: 'New Tools', tone: 'amber', icon: '✨' }],
  ['spy tools', { label: 'Spy Tools', tone: 'rose', icon: '🕵️' }],
  ['sale tools', { label: 'Sale Tools', tone: 'orange', icon: '🛒' }],
  ['combo seo tools', { label: 'Combo SEO Tools', tone: 'indigo', icon: '📦' }],
  ['affiliate marketing tools', { label: 'Affiliate Marketing', tone: 'lime', icon: '🔗' }],
  ['amazon tools', { label: 'Amazon Tools', tone: 'yellow', icon: '📊' }],
  ['video tools', { label: 'Video Tools', tone: 'violet', icon: '🎬' }],
  ['social media tools', { label: 'Social Media Tools', tone: 'sky', icon: '📱' }],
]);

function escapeHtmlText(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeToken(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isJunkCategory(cat, productName, productSlug) {
  const c = (cat || '').toLowerCase().trim();
  const name = normalizeToken(productName);
  const slug = normalizeToken((productSlug || '').replace(/-/g, ' '));
  const catNorm = normalizeToken(cat);
  if (!c || c.length < 2) return true;
  if (PRIMARY_CATEGORIES.has(c)) return false;
  if (name && (c === name || c === `${name} group buy`)) return true;
  if (/\bgroup\s*buy\b/i.test(c)) return true;
  if (c.startsWith('buy tool ')) return true;
  if (c.startsWith('group buy ')) return true;
  if (catNorm.length >= 4) {
    if (name && (catNorm === name || name.includes(catNorm) || catNorm.includes(name))) return true;
    if (slug && (catNorm === slug || slug.includes(catNorm) || catNorm.includes(slug))) return true;
  }
  return false;
}

function normalizeProductCategories(categories, productName, productSlug) {
  const seen = new Set();
  const out = [];

  for (const cat of categories || []) {
    const key = (cat || '').toLowerCase().trim();
    const primary = PRIMARY_CATEGORIES.get(key);
    if (primary) {
      if (!seen.has(primary.label)) {
        seen.add(primary.label);
        out.push(primary);
      }
      continue;
    }
    if (isJunkCategory(cat, productName, productSlug)) continue;
    const label = (cat || '').trim();
    if (label.length > 36 || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    out.push({ label, tone: 'slate', icon: '📁' });
  }

  if (!out.length) {
    out.push({ label: 'SEO Tools', tone: 'teal', icon: '🔍' });
  }
  return out;
}

function renderCategoryChips(categories, product, depth) {
  const productName = typeof product === 'string' ? product : getProductName(product);
  const productSlug = typeof product === 'string' ? '' : product.slug;
  return normalizeProductCategories(categories, productName, productSlug)
    .map(
      ({ label, tone, icon }) =>
        `<a href="${hrefPage('products', depth)}" class="product-category-chip product-category-chip--${tone}" title="Browse ${escapeHtmlText(label)} tools">
          <span class="product-category-chip__icon" aria-hidden="true">${icon}</span>
          <span class="product-category-chip__label">${escapeHtmlText(label)}</span>
        </a>`
    )
    .join('');
}

function renderTagChips(tags) {
  return (tags || [])
    .map((t) => (t || '').trim())
    .filter((t) => t.length > 0 && t.length <= 40)
    .slice(0, 12)
    .map(
      (t) =>
        `<span class="product-tag-chip">${escapeHtmlText(t)}</span>`
    )
    .join('');
}

const KEY_FEATURES = [
  { icon: '💰', title: '24 Hours Refund Policy', desc: 'Full refund within 24 hours.' },
  { icon: '➡️', title: 'Direct Access', desc: 'Browser-based, no installation.' },
  { icon: '🔥', title: 'Instant Activation', desc: 'Immediate access after payment.' },
  { icon: '🔒', title: 'Data Privacy', desc: 'Your data remains confidential.' },
];

const PROSE_CLASSES =
  'prose prose-lg prose-invert max-w-none product-prose prose-headings:text-white prose-headings:font-bold prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4 prose-li:text-slate-300 prose-li:mb-2 prose-strong:text-white prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-ul:my-4 prose-ol:my-4 prose-img:rounded-lg prose-img:shadow-lg';

const SVG = {
  arrowLeft:
    '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  check:
    '<svg class="h-5 w-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  cart: (size) =>
    `<svg class="${size}" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
};

function starsHtml(rating, sizeClass) {
  const r = Math.min(5, Math.max(0, Math.floor(Number(rating) || 0)));
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < r;
    return `<svg class="${sizeClass} ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }).join('');
}

function extractPriceFromText(text) {
  if (!text) return null;
  const patterns = [
    /only\s*\$\s*(\d+\.?\d*)\s*\/?\s*month/i,
    /price\s+is\s+(\d+\.?\d*)\$/i,
    /(\d+\.?\d*)\s*\$\s*\/?\s*month/i,
    /\$\s*(\d+\.?\d*)\s*\/?\s*month/i,
    /(\d+\.?\d*)\$\s*per/i,
    /\$\s*(\d+\.?\d*)/,
    /(\d+\.?\d*)\$/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 0 && val < 500) return val;
    }
  }
  return null;
}

function getDisplayPrice(product) {
  const fromTitle = extractPriceFromText(product.metaTitle);
  if (fromTitle) return `$${fromTitle.toFixed(2)}`;
  const fromDesc = extractPriceFromText(product.metaDescription);
  if (fromDesc) return `$${fromDesc.toFixed(2)}`;
  const scraped = parseFloat(String(product.price || '').replace(/[^0-9.]/g, ''));
  if (scraped > 0 && scraped < 30) return `$${scraped.toFixed(2)}`;
  return '$4.99';
}

function prepareProductDescription(product, depth) {
  const p = assetPrefix(depth);
  const name = getProductName(product);
  const source = product.customDescription || product.description || '';
  let html = cleanDescriptionHtml(source);
  html = cleanProductDescriptionHtml(html);
  html = removeFirstHeading(html);
  html = downgradeH1ToH2(html);
  html = ensureImgAlt(html, name);
  html = fixAssetPaths(html, p);
  html = localizeInternalLinks(html, depth);
  return html;
}

function fixAssetPaths(html, p) {
  return (html || '')
    .replace(/src=["']assets\//g, `src="${p}assets/`)
    .replace(/src=["']\/assets\//g, `src="${p}assets/`);
}

function prepareShortDescription(product, depth) {
  const p = assetPrefix(depth);
  let html = cleanDescriptionHtml(product.shortDescription || '');
  html = cleanProductDescriptionHtml(html);
  html = fixAssetPaths(html, p);
  return html;
}

function getProductH1(product) {
  return product.h1 || product.name || product.slug;
}

function getProductName(product) {
  return product.name || product.h1 || product.slug;
}

function getRelatedProducts(product, allProducts) {
  const cats = new Set(product.categories || []);
  const sameCat = allProducts.filter(
    (p) => p.slug !== product.slug && (p.categories || []).some((c) => cats.has(c))
  );
  const pool = sameCat.length > 0 ? sameCat : allProducts.filter((p) => p.slug !== product.slug);
  return pool.slice(0, 4);
}

function productImageBlock(product, p, tall) {
  const name = getProductName(product);
  const h = tall ? 'aspect-square' : 'h-48';
  if (product.image) {
    return `<div class="relative w-full ${h} overflow-hidden bg-slate-700">
      <img src="${p}${product.image}" alt="${name}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
    </div>`;
  }
  return `<div class="relative w-full ${h} overflow-hidden bg-slate-700">
    <div class="w-full h-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center border-2 border-dashed border-teal-500/30">
      <span class="text-5xl">📦</span>
    </div>
  </div>`;
}

function productCard(product, depth) {
  const p = assetPrefix(depth);
  const price = getDisplayPrice(product);
  const rating = product.average_rating || 0;
  const reviewCount = product.rating_count || 0;
  const name = getProductName(product);
  const shortRaw = product.customShort
    ? `<p>${product.customShort}</p>`
    : prepareShortDescription(product, depth);
  const short = shortRaw
    ? `<div class="mb-3 text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] product-prose">${shortRaw}</div>`
    : '';

  return `<article class="card-gradient group relative overflow-hidden h-full flex flex-col">
    <a href="${hrefProduct(product.slug, depth)}">${productImageBlock(product, p, false)}</a>
    <div class="p-5 flex flex-col flex-1">
      <a href="${hrefProduct(product.slug, depth)}">
        <h3 class="mb-2 text-lg font-bold text-white transition-colors line-clamp-2 min-h-[3.5rem] group-hover:text-teal-400">${name}</h3>
      </a>
      ${short}
      <div class="mb-4 flex items-center gap-1">
        <div class="flex">${starsHtml(rating, 'h-4 w-4')}</div>
        <span class="text-sm text-slate-400">(${reviewCount})</span>
      </div>
      <div class="mt-auto">
        <div class="flex items-baseline gap-2 mb-3">
          <span class="text-2xl font-bold text-white">${price}</span>
        </div>
        <a href="${SIGNUP_URL}" target="_blank" rel="noopener noreferrer" class="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 btn-primary">
          ${SVG.cart('h-4 w-4')}
          Buy Now
        </a>
      </div>
    </div>
  </article>`;
}

function renderProductPage(product, pages, allProducts) {
  const p = assetPrefix(1);
  const price = getDisplayPrice(product);
  const rating = product.average_rating || 0;
  const reviewCount = product.rating_count || 0;
  const h1 = getProductH1(product);
  const imgAlt = getProductName(product);

  const desc = prepareProductDescription(product, 1);

  const keyFeaturesHtml = KEY_FEATURES.map(
    (f) =>
      `<div class="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <span class="text-lg flex-shrink-0">${f.icon}</span>
        <div>
          <div class="font-semibold text-white text-sm mb-0.5">${f.title}</div>
          <p class="text-slate-400 text-xs">${f.desc}</p>
        </div>
      </div>`
  ).join('');

  const cats = renderCategoryChips(product.categories, product, 1);
  const tags = renderTagChips(product.tags);

  const related = getRelatedProducts(product, allProducts)
    .map((r) => productCard(r, 1))
    .join('');

  const imageCol = `<div class="animate-fade-in-up">
    <div class="card-gradient p-6 rounded-2xl">
      <div class="relative aspect-square bg-slate-800 rounded-xl overflow-hidden">
        ${
          product.image
            ? `<img src="${p}${product.image}" alt="${imgAlt}" class="absolute inset-0 w-full h-full object-cover">`
            : `<div class="w-full h-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center border-2 border-dashed border-teal-500/30"><span class="text-6xl">📦</span></div>`
        }
      </div>
    </div>
  </div>`;

  const body = `<div class="min-h-screen bg-slate-900">
  <div class="absolute inset-0 matrix-container opacity-5">
    <div class="matrix-grid"></div>
  </div>

  <div class="py-8 relative z-10">
    <div class="container mx-auto px-4">
      <div class="max-w-7xl mx-auto">
        <a href="${hrefPage('products', 1)}" class="mb-8 inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors animate-fade-in">
          ${SVG.arrowLeft}
          Back to Products
        </a>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          ${imageCol}

          <div class="space-y-4 animate-fade-in-up" style="animation-delay:0.1s">
            <div class="inline-flex items-center px-3 py-1.5 bg-teal-500/20 border border-teal-500/50 text-teal-400 text-xs font-bold rounded-full">🛒 Buy Now</div>

            <h1 class="text-2xl md:text-3xl font-bold text-white leading-tight">${h1}</h1>

            <div class="p-4 card-gradient rounded-xl border-2 border-teal-500/20">
              <div class="text-3xl font-black text-teal-400">${price}</div>
              <p class="text-slate-400 text-sm mt-1">/month</p>
            </div>

            <div class="space-y-2">${keyFeaturesHtml}</div>

            <a href="${SIGNUP_URL}" target="_blank" rel="noopener noreferrer" class="w-full py-3 rounded-xl font-bold text-base transition-all duration-300 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-purple-600 text-white hover:scale-105 shadow-xl block text-center">
              🛒 Buy Now
            </a>

            <div class="text-center text-xs font-semibold text-green-400">✅ In Stock</div>
          </div>
        </div>

        ${
          desc
            ? `<div class="card-gradient p-8 rounded-2xl mb-8 animate-fade-in-up">
          <h2 class="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center">📝</span>
            Product Details
          </h2>
          <div class="${PROSE_CLASSES}">${desc}</div>
        </div>`
            : ''
        }

        ${
          cats || tags
            ? `<div class="product-meta-section mb-8 animate-fade-in-up">
          ${
            cats
              ? `<div class="product-meta-card product-meta-card--categories">
            <div class="product-meta-card__header">
              <span class="product-meta-card__icon" aria-hidden="true">📂</span>
              <div>
                <h3 class="product-meta-card__title">Categories</h3>
                <p class="product-meta-card__subtitle">Browse similar tools in this category</p>
              </div>
            </div>
            <div class="product-category-list">${cats}</div>
          </div>`
              : ''
          }
          ${
            tags
              ? `<div class="product-meta-card product-meta-card--tags${cats ? ' mt-4' : ''}">
            <div class="product-meta-card__header">
              <span class="product-meta-card__icon" aria-hidden="true">🏷️</span>
              <div>
                <h3 class="product-meta-card__title">Tags</h3>
                <p class="product-meta-card__subtitle">Related keywords for this tool</p>
              </div>
            </div>
            <div class="product-tag-list">${tags}</div>
          </div>`
              : ''
          }
        </div>`
            : ''
        }

        ${
          related
            ? `<div class="mt-16 animate-fade-in-up">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-black text-white mb-4">You Might Also Like</h2>
            <p class="text-slate-400">Check out these similar products</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">${related}</div>
        </div>`
            : ''
        }
      </div>
    </div>
  </div>
</div>`;

  const { title, description, name } = buildProductSeo(product, price);
  const seo = buildSeoMeta({
    title,
    description,
    canonicalPath: `/${product.slug}`,
    keywords: productKeywords(name),
    ogImage: product.image || 'icon.svg',
    ogType: 'website',
  });

  return wrapPage({
    title,
    description,
    canonical: seo.canonical,
    depth: 1,
    pages,
    body,
    seo,
    jsonLd: productGraph(product, price),
    extraHead: `<link rel="stylesheet" href="${p}css/product-content.css">`,
  });
}

function renderProductsListing(products, pages) {
  const p = assetPrefix(1);
  const cards = products.map((prod) => productCard(prod, 1)).join('');
  const body = `<div class="min-h-screen bg-slate-900">
  <div class="absolute inset-0 matrix-container opacity-10">
    <div class="matrix-grid"></div>
  </div>

  <section class="relative py-12 overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute top-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float" style="animation-delay:2s"></div>
    </div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-4xl mx-auto text-center animate-fade-in-up">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
          <span class="text-teal-400 font-bold text-sm">🛍️ SHOP</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black text-white mb-4">
          Premium <span class="text-teal-400">Group Buy SEO Tools</span>
        </h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto">
          Access Ahrefs, SEMrush, Moz Pro, ChatGPT Plus &amp; 50+ premium tools at 90% discount.
        </p>
      </div>
    </div>
  </section>

  <div class="pb-16 relative z-10">
    <div class="container mx-auto px-4">
      <input type="text" data-products-filter placeholder="Search products..." class="w-full max-w-xl mx-auto block mb-8 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-teal-500 focus:outline-none">
      <div class="products-grid" data-products-grid>${cards}</div>
    </div>
  </div>
</div>`;

  const root = path.join(__dirname, '..');
  const listingSeo = getVerifiedPageSeo('Products', root);
  const seo = buildSeoMeta({
    title: listingSeo.title,
    description: listingSeo.description,
    canonicalPath: '/products',
    keywords: 'group buy seo tools, seo tools shop, ahrefs group buy, semrush group buy, premium seo tools',
  });

  return wrapPage({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    depth: 1,
    pages,
    body,
    seo,
    jsonLd: productsListingGraph(products, seo.title, seo.description),
    scripts: ['app.js', 'products-filter.js'],
  });
}

module.exports = { renderProductPage, renderProductsListing, getDisplayPrice, productCard };
