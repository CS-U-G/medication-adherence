import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { ServiceStatus } from './service-status';

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
    expect(host.querySelector('a[href="/availability"]')).not.toBeNull();
  });
  it('lets a visitor retry a failed health check', async () => {
    const fixture = TestBed.createComponent(ServiceStatus);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const button = host.querySelector('button')!;
    button.click();
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    TestBed.inject(HttpTestingController).expectOne('/health').error(new ProgressEvent('error'));
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(host.textContent).toContain('could not be verified');
    });
    expect(button.disabled).toBe(false);
    button.click();
    TestBed.inject(HttpTestingController).expectOne('/health').flush({ status: 'healthy' });
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(host.textContent).toContain('reachable and reports healthy');
    });
    expect(host.textContent).toContain('authorization is still pending');
  });
});
