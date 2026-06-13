/** Per-page visual theme — badge, colors, hero highlights, subtitles */

const ACCENT = {
  teal: { badge: 'bg-teal-500/10 border-teal-500/20 text-teal-400', text: 'text-teal-400', border: 'border-teal-500/30', blob: 'bg-teal-500/10', ring: 'ring-teal-500/20' },
  purple: { badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400', text: 'text-purple-400', border: 'border-purple-500/30', blob: 'bg-purple-500/10', ring: 'ring-purple-500/20' },
  orange: { badge: 'bg-orange-500/10 border-orange-500/20 text-orange-400', text: 'text-orange-400', border: 'border-orange-500/30', blob: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  amber: { badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400', text: 'text-amber-400', border: 'border-amber-500/30', blob: 'bg-amber-500/10', ring: 'ring-amber-500/20' },
  blue: { badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400', text: 'text-blue-400', border: 'border-blue-500/30', blob: 'bg-blue-500/10', ring: 'ring-blue-500/20' },
  emerald: { badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/30', blob: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
};

const SLUG_THEMES = {
  'about-us': {
    badge: 'About SEORDP',
    accent: 'teal',
    icon: '🏢',
    accentWord: 'Us',
    subtitle: 'Trusted group buy provider — premium SEO tools for freelancers, agencies & marketers worldwide.',
    highlights: [
      { icon: '🛠️', label: '50+ Tools', value: 'One dashboard' },
      { icon: '👥', label: '45K+ Users', value: 'Worldwide' },
      { icon: '⚡', label: '99% Uptime', value: 'Reliable access' },
    ],
    splitOn: 'h3',
  },
  'dmca-policy': {
    badge: 'Copyright & DMCA',
    accent: 'purple',
    icon: '⚖️',
    accentWord: 'Policy',
    subtitle: 'Digital Millennium Copyright Act — notice, takedown & counter-notification procedures.',
    highlights: [
      { icon: '📧', label: 'DMCA Agent', value: 'legal@seordp.net' },
      { icon: '⏱️', label: 'Response', value: '24–48 hours' },
      { icon: '🛡️', label: 'Protection', value: 'Rights respected' },
    ],
    splitOn: 'h2',
  },
  'privacy-policy-3': {
    badge: 'Privacy Policy',
    accent: 'purple',
    icon: '🔒',
    accentWord: 'Policy',
    subtitle: 'How SEORDP collects, uses, and protects your personal information.',
    highlights: [
      { icon: '🔐', label: 'Encrypted', value: 'Secure data' },
      { icon: '🚫', label: 'No selling', value: 'Your data' },
      { icon: '✅', label: 'GDPR', value: 'Compliant' },
    ],
    splitOn: 'h2',
  },
  'terms-of-service': {
    badge: 'Terms of Service',
    accent: 'purple',
    icon: '📜',
    accentWord: 'Service',
    subtitle: 'Rules and guidelines for using SEORDP group buy SEO tools platform.',
    highlights: [
      { icon: '📋', label: 'Fair use', value: 'Clear rules' },
      { icon: '💳', label: 'Billing', value: 'Transparent' },
      { icon: '🤝', label: 'Support', value: '24/7 help' },
    ],
    splitOn: 'h2',
  },
  'terms-and-conditions': {
    badge: 'Terms & Conditions',
    accent: 'purple',
    icon: '📜',
    accentWord: 'Conditions',
    subtitle: 'Full terms governing your SEORDP subscription and tool access.',
    splitOn: 'h2',
  },
  'return-and-refund-policy': {
    badge: 'Refund Policy',
    accent: 'emerald',
    icon: '💰',
    accentWord: 'Policy',
    subtitle: '24-hour refund guarantee — risk-free group buy SEO tools access.',
    highlights: [
      { icon: '⏰', label: '24 Hours', value: 'Full refund' },
      { icon: '✅', label: 'Easy', value: 'Simple process' },
      { icon: '💬', label: 'Support', value: 'Fast help' },
    ],
    splitOn: 'h2',
  },
  'editorial-guidelines': {
    badge: 'Editorial Standards',
    accent: 'blue',
    icon: '✍️',
    accentWord: 'Guidelines',
    subtitle: 'Quality standards for content published on SEORDP.',
    splitOn: 'h2',
  },
  'contact-us': {
    badge: 'Contact Us',
    accent: 'teal',
    icon: '💬',
    accentWord: 'Us',
    subtitle: 'Support, partnerships, or feedback — we reply within 24 hours on business days.',
    highlights: [
      { icon: '📧', label: 'Email', value: 'support@seordp.net' },
      { icon: '⏱️', label: 'Response', value: 'Within 24h' },
      { icon: '🌍', label: 'Global', value: 'Worldwide' },
    ],
    splitOn: 'h2',
  },
  'get-support': {
    badge: 'Help Center',
    accent: 'teal',
    icon: '🎧',
    accentWord: 'Support',
    subtitle: 'Get help with access, billing, tools, or technical issues.',
    highlights: [
      { icon: '💬', label: 'Live chat', value: 'Quick replies' },
      { icon: '📧', label: 'Email', value: '24h response' },
      { icon: '📚', label: 'Guides', value: 'Self-help' },
    ],
    splitOn: 'h2',
  },
  'introduction-to-group-buy-seo-tools': {
    badge: 'Beginner Guide',
    accent: 'teal',
    icon: '📖',
    accentWord: 'Tools',
    subtitle: 'Learn what group buy SEO tools are and how SEORDP works.',
    splitOn: 'h2',
  },
  'seo-tools-list-2025': {
    badge: 'Tools Directory',
    accent: 'amber',
    icon: '📋',
    accentWord: '2025',
    subtitle: 'Complete list of premium SEO & marketing tools available on SEORDP.',
    splitOn: 'h2',
  },
  'pricing-plans': {
    badge: 'Pricing Overview',
    accent: 'amber',
    icon: '💎',
    accentWord: 'Plans',
    subtitle: 'Compare all SEORDP plans — find the right package for your workflow.',
    splitOn: 'h2',
  },
  cart: {
    badge: 'Your Cart',
    accent: 'orange',
    icon: '🛒',
    accentWord: 'Cart',
    subtitle: 'Review selected tools and complete your group buy order.',
    splitOn: 'h2',
  },
  'designer-plan': {
    badge: 'Designer Plan',
    accent: 'orange',
    icon: '🎨',
    accentWord: 'Plan',
    subtitle: 'Canva, Creative Cloud & design tools at group buy prices.',
    highlights: [
      { icon: '🎨', label: 'Design', value: 'Pro tools' },
      { icon: '💵', label: 'From', value: '$10/mo' },
      { icon: '⚡', label: 'Instant', value: 'Activation' },
    ],
    splitOn: 'h2',
  },
};

function planTheme(slug, title) {
  const isMega = /mega/i.test(slug);
  const isSmall = /small/i.test(slug);
  const isBasic = /basic/i.test(slug);
  const isEcom = /ecom/i.test(slug);
  const isAhrefs = /ahrefs/i.test(slug);
  const priceMatch = title.match(/\$(\d+(?:\.\d+)?)/);
  const price = priceMatch ? `$${priceMatch[1]}` : isMega ? '$50' : isSmall ? '$15' : isBasic ? '$10' : '$25';

  return {
    badge: isMega ? 'MEGA Plan' : isSmall ? 'SMALL Plan' : isBasic ? 'LITE Plan' : isAhrefs ? 'Ahrefs Combo' : 'SEO Plan',
    accent: isMega ? 'amber' : 'teal',
    icon: isMega ? '🚀' : isSmall ? '⭐' : '💎',
    accentWord: isMega ? 'MEGA' : isSmall ? 'Small' : 'Plan',
    subtitle: `Premium group buy access — save up to 90% vs individual subscriptions.`,
    highlights: [
      { icon: '💰', label: 'Price', value: `${price}/mo` },
      { icon: '🛠️', label: 'Tools', value: isMega ? '100+' : isSmall ? '60+' : '40+' },
      { icon: '⚡', label: 'Access', value: 'Instant' },
    ],
    splitOn: 'h2',
    planCta: true,
  };
}

function getPageTheme(slug, title) {
  if (SLUG_THEMES[slug]) return { ...SLUG_THEMES[slug], accentClasses: ACCENT[SLUG_THEMES[slug].accent] || ACCENT.teal };
  if (/combo|plan|pricing|ahrefs-group/i.test(slug)) {
    const t = planTheme(slug, title);
    return { ...t, accentClasses: ACCENT[t.accent] || ACCENT.teal };
  }
  if (/policy|dmca|privacy|terms|refund/i.test(slug)) {
    return { badge: 'Legal & Policy', accent: 'purple', icon: '📋', accentWord: null, splitOn: 'h2', accentClasses: ACCENT.purple };
  }
  if (/about|support|editorial|introduction/i.test(slug)) {
    return { badge: 'Information', accent: 'teal', icon: 'ℹ️', accentWord: null, splitOn: 'h2', accentClasses: ACCENT.teal };
  }
  return { badge: 'SEORDP', accent: 'teal', icon: '📄', accentWord: null, splitOn: 'h2', accentClasses: ACCENT.teal };
}

module.exports = { ACCENT, getPageTheme };
