import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MEDMINDER_API_ORIGIN } from './app-mode';
import { AuthService } from './auth.service';
import { UserApi } from './user-api';

describe('staff user API', () => {
  let api: UserApi;
  let http: HttpTestingController;

  beforeEach(() => {
    const session = { mode: 'live', role: 'admin', token: 'live-token' };
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: AuthService, useValue: { mode: () => 'live', session: () => session, expireIfNeeded: () => false } },
    ] });
    api = TestBed.inject(UserApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); TestBed.resetTestingModule(); });

  it('rejects an HTTP 200 freeze result when the user was not updated', async () => {
    const rejected = expect(api.setActive(31, false)).rejects.toThrow('could not be changed');
    const request = http.expectOne({ method: 'POST', url: `${MEDMINDER_API_ORIGIN}/api/users/freeze/31` });
    expect(request.request.headers.get('Authorization')).toBe('Bearer live-token');
    request.flush(false);
    await rejected;
  });

  it('recognizes the directory endpoint’s explicit no-doctors response', async () => {
    const result = api.listDoctors();
    http.expectOne(`${MEDMINDER_API_ORIGIN}/api/users/doctors`)
      .flush({ messsage: 'No Any Doctors.' }, { status: 404, statusText: 'Not Found' });
    await expect(result).resolves.toEqual([]);
  });

  it('loads and unfreezes by user ID and edits the same account by doctor ID', async () => {
    const url = `${MEDMINDER_API_ORIGIN}/api/users`;
    const profile = {
      userId: 31, personId: 22, doctorId: 9, fullName: 'Doctor Example', email: 'doctor@example.test',
      phoneNumber: null, gender: null, dateOfBirth: null, role: 'Doctor',
      specialization: 'Primary care', licenseNumber: null, isActive: false,
    };
    const loaded = api.get(31);
    http.expectOne({ method: 'GET', url: `${url}/user/31` }).flush(profile);
    const doctor = await loaded;

    const edit = { fullName: 'Doctor Updated', phoneNumber: null, specialization: 'Primary care', licenseNumber: null };
    const updated = api.updateDoctor(doctor.doctorId!, edit);
    const update = http.expectOne({ method: 'PUT', url: `${url}/doctors/9` });
    expect(update.request.body).toEqual(edit);
    update.flush({ message: 'Updated' });
    await updated;

    const activated = api.setActive(doctor.userId, true);
    http.expectOne({ method: 'POST', url: `${url}/unfreeze/31` }).flush(true);
    await activated;
  });
});
