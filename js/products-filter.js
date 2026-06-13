(function () {
  const input = document.querySelector('[data-products-filter]');
  const grid = document.querySelector('[data-products-grid]');
  if (!input || !grid) return;
  const items = Array.from(grid.children);
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    items.forEach((el) => {
      const text = el.textContent.toLowerCase();
      el.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });
})();
