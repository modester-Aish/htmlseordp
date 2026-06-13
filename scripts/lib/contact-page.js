const { hrefHome, hrefPage } = require('./internal-links');
const { renderInfoShell } = require('./info-page-layout');

const SOCIAL_LINKS = [
  { href: 'https://www.facebook.com/seordp', label: 'Facebook', icon: 'facebook' },
  { href: 'https://twitter.com/seordp', label: 'Twitter/X', icon: 'twitter' },
  { href: 'https://www.instagram.com/seordp', label: 'Instagram', icon: 'instagram' },
  { href: 'https://www.linkedin.com/company/seordp', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://www.youtube.com/@seordp', label: 'YouTube', icon: 'youtube' },
];

function socialIcon(type) {
  const icons = {
    facebook:
      '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    twitter:
      '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    instagram:
      '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    linkedin:
      '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    youtube:
      '<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  };
  return icons[type] || '';
}

function renderContactPageBody(depth = 1) {
  const socialHtml = SOCIAL_LINKS.map(
    (s) =>
      `<a href="${s.href}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-teal-500/20 hover:text-teal-400 transition-all" aria-label="${s.label}">${socialIcon(s.icon)}</a>`
  ).join('');

  const inner = `<div class="max-w-6xl mx-auto space-y-10">
    <div class="grid lg:grid-cols-5 gap-8">
      <div class="lg:col-span-3 card-gradient p-6 md:p-8 rounded-2xl border-2 border-slate-700 hover:border-teal-500/30 transition-all">
        <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <svg class="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          Send us a message
        </h2>
        <form data-contact-form class="space-y-5">
          <div><label class="block text-sm font-medium text-slate-300 mb-2">Name <span class="text-teal-400">*</span></label><input required name="name" class="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="Your name"></div>
          <div><label class="block text-sm font-medium text-slate-300 mb-2">Email <span class="text-teal-400">*</span></label><input required type="email" name="email" class="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="your@email.com"></div>
          <div><label class="block text-sm font-medium text-slate-300 mb-2">Subject</label><input name="subject" class="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="e.g. Support, Partnership"></div>
          <div><label class="block text-sm font-medium text-slate-300 mb-2">Message <span class="text-teal-400">*</span></label><textarea required name="message" rows="5" class="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y min-h-[120px]" placeholder="How can we help?"></textarea></div>
          <button type="submit" class="w-full btn-primary flex items-center justify-center gap-2 py-4">Send message</button>
        </form>
      </div>
      <div class="lg:col-span-2 space-y-6">
        <div class="card-gradient p-6 rounded-2xl border-2 border-slate-700">
          <h3 class="font-bold text-white mb-2">Business Hours</h3>
          <ul class="text-slate-400 text-sm space-y-1">
            <li><strong class="text-slate-300">Mon – Fri:</strong> 9:00 AM – 6:00 PM (GMT)</li>
            <li><strong class="text-slate-300">Sat:</strong> 10:00 AM – 4:00 PM (GMT)</li>
            <li><strong class="text-slate-300">Sun:</strong> Closed</li>
          </ul>
          <p class="text-teal-400/90 text-sm mt-2">We respond within 24 hours on business days.</p>
        </div>
        <div class="card-gradient p-6 rounded-2xl border-2 border-slate-700">
          <h3 class="font-bold text-white mb-3">Connect with us</h3>
          <div class="flex flex-wrap gap-3">${socialHtml}</div>
        </div>
      </div>
    </div>
    <div class="card-gradient p-8 rounded-2xl border border-slate-700">
      <h2 class="text-xl font-bold text-white mb-3">Before contacting us</h2>
      <p class="text-slate-400 mb-4">Check our <a href="${hrefPage('blog', depth)}" class="text-teal-400 hover:text-teal-300 underline">blog</a> or <a href="${hrefHome(depth)}#faq" class="text-teal-400 hover:text-teal-300 underline">homepage FAQ</a> first.</p>
      <p class="text-slate-400">For technical issues, contact us immediately — we take all reports seriously.</p>
    </div>
    <div class="text-center">
      <a href="${hrefPage('products', depth)}" class="inline-flex items-center gap-2 hero-btn-primary px-8 py-4 rounded-xl">Explore our products</a>
    </div>
  </div>`;

  const { getPageTheme } = require('./page-themes');
  const theme = { ...getPageTheme('contact-us', 'Contact Us'), icon: '💬', badge: 'Contact Us' };

  return renderInfoShell({
    theme,
    titleHtml: 'Contact <span class="text-teal-400">Us</span>',
    subtitle: 'Support, partnerships, or feedback — we aim to reply within 24 hours on business days.',
    depth,
    content: inner,
    contentClass: 'max-w-6xl',
  });
}

module.exports = { renderContactPageBody };
