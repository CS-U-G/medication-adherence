import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MEDMINDER_CONFIG } from './app-mode';
import { AuthService } from './auth.service';

const LOGIN = 'https://medication-adherence.onrender.com/api/auth/web-login';

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
    ] });
    TestBed.inject(AuthService);
    expect(localStorage.length).toBe(0);
  });

  it('rejects identity-only login and keeps the portal signed out', async () => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
    ] });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const attempt = auth.signIn(' DOCTOR@example.test ', 'secret');
    const rejected = expect(attempt).rejects.toThrow('protected staff session');
    const request = http.expectOne(LOGIN);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.withCredentials).toBe(false);
    expect(request.request.body).toEqual({ email: 'DOCTOR@example.test', password: 'secret' });
    request.flush({ userId: 4, doctorId: 8, fullName: 'Doctor', email: 'doctor@example.test', role: 'Doctor', message: 'Login successful' });
    await rejected;
    expect(auth.session()).toBeNull();
    expect(() => auth.enterDemo('admin')).toThrow('disabled');
    http.verify();
  });

  it('gives a recoverable error for an unreachable API', async () => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
    ] });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const attempt = auth.signIn('doctor@example.test', 'secret');
    const rejected = expect(attempt).rejects.toThrow('could not be reached');
    http.expectOne(LOGIN).error(new ProgressEvent('error'));
    await rejected;
    expect(auth.session()).toBeNull();
    http.verify();
  });

  it.each([
    [400, 'Check your email and password'],
    [401, 'rejected'],
    [403, 'denied'],
    [500, 'HTTP 500'],
    [503, 'temporarily unavailable'],
  ])('does not create a staff session for HTTP %s', async (status, message) => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
    ] });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const attempt = auth.signIn('doctor@example.test', 'secret');
    const rejected = expect(attempt).rejects.toThrow(message);
    http.expectOne(LOGIN).flush({}, { status, statusText: 'Rejected' });
    await rejected;
    expect(auth.session()).toBeNull();
    http.verify();
  });

  it('handles an empty successful response without granting staff access', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    const attempt = auth.signIn('doctor@example.test', 'secret');
    const rejected = expect(attempt).rejects.toThrow('unexpected sign-in response');
    http.expectOne(LOGIN).flush(null, { status: 204, statusText: 'No Content' });
    await rejected;
    expect(auth.session()).toBeNull();
    http.verify();
  });
});
