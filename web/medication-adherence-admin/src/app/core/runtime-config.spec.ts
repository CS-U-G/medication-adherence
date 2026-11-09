import { loadConfig, parseConfig } from './runtime-config';

describe('runtime configuration', () => {
  it('defaults to same-origin live mode', () => {
    expect(parseConfig({})).toEqual({ mode: 'live', apiBaseUrl: '' });
  });
  it('normalizes an HTTPS API base URL', () => {
    expect(parseConfig({ apiBaseUrl: 'https://api.example.test/' }).apiBaseUrl).toBe('https://api.example.test');
  });
  it('only permits explicit demo mode in development', () => {
    expect(parseConfig({ mode: 'demo' }, true).mode).toBe('demo');
    expect(() => parseConfig({ mode: 'demo' })).toThrow('development');
  });
  it.each(['http://api.example.test', '//evil.test', 'javascript:alert(1)', 'https://name:secret@api.test', 'https://api.test/?token=x', 'https://api.test/#x'])('rejects unsafe API URL %s', apiBaseUrl => {
    expect(() => parseConfig({ apiBaseUrl })).toThrow();
  });
  it('allows an HTTP loopback API only in development', () => {
    expect(parseConfig({ apiBaseUrl: 'http://localhost:5000' }, true).apiBaseUrl).toBe('http://localhost:5000');
    expect(() => parseConfig({ apiBaseUrl: 'http://localhost:5000' })).toThrow();
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
