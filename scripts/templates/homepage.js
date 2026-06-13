const { assetPrefix } = require('../lib/utils');
const { hrefPage } = require('../lib/internal-links');
const {
  POPULAR_TOOLS,
  PRICING_CARDS,
  WHY_FEATURES,
  WHY_ICONS,
  HOW_STEPS,
  FACEBOOK_REVIEWS,
  TRUSTPILOT_REVIEWS,
  FAQS,
  STAR_SVG,
  getToolHref,
  toolLogoHtml,
} = require('../lib/homepage-data');

function renderHomepage(depth, popularTools = POPULAR_TOOLS) {
  const p = assetPrefix(depth);
  const heroToolsLeft = [
    { name: 'Ahrefs', logo: 'ahrefs-logo.svg', slug: 'ahrefs' },
    { name: 'SEMrush', logo: 'semrush-logo.svg', slug: 'semrush-group-buy-2022' },
    { name: 'ChatGPT Plus', logo: 'chatgpt-logo.svg', slug: 'chatgpt-group-buy-plus-pro' },
    { name: 'Claude AI', logo: 'claude-logo.svg', slug: 'claude-ai' },
  ];
  const heroToolsRight = [
    { name: 'Canva Pro', logo: 'canva-logo.svg', slug: 'canva' },
    { name: 'Moz Pro', logo: 'moz-logo.svg', slug: 'mozzat' },
    { name: 'RunwayML', logo: 'runwayml-logo.svg', slug: 'runwayml-group-buy' },
    { name: 'Netflix', logo: 'netflix-logo.svg', slug: 'netflix' },
  ];

  const heroFeatures = [
    '✓ Ahrefs, SEMrush, Moz Pro',
    '✓ ChatGPT Plus & Claude AI',
    '✓ Canva Pro & Design Tools',
    '✓ 24/7 Customer Support',
  ];

  const toolCard = (t) =>
    `<div class="bg-white rounded-xl p-4 shadow-xl w-60 hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-slate-50 rounded-lg p-2.5 flex items-center justify-center relative"><img src="${p}tools/${t.logo}" alt="${t.name}" class="max-h-full max-w-full object-contain"></div>
        <div><div class="font-bold text-slate-900 text-sm">${t.name}</div><div class="text-xs text-green-600 font-semibold">● Active</div></div>
      </div>
    </div>`;

  const whyGrid = WHY_FEATURES.map(
    (f, i) =>
      `<div class="group bg-slate-800 p-8 rounded-xl border border-slate-700 hover:border-teal-500 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300">
        <div class="w-14 h-14 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white transition-all">${WHY_ICONS[i] || '★'}</div>
        <h3 class="text-xl font-bold text-white mb-3">${f.title}</h3>
        <p class="text-slate-400 leading-relaxed">${f.desc}</p>
      </div>`
  ).join('');

  const popularToolsGrid = popularTools.map((tool, index) => {
    const extraClass = index >= 20 ? ' hidden popular-tool-extra' : '';
    const floatClass = index % 3 === 0 ? 'animate-float' : index % 3 === 1 ? 'animate-float-delay-1' : 'animate-float-delay-2';
    const toolHref = getToolHref(tool.id, p);
    return `<a href="${toolHref}" class="popular-tool-card bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 group animate-fade-in-up hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20 hover:-translate-y-2 block h-full cursor-pointer${extraClass}" style="animation-delay:${index * 0.1}s">
      <div class="relative z-10 flex flex-col h-full">
        <div class="w-20 h-20 rounded-2xl overflow-hidden mb-6 mx-auto bg-white p-3 group-hover:scale-110 transition-transform duration-300 relative flex items-center justify-center ${floatClass}">
          ${toolLogoHtml(tool, p)}
        </div>
        <h3 class="text-2xl font-bold text-white mb-2 text-center group-hover:text-teal-400 transition-colors duration-300">${tool.name}</h3>
        <p class="text-slate-400 text-sm text-center mb-6">${tool.description}</p>
        <div class="text-center mb-6">
          <span class="text-3xl font-bold text-teal-400">${tool.price}</span>
          <div class="text-sm text-slate-500">vs ${tool.originalPrice}</div>
        </div>
        <div class="mt-auto"><div class="block w-full btn-primary py-3 text-center pointer-events-none">View Details</div></div>
      </div>
    </a>`;
  }).join('');

  const pricingCards = PRICING_CARDS.map((card, i) => {
    const frontTools = card.tools.slice(0, 6);
    const toolList = frontTools
      .map(
        (t) =>
          `<li class="flex items-center gap-2 text-slate-300 text-sm"><span class="flex-shrink-0 w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center"><span class="text-teal-400 text-[10px] font-bold">✓</span></span><span class="truncate">${t}</span></li>`
      )
      .join('');
    const allTools = card.tools
      .map(
        (t) =>
          `<li class="flex items-center gap-2 text-slate-400 text-xs"><span class="text-teal-400/80">✓</span><span class="truncate">${t}</span></li>`
      )
      .join('');
    return `<div class="relative animate-fade-in-up ${card.popular ? 'h-[520px] lg:-mt-1' : 'h-[500px]'}" data-pricing-card="${i}" style="perspective:1200px">
      <div class="relative w-full h-full transition-transform duration-500 ease-out" data-pricing-inner style="transform-style:preserve-3d">
        <div class="absolute w-full h-full rounded-2xl overflow-hidden flex flex-col ${card.popular ? 'ring-2 ring-teal-400/50 bg-slate-800/90 shadow-2xl shadow-teal-500/10 scale-[1.02]' : 'border border-slate-600/60 bg-slate-800/80 backdrop-blur-sm hover:border-slate-500'}" style="backface-visibility:hidden">
          <div class="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl"><div class="absolute top-0 right-0 w-28 h-28 rotate-45 translate-x-10 -translate-y-10 bg-gradient-to-br ${card.iconBgColor} opacity-90"></div></div>
          <div class="p-6 flex flex-col flex-1 relative z-10">
            <h3 class="text-[11px] font-semibold text-slate-400 tracking-widest mb-1">${card.name}</h3>
            <span class="text-4xl font-bold text-white tabular-nums">${card.price}</span>
            <span class="text-slate-500 text-sm mb-4 block">per month</span>
            <p class="text-slate-400 text-xs mb-4">${card.toolCount}</p>
            <ul class="flex-1 space-y-2 mb-4">${toolList}</ul>
            <button type="button" class="text-teal-400 text-xs font-medium mb-4 hover:text-teal-300 text-left" data-flip-card="${i}">View all ${card.tools.length} tools →</button>
            <a href="https://members.seotoolsgroupbuy.us/signup" target="_blank" rel="noopener noreferrer" class="w-full py-3 rounded-xl font-semibold text-sm text-center block transition-all ${card.popular ? 'bg-teal-500 text-white hover:bg-teal-400' : 'bg-transparent border-2 border-slate-500 text-white hover:bg-slate-700/50 hover:border-slate-400'}">Get started</a>
          </div>
        </div>
        <div class="absolute w-full h-full rounded-2xl overflow-hidden flex flex-col border border-slate-600/60 bg-slate-800/90" style="backface-visibility:hidden;transform:rotateY(180deg)">
          <div class="h-16 bg-gradient-to-b from-teal-500/20 to-transparent shrink-0"></div>
          <div class="p-5 flex flex-col flex-1 min-h-0">
            <p class="text-slate-500 text-xs mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-teal-400/80"></span> Hover out to return</p>
            <div class="text-sm font-bold text-white mb-3">${card.name}</div>
            <ul class="flex-1 overflow-y-auto custom-scrollbar space-y-1.5" style="max-height:340px">${allTools}</ul>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  const howSteps = HOW_STEPS.map(
    (item, index) =>
      `<div class="relative animate-fade-in-up">
        ${index < HOW_STEPS.length - 1 ? '<div class="absolute left-10 top-24 w-0.5 h-20 bg-gradient-to-b from-teal-500 to-teal-600 opacity-30 hidden md:block"></div>' : ''}
        <div class="flex flex-col md:flex-row gap-6 mb-8">
          <div class="flex-shrink-0 relative">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex flex-col items-center justify-center shadow-2xl">
              <span class="text-white text-3xl font-black">${item.step}</span>
            </div>
            <div class="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 blur-xl opacity-40"></div>
          </div>
          <div class="flex-1">
            <div class="card-gradient p-6 rounded-2xl border-2 border-slate-700 hover:border-teal-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10 group relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <h3 class="text-2xl font-black text-white mb-3 group-hover:text-teal-400 transition-colors">${item.title}</h3>
              <p class="text-slate-300 leading-relaxed">${item.desc}</p>
            </div>
          </div>
        </div>
      </div>`
  ).join('');

  const stars = (color) => Array.from({ length: 5 }, () => `<span class="${color}">${STAR_SVG}</span>`).join('');

  const reviewBlock = (review, starColor) =>
    `<div class="space-y-4">
      <div class="flex items-start gap-3">
        <div class="flex items-center gap-1">${stars(starColor)}</div>
        <div>
          <h3 class="font-bold text-white leading-tight">${review.name}</h3>
          ${review.role ? `<div class="text-xs text-slate-400 mt-0.5">${review.role}</div>` : ''}
        </div>
      </div>
      <p class="text-slate-300 leading-relaxed">${review.review}</p>
    </div>`;

  const facebookReviews = FACEBOOK_REVIEWS.map((r) => reviewBlock(r, 'text-yellow-400')).join('');
  const trustpilotInitial = TRUSTPILOT_REVIEWS.slice(0, 3).map((r) => reviewBlock(r, 'text-green-500')).join('');
  const trustpilotExtra = TRUSTPILOT_REVIEWS.slice(3).map((r) => `<div class="hidden trustpilot-extra">${reviewBlock(r, 'text-green-500')}</div>`).join('');

  const faqHtml = FAQS.map(
    (faq, i) =>
      `<div class="group relative card-gradient overflow-hidden transition-all duration-300 animate-fade-in-up" data-faq-item="${i}">
        <button type="button" class="w-full p-6 flex items-start gap-4 text-left" data-faq-toggle="${i}">
          <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg"><span class="text-2xl">${faq.icon}</span></div>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-white mb-1 group-hover:text-teal-400 transition-colors">${faq.q}</h3>
            <p class="text-sm text-slate-500 faq-hint">Click to expand</p>
          </div>
          <svg class="flex-shrink-0 h-6 w-6 text-teal-400 transition-transform duration-300 faq-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div class="overflow-hidden transition-all duration-300 max-h-0 opacity-0 faq-answer-wrap" data-faq-answer-wrap>
          <div class="px-6 pb-6 pl-[88px]">
            <div class="border-l-2 border-teal-500/30 pl-4"><p class="text-slate-300 leading-relaxed">${faq.a}</p></div>
          </div>
        </div>
      </div>`
  ).join('');

  return `<div class="min-h-screen bg-slate-900">
<section class="relative pt-24 pb-32 overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
  <div class="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
  <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
  <div class="container mx-auto px-6 md:px-20 relative z-10">
    <div class="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
      <div class="space-y-8">
        <div class="text-teal-400 text-sm font-semibold tracking-wide uppercase">🚀 BEST GROUP BUY SEO TOOLS 2025</div>
        <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">Group Buy SEO Tools for Everyday SEO Work</h1>
        <p class="text-lg text-slate-300 leading-relaxed max-w-xl">Access 50+ premium SEO tools including Ahrefs, SEMrush, Moz Pro, and more. Join 45,000+ marketers, agencies, and businesses growing their online presence with affordable group buy tools.</p>
        <div class="flex flex-wrap gap-4">
            <a href="https://members.seotoolsgroupbuy.us/signup" target="_blank" rel="noopener noreferrer" class="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg">Get started</a>
          <a href="#pricing" class="px-8 py-4 bg-transparent hover:bg-white/5 text-white font-semibold rounded-lg border-2 border-white/30 hover:border-white/50 transition-all duration-200">View pricing</a>
        </div>
        <p class="text-sm text-slate-400">⚡ Instant activation • 🔒 Secure access • 💯 99% uptime guarantee • 💳 Money-back guarantee</p>
      </div>
      <div class="relative h-[600px] w-full">
        <div class="absolute -left-20 top-1/2 -translate-y-1/2 space-y-5 z-10">${heroToolsLeft.map(toolCard).join('')}</div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-8 shadow-2xl w-80 z-30">
          <div class="text-white/90 text-sm font-semibold mb-2">🔥 MOST POPULAR</div>
          <div class="text-white text-4xl font-black mb-2">$4.99<span class="text-xl font-normal">/mo</span></div>
          <p class="text-white/80 text-sm mb-6">Save $495/month compared to individual subscriptions</p>
          <div class="space-y-2 mb-6">${heroFeatures.map((f) => `<div class="flex items-center gap-2 text-white text-sm"><span>${f}</span></div>`).join('')}</div>
          <a href="https://members.seotoolsgroupbuy.us/signup" target="_blank" rel="noopener noreferrer" class="block w-full py-3 bg-white text-teal-600 font-bold rounded-xl text-center hover:bg-slate-100 transition-colors">Get Started Now</a>
        </div>
        <div class="absolute -right-32 top-1/2 -translate-y-1/2 space-y-5 z-10">${heroToolsRight.map(toolCard).join('')}</div>
        <div class="absolute top-0 left-1/2 -translate-x-1/2 text-teal-400 text-3xl animate-pulse">✦</div>
        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-orange-400 text-2xl animate-pulse" style="animation-delay:1s">✦</div>
      </div>
    </div>
  </div>
</section>

<section class="py-24 bg-slate-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6"><span class="text-teal-400 font-semibold text-sm tracking-wide">WHY CHOOSE SEORDP</span></div>
      <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">Why SEORDP Works Better for Daily Tool Access</h2>
      <p class="text-lg text-slate-300 max-w-2xl mx-auto">Get instant access to 50+ premium SEO tools including Ahrefs, SEMrush, Moz Pro with 99.9% uptime and enterprise-grade security</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${whyGrid}</div>
  </div>
</section>

<section id="popular-tools" class="section-padding bg-slate-800">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12 animate-fade-in-up">
      <h2 class="text-responsive-4xl font-bold text-white mb-4"><span class="text-teal-400">Get Access to Premium SEO, AI, and Marketing Tools in One Place</span></h2>
      <p class="text-lg text-slate-300 max-w-3xl mx-auto">Access Ahrefs, SEMrush, Moz Pro, ChatGPT Plus, Canva Pro &amp; more at 90% discount. Best group buy SEO tools 2025.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto" data-popular-tools-grid>${popularToolsGrid}</div>
    <div class="text-center mt-12${popularTools.length <= 20 ? ' hidden' : ''}">
      <button type="button" data-popular-tools-toggle class="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center gap-2">
        <span data-popular-tools-label>View More Tools (${Math.max(0, popularTools.length - 20)} more)</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
    </div>
    <div class="text-center mt-8">
      <a href="${hrefPage('products', depth)}" class="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold">Browse full tools shop →</a>
    </div>
  </div>
</section>

<section id="pricing" class="section-padding bg-slate-900 relative overflow-hidden">
  <div class="absolute inset-0 matrix-container opacity-5"><div class="matrix-grid"></div></div>
  <div class="container mx-auto px-4 relative z-10">
    <div class="text-center mb-16 animate-fade-in-up">
      <h2 class="text-responsive-4xl font-bold text-white mb-4">Plans Built for SEO, Content, and Design Work</h2>
      <p class="text-lg text-slate-300 max-w-2xl mx-auto">Get instant access to premium tools at unbeatable prices</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">${pricingCards}</div>
  </div>
</section>

<section class="section-padding bg-slate-900 relative overflow-hidden">
  <div class="absolute inset-0">
    <div class="absolute top-1/4 left-10 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float" style="animation-delay:2s"></div>
  </div>
  <div class="max-w-6xl mx-auto px-4 relative z-10">
    <div class="text-center mb-16 animate-fade-in-up">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6"><span class="text-teal-400 font-bold text-sm">HOW IT WORKS</span></div>
      <h2 class="text-4xl md:text-5xl font-black text-white mb-4">How Access Works on SEORDP</h2>
      <p class="text-lg text-slate-300 max-w-2xl mx-auto">Simple process to unlock premium access within minutes</p>
    </div>
    <div class="max-w-4xl mx-auto">${howSteps}</div>
  </div>
</section>

<section class="py-24 bg-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-20">
      <div class="grid lg:grid-cols-2 gap-12 items-start mb-16">
        <div>
          <div class="text-blue-400 font-semibold text-sm tracking-wide mb-4">LOVED BY USERS</div>
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Why Customers Keep Using SEORDP</h2>
          <p class="text-lg text-slate-300 leading-relaxed">We&apos;re obsessed with delivering outstanding customer experiences that are a reflection of your brand.</p>
        </div>
        <div class="flex justify-end">
          <div class="bg-white rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300 w-64">
            <div class="text-6xl font-black text-slate-900 mb-2">4.9</div>
            <div class="text-lg font-bold text-slate-700">Industry-leading Rating</div>
            <div class="text-sm text-slate-500 mt-1">As of November 2024</div>
          </div>
        </div>
      </div>
      <div class="relative mb-12">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-700"></div></div>
        <div class="relative flex justify-center">
          <div class="bg-slate-800 px-6 py-2 flex items-center gap-3">
            <span class="text-slate-400 text-sm">All 5-star reviews on</span>
            <div class="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded"><span class="text-white text-sm font-bold">Facebook</span></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">${facebookReviews}</div>
    </div>
    <div>
      <div class="relative mb-12">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-700"></div></div>
        <div class="relative flex justify-center">
          <div class="bg-slate-800 px-6 py-2 flex items-center gap-3">
            <span class="text-slate-400 text-sm">All 5-star reviews on</span>
            <div class="flex items-center gap-2 bg-green-600 px-3 py-1 rounded"><span class="text-white text-sm font-bold">Trustpilot</span></div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12" data-trustpilot-grid>${trustpilotInitial}${trustpilotExtra}</div>
      <div class="text-center">
        <button type="button" data-reviews-toggle class="inline-block text-white font-semibold border-b-2 border-white hover:text-teal-400 hover:border-teal-400 transition-colors pb-1">See more reviews</button>
      </div>
    </div>
  </div>
</section>

<section id="faq" class="section-padding bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute top-20 left-10 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style="animation-delay:2s"></div>
  </div>
  <div class="container mx-auto px-4 relative z-10">
    <div class="text-center mb-16 animate-fade-in-up">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6"><span class="text-2xl">❓</span><span class="text-sm font-bold text-teal-400 uppercase tracking-wide">FAQ</span></div>
      <h2 class="text-4xl md:text-5xl font-bold text-white mb-4">What to Know Before You Get Started</h2>
      <p class="text-slate-400 text-lg max-w-2xl mx-auto">Find answers to common questions about our services and platform</p>
    </div>
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">${faqHtml}</div>
  </div>
</section>
</div>`;
}

module.exports = { renderHomepage, FAQS };