import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RegisterDoctor } from './register-doctor';
import { AuthService } from '../core/auth.service';

describe('doctor self registration', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }));
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });

  function setup() {
    const fixture = TestBed.createComponent(RegisterDoctor);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const fill = (id: string, value: string) => {
      const field = host.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
      field.value = value;
      field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
    };
    const submit = () => host.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    const valid = () => {
      fill('fullName', ' Doctor Example '); fill('email', 'Doctor@Example.test');
      fill('gender', 'F'); fill('dateOfBirth', '1990-04-05');
      fill('specialization', ' Cardiology '); fill('password', 'Example-password-1');
      fill('confirmPassword', 'Example-password-1');
    };
    return { fixture, host, fill, submit, valid };
  }

  it('validates an empty form without sending a request', () => {
    const { fixture, host, submit } = setup();
    submit(); fixture.detectChanges();
    expect(host.textContent).toContain('Enter your full name.');
    TestBed.inject(HttpTestingController).expectNone('/api/auth/SignIn');
  });
  it('posts only backend fields and confirms creation without signing in', async () => {
    const { fixture, host, valid, submit } = setup();
    valid(); submit(); submit();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/auth/SignIn');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ fullName: 'Doctor Example', email: 'doctor@example.test',
      phoneNumber: null, gender: 'F', dateOfBirth: '1990-04-05', specialization: 'Cardiology',
      licenseNumber: null, password: 'Example-password-1' });
    request.flush({ userId: 4, doctorId: 7, fullName: 'Doctor Example', email: 'doctor@example.test', role: 'Doctor', message: 'Account created successfully' });
    await vi.waitFor(() => { fixture.detectChanges(); expect(host.textContent).toContain('Your doctor account is ready'); });
    expect(host.querySelector('form')).toBeNull();
    expect(TestBed.inject(AuthService).session()).toBeNull();
  });
  it('does not submit mismatched passwords or a future date', () => {
    const { fixture, host, valid, fill, submit } = setup();
    valid(); fill('confirmPassword', 'different'); fill('dateOfBirth', '2999-01-01'); submit(); fixture.detectChanges();
    expect(host.textContent).toContain('Passwords must match.');
    expect(host.textContent).toContain('Enter a valid date of birth');
    TestBed.inject(HttpTestingController).expectNone('/api/auth/SignIn');
  });
  it.each([401, 400, 500, 0])('keeps the form recoverable for HTTP %s', async status => {
    const { fixture, host, valid, submit } = setup();
    valid(); submit();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/auth/SignIn');
    if (status === 0) request.error(new ProgressEvent('error'));
    else request.flush({ errors: { Email: ['Email is already in use.'] } }, { status, statusText: 'Rejected' });
    await vi.waitFor(() => { fixture.detectChanges(); expect(host.querySelector('[role="alert"]')).not.toBeNull(); });
    expect(host.querySelector('form')).not.toBeNull();
    if (status === 400) expect(host.textContent).toContain('Email is already in use.');
    expect(host.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    expect(TestBed.inject(AuthService).session()).toBeNull();
  });
});
