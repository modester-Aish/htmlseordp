/** Homepage content aligned with Next.js components + local product slugs */

const fs = require('fs');
const path = require('path');

const TOOL_PRODUCT_LINKS = {
  ahrefs: 'ahrefs',
  semrush: 'semrush-group-buy-2022',
  moz: 'mozzat',
  canva: 'canva',
  'chatgpt-plus': 'chatgpt-group-buy-plus-pro',
  claude: 'claude-ai',
  runwayml: 'runwayml-group-buy',
  netflix: 'netflix',
  grammarly: 'prowritingaid',
  jasper: 'jasper',
  surfer: 'surfer-seo',
  buzzsumo: 'buzzsumo',
  helium10: 'helium-10',
  envato: 'envato-elements',
  freepik: 'freepik-group-buy-new',
  capcut: 'capcut-group-buy',
  invideo: 'invideo',
  coursera: 'coursera-group-buy',
  udemy: 'udemy-group-buy',
  turnitin: 'turnitin-group-buy',
  prezi: 'prezi',
  storyblocks: 'storyblocks',
  ubersuggest: 'ubersuggest',
  spyfu: 'spyfu',
  majestic: 'majestic-seo',
  quillbot: 'quillbot',
  copyai: 'copy-ai',
  wordhero: 'wordhero',
  hootsuite: 'hootsuite',
  adobe: 'adobe',
  primevideo: 'prime-video',
};

const LOCAL_TOOL_LOGOS = {
  ahrefs: 'ahrefs-logo.svg',
  semrush: 'semrush-logo.svg',
  moz: 'moz-logo.svg',
  canva: 'canva-logo.svg',
  'chatgpt-plus': 'chatgpt-logo.svg',
  claude: 'claude-logo.svg',
  runwayml: 'runwayml-logo.svg',
  netflix: 'netflix-logo.svg',
};

/** Only tools with local logo files in /tools/ — no external Icons8 URLs */
const POPULAR_TOOLS = [
  { id: 'ahrefs', name: 'Ahrefs', price: '$20.00', originalPrice: '$99.00', image: '/tools/ahrefs-logo.svg', description: 'Advanced analysis and optimization toolkit for websites' },
  { id: 'semrush', name: 'SEMrush', price: '$4.99', originalPrice: '$119.95', image: '/tools/semrush-logo.svg', description: 'Complete digital marketing solution for businesses' },
  { id: 'moz', name: 'Moz Pro', price: '$4.99', originalPrice: '$99.00', image: '/tools/moz-logo.svg', description: 'Professional website optimization and tracking software' },
  { id: 'canva', name: 'Canva Pro', price: '$4.99', originalPrice: '$12.99', image: '/tools/canva-logo.svg', description: 'Creative design platform with professional resources' },
  { id: 'chatgpt-plus', name: 'ChatGPT Plus', price: '$4.99', originalPrice: '$20.00', image: '/tools/chatgpt-logo.svg', description: 'Advanced AI assistant for productivity' },
  { id: 'runwayml', name: 'RunwayML', price: '$4.99', originalPrice: '$35.00', image: '/tools/runwayml-logo.svg', description: 'Innovative video creation platform' },
  { id: 'netflix', name: 'Netflix', price: '$4.99', originalPrice: '$15.99', image: '/tools/netflix-logo.svg', description: 'Premium streaming entertainment service' },
  { id: 'claude', name: 'Claude', price: '$4.99', originalPrice: '$20.00', image: '/tools/claude-logo.svg', description: 'Next-generation AI development assistant' },
];

