import { loadConfig, parseConfig } from './runtime-config';

describe('runtime configuration', () => {
  it('defaults to live mode without a configurable request destination', () => {
    expect(parseConfig({})).toEqual({ mode: 'live' });
  });
  it('accepts an old runtime asset that already targets the canonical API', () => {
    expect(parseConfig({ apiBaseUrl: 'https://medication-adherence.onrender.com/' })).toEqual({ mode: 'live' });
  });
  it('only permits explicit demo mode in development', () => {
    expect(parseConfig({ mode: 'demo' }, true).mode).toBe('demo');
    expect(() => parseConfig({ mode: 'demo' })).toThrow('development');
  });
  it.each(['http://medication-adherence.onrender.com', 'http://localhost:5000',
    'https://127.0.0.1', 'https://api.example.test', '//api.example.test',
    'https://medication-adherence.onrender.com/api', 'https://medication-adherence.onrender.com/?token=x',
  ])('rejects redirects to an alternate API address %s even during local development', apiBaseUrl => {
    expect(() => parseConfig({ apiBaseUrl })).toThrow();
    expect(() => parseConfig({ apiBaseUrl }, true)).toThrow();
  });
  it.each([null, [], { mode: 'other' }, { apiBaseUrl: 4 }])('rejects malformed configuration', value => {
    expect(() => parseConfig(value)).toThrow();
  });
});

describe('configuration loading', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('refuses an unavailable configuration instead of falling back to demo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(loadConfig(false)).rejects.toThrow('could not be loaded');
  });
  it('rejects a published demo configuration in production', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ mode: 'demo' }) }));
    await expect(loadConfig(false)).rejects.toThrow('development');
  });
});
