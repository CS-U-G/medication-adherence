import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Session } from '../core/models';
import { DoctorOverview } from './doctor-overview';

it('loads the signed-in doctor’s roster and active prescription count from the API', async () => {
  const session = signal<Session>({
    id: '31', name: 'Test Doctor', email: 'doctor@example.test', role: 'doctor', mode: 'live',
    signedInAt: '2026-11-10T12:00:00Z',
  });
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
      { provide: AuthService, useValue: { mode: () => 'live', session } }],
  });
  const http = TestBed.inject(HttpTestingController);
  try {
    const fixture = TestBed.createComponent(DoctorOverview);
    const origin = 'https://medication-adherence.onrender.com';
    fixture.detectChanges();
    let roster: TestRequest | undefined;
    let prescriptions: TestRequest | undefined;
    await vi.waitFor(() => {
      roster ??= http.expectOne({ method: 'GET', url: `${origin}/api/patients/doctor/31` });
      prescriptions ??= http.expectOne({ method: 'GET', url: `${origin}/api/Prescriptions/doctor/31` });
    });
    roster!.flush([{
      patientId: 14, personId: 20, fullName: 'Test Patient', phoneNumber: null, gender: 'F',
      dateOfBirth: '1990-01-01', patientAccessCode: 'TEST-001', primaryDoctorId: 31,
      primaryDoctorName: 'Test Doctor', medicalNotes: null, isActive: true,
    }]);
    const prescription = {
      prescriptionId: 21, patientId: 14, patientName: 'Test Patient', doctorId: 31, doctorName: 'Test Doctor',
      diagnosisNotes: null, issuedDate: '2026-11-10T12:00:00Z', status: 'Active', items: [],
    };
    prescriptions!.flush([prescription, { ...prescription, prescriptionId: 22, status: 'Completed' }]);
    await vi.waitFor(() => {
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect([...host.querySelectorAll('.metric strong')].map(node => node.textContent)).toEqual(['1', '1']);
      expect(host.textContent).toContain('Live dose outcomes are unavailable');
    });
    http.verify();
  } finally {
    TestBed.resetTestingModule();
  }
});
