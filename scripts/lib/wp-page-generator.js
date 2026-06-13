const { cleanPageTitle } = require('./utils');
const { cleanWordPressContent, ensureImgAlt, removeFirstHeading, downgradeH1ToH2 } = require('./content-parser');
const { localizeInternalLinks } = require('./internal-links');
const { getSeoMeta } = require('./seo-meta');
const { getPageTheme } = require('./page-themes');
const { polishPolicyContent } = require('./policy-content-polisher');
const { isPlanPage, polishPlanContent } = require('./plan-content-polisher');
const { renderPlanPageShell } = require('./plan-page-layout');
const {
  renderInfoShell,
  renderInfoContentCard,
  heroDisplayTitle,
  accentTitleHtml,
} = require('./info-page-layout');

function stripInlineStyles(html) {
  return (html || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\sstyle="[^"]*"/gi, '')
    .replace(/\sstyle='[^']*'/gi, '')
    .replace(/class="readable-content"/gi, '')
    .replace(/<div class="">\s*/gi, '<div>')
    .replace(/<div>\s*<\/div>/gi, '');
}

function cleanWpHtml(html) {
  return (html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/p>\s*<\/p>/gi, '</p>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<p>\s*(<div)/gi, '$1')
    .replace(/(<\/div>)\s*<\/p>/gi, '$1');
}

function wrapRequirementCards(html) {
  const blocks = html.split(/(?=<h4[\s>])/i);
  if (blocks.length < 3) return html;
  const head = blocks[0];
  const cards = blocks.slice(1).filter((b) => b.trim());
  if (!cards.length) return html;
  return `${head}<div class="info-grid-cards">${cards.map((c) => `<div class="info-grid-card">${c}</div>`).join('')}</div>`;
}

function structureContent(html, theme) {
  const level = theme.splitOn === 'h3' ? 'h3' : 'h2';
  const re = new RegExp(`(?=<${level}[\\s>])`, 'i');
  const parts = html.split(re).map((p) => p.trim()).filter(Boolean);

  if (parts.length <= 1) return wrapRequirementCards(html);

  const startsWithHeading = new RegExp(`^<${level}`, 'i').test(parts[0]);

  if (theme.splitOn === 'h3') {
    const lead = startsWithHeading ? '' : `<div class="info-lead">${parts[0]}</div>`;
    const sections = (startsWithHeading ? parts : parts.slice(1))
      .map((s) => `<div class="info-grid-card">${s}</div>`)
      .join('');
    return `${lead}<div class="info-grid-cards">${sections}</div>`;
  }

  let out = '';
  for (let i = 0; i < parts.length; i++) {
    if (i === 0 && !startsWithHeading) {
      out += `<div class="info-lead">${parts[i]}</div>`;
    } else {
      out += `<div class="info-section">${wrapRequirementCards(parts[i])}</div>`;
    }
  }
  return out;
}

function enhanceImportantNotice(html) {
  return html.replace(
    /<h3>\s*⚠️?\s*Important Notice\s*<\/h3>\s*<p>([\s\S]*?)<\/p>/i,
    '<div class="info-alert"><strong>⚠️ Important Notice</strong><p class="mt-2 mb-0">$1</p></div>'
  );
}

function preparePlanPageContent(page, title, depth) {
  const { assetPrefix } = require('./utils');
  let content = cleanWordPressContent(page.content?.rendered || '');
  content = polishPlanContent(content, page.slug);
  content = removeFirstHeading(content);
  content = ensureImgAlt(downgradeH1ToH2(content), title);
  const p = assetPrefix(depth);
  content = content.replace(/src="\/wp-content\//g, `src="${p}wp-content/`);
  content = localizeInternalLinks(content, depth);
  return content;
}

function preparePageContent(page, title, depth, theme) {
  const { assetPrefix } = require('./utils');

  if (isPlanPage(page.slug)) {
    return preparePlanPageContent(page, title, depth);
  }

  let content = cleanWordPressContent(page.content?.rendered || '');
  content = stripInlineStyles(content);
  content = cleanWpHtml(content);
  content = removeFirstHeading(content);
  content = ensureImgAlt(downgradeH1ToH2(content), title);
  const p = assetPrefix(depth);
  content = content.replace(/src="\/wp-content\//g, `src="${p}wp-content/`);
  content = localizeInternalLinks(content, depth);

  const policyHtml = polishPolicyContent(content, page.slug, depth);
  if (policyHtml) {
    content = policyHtml;
  } else {
    content = enhanceImportantNotice(content);
    content = structureContent(content, theme);
  }

  return content;
}

function cleanExcerpt(excerpt) {
  return (excerpt || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFeaturedImage(page, depth) {
  const { assetPrefix } = require('./utils');
  const img =
    page._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
    page.jetpack_featured_media_url ||
    page.featured_media_url;
  if (!img) return null;
  const p = assetPrefix(depth);
  if (img.startsWith('http')) return img;
  return `${p}${img.replace(/^\//, '')}`;
}

function renderWpPageBody(page, depth = 1, root) {
  const rawTitle = cleanPageTitle(page.title?.rendered || '');
  const seo = getSeoMeta(page.slug, root) || getSeoMeta(rawTitle, root);
  const theme = getPageTheme(page.slug, rawTitle);
  const displayTitle = heroDisplayTitle(rawTitle, seo?.h1);
  const accentClass = theme.accentClasses?.text || 'text-teal-400';
  const titleHtml = accentTitleHtml(displayTitle, theme.accentWord, accentClass);
  const content = preparePageContent(page, rawTitle, depth, theme);

  if (isPlanPage(page.slug)) {
    return renderPlanPageShell({
      titleHtml: displayTitle,
      content,
      depth,
      featuredImage: getFeaturedImage(page, depth),
    });
  }

  const excerpt = cleanExcerpt(page.excerpt?.rendered);
  const subtitle =
    theme.subtitle ||
    (excerpt ? excerpt.slice(0, 160) + (excerpt.length > 160 ? '…' : '') : 'Official information from SEORDP — group buy SEO tools &amp; premium access.');

  return renderInfoShell({
    theme,
    titleHtml,
    subtitle,
    depth,
    content: renderInfoContentCard(content, theme),
  });
}

module.exports = { renderWpPageBody, preparePageContent };
