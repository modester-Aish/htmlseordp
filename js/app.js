(function () {
  'use strict';

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }
  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  function getAssetBase() {
    const scripts = document.querySelectorAll('script[src*="app.js"]');
    if (!scripts.length) return './';
    const src = scripts[scripts.length - 1].getAttribute('src') || 'js/app.js';
    return src.replace(/js\/app\.js.*$/, '');
  }

  function resolvePageUrl(base, urlPath) {
    const clean = (urlPath || '').replace(/^\//, '').replace(/\/$/, '');
    if (!clean) return base + 'index.html';
    return base + clean + '/index.html';
  }

  const mobileToggle = $('[data-mobile-toggle]');
  const mobileMenu = $('[data-mobile-menu]');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  $$('[data-dropdown]').forEach((wrap) => {
    const trigger = wrap.querySelector('[data-dropdown-trigger]');
    const menu = wrap.querySelector('[data-dropdown-menu]');
    if (!trigger || !menu) return;
    let t;
    wrap.addEventListener('mouseenter', () => {
      clearTimeout(t);
      menu.classList.remove('hidden');
    });
    wrap.addEventListener('mouseleave', () => {
      t = setTimeout(() => menu.classList.add('hidden'), 200);
    });
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      menu.classList.toggle('hidden');
    });
  });

  $$('[data-faq-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq-item]');
      const wrap = item.querySelector('[data-faq-answer-wrap]');
      const chevron = item.querySelector('.faq-chevron');
      const hint = item.querySelector('.faq-hint');
      const isOpen = wrap.classList.contains('faq-open');
      $$('[data-faq-answer-wrap]').forEach((w) => {
        w.classList.remove('faq-open', 'max-h-96', 'opacity-100');
        w.classList.add('max-h-0', 'opacity-0');
      });
      $$('.faq-chevron').forEach((c) => c.classList.remove('rotate-180'));
      $$('[data-faq-item]').forEach((el) => el.classList.remove('ring-2', 'ring-teal-500/50'));
      $$('.faq-hint').forEach((h) => h.classList.remove('hidden'));
      if (!isOpen) {
        wrap.classList.add('faq-open', 'max-h-96', 'opacity-100');
        wrap.classList.remove('max-h-0', 'opacity-0');
        if (chevron) chevron.classList.add('rotate-180');
        item.classList.add('ring-2', 'ring-teal-500/50');
        if (hint) hint.classList.add('hidden');
      }
    });
  });
  const firstFaqWrap = $('[data-faq-answer-wrap]');
  if (firstFaqWrap) {
    firstFaqWrap.classList.add('faq-open', 'max-h-96', 'opacity-100');
    firstFaqWrap.classList.remove('max-h-0', 'opacity-0');
    const firstItem = firstFaqWrap.closest('[data-faq-item]');
    if (firstItem) {
      firstItem.classList.add('ring-2', 'ring-teal-500/50');
      const chev = firstItem.querySelector('.faq-chevron');
      if (chev) chev.classList.add('rotate-180');
      const hint = firstItem.querySelector('.faq-hint');
      if (hint) hint.classList.add('hidden');
    }
  }

  const popularToggle = $('[data-popular-tools-toggle]');
  if (popularToggle) {
    let expanded = false;
    popularToggle.addEventListener('click', () => {
      expanded = !expanded;
      $$('.popular-tool-extra').forEach((el) => el.classList.toggle('hidden', !expanded));
      const label = $('[data-popular-tools-label]');
      if (label) {
        label.textContent = expanded
          ? 'Show Less'
          : `View More Tools (${document.querySelectorAll('.popular-tool-extra').length} more)`;
      }
    });
  }

  const reviewsToggle = $('[data-reviews-toggle]');
  if (reviewsToggle) {
    let showMore = false;
    reviewsToggle.addEventListener('click', () => {
      showMore = !showMore;
      $$('.trustpilot-extra').forEach((el) => el.classList.toggle('hidden', !showMore));
      reviewsToggle.textContent = showMore ? 'Show less reviews' : 'See more reviews';
    });
  }

  $$('[data-flip-card]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('[data-pricing-card]').querySelector('[data-pricing-inner]').style.transform = 'rotateY(180deg)';
    });
  });
  $$('[data-pricing-card]').forEach((card) => {
    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('[data-pricing-inner]');
      if (inner) inner.style.transform = 'rotateY(0deg)';
    });
  });

  const btt = $('[data-back-to-top]');
  if (btt) {
    window.addEventListener('scroll', () => btt.classList.toggle('hidden', window.scrollY < 300));
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const chatToggle = $('[data-chat-toggle]');
  const chatPanel = $('[data-chat-panel]');
  if (chatToggle && chatPanel) {
    chatToggle.addEventListener('click', () => chatPanel.classList.toggle('hidden'));
  }

  const contactForm = $('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const body = `Name: ${fd.get('name')}\nEmail: ${fd.get('email')}\n\nMessage:\n${fd.get('message')}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(fd.get('subject') || 'Contact from SEORDP')}&body=${encodeURIComponent(body)}`;
    });
  }

  let searchIndex = null;
  const base = getAssetBase();

  function loadSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    return fetch(base + 'js/search-index.json')
      .then((r) => r.json())
      .then((d) => {
        searchIndex = d;
        return d;
      })
      .catch(() => []);
  }

  function renderResults(results, container, compact) {
    if (!results.length) {
      container.innerHTML = compact
        ? '<p class="p-4 text-sm text-gray-400">No results found</p>'
        : '<p class="text-center text-gray-600 py-8">No results found</p>';
      container.classList.remove('hidden');
      return;
    }
    container.innerHTML = results
      .slice(0, 15)
      .map((r) => {
        const href = resolvePageUrl(base, r.url);
        if (compact) {
          return `<a href="${href}" class="block p-3 hover:bg-slate-800 rounded-lg border border-slate-700 m-2"><span class="text-xs text-teal-400 uppercase">${r.type}</span><div class="text-sm text-white font-semibold">${r.title}</div></a>`;
        }
        return `<a href="${href}" class="block p-6 bg-gray-50 hover:bg-emerald-50 rounded-lg border hover:border-emerald-300"><span class="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">${r.type}</span><h3 class="text-lg font-semibold text-gray-900 mt-2">${r.title}</h3><p class="text-sm text-gray-600">${r.description || ''}</p></a>`;
      })
      .join('');
    container.classList.remove('hidden');
  }

  const searchInput = $('[data-search-input]');
  const searchResults = $('[data-search-results]');
  if (searchInput && searchResults) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
          searchResults.classList.add('hidden');
          return;
        }
        loadSearchIndex().then((items) => {
          renderResults(
            items.filter((i) => i.title.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)),
            searchResults,
            true
          );
        });
      }, 300);
    });
  }

  const pageSearchInput = $('[data-search-page-input]');
  const pageSearchResults = $('[data-search-page-results]');
  if (pageSearchInput && pageSearchResults) {
    let debounce;
    pageSearchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = pageSearchInput.value.trim().toLowerCase();
        if (!q) {
          pageSearchResults.innerHTML = '';
          return;
        }
        loadSearchIndex().then((items) => {
          renderResults(
            items.filter((i) => i.title.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)),
            pageSearchResults,
            false
          );
        });
      }, 300);
    });
  }
})();
