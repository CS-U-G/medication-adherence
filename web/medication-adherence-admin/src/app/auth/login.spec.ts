import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Login } from './login';

const LOGIN = 'https://medication-adherence.onrender.com/api/auth/web-login';
const token = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;

describe('unified staff sign-in', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  function openLogin() {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    return fixture;
  }

  function submitCredentials(fixture: ReturnType<typeof openLogin>) {
    const host = fixture.nativeElement as HTMLElement;
    const email = host.querySelector<HTMLInputElement>('#staff-email')!;
    const password = host.querySelector<HTMLInputElement>('#staff-password')!;
    email.value = 'staff@example.test';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'secret';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('shows one credential form without a role or administrator sign-in option', () => {
    const fixture = openLogin();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('form')).toHaveLength(1);
    expect(host.querySelectorAll('input#staff-email, input#staff-password')).toHaveLength(2);
    expect(host.textContent).toContain('Staff sign in');
    expect(host.textContent).not.toMatch(/admin demo|administrator sign.?in|choose a role/i);
  });

  it.each([
    ['Doctor', 21, 31, '/doctor'],
    ['Admin', 7, null, '/admin'],
  ] as const)('routes a backend-authenticated %s to its workspace', async (role, userId, doctorId, target) => {
    const fixture = openLogin();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    submitCredentials(fixture);

    const request = TestBed.inject(HttpTestingController).expectOne(LOGIN);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'staff@example.test', password: 'secret' });
    request.flush({ userId, doctorId, fullName: 'Staff Member', email: 'staff@example.test', role, message: 'Login successful', token });

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(target));
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Admin Demo');
    TestBed.inject(AuthService).signOut();
  });

  it('shows an accessible non-revealing message for rejected credentials', async () => {
    const fixture = openLogin();
    submitCredentials(fixture);
    TestBed.inject(HttpTestingController).expectOne(LOGIN)
      .flush({ message: 'Internal account detail' }, { status: 401, statusText: 'Unauthorized' });

    await vi.waitFor(() => {
      fixture.detectChanges();
      const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
      expect(alert?.textContent).toContain('We could not sign you in with those details');
      expect(alert?.textContent).not.toContain('Internal account detail');
    });
  });
});
