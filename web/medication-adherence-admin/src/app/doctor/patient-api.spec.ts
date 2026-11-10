import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MEDMINDER_API_ORIGIN } from '../core/app-mode';
import { AuthService } from '../core/auth.service';
import { PatientApi } from '../core/patient-api';

describe('live patient API', () => {
  const url = `${MEDMINDER_API_ORIGIN}/api/patients`;
  const details = {
    fullName: 'Patient Example', phoneNumber: null, gender: 'F',
    dateOfBirth: '1980-01-02', medicalNotes: null,
  };
  const record = {
    ...details, patientId: 12, personId: 18, patientAccessCode: 'PAT-12345',
    primaryDoctorId: 31, primaryDoctorName: null, isActive: true,
  };
  let http: HttpTestingController;
  let api: PatientApi;

  beforeEach(() => {
    const session = {
      id: '31', role: 'doctor', mode: 'live', name: 'Example Doctor',
      email: 'doctor@example.test', signedInAt: '2026-01-01T12:00:00Z',
    };
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: AuthService, useValue: { mode: () => 'live', session: () => session } },
    ] });
    api = TestBed.inject(PatientApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('registers with the doctor profile ID and returns the server-generated code', async () => {
    const result = api.register({ ...details, primaryDoctorId: 31 });
    const request = http.expectOne({ method: 'POST', url: `${url}/register-by-doctor` });
    expect(request.request.body).toEqual({ ...details, primaryDoctorId: 31 });
    request.flush(record);
    await expect(result).resolves.toEqual(record);
  });

  it('sends account status as a query parameter and rejects an empty confirmation', async () => {
    const result = api.setActive(12, false);
    const rejected = expect(result).rejects.toThrow('did not confirm');
    http.expectOne({ method: 'PUT', url: `${url}/12/status?isActive=false` })
      .flush(null, { status: 204, statusText: 'No Content' });
    await rejected;
  });

  it('rejects a replacement access code for a different patient', async () => {
    const result = api.regenerateCode(12);
    const rejected = expect(result).rejects.toThrow('did not confirm');
    http.expectOne({ method: 'PUT', url: `${url}/12/regenerate-code` }).flush({
      patientId: 18, newAccessCode: 'PAT-54321', message: 'Access code regenerated',
    });
    await rejected;
  });

  it('loads a patient record and sends edits without changing its assigned doctor', async () => {
    const loaded = api.get(12);
    http.expectOne({ method: 'GET', url: `${url}/12` }).flush(record);
    await expect(loaded).resolves.toEqual(record);

    const edit = { ...details, fullName: 'Patient Updated' };
    const updated = api.update(12, edit);
    const request = http.expectOne({ method: 'PUT', url: `${url}/12` });
    expect(request.request.body).toEqual(edit);
    request.flush({ message: 'Updated' });
    await updated;
  });
});
