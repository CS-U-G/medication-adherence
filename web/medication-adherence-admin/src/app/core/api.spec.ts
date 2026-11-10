import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MedMinderApi } from './api.service';
import { MEDMINDER_CONFIG } from './app-mode';

describe('public API health', () => {
  let http: HttpTestingController;
  let api: MedMinderApi;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: MEDMINDER_CONFIG, useValue: { mode: 'live', apiBaseUrl: 'https://api.example.test/' } },
    ] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(MedMinderApi);
  });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('checks the real health route without sending credentials', async () => {
    const result = api.health();
    const request = http.expectOne('https://api.example.test/health');
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(false);
    request.flush({ status: 'healthy' });
    await expect(result).resolves.toEqual({ status: 'healthy' });
  });
  it('does not mistake an SPA fallback for a healthy API', async () => {
    const result = api.health();
    const rejected = expect(result).rejects.toThrow('unexpected health response');
    http.expectOne('https://api.example.test/health').flush('<html>App shell</html>');
    await rejected;
  });
  it('propagates service outages for recovery in the view', async () => {
    const result = api.health();
    const rejected = expect(result).rejects.toMatchObject({ status: 503 });
    http.expectOne('https://api.example.test/health').flush({}, { status: 503, statusText: 'Unavailable' });
    await rejected;
  });
});
