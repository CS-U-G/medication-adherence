import { inject, Injectable, Injector, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MEDMINDER_CONFIG } from './app-mode';
import { HttpAuthAdapter } from './auth-adapters';
import { DEMO_DOCTOR_ID, DEMO_SESSION_KEY } from './demo-fixtures';
import { DemoStore } from './demo-store';
import { Session } from './models';

const LIVE_SESSION_KEY = 'medminder-live-session';

function jwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))) as { exp?: unknown };
    return typeof claims.exp === 'number' && Number.isFinite(claims.exp) ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly config = inject(MEDMINDER_CONFIG);
  private readonly adapter = inject(HttpAuthAdapter);
  private readonly injector = inject(Injector);
  private get store(): DemoStore { return this.injector.get(DemoStore); }
  private readonly current = signal<Session | null>(this.restore());
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;
  readonly session = this.current.asReadonly();
  readonly mode = signal(this.config.mode).asReadonly();

  constructor() { this.armExpiration(this.current()); }

  async signIn(email: string, password: string): Promise<Session> {
    if (this.mode() !== 'live') throw new Error('Staff sign-in requires a live connection. Use the doctor preview in development.');
    const address = email.trim();
    const identity = await this.adapter.signIn(address, password);
    return this.start(identity);
  }

  enterDemo(): Session {
    if (this.mode() !== 'demo') throw new Error('Demo entry is disabled in live mode.');
    const doctors = this.store.state().doctors;
    const doctor = doctors.find(account => account.id === DEMO_DOCTOR_ID && account.active)
      ?? doctors.find(account => account.active);
    if (!doctor) throw new Error('The doctor preview has no active sample account.');
    return this.start({ id: doctor.id, name: doctor.name, email: doctor.email, role: 'doctor' });
  }

  signOut(): void {
    this.clearSession();
  }

  private start(identity: Pick<Session, 'id' | 'name' | 'email' | 'role'> &
    Pick<Session, 'token' | 'userId' | 'doctorId'>): Session {
    const expiresAt = this.mode() === 'live' && identity.token ? jwtExpiry(identity.token) : undefined;
    if (this.mode() === 'live' && (!identity.token || !expiresAt || expiresAt <= Date.now())) {
      throw new Error('The server returned an invalid or expired sign-in token. Please try again.');
    }
    const session: Session = {
      ...identity,
      mode: this.mode(),
      signedInAt: new Date().toISOString(),
      ...(expiresAt ? { expiresAt } : {}),
    };
    if (session.mode === 'demo') sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    else this.saveLiveSession(session);
    this.current.set(session);
    this.armExpiration(session);
    return session;
  }

  private restore(): Session | null {
    if (this.config.mode === 'live') {
      try {
        const saved = localStorage.getItem(LIVE_SESSION_KEY);
        if (!saved) return null;
        const session = JSON.parse(saved) as Session;
        const expiry = session.token ? jwtExpiry(session.token) : null;
        const valid = session.mode === 'live' && !!session.token && !!expiry && expiry > Date.now() &&
          session.expiresAt === expiry && Number.isSafeInteger(session.userId) && session.userId! > 0 &&
          (session.role === 'admin'
            ? session.id === String(session.userId)
            : session.role === 'doctor' && Number.isSafeInteger(session.doctorId) &&
              session.doctorId! > 0 && session.id === String(session.doctorId)) &&
          typeof session.name === 'string' && typeof session.email === 'string' && !!session.signedInAt;
        if (!valid) {
          localStorage.removeItem(LIVE_SESSION_KEY);
          return null;
        }
        return session;
      } catch {
        try { localStorage.removeItem(LIVE_SESSION_KEY); } catch { /* Storage may be unavailable. */ }
        return null;
      }
    }
    try {
      const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (!saved) return null;
      const session = JSON.parse(saved) as Session;
      if (session.mode !== 'demo' || !session.signedInAt) return null;
      if (session.role !== 'doctor') {
        sessionStorage.removeItem(DEMO_SESSION_KEY);
        return null;
      }
      const doctor = this.store.state().doctors.find(account => account.id === session.id && account.active);
      return doctor ? { ...session, name: doctor.name, email: doctor.email } : null;
    } catch {
      return null;
    }
  }

  expireIfNeeded(): boolean {
    const session = this.current();
    if (session?.mode === 'live' && (!session.expiresAt || session.expiresAt <= Date.now())) {
      this.expireSession();
      return true;
    }
    return false;
  }

  expireSession(): void {
    this.clearSession();
    void this.injector.get(Router).navigate(['/login'], { queryParams: { expired: '1' } });
  }

  private clearSession(): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    this.current.set(null);
    try { sessionStorage.removeItem(DEMO_SESSION_KEY); } catch { /* Storage may be unavailable. */ }
    try { localStorage.removeItem(LIVE_SESSION_KEY); } catch { /* Storage may be unavailable. */ }
  }

  private saveLiveSession(session: Session): void {
    try { localStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(session)); }
    catch { /* Keep this tab signed in even when browser persistence is disabled. */ }
  }

  private armExpiration(session: Session | null): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    if (session?.mode !== 'live' || !session.expiresAt) return;
    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      this.expireSession();
      return;
    }
    this.expiryTimer = setTimeout(() => this.expireSession(), remaining);
  }
}
