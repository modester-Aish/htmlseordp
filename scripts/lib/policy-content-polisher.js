/** Clean & restyle legal/policy WP HTML after inline styles are stripped */

function flattenDivs(html) {
  let out = html || '';
  for (let i = 0; i < 25; i++) {
    const next = out
      .replace(/<div>\s*<\/div>/gi, '')
      .replace(/<\/p>\s*<\/p>/gi, '</p>')
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/<p>\s*(<(?:div|h[1-6]|ul|ol))/gi, '$1')
      .replace(/(<\/(?:div|h[1-6]|ul|ol)>)\s*<\/p>/gi, '$1')
      .replace(/<div>(\s*<(?:h[1-6]|ul|ol|div class))/gi, '$1')
      .replace(/(<\/(?:h[1-6]|ul|ol|div)>)\s*<\/div>/gi, '$1');
    if (next === out) break;
    out = next;
  }
  return out;
}

function stripPolicyIntro(html) {
  return (html || '')
    .replace(/<span>\s*⚖️\s*<\/span>[\s\S]*?Last Updated:\s*[^<]*<\/p>/gi, '')
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '')
    .replace(/Digital Millennium Copyright Act Notice and Takedown Procedure\s*<\/p>/gi, '')
    .replace(/<p>\s*Last Updated:[^<]*<\/p>/gi, '');
}

function cleanHeadings(html) {
  return (html || '')
    .replace(/<h2([^>]*)>([\s\S]*?)<br\s*\/?>\s*<\/h2>/gi, '<h2$1>$2</h2>')
    .replace(/<h2([^>]*)>\s+/gi, '<h2$1>')
    .replace(/\s+<\/h2>/gi, '</h2>');
}

function enhanceImportantNotice(html) {
  return (html || '').replace(
    /<h3[^>]*>\s*⚠️?\s*Important Notice\s*<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/i,
    '<div class="info-alert"><strong>⚠️ Important Notice</strong><p class="mt-2 mb-0">$1</p></div>'
  );
}

function enhanceInfoBox(html) {
  return (html || '').replace(
    /<h3[^>]*>\s*ℹ️?\s*Repeat Infringer Policy\s*<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/i,
    '<div class="info-info-box"><strong>ℹ️ Repeat Infringer Policy</strong><p class="mt-2 mb-0">$1</p></div>'
  );
}

function enhancePolicyCta(html, depth) {
  const { hrefPage } = require('./internal-links');
  const contact = hrefPage('contact-us', depth);
  return (html || '').replace(
    /<h2[^>]*>\s*Questions About DMCA\?\s*<\/h2>\s*<p[^>]*>([\s\S]*?)<\/p>\s*(?:<p[^>]*>\s*)?<a[^>]*href="[^"]*"[^>]*>([\s\S]*?)<\/a>/i,
    `<div class="info-policy-cta"><h2>Questions About DMCA?</h2><p>$1</p><a href="${contact}" class="info-policy-cta-btn">$2</a></div>`
  );
}

function wrapH4Cards(section) {
  const flat = flattenDivs(section);
  const pairs = [...flat.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)];
  if (pairs.length < 2) return flat;
  if (/Response Process/i.test(flat)) return flat;

  let cleaned = flat;
  const cards = pairs.map((m) => {
    cleaned = cleaned.replace(m[0], '');
    const num = (m[1].match(/^[0-9]️⃣/) || [''])[0];
    const title = m[1].replace(/^[0-9]️⃣\s*/, '').replace(/^\d+\.\s*/, '').trim();
    return `<div class="info-req-card"><span class="req-num">${num || '•'}</span><h4>${title}</h4><p>${m[2]}</p></div>`;
  });

  cleaned = flattenDivs(cleaned).replace(/(<\/div>\s*)+$/i, '');
  return `${cleaned}<div class="info-req-grid">${cards.join('')}</div>`;
}

