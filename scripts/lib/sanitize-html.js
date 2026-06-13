const { rebrand } = require('./rebrand');

/** Remove all links and external/groupbuy references from product HTML. */
function cleanDescriptionHtml(html) {
  if (!html) return '';
  let out = html;
  const cut = out.search(/tab-reviews|woocommerce-Reviews|review_form_wrapper|id=["']respond["']/i);
  if (cut > -1) out = out.slice(0, cut);
  out = out.replace(/<small>Cancel reply<\/small>/gi, '');
  out = out.replace(/You must be logged in to post a review\.?/gi, '');
  return sanitizeProductHtml(out);
}

function sanitizeProductHtml(html) {
  if (!html) return '';
  let out = html;

  // Remove anchor tags but keep inner text
  out = out.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // Remove href/src pointing to groupbuyseotools or other domains in remaining tags
  out = out.replace(/\s(href|src|data-src|data-lazy-src)=["'][^"']*["']/gi, (match, attr) => {
    if (attr === 'src' || attr === 'data-src' || attr === 'data-lazy-src') return match;
    return '';
  });

  // Strip any leftover external URLs in text
  out = out.replace(/https?:\/\/[^\s"'<>]+/gi, '');
  out = out.replace(/groupbuyseotools\.org/gi, 'seordp.net');

  // Remove scripts, iframes, forms
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  out = out.replace(/<form[\s\S]*?<\/form>/gi, '');

  out = rebrand(out);
  return out.trim();
}

/** Clean scraped/AI product body HTML while keeping images and structure */
function cleanProductDescriptionHtml(html) {
  if (!html) return '';
  let out = html;

  out = out.replace(/<span[^>]*class="[^"]*citation[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  out = out.replace(/\sdata-path-to-node="[^"]*"/gi, '');
  out = out.replace(/\sdata-recalc-dims="[^"]*"/gi, '');
  out = out.replace(/<div[^>]*class="[^"]*source-inline-chip-container[^"]*"[^>]*>\s*<\/div>/gi, '');
  out = out.replace(/\ssrcset="[^"]*"/gi, '');
  out = out.replace(/\ssizes="[^"]*"/gi, '');
  out = out.replace(/\sloading="[^"]*"/gi, '');
  out = out.replace(/\sdecoding="[^"]*"/gi, '');
  out = out.replace(/\sclass="alignnone[^"]*"/gi, ' class="product-content-img"');

  // Fix invalid block elements nested inside <p> (common in scraped content)
  for (let i = 0; i < 5; i++) {
    out = out.replace(/<p[^>]*>\s*(<(?:h[1-6]|hr|ul|ol|div|table)[^>]*>)/gi, '$1');
    out = out.replace(/(<\/(?:h[1-6]|ul|ol|div|table)>)\s*<\/p>/gi, '$1');
    out = out.replace(/<p[^>]*>\s*<\/p>/gi, '');
    out = out.replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/gi, '');
  }

  return sanitizeProductHtml(out);
}

function localImageSrc(localPath, depth) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  return prefix + localPath.replace(/^\//, '');
}

module.exports = { sanitizeProductHtml, cleanDescriptionHtml, cleanProductDescriptionHtml, localImageSrc };
