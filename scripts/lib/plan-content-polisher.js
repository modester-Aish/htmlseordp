const CHECK_SVG =
  '<svg class="plan-check-icon" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';

function isPlanPage(slug) {
  if (/policy|privacy|terms|dmca|refund|about|contact|editorial|introduction|support|cart/i.test(slug)) {
    if (!/plan|combo|pricing/i.test(slug)) return false;
  }
  return /combo|plan|pricing|ahrefs-group|content-and-writ/i.test(slug);
}

function cleanPlanHtml(html) {
  return (html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<\/p>\s*<\/p>/gi, '</p>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<p>\s*(<(?:div|h[1-6]|a))/gi, '$1')
    .replace(/(<\/(?:div|h[1-6]|a)>)\s*<\/p>/gi, '$1')
    .replace(/<br\s*\/?>\s*<\/a>/gi, '</a>')
    .replace(/<a([^>]*)><br\s*\/?>/gi, '<a$1>')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '');
}

/** Normalize flex tool rows — strip broken br between svg and span */
function normalizeToolRows(html) {
  return html.replace(
    /<div([^>]*display:\s*flex[^>]*)>([\s\S]*?)<\/div>/gi,
    (block, attrs, inner) => {
      if (!/<span[^>]*>/.test(inner) || !/<svg/.test(inner)) return block;
      const spanMatch = inner.match(/<span[^>]*>([\s\S]*?)<\/span>/i);
      if (!spanMatch) return block;
      const label = spanMatch[1].trim();
      if (!label || label.length > 80) return block;
      return `<div class="plan-tool-row"${attrs ? '' : ''}>${CHECK_SVG}<span class="plan-tool-name">${label}</span></div>`;
    }
  );
}

/** White category cards → collapsible sections */
function wrapCategoryAccordions(html) {
  const re =
    /<div style="background:\s*white[^"]*"[^>]*>\s*<h3([^>]*)>([\s\S]*?)<\/h3>\s*<div>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let i = 0;
  return html.replace(re, (full, h3attrs, title, body) => {
    const t = title.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim();
    if (!/category|tools included|tool list/i.test(t) && !/^\d/.test(t)) return full;
    const open = i++ === 0 ? ' open' : '';
    const cleanedBody = normalizeToolRows(body);
    return `<details class="plan-category-acc"${open}><summary class="plan-category-summary"><span class="plan-category-title">${t}</span><span class="plan-category-chevron" aria-hidden="true">▼</span></summary><div class="plan-category-body">${cleanedBody}</div></details>`;
  });
}

function polishPlanContent(html, slug) {
  let out = cleanPlanHtml(html);
  if (/combo|designer|writer|basic|mega|ahrefs-group|ecom/i.test(slug)) {
    out = wrapCategoryAccordions(out);
    out = normalizeToolRows(out);
  }
  return out;
}

module.exports = { isPlanPage, polishPlanContent, cleanPlanHtml };
