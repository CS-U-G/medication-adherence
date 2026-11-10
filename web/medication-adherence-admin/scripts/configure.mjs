import { writeFileSync } from 'node:fs';

// Public configuration only. Never put credentials in this file or environment variable.
const apiBaseUrl = (process.env['MEDMINDER_API_URL'] ?? '').trim().replace(/\/+$/, '');
if (apiBaseUrl) {
  const url = new URL(apiBaseUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('MEDMINDER_API_URL must be an HTTPS base URL without credentials, query or fragment.');
  }
}
writeFileSync(new URL('../public/app-config.json', import.meta.url), JSON.stringify({ mode: 'live', apiBaseUrl }, null, 2) + '\n');
console.log('Prepared public live-mode API configuration.');
