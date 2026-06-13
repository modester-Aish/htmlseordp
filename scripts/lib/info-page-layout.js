const { hrefHome } = require('./internal-links');



const ARROW_LEFT =

  '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>';



const INFO_PROSE =

  'prose prose-lg prose-invert max-w-none info-prose prose-headings:text-white prose-headings:font-bold prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-white prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-img:rounded-lg prose-img:shadow-lg';



function renderHighlights(highlights, accentClasses) {

  if (!highlights?.length) return '';

  const border = accentClasses?.border || 'border-slate-600/50';

  return `<div class="info-highlights animate-fade-in-up">

    ${highlights

      .map(

        (h) => `<div class="info-highlight-card ${border}">

        <span class="hl-icon">${h.icon || '✦'}</span>

        <div class="hl-value">${h.value}</div>

        <div class="hl-label">${h.label}</div>

      </div>`

      )

      .join('')}

  </div>`;

}



function renderInfoHero({ theme, titleHtml, subtitle, depth = 1 }) {

  const ac = theme?.accentClasses || {};

  const accent = ac.badge || 'bg-teal-500/10 border-teal-500/20 text-teal-400';

  const blobA = ac.blob || 'bg-teal-500/10';

  const blobB = theme?.accent === 'purple' ? 'bg-teal-500/10' : 'bg-purple-500/10';

  const ring = ac.ring || 'ring-teal-500/20';

  const icon = theme?.icon || '📄';

  const badge = theme?.badge || 'SEORDP';



  return `<section class="relative py-10 md:py-14 overflow-hidden">

    <div class="absolute inset-0 pointer-events-none">

      <div class="absolute top-10 left-10 w-64 h-64 ${blobA} rounded-full blur-3xl animate-float"></div>

      <div class="absolute bottom-10 right-10 w-64 h-64 ${blobB} rounded-full blur-3xl animate-float" style="animation-delay:2s"></div>

    </div>

    <div class="container mx-auto px-4 relative z-10">

      <a href="${hrefHome(depth)}" class="mb-6 inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors animate-fade-in">

        ${ARROW_LEFT}

        Back to Home

      </a>

      <div class="max-w-4xl mx-auto text-center animate-fade-in-up">

        <div class="info-icon-hero ${ring} ${blobA}">${icon}</div>

        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${accent}">

          <span class="font-bold text-sm uppercase tracking-wide">${badge}</span>

        </div>

        <h1 class="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">${titleHtml}</h1>

        ${subtitle ? `<p class="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">${subtitle}</p>` : ''}

        ${renderHighlights(theme?.highlights, ac)}

      </div>

    </div>

  </section>`;

}



function resolveTheme(opts) {
  if (opts.theme) return opts.theme;
  const { ACCENT } = require('./page-themes');
  const accent = opts.badgeClass || 'teal';
  const iconFromBadge = (opts.badge || '').match(/^(\S+)/);
  return {
    badge: (opts.badge || 'SEORDP').replace(/^\S+\s*/, '').trim() || opts.badge || 'SEORDP',
    accent,
    accentClasses: ACCENT[accent] || ACCENT.teal,
    icon: opts.icon || iconFromBadge?.[1] || '📄',
    highlights: opts.highlights,
  };
}

function renderInfoShell(opts) {
  const { titleHtml, subtitle, content, depth = 1, contentClass = '' } = opts;
  const theme = resolveTheme(opts);

  return `<div class="min-h-screen bg-slate-900 relative overflow-x-hidden">

  <div class="absolute inset-0 matrix-container opacity-10 pointer-events-none"><div class="matrix-grid"></div></div>

  ${renderInfoHero({ theme, titleHtml, subtitle, depth })}

  <div class="pb-16 relative z-10">

    <div class="container mx-auto px-4">

      <div class="max-w-4xl mx-auto ${contentClass}">${content}</div>

    </div>

  </div>

</div>`;

}



function renderInfoContentCard(html, theme, extraClass = '') {
  const border = theme?.accentClasses?.border || 'border-slate-700';
  const themeClass = theme?.accent ? `info-theme-${theme.accent}` : '';

  return `<div class="card-gradient rounded-2xl border-2 ${border} p-8 md:p-12 animate-fade-in-up ${themeClass} ${extraClass}">

    <div class="${INFO_PROSE}">${html}</div>

  </div>`;

}



/** Short display title for hero — prefer CSV h1, else first segment before | or – */

function heroDisplayTitle(rawTitle, seoH1) {

  const t = (seoH1 || rawTitle || '').trim();

  const short = t.split(/\s*[|–—]\s*/)[0].trim();

  return short || t;

}



function accentTitleHtml(title, accentWord, accentTextClass = 'text-teal-400') {

  const t = title.trim();

  if (!accentWord || !t.toLowerCase().includes(accentWord.toLowerCase())) {

    const words = t.split(/\s+/);

    if (words.length >= 2) {

      const mid = Math.ceil(words.length / 2);

      return `${words.slice(0, mid).join(' ')} <span class="${accentTextClass}">${words.slice(mid).join(' ')}</span>`;

    }

    return t;

  }

  const re = new RegExp(`(${accentWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');

  return t.replace(re, `<span class="${accentTextClass}">$1</span>`);

}



module.exports = {

  INFO_PROSE,

  ARROW_LEFT,

  renderInfoHero,

  renderInfoShell,

  renderInfoContentCard,

  heroDisplayTitle,

  accentTitleHtml,

};

