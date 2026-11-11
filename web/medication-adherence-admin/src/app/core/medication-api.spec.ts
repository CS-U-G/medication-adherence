import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { MedicationApi } from './medication-api';
import { Session } from './models';

const origin = 'https://medication-adherence.onrender.com';
const liveSession: Session = {
  id: '5', role: 'admin', mode: 'live', name: 'Staff Test', email: 'staff@example.test', signedInAt: '2026-11-10T12:00:00Z',
  token: 'live-token', expiresAt: Date.now() + 60_000,
};
const input = { tradeName: 'Sample brand', scientificName: 'Sample ingredient', dosageForm: 'Tablet', strength: null };
const medication = { medicationId: 22, ...input, isActive: true, createdAt: '2026-11-10T12:00:00Z' };

describe('live medication API', () => {
  const session = signal<Session | null>(null);
  let http: HttpTestingController;
  let api: MedicationApi;

  beforeEach(() => {
    session.set(liveSession);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(),
        { provide: AuthService, useValue: { mode: () => 'live', session, expireIfNeeded: () => false } }],
    });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(MedicationApi);
  });

  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it.each([null, { ...liveSession, mode: 'demo' } as const])('keeps staff requests off the network without a live session', async current => {
    session.set(current);
    await expect(api.list()).rejects.toThrow('live staff session');
    http.expectNone(request => request.url.startsWith(origin));
  });

  it('reads the full catalogue and filters active medications from the doctor-authorized route', async () => {
    session.set({ ...liveSession, id: '31', role: 'doctor' });
    const all = api.list();
    const active = api.active();
    const one = api.get(22);
    const catalogRequests = http.match({ method: 'GET', url: `${origin}/api/Medications/All` });
    expect(catalogRequests).toHaveLength(2);
    const inactive = { ...medication, medicationId: 23, isActive: false };
    catalogRequests.forEach(request => request.flush([medication, inactive]));
    http.expectOne({ method: 'GET', url: `${origin}/api/Medications/Medication/22` }).flush(medication);
    await expect(Promise.all([all, active, one])).resolves.toEqual([[medication, inactive], [medication], medication]);
  });

  it('sends the catalogue write fields and uses a status PUT for deactivation', async () => {
    const created = api.create(input);
    const create = http.expectOne({ method: 'POST', url: `${origin}/api/Medications/AddNew` });
    expect(create.request.body).toEqual(input);
    create.flush(medication);
    await expect(created).resolves.toEqual(medication);

    const updated = api.update(22, input);
    const update = http.expectOne({ method: 'PUT', url: `${origin}/api/Medications/Medication/22` });
    expect(update.request.body).toEqual(input);
    update.flush({ message: 'Updated' });
    await updated;

    const deactivated = api.setActive(22, false);
    const status = http.expectOne({ method: 'PUT', url: `${origin}/api/Medications/22/status?isActive=false` });
    expect(status.request.body).toBeNull();
    status.flush({ message: 'Updated' });
    await deactivated;
  });

  it('discards a catalogue response after the staff session ends', async () => {
    const pending = api.list();
    session.set(null);
    http.expectOne(`${origin}/api/Medications/All`).flush([medication]);
    await expect(pending).rejects.toThrow('session changed');
  });
});
