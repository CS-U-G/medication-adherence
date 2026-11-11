import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Home } from './home';
import { ServiceStatus } from './service-status';

const healthUrl = 'https://medication-adherence.onrender.com/health';

describe('public production experience', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }));
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); TestBed.resetTestingModule(); });

  it('introduces the ecosystem without fictional clinical records or demo entry', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Patient app');
    expect(host.textContent).toContain('Doctor workspace');
    expect(host.textContent).not.toContain('Marcus Reed');
    expect(host.textContent).not.toContain('80%');
    expect([...host.querySelectorAll('button')].some(button => button.textContent?.includes('Demo'))).toBe(false);
    expect(host.textContent).not.toContain('Enter Admin Demo');
    expect(host.textContent).toContain('Access staff workspace');
    expect(host.textContent).toContain('Administrator workspace');
    expect(host.textContent).not.toContain('Create doctor account');
    expect(host.querySelector('a[href="/availability"]')).not.toBeNull();
  });
  it('sends an already signed-in administrator to the authorized workspace', () => {
    const session = signal({ mode: 'live', role: 'admin', id: '7', name: 'Administrator', email: 'staff@example.test', signedInAt: 'now', token: 'token' });
    TestBed.overrideProvider(AuthService, { useValue: { session, mode: () => 'live' } });
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('a')];
    const accessLinks = links.filter(link => link.textContent?.includes('Open staff workspace') || link.textContent?.includes('Access staff workspace'));
    expect(accessLinks.length).toBeGreaterThan(0);
    expect(accessLinks.every(link => link.getAttribute('href') === '/admin')).toBe(true);
  });
  it('lets a visitor retry a failed health check', async () => {
    const fixture = TestBed.createComponent(ServiceStatus);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const button = host.querySelector('button')!;
    button.click();
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    TestBed.inject(HttpTestingController).expectOne(healthUrl).error(new ProgressEvent('error'));
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(host.textContent).toContain('could not be verified');
    });
    expect(button.disabled).toBe(false);
    button.click();
    TestBed.inject(HttpTestingController).expectOne(healthUrl).flush({ status: 'healthy' });
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(host.textContent).toContain('reachable and reports healthy');
    });
    expect(host.textContent).toContain('Authorized staff can sign in');
    expect(host.textContent).not.toContain('Pending authorization');
  });
  it('distinguishes an unavailable API from a browser connection failure', async () => {
    const fixture = TestBed.createComponent(ServiceStatus);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const button = host.querySelector('button')!;
    button.click();
    TestBed.inject(HttpTestingController).expectOne(healthUrl)
      .flush(null, { status: 503, statusText: 'Service Unavailable' });
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(host.textContent).toContain('temporarily unavailable (HTTP 503)');
    });
    expect(button.disabled).toBe(false);
  });
});
