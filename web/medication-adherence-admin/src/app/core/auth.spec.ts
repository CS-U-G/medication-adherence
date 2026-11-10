import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MEDMINDER_CONFIG } from './app-mode';
import { AuthService } from './auth.service';

describe('production staff access', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('defaults to live mode rather than demo access', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    expect(TestBed.inject(MEDMINDER_CONFIG).mode).toBe('live');
  });

  it('does not seed fictional records while starting live authentication', () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(),
      { provide: MEDMINDER_CONFIG, useValue: { mode: 'live', apiBaseUrl: '' } },
    ] });
    TestBed.inject(AuthService);
    expect(localStorage.length).toBe(0);
  });

  it('rejects identity-only login and keeps the portal signed out', async () => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: MEDMINDER_CONFIG, useValue: { mode: 'live', apiBaseUrl: 'https://api.example.test' } },
    ] });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const attempt = auth.signIn(' DOCTOR@example.test ', 'secret');
    const rejected = expect(attempt).rejects.toThrow('protected staff session');
    const request = http.expectOne('https://api.example.test/api/auth/web-login');
    expect(request.request.body).toEqual({ email: 'doctor@example.test', password: 'secret' });
    request.flush({ userId: 4, doctorId: 8, fullName: 'Doctor', email: 'doctor@example.test', role: 'Doctor', message: 'Login successful' });
    await rejected;
    expect(auth.session()).toBeNull();
    expect(() => auth.enterDemo('admin')).toThrow('disabled');
    http.verify();
  });

  it('gives a recoverable error for an unreachable API', async () => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: MEDMINDER_CONFIG, useValue: { mode: 'live', apiBaseUrl: '' } },
    ] });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const attempt = auth.signIn('doctor@example.test', 'secret');
    const rejected = expect(attempt).rejects.toThrow('could not be reached');
    http.expectOne('/api/auth/web-login').error(new ProgressEvent('error'));
    await rejected;
    expect(auth.session()).toBeNull();
    http.verify();
  });

  it.each([401, 403, 500])('does not create a staff session for HTTP %s', async status => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: MEDMINDER_CONFIG, useValue: { mode: 'live', apiBaseUrl: '' } },
    ] });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const attempt = auth.signIn('doctor@example.test', 'secret');
    const rejected = expect(attempt).rejects.toThrow(status === 401 ? 'rejected' : status === 403 ? 'denied' : 'HTTP 500');
    http.expectOne('/api/auth/web-login').flush({}, { status, statusText: 'Rejected' });
    await rejected;
    expect(auth.session()).toBeNull();
    http.verify();
  });
});
