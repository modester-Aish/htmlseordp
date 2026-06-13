const https = require('https');
const http = require('http');

function fetchUrl(url, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(
      url,
      {
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEORDP-Scraper/1.0)',
          Accept: 'text/html,application/xhtml+xml',
        },
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (loc) return fetchUrl(loc.startsWith('http') ? loc : new URL(loc, url).href, timeoutMs).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

module.exports = { fetchUrl };
