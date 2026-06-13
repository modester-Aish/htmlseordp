const { cleanPageTitle, assetPrefix, SITE_URL } = require('./utils');
const { hrefHome, hrefPage } = require('./internal-links');
const { buildSeo, renderSeoTags, escapeMeta } = require('./seo-head');
const { jsonLdScript } = require('./structured-data');
const { searchIcon } = require('./icons');

const PRICING_PLANS = [
  { name: 'SMALL PLAN', slug: 'combo-seo-tools-small', price: '$15' },
  { name: 'Ahrefs Combo', slug: 'ahrefs-group-buy', price: '$25' },
  { name: 'MEGA PLAN', slug: 'combo-mega-pack-tools', price: '$50' },
  { name: 'LITE PLAN', slug: 'combo-seo-tools-basic-plan', price: '$10' },
  { name: 'WRITER PLAN', slug: 'content-and-writting', price: '$15' },
  { name: 'DESIGNER PLAN', slug: 'designer-plan', price: '$10' },
];

function categorizePages(pages) {
  const infoPages = pages.filter((p) => {
    const title = p.title.rendered.toLowerCase();
    return (
      title.includes('about') ||
      title.includes('contact') ||
      title.includes('faq') ||
      title.includes('policy') ||
      title.includes('terms') ||
      title.includes('privacy') ||
      title.includes('refund') ||
      title.includes('dmca')
    );
  });
  return { infoPages };
}

function renderHead({ title, description, canonical, depth, extra = '', seo, jsonLd }) {
  const p = assetPrefix(depth);
  const seoMeta =
    seo ||
    buildSeo({
      title,
      description,
      canonicalPath: canonical,
    });
  const jsonLdBlock = jsonLd ? jsonLdScript(jsonLd) : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeMeta(seoMeta.title)}</title>
  <meta name="description" content="${escapeMeta(seoMeta.description)}">
  ${renderSeoTags(seoMeta)}
  <link rel="icon" href="${p}favicon.ico" sizes="32x32">
  <link rel="icon" type="image/svg+xml" href="${p}icon.svg">
  <link rel="apple-touch-icon" href="${p}icon.svg">
  <link rel="manifest" href="${p}manifest.json">
  <meta name="theme-color" content="#14b8a6">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${p}css/main.css">
  <style>body{font-family:Inter,system-ui,sans-serif}</style>
  ${jsonLdBlock}
  ${extra}
</head>`;
}

function renderHeader(pages, depth) {
  const p = assetPrefix(depth);
  const { infoPages } = categorizePages(pages);
  const pricingDropdown = PRICING_PLANS.map(
    (plan) =>
      `<a href="${hrefPage(plan.slug, depth)}" class="block px-4 py-2.5 text-sm text-slate-300 hover:bg-purple-500/10 hover:text-purple-400 transition-all rounded-lg">${plan.name} <span class="text-xs text-purple-500 font-semibold float-right">${plan.price}</span></a>`
  ).join('');
  const infoDropdown = infoPages
    .map(
      (page) =>
        `<a href="${hrefPage(page.slug, depth)}" class="block px-4 py-2.5 text-sm text-slate-300 hover:bg-orange-500/10 hover:text-orange-400 transition-all rounded-lg hover:pl-5">${cleanPageTitle(page.title.rendered)}</a>`
    )
    .join('');

  return `<header class="sticky top-4 z-[100] w-full px-4">
  <nav class="container mx-auto max-w-7xl">
    <div class="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 backdrop-blur-xl rounded-full shadow-2xl border border-teal-400/30 px-8 py-4">
      <div class="flex items-center justify-between gap-8">
        <a href="${hrefHome(depth)}" class="flex items-center flex-shrink-0">
          <span class="text-2xl font-bold text-white">SEO<span class="text-teal-400">RDP</span></span>
        </a>
        <div class="hidden lg:flex items-center gap-6 flex-1 justify-center">
          <a href="${hrefHome(depth)}" class="text-sm font-medium text-white hover:text-teal-400 transition-colors">Home</a>
          <a href="${hrefPage('products', depth)}" class="text-sm font-medium text-white hover:text-teal-400 transition-colors">Tools Shop</a>
          <div class="relative" data-dropdown="pricing">
            <button type="button" class="flex items-center gap-1 text-sm font-medium text-white hover:text-teal-400 transition-colors" data-dropdown-trigger>Pricing Plans ▾</button>
            <div class="hidden absolute left-0 top-full mt-3 w-80 rounded-xl shadow-2xl z-[9999]" data-dropdown-menu>
              <div class="bg-gradient-to-r from-purple-500 to-pink-500 p-[2px] rounded-xl"><div class="bg-slate-900 rounded-xl p-4 space-y-1 max-h-96 overflow-y-auto custom-scrollbar">${pricingDropdown}</div></div>
            </div>
          </div>
          <a href="${hrefPage('products', depth)}" class="text-sm font-medium text-white hover:text-teal-400 transition-colors">Products</a>
          <a href="${hrefPage('blog', depth)}" class="text-sm font-medium text-white hover:text-teal-400 transition-colors">Blog</a>
          <div class="relative" data-dropdown="pages">
            <button type="button" class="flex items-center gap-1 text-sm font-medium text-white hover:text-teal-400 transition-colors" data-dropdown-trigger>Pages ▾</button>
            <div class="hidden absolute left-0 top-full mt-3 w-80 rounded-xl shadow-2xl z-[9999]" data-dropdown-menu>
              <div class="bg-gradient-to-r from-orange-500 to-amber-500 p-[2px] rounded-xl"><div class="bg-slate-900 rounded-xl p-4 space-y-1 max-h-96 overflow-y-auto custom-scrollbar">${infoDropdown}<a href="${hrefPage('pages', depth)}" class="block px-4 py-2.5 text-sm text-teal-400 hover:bg-orange-500/10 rounded-lg font-semibold mt-2">View all pages →</a></div></div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden lg:block relative search-container">
            ${searchIcon('sm')}
            <input type="text" placeholder="Search..." data-search-input class="w-64 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder:text-white/70 focus:outline-none focus:border-teal-400 text-sm">
            <div class="hidden absolute top-full mt-2 w-96 bg-slate-900 rounded-xl shadow-2xl border border-white/10 z-[105] max-h-[500px] overflow-y-auto" data-search-results></div>
          </div>
          <button type="button" class="lg:hidden text-white" data-mobile-toggle aria-label="Menu">☰</button>
        </div>
      </div>
    </div>
    <div class="hidden fixed top-20 right-4 left-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-[95] lg:hidden p-6 max-h-[80vh] overflow-y-auto" data-mobile-menu>
      <a href="${hrefHome(depth)}" class="block py-3 text-white">Home</a>
      <a href="${hrefPage('products', depth)}" class="block py-3 text-white">Tools Shop</a>
      <a href="${hrefPage('products', depth)}" class="block py-3 text-white">Products</a>
      <a href="${hrefPage('blog', depth)}" class="block py-3 text-white">Blog</a>
      <a href="${hrefPage('pages', depth)}" class="block py-3 text-white">All Pages</a>
      <a href="${hrefPage('contact-us', depth)}" class="block py-3 text-white">Contact</a>
    </div>
  </nav>
