import { MEDMINDER_API_ORIGIN, type MedMinderConfig } from './app-mode';

export function parseConfig(value: unknown, development = false): MedMinderConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid application configuration.');
  const input = value as Record<string, unknown>;
  const mode = input['mode'] ?? 'live';
  if (mode !== 'live' && mode !== 'demo') throw new Error('Invalid application mode.');
  if (mode === 'demo' && !development) throw new Error('Demo mode is available only in development.');
  // Old runtime assets can still load, but they cannot redirect live API traffic.
  const legacyUrl = input['apiBaseUrl'];
  if (legacyUrl !== undefined) {
    if (typeof legacyUrl !== 'string') throw new Error('Invalid API base URL.');
    const normalized = legacyUrl.trim().replace(/\/+$/, '');
    if (legacyUrl.trim() && normalized !== MEDMINDER_API_ORIGIN) {
      throw new Error('The API address must be the MedMinder Render HTTPS origin.');
    }
  }
  return { mode };
}

export async function loadConfig(development: boolean): Promise<MedMinderConfig> {
  const response = await fetch('/app-config.json', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Application configuration could not be loaded.');
  return parseConfig(await response.json(), development);
}
