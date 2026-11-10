import type { MedMinderConfig } from './app-mode';

export function parseConfig(value: unknown, development = false): MedMinderConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid application configuration.');
  const input = value as Record<string, unknown>;
  const mode = input['mode'] ?? 'live';
  if (mode !== 'live' && mode !== 'demo') throw new Error('Invalid application mode.');
  if (mode === 'demo' && !development) throw new Error('Demo mode is available only in development.');
  const rawUrl = input['apiBaseUrl'] ?? '';
  if (typeof rawUrl !== 'string') throw new Error('Invalid API base URL.');
  const apiBaseUrl = rawUrl.trim().replace(/\/+$/, '');
  if (apiBaseUrl) {
    const url = new URL(apiBaseUrl);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(development && loopback && url.protocol === 'http:')) ||
        url.username || url.password || url.search || url.hash) {
      throw new Error('The API requires an HTTPS base URL without credentials, query or fragment.');
    }
  }
  return { mode, apiBaseUrl };
}

export async function loadConfig(development: boolean): Promise<MedMinderConfig> {
  const response = await fetch('/app-config.json', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Application configuration could not be loaded.');
  return parseConfig(await response.json(), development);
}