function wrapProcessSteps(section) {
  const flat = flattenDivs(section);
  const steps = [
    ...flat.matchAll(
      /<div>\s*([📨🔍🗑️✉️])\s*<\/div>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi
    ),
  ];
  if (steps.length < 2) return flat;

  let cleaned = flat;
  const cards = steps.map((m) => {
    cleaned = cleaned.replace(m[0], '');
    return `<div class="info-process-step"><div class="step-icon">${m[1]}</div><h4>${m[2].trim()}</h4><p>${m[3]}</p></div>`;
  });

  cleaned = flattenDivs(cleaned).replace(/(<\/div>\s*)+$/i, '');
  return `${cleaned}<div class="info-process-steps">${cards.join('')}</div>`;
}

function wrapContactPanel(section) {
  if (!/DMCA Agent Contact/i.test(section)) return section;

  const dmcaEmail = section.match(/mailto:dmca@seordp\.net/i) ? 'dmca@seordp.net' : null;
  const adminEmail = section.match(/mailto:admin@seordp\.net/i) ? 'admin@seordp.net' : null;

  const panel = `<div class="info-contact-panel"><h3>DMCA Agent Contact</h3>
    ${dmcaEmail ? `<div class="info-contact-row"><span class="info-contact-label">Email</span><span class="info-contact-value"><a href="mailto:${dmcaEmail}">${dmcaEmail}</a></span></div>` : ''}
    ${adminEmail ? `<div class="info-contact-row"><span class="info-contact-label">Alternative</span><span class="info-contact-value"><a href="mailto:${adminEmail}">${adminEmail}</a></span></div>` : ''}
    <div class="info-contact-row"><span class="info-contact-label">Subject</span><span class="info-contact-value">DMCA Takedown Request – [Your Name]</span></div>
  </div>`;

  return section.replace(/<h3[^>]*>\s*DMCA Agent Contact\s*<\/h3>[\s\S]*?(?=<\/div>\s*<\/div>|<h2|$)/i, panel);
}

function wrapChecklist(section) {
  return section.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, inner) => {
    if (!/✓/.test(inner)) return match;
    const items = [...inner.matchAll(/<li[^>]*>\s*✓\s*([\s\S]*?)\s*<\/li>/gi)];
    if (!items.length) return match;
    return `<ul class="info-checklist">${items.map((m) => `<li>${m[1].trim()}</li>`).join('')}</ul>`;
  });
}

function extractTailBlocks(section) {
  let tail = '';
  let s = section;
  s = s.replace(/<div class="info-info-box">[\s\S]*?<\/div>/i, (m) => {
    tail += m;
    return '';
  });
  s = s.replace(/<div class="info-policy-cta">[\s\S]*?<\/div>/i, (m) => {
    tail += m;
    return '';
  });
  return { body: s, tail };
}

function polishSection(section) {
  const { body, tail } = extractTailBlocks(section);
  let s = flattenDivs(body);
  s = wrapContactPanel(s);
  s = wrapChecklist(s);
  s = wrapProcessSteps(s);
  s = wrapH4Cards(s);
  return flattenDivs(s) + tail;
}

function structurePolicyContent(html, depth) {
  html = flattenDivs(html);
  html = stripPolicyIntro(cleanHeadings(html));
  html = enhanceImportantNotice(html);
  html = enhanceInfoBox(html);
  html = enhancePolicyCta(html, depth);

  let alert = '';
  let footer = '';

  html = html.replace(/<div class="info-alert">[\s\S]*?<\/div>/i, (m) => {
    alert = m;
    return '';
  });
  html = html.replace(/<div class="info-info-box">[\s\S]*?<\/div>/gi, (m) => {
    footer += m;
    return '';
  });
  html = html.replace(/<div class="info-policy-cta">[\s\S]*?<\/div>/gi, (m) => {
    footer += m;
    return '';
  });

  html = flattenDivs(html);

  const parts = html.split(/(?=<h2[\s>])/i).map((p) => p.trim()).filter(Boolean);
  const sections = parts
    .filter((p) => /^<h2/i.test(p))
    .map((p) => {
      const polished = polishSection(p);
      return `<div class="info-section">${polished}</div>`;
    })
    .join('');

  return `${alert}${sections}${footer}`;
}

function isPolicySlug(slug) {
  return /policy|dmca|terms|privacy|refund|editorial/i.test(slug);
}

function polishPolicyContent(html, slug, depth) {
  if (!isPolicySlug(slug)) return null;
  return structurePolicyContent(html, depth);
}

module.exports = { polishPolicyContent, isPolicySlug, flattenDivs };
