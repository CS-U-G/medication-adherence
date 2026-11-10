import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MedMinderApi } from './api.service';
import { MEDMINDER_CONFIG } from './app-mode';

const API = 'https://medication-adherence.onrender.com';

describe('public API health', () => {
  let http: HttpTestingController;
  let api: MedMinderApi;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(MedMinderApi);
  });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('checks the real health route without sending credentials', async () => {
    const result = api.health();
    const request = http.expectOne(`${API}/health`);
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(false);
    request.flush({ status: 'healthy' });
    await expect(result).resolves.toEqual({ status: 'healthy' });
  });
  it('does not mistake an SPA fallback for a healthy API', async () => {
    const result = api.health();
    const rejected = expect(result).rejects.toThrow('unexpected health response');
    http.expectOne(`${API}/health`).flush('<html>App shell</html>');
    await rejected;
  });
  it('propagates service outages for recovery in the view', async () => {
    const result = api.health();
    const rejected = expect(result).rejects.toMatchObject({ status: 503 });
    http.expectOne(`${API}/health`).flush({}, { status: 503, statusText: 'Unavailable' });
    await rejected;
  });
});

describe('doctor registration API', () => {
  const details = {
    fullName: 'Doctor Example', phoneNumber: null, gender: 'F', dateOfBirth: '1990-04-05',
    email: 'doctor@example.test', password: 'Example-password-1', specialization: 'Cardiology',
    licenseNumber: null,
  };

  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });

  it('does not post a real account from the demo', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: MEDMINDER_CONFIG, useValue: { mode: 'demo' } },
    ] });
    const registration = TestBed.inject(MedMinderApi).registerDoctor(details);
    TestBed.inject(HttpTestingController).expectNone(`${API}/api/auth/SignIn`);
    await expect(registration).rejects.toThrow('unavailable in demo mode');
  });

  it('does not confirm creation when the server returns invalid ID types', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const registration = TestBed.inject(MedMinderApi).registerDoctor(details);
    const rejected = expect(registration).rejects.toThrow('did not confirm');
    TestBed.inject(HttpTestingController).expectOne(`${API}/api/auth/SignIn`).flush({
      userId: '4', doctorId: '7', fullName: 'Doctor Example', email: details.email,
      role: 'Doctor', message: 'Account created successfully',
    });
    await rejected;
  });
});
