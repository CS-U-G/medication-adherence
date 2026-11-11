import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MEDMINDER_API_ORIGIN } from '../core/app-mode';
import { AuthService } from '../core/auth.service';
import { CreatePrescriptionRequest, PrescriptionApi, PrescriptionRecord } from '../core/prescription-api';

describe('live prescription API', () => {
  const url = `${MEDMINDER_API_ORIGIN}/api/Prescriptions`;
  const input: CreatePrescriptionRequest = {
    patientId: 12,
    doctorId: 31,
    diagnosisNotes: null,
    items: [{
      medicationId: 7, prescribedMedName: 'Example Medication', dosage: '1 tablet',
      frequencyPerDay: 2, durationDays: 7,
    }],
  };
  const record: PrescriptionRecord = {
    prescriptionId: 27, patientId: 12, patientName: 'Patient Example', doctorId: 31,
    doctorName: 'Doctor Example', diagnosisNotes: null, issuedDate: '2026-11-10T12:00:00Z', status: 'Active',
    items: [{
      ...input.items[0], prescriptionItemId: 18, prescriptionId: 27,
      medicationSource: 'PrescribedByDoctor', scheduleStatus: 'PendingSchedule',
      startDate: '2026-11-10', endDate: '2026-11-17', instructions: null,
    }],
  };
  const session = { mode: 'live', id: '31', role: 'doctor', token: 'live-token', expiresAt: Date.now() + 60_000 };
  let http: HttpTestingController;
  let api: PrescriptionApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: AuthService, useValue: { mode: () => 'live', session: () => session, expireIfNeeded: () => false } },
      ],
    });
    api = TestBed.inject(PrescriptionApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('issues a prescription with numeric profile and catalogue IDs and numeric daily frequency', async () => {
    const result = api.create(input);
    const request = http.expectOne({ method: 'POST', url: `${url}/AddNew` });
    expect(request.request.body).toEqual(input);
    request.flush(record);
    await expect(result).resolves.toEqual(record);
  });

  it('rejects a creation response for a different patient', async () => {
    const result = api.create(input);
    const rejected = expect(result).rejects.toThrow('did not confirm');
    http.expectOne({ method: 'POST', url: `${url}/AddNew` }).flush({ ...record, patientId: 99 });
    await rejected;
  });

  it('reads prescription details and the doctor and patient histories from their own routes', async () => {
    const byId = api.get(27);
    const byDoctor = api.listByDoctor(31);
    const byPatient = api.listByPatient(12);
    http.expectOne({ method: 'GET', url: `${url}/Prescription/27` }).flush(record);
    http.expectOne({ method: 'GET', url: `${url}/doctor/31` }).flush([record]);
    http.expectOne({ method: 'GET', url: `${url}/patient/12` }).flush([record]);
    await expect(Promise.all([byId, byDoctor, byPatient])).resolves.toEqual([record, [record], [record]]);
  });

  it('uses the status enum in the query and requires confirmation before updating the view', async () => {
    const result = api.updateStatus(27, 'Cancelled');
    const rejected = expect(result).rejects.toThrow('did not confirm');
    const request = http.expectOne({ method: 'PUT', url: `${url}/27/status?status=Cancelled` });
    expect(request.request.body).toBeNull();
    request.flush(null, { status: 204, statusText: 'No Content' });
    await rejected;
  });

  it('accepts a confirmed status update', async () => {
    const result = api.updateStatus(27, 'Completed');
    http.expectOne({ method: 'PUT', url: `${url}/27/status?status=Completed` })
      .flush({ message: 'The prescription status has been successfully updated.' });
    await expect(result).resolves.toBeUndefined();
  });
});
