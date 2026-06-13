(function () {
  'use strict';

  const SIGNUP_URL = 'https://members.seotoolsgroupbuy.us/signup';
  const PAGE_SIZE = window.SEORDP_PRODUCTS_PAGE_SIZE || 24;
  const MAX_PAGE_BUTTONS = 7;

  const input = document.querySelector('[data-products-filter]');
  const grid = document.querySelector('[data-products-grid]');
  const loading = document.querySelector('[data-products-loading]');
  const pagination = document.querySelector('[data-products-pagination]');
  const pageNumbers = document.querySelector('[data-page-numbers]');
  const pageInfo = document.querySelector('[data-page-info]');
  const prevBtn = document.querySelector('[data-page-prev]');
  const nextBtn = document.querySelector('[data-page-next]');

  if (!grid) return;

  const cartSvg =
    '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';

  let allProducts = [];
  let filtered = [];
  let currentPage = 1;

  function starsHtml(rating) {
    const r = Math.min(5, Math.max(0, Math.floor(Number(rating) || 0)));
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < r;
      return `<svg class="h-4 w-4 ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }).join('');
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function productCard(item) {
    const href = `../${item.slug}/`;
    const imageBlock = item.image
      ? `<div class="relative w-full h-48 overflow-hidden bg-slate-700">
      <img src="../${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
    </div>`
      : `<div class="relative w-full h-48 overflow-hidden bg-slate-700">
      <div class="w-full h-full bg-gradient-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center border-2 border-dashed border-teal-500/30">
        <span class="text-5xl">📦</span>
      </div>
    </div>`;

    return `<article class="card-gradient group relative overflow-hidden h-full flex flex-col">
    <a href="${href}">${imageBlock}</a>
    <div class="p-5 flex flex-col flex-1">
      <a href="${href}">
        <h3 class="mb-2 text-lg font-bold text-white transition-colors line-clamp-2 min-h-[3.5rem] group-hover:text-teal-400">${escapeHtml(item.name)}</h3>
      </a>
      <div class="mb-4 flex items-center gap-1">
        <div class="flex">${starsHtml(item.rating)}</div>
        <span class="text-sm text-slate-400">(${item.reviews || 0})</span>
      </div>
      <div class="mt-auto">
        <div class="flex items-baseline gap-2 mb-3">
          <span class="text-2xl font-bold text-white">${escapeHtml(item.price)}</span>
        </div>
        <a href="${SIGNUP_URL}" target="_blank" rel="noopener noreferrer" class="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300 btn-primary">
          ${cartSvg}
          Buy Now
        </a>
      </div>
    </div>
  </article>`;
  }

  function totalPages() {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }

  function getPageFromUrl() {
    const page = parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10);
    return Number.isFinite(page) && page > 0 ? page : 1;
  }

  function updateUrl(page) {
    const url = new URL(window.location.href);
    if (page <= 1) url.searchParams.delete('page');
    else url.searchParams.set('page', String(page));
    window.history.replaceState({}, '', url);
  }

  function pageWindow(current, total) {
    if (total <= MAX_PAGE_BUTTONS) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, current - Math.floor(MAX_PAGE_BUTTONS / 2));
    let end = start + MAX_PAGE_BUTTONS - 1;
    if (end > total) {
      end = total;
      start = end - MAX_PAGE_BUTTONS + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  function renderPagination() {
    const total = totalPages();
    if (!pagination) return;

    if (filtered.length <= PAGE_SIZE) {
      pagination.hidden = true;
      return;
    }

    pagination.hidden = false;
    currentPage = Math.min(currentPage, total);

    if (pageInfo) {
      const start = (currentPage - 1) * PAGE_SIZE + 1;
      const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
      pageInfo.textContent = `Showing ${start}-${end} of ${filtered.length} (Page ${currentPage} of ${total})`;
    }

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= total;

    if (pageNumbers) {
      pageNumbers.innerHTML = pageWindow(currentPage, total)
        .map((n) => {
          const active = n === currentPage;
          return `<button type="button" data-page-go="${n}" class="min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
            active
              ? 'bg-teal-500 text-white border border-teal-400'
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-teal-500'
          }">${n}</button>`;
        })
        .join('');
    }
  }

  function renderGrid() {
    const total = totalPages();
    currentPage = Math.min(Math.max(1, currentPage), total);
    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    if (!slice.length) {
      grid.innerHTML =
        '<div class="col-span-full text-center py-16 text-slate-400">No products found. Try a different search.</div>';
      if (pagination) pagination.hidden = true;
      return;
    }

    grid.innerHTML = slice.map(productCard).join('');
    renderPagination();
    updateUrl(currentPage);
  }

  function applyFilter(query) {
    const q = query.toLowerCase().trim();
    filtered = !q ? allProducts.slice() : allProducts.filter((p) => p.search.includes(q));
    currentPage = 1;
    renderGrid();
  }

  function goToPage(page) {
    currentPage = page;
    renderGrid();
    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bindEvents() {
    if (input) {
      let debounce;
      input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => applyFilter(input.value), 200);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

    if (pageNumbers) {
      pageNumbers.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-page-go]');
        if (!btn) return;
        goToPage(parseInt(btn.getAttribute('data-page-go'), 10));
      });
    }
  }

  function getCatalogUrl() {
    const scripts = document.querySelectorAll('script[src*="products-filter.js"]');
    if (!scripts.length) return 'products-catalog.json';
    const src = scripts[scripts.length - 1].getAttribute('src') || '../js/products-filter.js';
    return src.replace(/products-filter\.js.*$/, 'products-catalog.json');
  }

  fetch(getCatalogUrl())
    .then((r) => {
      if (!r.ok) throw new Error('catalog fetch failed');
      return r.json();
    })
    .then((data) => {
      allProducts = Array.isArray(data) ? data : [];
      filtered = allProducts.slice();
      currentPage = getPageFromUrl();
      if (loading) loading.remove();
      bindEvents();
      renderGrid();
    })
    .catch(() => {
      if (loading) {
        loading.textContent = 'Unable to load products. Please refresh the page.';
      }
    });
})();
