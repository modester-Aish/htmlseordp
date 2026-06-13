/** Replace groupbuyseotools branding with SEORDP in meta and text. */
function rebrand(text) {
  if (!text) return '';
  return text
    .replace(/groupbuyseotools\.org/gi, 'seordp.net')
    .replace(/www\.groupbuyseotools\.org/gi, 'seordp.net')
    .replace(/Group Buy Seo Tools/gi, 'SEORDP')
    .replace(/Groupbuyseotools/gi, 'SEORDP')
    .replace(/Group Buy SEO Tools/gi, 'SEORDP')
    .replace(/\s*\|\s*backend/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function rebrandTitle(title, fallbackName) {
  let t = rebrand(stripTags(title));
  if (!t || t.length < 3) {
    t = `${fallbackName} Group Buy | SEORDP`;
  }
  if (!/seordp/i.test(t)) {
    t = t.replace(/\s*\|\s*[^|]+$/, '') + ' | SEORDP';
  }
  return t.slice(0, 60);
}

function stripTags(html) {
  return (html || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#039;/g, "'").trim();
}

module.exports = { rebrand, rebrandTitle, stripTags };