function hasLocalToolImage(tool, root) {
  const image = tool.image;
  if (!image || image.startsWith('http://') || image.startsWith('https://')) return false;
  return fs.existsSync(path.join(root, image.replace(/^\//, '')));
}

function getProductSlug(tool) {
  return TOOL_PRODUCT_LINKS[tool.id] || tool.id;
}

/** Homepage grid: local logo file + built product page must both exist */
function getPopularToolsForHome(root, products = []) {
  const slugs = new Set(products.map((p) => p.slug));
  return POPULAR_TOOLS.filter((tool) => {
    if (!hasLocalToolImage(tool, root)) return false;
    const slug = getProductSlug(tool);
    if (slugs.size && !slugs.has(slug)) return false;
    if (fs.existsSync(path.join(root, slug, 'index.html'))) return true;
    return slugs.size === 0;
  });
}

const PRICING_CARDS = [
  {
    name: 'Small Plan',
    price: '$15',
    toolCount: '60+ Tools',
    slug: 'combo-seo-tools-small',
    popular: false,
    iconBgColor: 'from-blue-500 to-blue-600',
    tools: [
      'SEMrush Guru', 'MOZ Pro', 'Majestic', 'Kwfinder', 'Keywordtool io', 'Ubersuggest', 'SerpState',
      'Answer the public', 'Woorank', 'Spyfu', 'SEOptimer', 'ChatGPT 4', 'Grammarly', 'WordAi',
      'Quillbot', 'Spin Rewriter', 'WordHero', 'WordTune', 'SmartCopy', 'CloserCopy', 'Copy ai',
      'Copymatic ai', 'Jasper Ai', 'WriteSonic', 'Rytr me', 'Jenni ai', 'CANVA pro', 'Crello',
      'Envato Elements', 'Leonardo.AI', 'Freepik', 'Vecteezy', 'StoryBlocks', 'Designs ai', 'PicsArt',
      'Fotojet', 'IconScout', 'Renderforest', 'GPL Themes/Plugins', 'Netflix', 'Prime Video',
      'Chaupal tv', 'Indexification', 'Ecomhunt', 'Salehoo', 'Sell the trend', 'Niche Scraper',
      'Helium 10', 'Semscoop', 'Buzzsumo', 'Buzzstream', 'Picmonkey', 'Word Tracker', 'Epidemicsound',
      'Slidebean', 'Motionarray', 'Prezi', 'Udemy', 'Skill Share', 'Turnitin', 'Linkedin Learning',
      'Coursera', 'Scribd Premium',
    ],
  },
  {
    name: 'Ahrefs Combo',
    price: '$25',
    toolCount: '60+ Tools',
    slug: 'ahrefs-group-buy',
    popular: true,
    iconBgColor: 'from-orange-500 to-orange-600',
    tools: [
      'Ahrefs', 'SEMrush Guru', 'MOZ Pro', 'Majestic', 'Kwfinder', 'Keywordtool io', 'Ubersuggest',
      'SerpState', 'Answer the public', 'Woorank', 'Spyfu', 'SEOptimer', 'ChatGPT 4', 'Bypass GPT',
      'Grammarly', 'Quetext premium', 'WordAi', 'Hix ai', 'Quillbot', 'Spin Rewriter', 'WordHero',
      'WordTune', 'SmartCopy', 'CloserCopy', 'Copymatic ai', 'Jasper Ai', 'WriteSonic', 'Rytr me',
      'Jenni ai', 'CANVA pro', 'Crello', 'Envato Elements', 'Leonardo.AI', 'Freepik', 'Vecteezy',
      'Designs ai', 'CAPCUT Pro', 'PicsArt', 'Fotojet', 'IconScout', 'Renderforest', 'Invideo io',
      'GPL Themes/Plugins', 'Netflix', 'Prime Video', 'Chaupal tv', 'Indexification', 'Ecomhunt',
      'Sell the trend', 'Niche Scraper', 'Helium 10', 'Semscoop', 'Buzzsumo', 'Picmonkey',
      'Word Tracker', 'Epidemicsound', 'Slidebean', 'Motionarray', 'Prezi', 'Udemy', 'Skill Share',
      'Turnitin', 'Coursera', 'Scribd Premium',
    ],
  },
  {
    name: 'Mega Plan',
    price: '$50',
    toolCount: '80+ Tools',
    slug: 'combo-mega-pack-tools',
    popular: false,
    iconBgColor: 'from-purple-500 to-purple-600',
    tools: [
      'Ahrefs', 'SEMrush Guru', 'MOZ Pro', 'Majestic', 'Kwfinder', 'Keywordtool io', 'Ubersuggest',
      'SerpState', 'Answer the public', 'Woorank', 'Spyfu', 'SEOptimer', 'SEOSITECHECKUP', 'ChatGPT 4',
      'Bypass GPT', 'Grammarly', 'Quetext premium', 'WordAi', 'You Ai', 'Claude Ai', 'Hix Ai', 'Copy Ai',
      'Jasper Ai', 'Copymatic Ai', 'Stealthwriter Ai', 'Jenni ai', 'Quillbot', 'Spin Rewriter', 'WordHero',
      'WordTune', 'SmartCopy', 'CloserCopy', 'Writerzen', 'WriteSonic', 'Rytr me', 'CANVA pro', 'Crello',
      'Envato Elements', 'Leonardo.AI', 'Freepik', 'Vecteezy', 'StoryBlocks', 'Designs ai', 'CAPCUT Pro',
      'PicsArt', 'Fotojet', 'Invideo io', 'IconScout', 'Renderforest', 'GPL Themes/Plugins', 'Netflix',
      'Prime Video', 'Chaupal tv', 'Indexification', 'Ecomhunt', 'Sell the trend', 'SaleHoo',
      'Niche Scraper', 'Helium 10', 'Jungle Scout', 'Viral Launch', 'Semscoop', 'Buzzsumo', 'Buzzstream',
      'Se Ranking', 'Picmonkey', 'Word Tracker', 'Epidemicsound', 'Slidebean', 'Motionarray', 'Prezi',
      'Udemy', 'Skill Share', 'Turnitin', 'Linkedin Learning', 'Coursera', 'Scribd Premium',
    ],
  },
  {
    name: 'Lite Plan',
    price: '$10',
    toolCount: 'SEMrush Combo, 20+ Tools',
    slug: 'combo-seo-tools-basic-plan',
    popular: false,
    iconBgColor: 'from-blue-500 to-blue-600',
    tools: [
      'SEMrush Guru', 'MOZ Pro', 'Ubersuggest', 'Woorank', 'Grammarly', 'WordAi', 'Quillbot', 'Canva',
      'Crello', 'Envato Elements', 'FotoJet', 'Invideo io', 'Netflix', 'Prime Video', 'Buzzsumo',
      'Picmonkey', 'Motionarray', 'SkillShare', 'Turnitin', 'Linkedin Learning',
    ],
  },
  {
    name: 'Writer Plan',
    price: '$15',
    toolCount: '30+ Tools',
    slug: 'content-and-writting',
    popular: false,
    iconBgColor: 'from-orange-500 to-orange-600',
    tools: [
      'ChatGPT 4', 'Bypass GPT', 'Grammarly', 'Quetext', 'WordAi', 'You Ai', 'Claude Ai', 'Hix Ai',
      'Copymatic AI', 'Jasper Ai', 'Copy AI', 'Stealthwriter Ai', 'Jeeni Ai', 'SpinRewriter', 'Quillbot',
      'WordHero', 'SmartCopy', 'WordTune', 'CloserCopy', 'Writerzen', 'Writesonic', 'Rytr me', 'Canva',
      'Crello', 'WordTracker', 'Motionarray', 'Prezi', 'Turnitin', 'Coursera', 'Leonardo.AI',
    ],
  },
  {
    name: 'Designer Plan',
    price: '$10',
    toolCount: '15+ Tools',
    slug: 'designer-plan',
    popular: false,
    iconBgColor: 'from-purple-500 to-purple-600',
    tools: [
      'Canva Pro', 'Crello', 'Envato Elements', 'Freepik', 'Vecteezy', 'Storyblocks', 'Videoblocks',
      'Audioblocks', 'Designs AI', 'CAPCUT Pro', 'FotoJet', 'Invideo io', 'GPL Themes/Plugins',
      'Leonardo.AI', 'Renderforest', 'IconScout',
    ],
  },
];

const WHY_FEATURES = [
  { title: 'Fast Access After Signup', desc: 'Professional-grade services backed by industry-leading infrastructure and 99.9% uptime guarantee.' },
  { title: 'Stable and Secure Tool Sessions', desc: 'Zero wait time with immediate access to all services upon purchase. Start working within minutes.' },
  { title: 'Lower Cost Than Separate Premium Subscriptions', desc: 'Advanced encryption and security protocols to protect your data and ensure complete privacy.' },
  { title: 'Useful Tools for SEO, Content, and Design Work', desc: 'Worldwide presence with local data centers ensuring optimal performance from anywhere.' },
  { title: '24/7 Support When You Need Help', desc: 'Dedicated technical support team available round the clock to assist with any queries.' },
  { title: 'Built for Freelancers, Marketers, and Teams', desc: 'Join over 10,000 satisfied customers who trust our platform for their business needs.' },
];

const HOW_STEPS = [
  { step: 1, title: 'Choose the Setup That Fits Your Work', desc: 'Browse our service packages and select the one that perfectly fits your needs and goals.' },
  { step: 2, title: 'Complete Signup and Payment', desc: 'Quick registration process with secure data handling. Your information stays private and protected.' },
  { step: 3, title: 'Start Using Your Tools', desc: 'Complete payment and get immediate access. Begin using premium features right away with zero delay.' },
];

const FACEBOOK_REVIEWS = [
  { name: 'Sarah Khan', role: 'SEO Professional', review: 'Setting up my SEORDP account was incredibly easy. The platform is user-friendly and intuitive for browsing tools, checkout, and managing my subscription. Looking forward to them expanding their tool library even more!' },
  { name: 'Ahmed Raza', role: 'Freelancer', review: 'I had a great experience with SEORDP when subscribing to Ahrefs. The transaction was seamless, I got instant access to the tool, paid my monthly bill without hassle, and even earned reward points!' },
  { name: 'Maria Santos', role: 'Content Writer', review: 'Quick and seamless! I set up my SEORDP account with SEMrush in less than 5 minutes and started using it right away. Plus, I am earning rewards with every payment which is an added bonus!' },
];

const TRUSTPILOT_REVIEWS = [
  { name: 'John Martin', role: 'Agency User', review: 'Outstanding quality and exceptional customer support. The enterprise features have helped scale our operations efficiently. Worth every penny for our business!' },
  { name: 'Lisa Williams', role: 'Designer', review: 'Best decision for my business growth. Professional service throughout with consistent results. The platform is reliable and feature-rich for all our marketing needs.' },
  { name: 'David Carter', role: 'Digital Marketer', review: 'Impressive platform with powerful features and tools. The integration capabilities have streamlined our workflow significantly and saved us countless hours!' },
  { name: 'Emma Roberts', role: 'SEO User', review: 'Fantastic experience! Easy setup and reliable performance. The customer support team is incredibly responsive and helpful.' },
  { name: 'Michael Brown', role: 'Freelancer', review: 'Top-notch service with great customer care. Highly satisfied!' },
  { name: 'Sophie Lewis', role: 'Content Marketer', review: 'Great platform with useful features. Professional and reliable.' },
];

const FAQS = [
  { q: 'What Are Group Buy SEO Tools?', a: 'Group buy SEO tools give you access to premium tools at a lower price. Instead of paying for each tool alone, you use a shared setup that includes many tools in one place. This helps freelancers, small teams, and new marketers save money. People use these tools for keyword research, backlink checks, content work, and competitor research.', icon: '❓' },
  { q: 'How Does Group Buy Tool Access Work?', a: 'The process is simple. First, you choose a setup that matches your work. Then you sign up and get access to the tools in that setup. The provider manages the system and keeps access running. This helps users do daily SEO tasks without paying for many separate subscriptions.', icon: '🚀' },
  { q: 'Are Tools Updated Regularly?', a: 'Yes. A good provider keeps tool access updated. This matters because tool dashboards and login steps can change over time. If access is not updated, work can slow down. Regular updates help users keep working with fewer problems.', icon: '🔄' },
  { q: 'Can I Use These Tools for Client Work?', a: 'Yes, many users do that. These tools are often used for keyword research, backlink checks, content planning, and competitor reviews. The main thing is to choose a setup that fits your daily work. Some setups are better for light tasks, while others are better for heavier SEO work.', icon: '💼' },
  { q: 'How Secure Is My Data on SEORDP?', a: 'Data safety depends on how the system is managed. A good setup keeps access controlled and helps reduce misuse. This is important because SEO tools may hold search data, exports, and past work. Users should still avoid putting very sensitive client data into shared tools. Good access control helps keep daily work safer and smoother.', icon: '🔒' },
  { q: 'Do I Get Full Access to Every Tool Feature?', a: 'Not always. Group buy access is made to lower the cost of premium tools. Most users get the parts they need for daily work. This often includes keyword tools, backlink data, site review tools, and content support. Some advanced parts may work in a different way than a full direct subscription.', icon: '⚙️' },
  { q: 'Which Plan Is Best for SEO Beginners?', a: 'Beginners should start with a setup that covers the main SEO tools. That usually means tools for keywords, backlinks, site checks, and content help. A lighter plan is often the better choice in the beginning. It keeps cost lower and gives enough access to learn the basics.', icon: '🌱' },
  { q: 'What Should I Check Before Choosing a Setup?', a: 'First, check which tools are included. Then see if they match the work you do each day. Some users need keyword tools, while others need backlink data, content help, or design tools. You should also check support, access style, and session stability.', icon: '✅' },
];

const WHY_ICONS = [
  '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>',
  '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>',
  '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
  '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>',
];

const STAR_SVG = '<svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';

function getToolHref(id, prefix) {
  const slug = TOOL_PRODUCT_LINKS[id] || id;
  return `${prefix}${slug}/index.html`;
}

function resolveToolImageSrc(tool, prefix) {
  const image = tool.image || (LOCAL_TOOL_LOGOS[tool.id] ? `/tools/${LOCAL_TOOL_LOGOS[tool.id]}` : null);
  if (!image) return null;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${prefix}${image.replace(/^\//, '')}`;
}

function toolLogoHtml(tool, prefix) {
  const name = typeof tool === 'string' ? tool : tool.name;
  const src = typeof tool === 'string' ? null : resolveToolImageSrc(tool, prefix);
  if (src) {
    return `<img src="${src}" alt="${name}" class="w-full h-full object-contain p-2" loading="lazy" decoding="async">`;
  }
  const letter = (name || '?').charAt(0).toUpperCase();
  return `<span class="text-2xl font-black text-teal-600">${letter}</span>`;
}

module.exports = {
  POPULAR_TOOLS,
  TOOL_PRODUCT_LINKS,
  PRICING_CARDS,
  WHY_FEATURES,
  WHY_ICONS,
  HOW_STEPS,
  FACEBOOK_REVIEWS,
  TRUSTPILOT_REVIEWS,
  FAQS,
  STAR_SVG,
  getToolHref,
  getPopularToolsForHome,
  toolLogoHtml,
};
