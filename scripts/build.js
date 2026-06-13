const fs = require('fs');
const path = require('path');
const { wrapPage, SITE_URL } = require('./lib/layout');
const { buildSeo } = require('./lib/seo-head');
const { getVerifiedPageSeo, buildPageSeoFromWp, enrichProduct } = require('./lib/seo-meta');
const { homepageGraph, webPageGraph } = require('./lib/structured-data');
const { generateCanonicalUrl } = require('./lib/canonical');
const { FAQS } = require('./lib/homepage-data');
const {
  EXCLUDED_PAGE_SLUGS,
  cleanPageTitle,
  stripTags,
  truncate,
  getTitle,
  getExcerpt,
  assetPrefix,
} = require('./lib/utils');
const { renderHomepage } = require('./templates/homepage');
const { getDisplayPrice, renderProductPage, renderProductsListing } = require('./lib/products-generator');
const { applyCustomDescription } = require('./lib/product-content');
const { hrefPage, hrefHome } = require('./lib/internal-links');
const { renderWpPageBody } = require('./lib/wp-page-generator');
const { renderContactPageBody } = require('./lib/contact-page');
const { renderInfoShell } = require('./lib/info-page-layout');

const BOOKMARK_SVG = `<svg class="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>`;
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function loadJson(name) {
  const file = path.join(ROOT, 'data', name);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writePage(relativePath, html) {
  const full = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
  console.log('  ✓', relativePath);
}

function depthFromPath(rel) {
  const parts = rel.split('/').filter(Boolean);
  return Math.max(0, parts.length - 1);
}

function buildSearchIndex(pages, products = []) {
  const items = [];
  items.push({ type: 'page', title: 'Home', slug: '', url: '/', description: 'SEORDP homepage' });
  items.push({ type: 'page', title: 'Blog', slug: 'blog', url: '/blog/', description: 'SEO blog and tutorials' });
  items.push({ type: 'page', title: 'Products', slug: 'products', url: '/products/', description: 'All group buy SEO tools' });
  items.push({ type: 'page', title: 'Contact Us', slug: 'contact-us', url: '/contact-us/', description: 'Contact SEORDP support' });
  items.push({ type: 'page', title: 'All Pages', slug: 'pages', url: '/pages/', description: 'Browse all information pages' });
  for (const page of pages) {
    items.push({
      type: 'page',
      title: getTitle(page),
      slug: page.slug,
      url: `/${page.slug}/`,
      description: truncate(getExcerpt(page), 120),
    });
  }
  for (const prod of products) {
    items.push({
      type: 'product',
      title: prod.h1 || prod.name,
      slug: prod.slug,
      url: `/${prod.slug}/`,
      description: truncate(prod.metaDescription || prod.shortDescription || prod.name, 120),
    });
  }
  writePage('js/search-index.json', JSON.stringify(items, null, 2));
}

function generateHome(pages, products = []) {
  const { getPopularToolsForHome } = require('./lib/homepage-data');
  const popularTools = getPopularToolsForHome(ROOT, products);
  const homeSeo = getVerifiedPageSeo('Seordp.net', ROOT);
  const seo = buildSeo({
    title: homeSeo.title,
    description: homeSeo.description,
    canonicalPath: '/',
    keywords:
      'group buy seo tools, cheap seo tools, ahrefs group buy, semrush group buy, moz pro group buy, best seo tools 2025, affordable seo tools, premium seo tools, seo tools discount, chatgpt plus group buy, canva pro group buy, seo group buy service, shared seo tools, bulk seo tools, seo tools subscription, digital marketing tools, keyword research tools, backlink analysis tools, competitor analysis tools, seo software group buy',
  });
  const html = wrapPage({
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    depth: 0,
    pages,
    body: renderHomepage(0, popularTools),
    seo,
    jsonLd: homepageGraph(FAQS),
  });
  writePage('index.html', html);
}

function generateBlogListing(pages) {
  const body = renderInfoShell({
    badge: '📰 Blog',
    badgeClass: 'teal',
    titleHtml: '<span class="text-teal-400">SEO Blog</span> &amp; Tutorials',
    subtitle: 'Expert tips, Ahrefs tutorials, SEMrush guides, and digital marketing strategies.',
    depth: 1,
    content: `<div class="card-gradient p-10 rounded-2xl border-2 border-slate-700 text-center">
      <h2 class="text-2xl font-bold text-white mb-2">No Posts Found</h2>
      <p class="text-slate-400 mb-6">Check back later for new content!</p>
      <a href="${hrefPage('products', 1)}" class="inline-flex items-center gap-2 hero-btn-primary px-6 py-3 rounded-xl">Browse SEO Tools</a>
    </div>`,
  });

  const blogSeo = getVerifiedPageSeo('Blog', ROOT);
  const seo = buildSeo({
    title: blogSeo.title,
    description: blogSeo.description,
    canonicalPath: '/blog',
    keywords: 'seo blog, seo tutorials, group buy seo tools, ahrefs tutorial, semrush guide, digital marketing tips',
  });
  writePage(
    'blog/index.html',
    wrapPage({
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      depth: 1,
      pages,
      body,
      seo,
      jsonLd: webPageGraph('blog', seo.title, seo.description),
    })
  );
}

function removeBlogPostDirs(posts) {
  for (const post of posts) {
    const postDir = path.join(ROOT, post.slug);
    if (fs.existsSync(postDir)) {
      fs.rmSync(postDir, { recursive: true, force: true });
      console.log('  ✗ removed blog post:', post.slug);
    }
    const legacyDir = path.join(ROOT, 'blog', post.slug);
    if (fs.existsSync(legacyDir)) {
      fs.rmSync(legacyDir, { recursive: true, force: true });
    }
  }
}

function generatePagesListing(pages, allPages) {
  const cards = allPages
    .map(
      (page, index) => {
        const excerpt =
          truncate(stripTags(page.excerpt?.rendered || ''), 120) ||
          'Explore this resource to learn more about our services and offerings.';
        return `<a href="${hrefPage(page.slug, 1)}" class="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 animate-fade-in-up flex h-[200px]" style="animation-delay:${index * 0.05}s">
      <div class="w-2/5 p-6 flex flex-col justify-center bg-slate-50"><h2 class="text-base font-bold text-slate-900 line-clamp-3 group-hover:text-teal-600 transition-colors">${cleanPageTitle(page.title.rendered)}</h2></div>
      <div class="w-3/5 bg-teal-500 p-6 flex flex-col justify-center relative">
        <div class="absolute top-4 right-4">${BOOKMARK_SVG}</div>
        <p class="text-white text-sm leading-relaxed line-clamp-4 pr-8">${excerpt}</p>
      </div>
    </a>`;
      }
    )
    .join('');

  const body = `<div class="min-h-screen bg-slate-900">
    <div class="absolute inset-0 matrix-container opacity-10"><div class="matrix-grid"></div></div>
    <section class="relative py-12 overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute top-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-10 right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>
      <div class="container mx-auto px-4 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <span class="text-purple-400 font-bold text-sm">📄 EXPLORE</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-white mb-4">Important <span class="text-purple-400">Information</span></h1>
          <p class="text-lg text-slate-300 max-w-2xl mx-auto">Browse through our essential resources and helpful content</p>
        </div>
      </div>
    </section>
    <div class="pb-16 relative z-10">
      <div class="container mx-auto px-4">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">${cards}</div>
        <div class="text-center mt-12">
          <span class="px-8 py-3 bg-slate-800 text-white font-semibold rounded-xl inline-block">See all pages</span>
        </div>
      </div>
    </div>
  </div>`;

  const pagesSeo = getVerifiedPageSeo('Pages', ROOT);
  const seo = buildSeo({
    title: pagesSeo.title,
    description: pagesSeo.description,
    canonicalPath: '/pages',
    keywords: 'seo tools pricing, group buy plans, seo tools packages, seordp plans',
  });
  writePage(
    'pages/index.html',
    wrapPage({
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      depth: 1,
      pages,
      body,
      seo,
      jsonLd: webPageGraph('pages', seo.title, seo.description),
    })
  );
}

function generateWpPage(page, pages) {
  const title = getTitle(page);
  const body = renderWpPageBody(page, 1, ROOT);

  const csvKeyMap = {
    'about-us': 'About Us',
    'contact-us': 'Contact Us',
    'privacy-policy-3': 'Privacy Policy',
    'terms-of-service': 'Terms Of Service',
    'return-and-refund-policy': 'Return And Refund Policy',
    'editorial-guidelines': 'Editorial Guidelines',
  };
  const { title: metaTitle, description: metaDesc } = buildPageSeoFromWp(
    page,
    ROOT,
    csvKeyMap[page.slug]
  );
  const seo = buildSeo({
    title: metaTitle || title,
    description: metaDesc || truncate(getExcerpt(page), 160),
    canonicalPath: `/${page.slug}`,
    keywords: `${title}, group buy seo tools, seordp`,
  });

  writePage(
    `${page.slug}/index.html`,
    wrapPage({
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      depth: 1,
      pages,
      body,
      seo,
      jsonLd: webPageGraph(page.slug, seo.title, seo.description),
    })
  );
}

function generateContact(pages) {
  const body = renderContactPageBody(1);

  const contactSeo = getVerifiedPageSeo('Contact Us', ROOT);
  const seo = buildSeo({
    title: contactSeo.title,
    description: contactSeo.description,
    canonicalPath: '/contact-us',
    keywords: 'contact seordp, seo tools support, group buy help',
  });
  writePage(
    'contact-us/index.html',
    wrapPage({
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      depth: 1,
      pages,
      body,
      seo,
      jsonLd: webPageGraph('contact-us', seo.title, seo.description),
    })
  );
}

function generateSearch(pages) {
  const body = renderInfoShell({
    badge: '🔍 Search',
    badgeClass: 'teal',
    titleHtml: 'Search <span class="text-teal-400">SEORDP</span>',
    subtitle: 'Find products, pages, and resources across the site.',
    depth: 1,
    content: `<div class="card-gradient rounded-2xl border-2 border-slate-700 p-6 md:p-8">
      <input type="text" data-search-page-input placeholder="Search products, pages, tools..." class="w-full px-4 py-4 bg-slate-800/80 border-2 border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 mb-6">
      <div data-search-page-results class="space-y-3"></div>
      <p class="text-slate-500 text-sm text-center mt-6" data-search-hint>Start typing to search...</p>
    </div>`,
  });

  const searchSeo = getVerifiedPageSeo('search', ROOT);
  const seo = buildSeo({
    title: searchSeo.title,
    description: searchSeo.description,
    canonicalPath: '/search',
    robots: 'noindex,follow',
  });
  writePage(
    'search/index.html',
    wrapPage({
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      depth: 1,
      pages,
      body,
      seo,
      jsonLd: webPageGraph('search', seo.title, seo.description),
    })
  );
}

function generateProducts(pages) {
  const gbstFile = path.join(ROOT, 'data', 'gbst-products.json');
  if (!fs.existsSync(gbstFile)) {
    console.log('  ⚠ data/gbst-products.json missing — run: npm run scrape:gbst');
    return [];
  }
  const rawProducts = JSON.parse(fs.readFileSync(gbstFile, 'utf8'));
  if (!rawProducts.length) return [];
  const products = rawProducts.map((p) => {
    const enriched = enrichProduct(p, ROOT);
    return applyCustomDescription(enriched, getDisplayPrice(enriched));
  });

  writePage('products/index.html', renderProductsListing(products, pages));
  for (const product of products) {
    writePage(`${product.slug}/index.html`, renderProductPage(product, pages, products));
  }
  console.log(`  ✓ products/ + ${products.length} product pages`);
  return products;
}

function generateSitemap(pages, allPages, products = []) {
  const pageLinks = allPages
    .map((pg) => `<li><a href="${hrefPage(pg.slug, 1)}" class="text-teal-400 hover:text-teal-300 hover:underline">${getTitle(pg)}</a></li>`)
    .join('');

  const sitemapCard = `<div class="card-gradient rounded-2xl border-2 border-slate-700 p-8 md:p-12 space-y-10">
      <section><h2 class="text-xl font-bold text-white mb-4 pb-2 border-b border-teal-500/40">Main Pages</h2>
        <ul class="space-y-2 text-slate-300"><li><a href="${hrefHome(1)}" class="text-teal-400 hover:underline">Home</a></li>
        <li><a href="${hrefPage('blog', 1)}" class="text-teal-400 hover:underline">Blog</a></li>
        <li><a href="${hrefPage('contact-us', 1)}" class="text-teal-400 hover:underline">Contact</a></li>
        <li><a href="${hrefPage('products', 1)}" class="text-teal-400 hover:underline">Products (${products.length})</a></li></ul>
      </section>
      ${products.length > 0 ? `<section><h2 class="text-xl font-bold text-white mb-4 pb-2 border-b border-teal-500/40">Products (${products.length})</h2><ul class="space-y-2 columns-1 md:columns-2 lg:columns-3 text-slate-300">${products.map((pr) => `<li><a href="${hrefPage(pr.slug, 1)}" class="text-teal-400 hover:underline">${pr.name}</a></li>`).join('')}</ul></section>` : ''}
      <section><h2 class="text-xl font-bold text-white mb-4 pb-2 border-b border-teal-500/40">Pages (${allPages.length})</h2><ul class="space-y-2 columns-1 md:columns-2 lg:columns-3 text-slate-300">${pageLinks}</ul></section>
    </div>`;

  const body = renderInfoShell({
    badge: '🗺️ Sitemap',
    badgeClass: 'purple',
    titleHtml: 'HTML <span class="text-purple-400">Sitemap</span>',
    subtitle: 'All pages and products on SEORDP in one place.',
    depth: 1,
    content: sitemapCard,
    contentClass: 'max-w-6xl',
  });

  const sitemapSeo = getVerifiedPageSeo('sitemap', ROOT);
  const seo = buildSeo({
    title: sitemapSeo.title,
    description: sitemapSeo.description,
    canonicalPath: '/sitemap',
    keywords: 'sitemap, seordp pages, seo tools list',
  });
  writePage(
    'sitemap/index.html',
    wrapPage({
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      depth: 1,
      pages,
      body,
      seo,
      jsonLd: webPageGraph('sitemap', seo.title, seo.description),
    })
  );
}

function generateRobotsTxt() {
  const content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${generateCanonicalUrl('/sitemap.xml')}
`;
  writePage('robots.txt', content);
}

function generateXmlSitemap(pages, products) {
  const entries = [];
  const add = (path, lastMod, priority, freq = 'weekly') => {
    entries.push({ loc: generateCanonicalUrl(path), lastmod: lastMod, priority, changefreq: freq });
  };

  const now = new Date().toISOString().split('T')[0];
  add('/', now, '1.0', 'daily');
  add('/blog', now, '0.9', 'daily');
  add('/products', now, '0.9', 'daily');
  add('/pages', now, '0.8', 'weekly');
  add('/contact-us', now, '0.8', 'monthly');
  add('/sitemap', now, '0.5', 'weekly');

  for (const page of pages) {
    if (page.slug === 'contact-us') continue;
    const mod = (page.modified || page.date || now).split('T')[0];
    add(`/${page.slug}`, mod, '0.8', 'weekly');
  }

  for (const product of products) {
    const mod = (product.date_modified || product.date_created || now).split('T')[0];
    add(`/${product.slug}`, mod, '0.8', 'weekly');
  }

  const seen = new Set();
  const unique = entries.filter((e) => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  writePage('sitemap.xml', xml);
}

function main() {
  console.log('Building standalone HTML site...\n');
  const rawPages = loadJson('wp-pages.json');
  const rawPosts = loadJson('wp-posts.json');
  const pages = rawPages.filter((p) => p.status === 'publish' && !EXCLUDED_PAGE_SLUGS.includes(p.slug));
  const posts = rawPosts.filter((p) => p.status === 'publish');
  const products = generateProducts(pages);

  removeBlogPostDirs(posts);
  buildSearchIndex(pages, products);
  generateHome(pages, products);
  generateBlogListing(pages);
  generatePagesListing(pages, pages);
  pages.forEach((page) => {
    if (page.slug === 'contact-us') return;
    generateWpPage(page, pages);
  });
  generateContact(pages);
  generateSearch(pages);
  generateSitemap(pages, pages, products);
  generateRobotsTxt();
  generateXmlSitemap(pages, products);

  console.log(`\nDone! ${pages.length} WP pages, ${products.length} products (blog posts disabled).`);
  fs.mkdirSync(path.join(ROOT, 'css'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'src', 'css', 'blog.css'), path.join(ROOT, 'css', 'blog.css'));
  fs.copyFileSync(path.join(ROOT, 'src', 'css', 'product-content.css'), path.join(ROOT, 'css', 'product-content.css'));
  fs.copyFileSync(path.join(ROOT, 'src', 'css', 'page-content.css'), path.join(ROOT, 'css', 'page-content.css'));

  try {
    execSync('npm run build:css', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.log('Run: npm run build:css');
  }
}

main();
