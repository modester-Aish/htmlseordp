/** Build homepage popular tools grid from live product catalog */

const FEATURED_SLUGS = [
  'ahrefs',
  'semrush-group-buy-2022',
  'mrush-group-buy',
  'mozzat',
  'canva',
  'chatgpt-group-buy-plus-pro',
  'claude-ai',
  'ubersuggest',
  'buzzsumo',
  'quillbot',
  'jasper',
  'surfer-seo',
  'helium-10',
  'envato-elements',
  'freepik-group-buy-new',
  'netflix',
  'runwayml-group-buy',
  'spyfu',
  'majestic-seo',
  'copy-ai',
  'wordhero',
  'invideo',
  'prezi',
  'storyblocks',
  'leonardo-ai',
  'capcut-group-buy',
  'grammarly',
  'prowritingaid',
  'semrush-group-buy',
  'ahrefs-group-buy',
  'moz-group-buy',
  'keywordtool',
  'kwfinder-group-buy',
  'helium10-group-buy-12',
  'chatgpt-group-buy',
  'gamma-app-group-buy',
  'midjourney-group-buy',
  'jasper-ai-group-buy',
];

const LOCAL_TOOL_LOGOS = {
  ahrefs: 'ahrefs-logo.svg',
  'semrush-group-buy-2022': 'semrush-logo.svg',
  'mrush-group-buy': 'semrush-logo.svg',
  mozzat: 'moz-logo.svg',
  canva: 'canva-logo.svg',
  'chatgpt-group-buy-plus-pro': 'chatgpt-logo.svg',
  'claude-ai': 'claude-logo.svg',
  'runwayml-group-buy': 'runwayml-logo.svg',
  netflix: 'netflix-logo.svg',
};

function stripHtml(text) {
  return (text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function productDescription(product) {
  const fromMeta = stripHtml(product.metaDescription);
  if (fromMeta.length > 20) return fromMeta.slice(0, 120);
  const fromShort = stripHtml(product.shortDescription);
  if (fromShort.length > 20) return fromShort.slice(0, 120);
  const fromDesc = stripHtml(product.description);
  if (fromDesc.length > 20) return fromDesc.slice(0, 120);
  return `${product.name || product.h1} group buy access at SEORDP`;
}

function productLogoHtml(product, prefix) {
  const slug = product.slug;
  const logo = LOCAL_TOOL_LOGOS[slug];
  if (logo) {
    return `<img src="${prefix}tools/${logo}" alt="${product.name}" class="w-full h-full object-contain p-2">`;
  }
  if (product.image) {
    return `<img src="${prefix}${product.image}" alt="${product.name}" class="w-full h-full object-cover rounded-xl">`;
  }
  const letter = (product.name || '?').charAt(0).toUpperCase();
  return `<span class="text-2xl font-black text-teal-600">${letter}</span>`;
}

function buildPopularToolsFromProducts(products, getDisplayPrice) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const picked = [];
  const seen = new Set();

  for (const slug of FEATURED_SLUGS) {
    const p = bySlug.get(slug);
    if (p && !seen.has(p.slug)) {
      picked.push(p);
      seen.add(p.slug);
    }
  }

  const rest = products
    .filter((p) => !seen.has(p.slug))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const ordered = picked.concat(rest);

  return ordered.map((product) => ({
    slug: product.slug,
    name: product.h1 || product.name,
    price: getDisplayPrice(product),
    description: productDescription(product),
    image: product.image || null,
    logoHtml: (prefix) => productLogoHtml(product, prefix),
  }));
}

module.exports = {
  FEATURED_SLUGS,
  buildPopularToolsFromProducts,
  productLogoHtml,
};