</header>`;
}

function renderFooter(depth) {
  const p = assetPrefix(depth);
  const year = new Date().getFullYear();
  return `<footer class="border-t border-slate-800 bg-slate-900">
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
      <a href="${hrefPage('privacy-policy-3', depth)}" class="text-slate-400 hover:text-teal-400 transition-colors">Privacy Policy</a>
      <a href="${hrefPage('contact-us', depth)}" class="text-slate-400 hover:text-teal-400 transition-colors">Contact Us</a>
      <a href="${hrefPage('terms-of-service', depth)}" class="text-slate-400 hover:text-teal-400 transition-colors">Terms &amp; Conditions</a>
      <a href="${hrefPage('return-and-refund-policy', depth)}" class="text-slate-400 hover:text-teal-400 transition-colors">Refund Policy</a>
      <a href="${hrefPage('dmca-policy', depth)}" class="text-slate-400 hover:text-teal-400 transition-colors">DMCA</a>
    </div>
  </div>
  <div class="bg-slate-950 border-t border-slate-800">
    <div class="container mx-auto px-4 py-4">
      <p class="text-center text-sm text-slate-400">Copyright 2023 - ${year} All Rights Reserved By SEORDP</p>
    </div>
  </div>
</footer>`;
}

function renderFloatingChat() {
  return `<div class="fixed bottom-6 right-6 z-[9999]" data-floating-chat>
  <div class="hidden absolute bottom-20 right-0 w-72 mb-2 animate-fade-in-up" data-chat-panel>
    <div class="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
      <div class="bg-slate-900 border-b border-slate-700 p-4"><h3 class="text-white font-bold">💬 Chat with us</h3></div>
      <div class="p-4 space-y-3">
        <a href="https://wa.me/15205636362?text=Hi!%20I'm%20interested%20in%20your%20SEO%20tools." target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-xl text-white text-sm font-semibold">WhatsApp</a>
        <a href="https://www.messenger.com/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-semibold">Facebook Messenger</a>
      </div>
    </div>
  </div>
  <button type="button" class="w-14 h-14 rounded-full bg-teal-500 hover:bg-teal-600 shadow-xl flex items-center justify-center text-white text-xl" data-chat-toggle aria-label="Chat">💬</button>
</div>`;
}

function renderBackToTop() {
  return `<button type="button" class="hidden fixed bottom-6 left-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-all" data-back-to-top aria-label="Back to top">↑</button>`;
}

function wrapPage({
  title,
  description,
  canonical,
  depth,
  pages,
  body,
  scripts = ['app.js'],
  extraHead = '',
  seo,
  jsonLd,
}) {
  const p = assetPrefix(depth);
  const scriptTags = scripts.map((s) => `<script src="${p}js/${s}" defer></script>`).join('\n  ');
  return `${renderHead({ title, description, canonical, depth, extra: extraHead, seo, jsonLd })}
<body class="bg-slate-900 text-white antialiased">
<div class="flex min-h-screen flex-col">
${renderHeader(pages, depth)}
<main class="flex-1">${body}</main>
${renderFooter(depth)}
${renderFloatingChat()}
${renderBackToTop()}
</div>
  ${scriptTags}
</body>
</html>`;
}

module.exports = { wrapPage, renderHead, PRICING_PLANS, SITE_URL, assetPrefix, buildSeo };
