const { SITE_URL } = require('./utils');
const { generateCanonicalUrl, absoluteAssetUrl, truncateMetaDescription } = require('./canonical');
const { pickProductDescription } = require('./seo-meta');

function jsonLdScript(graph) {
  const payload = graph['@graph'] ? graph : { '@context': 'https://schema.org', ...graph };
  if (!payload['@context']) payload['@context'] = 'https://schema.org';
  return `<script type="application/ld+json">${JSON.stringify(payload)}</script>`;
}

function homepageGraph(faqs = []) {
  const home = generateCanonicalUrl('/');
  const faqEntities = faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'SEORDP',
        url: home,
        logo: absoluteAssetUrl('icon.svg'),
        description:
          'Premium SEO tools and RDP services provider offering access to 50+ tools including Ahrefs, SEMrush at discounted rates.',
        foundingDate: '2024',
        sameAs: ['https://twitter.com/seordp'],
      },
      {
        '@type': 'WebSite',
        name: 'SEORDP',
        url: home,
        description: 'Access premium SEO tools and RDP services at affordable prices.',
        publisher: { '@type': 'Organization', name: 'SEORDP' },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${generateCanonicalUrl('/products')}?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Service',
        name: 'Premium SEO Tools Access',
        description:
          'Affordable group buy access to premium SEO and digital marketing tools including Ahrefs, SEMrush, Moz Pro and 50+ other tools.',
        provider: { '@type': 'Organization', name: 'SEORDP' },
        serviceType: 'Digital Marketing Tools',
        areaServed: 'Worldwide',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'SEO Tools Packages',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: 'SEO Tools Package' },
              price: '4.99',
              priceCurrency: 'USD',
            },
          ],
        },
      },
      ...(faqEntities.length
        ? [{ '@type': 'FAQPage', mainEntity: faqEntities }]
        : []),
      {
        '@type': 'SiteNavigationElement',
        name: 'Main Navigation',
        url: home,
        hasPart: [
          { '@type': 'SiteNavigationElement', name: 'Home', url: home },
          { '@type': 'SiteNavigationElement', name: 'Tools Shop', url: generateCanonicalUrl('/products') },
          { '@type': 'SiteNavigationElement', name: 'Pricing Plans', url: generateCanonicalUrl('/pages') },
          { '@type': 'SiteNavigationElement', name: 'Products', url: generateCanonicalUrl('/products') },
          { '@type': 'SiteNavigationElement', name: 'Blog', url: generateCanonicalUrl('/blog') },
          { '@type': 'SiteNavigationElement', name: 'About Us', url: generateCanonicalUrl('/about-us') },
          { '@type': 'SiteNavigationElement', name: 'Contact Us', url: generateCanonicalUrl('/contact-us') },
          { '@type': 'SiteNavigationElement', name: 'Privacy Policy', url: generateCanonicalUrl('/privacy-policy-3') },
          { '@type': 'SiteNavigationElement', name: 'Terms of Service', url: generateCanonicalUrl('/terms-of-service') },
        ],
      },
    ],
  };
}

function productGraph(product, priceFormatted) {
  const productUrl = generateCanonicalUrl(`/${product.slug}`);
  const name = product.h1 || product.name;
  const description = truncateMetaDescription(pickProductDescription(product, priceFormatted));
  const imageUrl = product.image ? absoluteAssetUrl(product.image) : absoluteAssetUrl('icon.svg');
  const price = parseFloat(String(priceFormatted || '4.99').replace(/[^0-9.]/g, '')) || 4.99;
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: 'SEORDP', url: SITE_URL, logo: absoluteAssetUrl('icon.svg') },
      { '@type': 'WebSite', '@id': `${SITE_URL}#website`, name: 'SEORDP', url: SITE_URL },
      {
        '@type': 'WebPage',
        '@id': `${productUrl}#webpage`,
        url: productUrl,
        name,
        description,
        isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}#website` },
        mainEntity: { '@id': `${productUrl}#product` },
        breadcrumb: { '@id': `${productUrl}#breadcrumb` },
      },
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name,
        description,
        url: productUrl,
        image: imageUrl,
        sku: product.slug,
        category: 'SEO Tools',
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${productUrl}#webpage`, url: productUrl },
        brand: { '@type': 'Brand', name: 'SEORDP' },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'USD',
          price: String(price),
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          priceValidUntil: validUntil,
        },
        ...(Number(product.rating_count) > 0 && Number(product.average_rating) > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: String(product.average_rating),
                reviewCount: String(product.rating_count),
              },
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${productUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Products', item: generateCanonicalUrl('/products') },
          { '@type': 'ListItem', position: 3, name, item: productUrl },
        ],
      },
    ],
  };
}

function blogPostGraph(post, title, description, imageUrl) {
  const postUrl = generateCanonicalUrl(`/${post.slug}`);
  const img = imageUrl ? absoluteAssetUrl(imageUrl.replace(/^\//, '')) : absoluteAssetUrl('icon.svg');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', name: 'SEORDP', url: SITE_URL, logo: absoluteAssetUrl('icon.svg') },
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}#article`,
        headline: title,
        description,
        url: postUrl,
        mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
        image: img,
        datePublished: post.date,
        dateModified: post.modified || post.date,
        author: { '@type': 'Organization', name: 'SEORDP' },
        publisher: {
          '@type': 'Organization',
          name: 'SEORDP',
          logo: { '@type': 'ImageObject', url: absoluteAssetUrl('icon.svg') },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: generateCanonicalUrl('/blog') },
          { '@type': 'ListItem', position: 3, name: title, item: postUrl },
        ],
      },
    ],
  };
}

function productsListingGraph(products, title, description) {
  const listUrl = generateCanonicalUrl('/products');
  const items = (products || []).slice(0, 100).map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: generateCanonicalUrl(`/${product.slug}`),
    name: product.h1 || product.name,
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${listUrl}#webpage`,
        url: listUrl,
        name: title,
        description,
        isPartOf: { '@type': 'WebSite', name: 'SEORDP', url: SITE_URL },
        mainEntity: { '@id': `${listUrl}#itemlist` },
      },
      {
        '@type': 'ItemList',
        '@id': `${listUrl}#itemlist`,
        name: 'SEORDP SEO Tools',
        numberOfItems: products.length,
        itemListElement: items,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Products', item: listUrl },
        ],
      },
    ],
  };
}

function webPageGraph(slug, title, description) {
  const pageUrl = generateCanonicalUrl(`/${slug}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { '@type': 'WebSite', name: 'SEORDP', url: SITE_URL },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
        ],
      },
    ],
  };
}

module.exports = {
  jsonLdScript,
  homepageGraph,
  productGraph,
  productsListingGraph,
  blogPostGraph,
  webPageGraph,
};
