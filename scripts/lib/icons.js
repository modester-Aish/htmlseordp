function searchIcon(size = 'sm') {
  const cls =
    size === 'lg'
      ? 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400'
      : 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70';
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>`;
}

module.exports = { searchIcon };
