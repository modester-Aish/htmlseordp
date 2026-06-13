/**
 * Download WordPress upload images into this site's wp-content/uploads/
 * Reads URLs from local data/*.json — no Next.js dependency after setup.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOADS_DIR = path.join(ROOT, 'wp-content', 'uploads');
const BASE_URL = process.env.WORDPRESS_BASE_URL || 'https://backend.seordp.net';

const JSON_FILES = ['wp-posts.json', 'wp-pages.json', 'wp-categories.json', 'wp-tags.json'];

const UPLOADS_PATTERNS = [
  /https?:\/\/(?:backend\.seordp\.net|app\.faditools\.com)\/wp-content\/uploads\/([^"'\s?#\\]+)/gi,
  /https:\\\\\/\\\\\/(?:backend\.seordp\.net|app\.faditools\.com)\\\\\/wp-content\\\\\/uploads\\\\\/([^"\\]+)/gi,
  /\/wp-content\/uploads\/([^"'\s?#\\]+)/gi,
];

function extractUploadUrls() {
  const paths = new Set();
  for (const file of JSON_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const regex of UPLOADS_PATTERNS) {
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(raw)) !== null) {
        const rel = m[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&').trim();
        if (rel && !rel.startsWith('.')) paths.add(decodeURIComponent(rel));
      }
    }
  }
  const base = BASE_URL.replace(/\/$/, '');
  return [...paths].map((rel) => ({ url: `${base}/wp-content/uploads/${rel}`, rel }));
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol
      .get(url, { timeout: 20000 }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return downloadFile(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('Scanning local data/*.json for image URLs...');
  const items = extractUploadUrls();
  console.log(`Found ${items.length} unique image(s).`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const { url, rel } of items) {
    const dest = path.join(UPLOADS_DIR, rel);
    if (fs.existsSync(dest)) {
      skip++;
      continue;
    }
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    try {
      const buf = await downloadFile(url);
      await fs.promises.writeFile(dest, buf);
      ok++;
      if (ok % 10 === 0) console.log(`  Downloaded ${ok}...`);
    } catch (e) {
      fail++;
      console.warn(`  Skip ${rel}: ${e.message}`);
    }
  }

  console.log(`Done: ${ok} downloaded, ${skip} already exist, ${fail} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
