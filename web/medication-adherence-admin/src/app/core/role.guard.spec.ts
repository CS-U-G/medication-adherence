import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('staff route guards', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] }));
  afterEach(() => TestBed.resetTestingModule());
  it.each(['doctor', 'admin'] as const)('redirects signed-out %s routes to sign in with a return URL', role => {
    const path = `/${role}/settings`;
    const result = TestBed.runInInjectionContext(() => roleGuard(role)({} as ActivatedRouteSnapshot, { url: path } as RouterStateSnapshot));
    expect(result instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(`/login?returnUrl=%2F${role}%2Fsettings`);
  });
  it('denies a doctor access to administrator routes', () => {
    TestBed.overrideProvider(AuthService, { useValue: { session: () => ({ role: 'doctor' }), expireIfNeeded: () => false } });
    const result = TestBed.runInInjectionContext(() => roleGuard('admin')({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/forbidden');
  });
  it('allows an administrator into administrator routes', () => {
    TestBed.overrideProvider(AuthService, { useValue: { session: () => ({ role: 'admin' }), expireIfNeeded: () => false } });
    const result = TestBed.runInInjectionContext(() => roleGuard('admin')({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot));
    expect(result).toBe(true);
  });
  it('denies an administrator access to doctor routes', () => {
    TestBed.overrideProvider(AuthService, { useValue: { session: () => ({ role: 'admin' }), expireIfNeeded: () => false } });
    const result = TestBed.runInInjectionContext(() => roleGuard('doctor')({} as ActivatedRouteSnapshot, { url: '/doctor' } as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/forbidden');
  });
  it('redirects an expired staff session back to sign in', () => {
    TestBed.overrideProvider(AuthService, { useValue: { session: () => null, expireIfNeeded: () => true } });
    const result = TestBed.runInInjectionContext(() => roleGuard('admin')({} as ActivatedRouteSnapshot, { url: '/admin' } as RouterStateSnapshot));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login?expired=1');
  });
});
