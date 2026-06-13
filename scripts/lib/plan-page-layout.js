const { hrefHome, hrefPage } = require('./internal-links');

const ARROW_LEFT =
  '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>';

function renderPlanToc(depth) {
  return `<aside class="lg:sticky lg:top-24 h-fit">
    <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
        </div>
        <h3 class="font-bold text-slate-900 text-lg">Contents</h3>
      </div>
      <nav class="space-y-2 text-sm">
        <a href="#plan-content" class="flex items-center gap-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-all py-2 px-3 rounded-lg font-medium">
          <span class="text-teal-500">→</span> Plan Details
        </a>
        <a href="${hrefPage('pricing-plans', depth)}" class="flex items-center gap-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-all py-2 px-3 rounded-lg font-medium">
          <span class="text-teal-500">→</span> All Pricing Plans
        </a>
        <a href="${hrefPage('products', depth)}" class="flex items-center gap-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-all py-2 px-3 rounded-lg font-medium">
          <span class="text-teal-500">→</span> Browse Tools
        </a>
      </nav>
    </div>
  </aside>`;
}

function renderPlanPageShell({ titleHtml, content, depth = 1, featuredImage, assetPrefix = '' }) {
  const heroBg = featuredImage
    ? `<div class="absolute inset-0"><img src="${featuredImage}" alt="" class="w-full h-full object-cover" loading="eager"><div class="absolute inset-0 bg-gradient-to-b from-teal-900/70 via-teal-800/80 to-teal-900/90"></div></div>`
    : `<div class="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600">
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-10 w-72 h-72 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
      </div>`;

  return `<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden" data-plan-page>
  <section class="relative h-[280px] md:h-[380px] overflow-hidden">
    ${heroBg}
    <div class="absolute inset-0 flex items-end">
      <div class="container mx-auto px-4 pb-10 md:pb-12 relative z-10">
        <a href="${hrefHome(depth)}" class="mb-4 inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors text-sm">
          ${ARROW_LEFT}
          Back to Home
        </a>
        <div class="max-w-4xl">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4">
            <span class="text-white font-bold text-sm">💎 Pricing Plan</span>
          </div>
          <h1 class="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">${titleHtml}</h1>
        </div>
      </div>
    </div>
  </section>
  <div class="py-12 md:py-16 relative">
    <div class="container mx-auto px-4">
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-[280px,1fr] gap-8">
          ${renderPlanToc(depth)}
          <article id="plan-content" class="overflow-x-hidden min-w-0">
            <div class="bg-white rounded-2xl shadow-lg p-6 md:p-10 lg:p-12 border border-slate-200">
              <div class="page-content plan-page-content overflow-x-hidden max-w-none">${content}</div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

module.exports = { renderPlanPageShell };
