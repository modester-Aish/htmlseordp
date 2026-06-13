function toLocalUploadUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(
    /https?:\/\/(?:app\.faditools\.com|backend\.seordp\.net)\/wp-content\/uploads\/(.+)$/i
  );
  if (match) return `/wp-content/uploads/${match[1].replace(/\?.*$/, '')}`;
  return url;
}

function removeBackendUrls(content) {
  if (!content) return '';
  let cleanedContent = content;
  cleanedContent = cleanedContent.replace(
    /https?:\/\/(?:app\.faditools\.com|backend\.seordp\.net)(\/[^\s"']*)/gi,
    (match, path) => {
      const cleanPath = path.replace(/^\/(?:pages?|posts?|products?)\//, '/');
      if (/^\/wp-content\/uploads\//i.test(cleanPath)) return cleanPath;
      return `https://seordp.net${cleanPath}`;
    }
  );
  cleanedContent = cleanedContent.replace(
    /href=["']https?:\/\/(?:app\.faditools\.com|backend\.seordp\.net)([^"']+)["']/gi,
    (match, path) => {
      const cleanPath = path.replace(/^\/(?:pages?|posts?|products?)\//, '/');
      if (/^\/wp-content\/uploads\//i.test(cleanPath)) return `href="${cleanPath}"`;
      return `href="https://seordp.net${cleanPath}"`;
    }
  );
  return cleanedContent;
}

function fixBrokenLinks(content) {
  if (!content) return '';
  let fixedContent = content;
  const linkMappings = {
    '/pages/single-tools-list': '/products',
    '/single-tools-list': '/products',
    '/pages/contact-us': '/contact-us',
    '/pages/list-seo-tools-combo-package': '/list-seo-tools-combo-package',
    '/pages/combo-seo-tools-standard-plan': '/combo-seo-tools-standard-plan',
    '/refund-returns': '/return-and-refund-policy',
    '/small-plan': '/combo-seo-tools-small',
    '/mega-plan': '/combo-mega-pack-tools',
    '/lite-plan': '/combo-seo-tools-basic-plan',
    '/ahrefs-combo': '/ahrefs-group-buy',
    '/writer-plan': '/content-and-writting',
  };
  Object.keys(linkMappings).forEach((broken) => {
    const slug = broken.replace(/^\//, '');
    if (slug.startsWith('pages/')) return;
    linkMappings[`/blog/${slug}`] = linkMappings[broken];
  });
  Object.entries(linkMappings).forEach(([broken, correct]) => {
    const escapedBroken = broken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    fixedContent = fixedContent.replace(
      new RegExp(`(href=["'])${escapedBroken}([#"']?[^"']*)(["'])`, 'gi'),
      (match, prefix, extra, suffix) => `${prefix}${correct}${extra}${suffix}`
    );
  });
  fixedContent = fixedContent.replace(
    /(href=["'])(?:https?:\/\/seordp\.net)?\/pages\/([^"'\s#]+)([#"']?[^"']*)(["'])/gi,
    (match, prefix, slug, extra, suffix) => {
      if (!slug || slug.trim() === '') return match;
      const fullPath = `/pages/${slug}`;
      if (linkMappings[fullPath]) return `${prefix}${linkMappings[fullPath]}${extra}${suffix}`;
      return `${prefix}/${slug}${extra}${suffix}`;
    }
  );
  fixedContent = fixedContent.replace(
    /(href=["'])(?:https?:\/\/seordp\.net)?\/blog\/([^"'\s#]+)([#"']?[^"']*)(["'])/gi,
    (match, prefix, slug, extra, suffix) => {
      if (!slug || slug.trim() === '') return match;
      const fullPath = `/blog/${slug}`;
      if (linkMappings[fullPath]) return `${prefix}${linkMappings[fullPath]}${extra}${suffix}`;
      return `${prefix}/${slug}${extra}${suffix}`;
    }
  );
  return fixedContent;
}

function stripPoweredBy(content) {
  if (!content) return '';
  let out = content;
  out = out.replace(
    /<p[^>]*>\s*powered\s+by\s*:?\s*(?:<a[^>]*>.*?<\/a>|[^<]*?[\w.-]+\.(?:org|us|com|net)[^\s<]*)\s*<\/p>/gi,
    ''
  );
  out = out.replace(
    /\bpowered\s+by\s*:?\s*(<a[^>]*>.*?<\/a>|[^\s<]*[\w.-]+\.(?:org|us|com|net)[^\s<]*)/gi,
    ''
  );
  out = out.replace(/<p>\s*<\/p>/g, '');
  return out.trim();
}

function removeShortcodes(content) {
  if (!content) return '';
  let cleanContent = content;
  cleanContent = cleanContent.replace(/\[et_pb_[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/\[\/et_pb_[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/\[elementor-[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/\[\/elementor-[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/\[vc_[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/\[\/vc_[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/\[[a-z_\-]+[^\]]*\]/gi, '');
  cleanContent = cleanContent.replace(/\[\/[a-z_\-]+\]/gi, '');
  cleanContent = cleanContent.replace(/<p>\s*<\/p>/g, '');
  return cleanContent.trim();
}

function ensureImgAlt(html, fallbackAlt) {
  if (!html || !fallbackAlt) return html || '';
  const safeAlt = fallbackAlt.replace(/"/g, '&quot;').trim() || 'Image';
  return html.replace(/<img(\s[^>]*?)?\s*\/?>/gi, (match, attrs) => {
    const a = (attrs || '').trim();
    const hasAlt = /alt\s*=\s*["'][^"']*["']/i.test(a);
    const hasEmptyAlt = /alt\s*=\s*["']\s*["']/i.test(a);
    if (hasAlt && !hasEmptyAlt) return match;
    const isSelfClosing = /\s*\/\s*$/.test(a);
    const attrsNoSlash = a.replace(/\s*\/\s*$/, '').trimEnd();
    const fixedAttrs = hasEmptyAlt
      ? attrsNoSlash.replace(/alt\s*=\s*["']\s*["']/i, `alt="${safeAlt}"`)
      : `${attrsNoSlash} alt="${safeAlt}"`;
    return isSelfClosing ? `<img ${fixedAttrs} />` : `<img ${fixedAttrs}>`;
  });
}

function cleanWordPressContent(content) {
  if (!content) return '';
  let cleanContent = removeShortcodes(content);
  cleanContent = removeBackendUrls(cleanContent);
  cleanContent = fixBrokenLinks(cleanContent);
  cleanContent = stripPoweredBy(cleanContent);
  cleanContent = cleanContent.replace(/data-[a-z\-]+=["'][^"']*["']/gi, '');
  return cleanContent;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractHeadings(content) {
  if (!content) return [];
  const headings = [];
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  const usedIds = new Set();
  let match;
  headingRegex.lastIndex = 0;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    let text = match[2].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
    if (text) {
      let id = slugify(text);
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter++}`;
      }
      usedIds.add(uniqueId);
      headings.push({ level, text, id: uniqueId });
    }
  }
  return headings;
}

function addHeadingIds(content) {
  if (!content) return '';
  const usedIds = new Set();
  return content.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, level, attributes, text) => {
    if (/id=["'][^"']+["']/i.test(attributes)) return match;
    const textContent = text.replace(/<[^>]*>/g, '').trim();
    if (!textContent) return match;
    let id = slugify(textContent);
    let uniqueId = id;
    let counter = 1;
    while (usedIds.has(uniqueId)) uniqueId = `${id}-${counter++}`;
    usedIds.add(uniqueId);
    const newAttributes = attributes.trim() ? `${attributes} id="${uniqueId}"` : `id="${uniqueId}"`;
    return `<h${level} ${newAttributes}>${text}</h${level}>`;
  });
}

function removeFirstHeading(content) {
  if (!content) return '';
  return content.replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/i, '');
}

function downgradeH1ToH2(content) {
  if (!content) return '';
  return content.replace(/<\/h1\s*>/gi, '</h2>').replace(/<h1\b/gi, '<h2');
}

module.exports = {
  toLocalUploadUrl,
  cleanWordPressContent,
  ensureImgAlt,
  extractHeadings,
  addHeadingIds,
  removeFirstHeading,
  downgradeH1ToH2,
};
