import { inject, Injectable, Injector, signal } from '@angular/core';
import { MEDMINDER_CONFIG } from './app-mode';
import { adapterFor, demoAdmin } from './auth-adapters';
import { DEMO_DOCTOR_ID, DEMO_SESSION_KEY } from './demo-fixtures';
import { DemoStore } from './demo-store';
import { Role, Session } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly config = inject(MEDMINDER_CONFIG);
  private readonly adapter = adapterFor(this.config.mode);
  private readonly injector = inject(Injector);
  private get store(): DemoStore { return this.injector.get(DemoStore); }
  private readonly current = signal<Session | null>(this.restore());
  readonly session = this.current.asReadonly();
  readonly mode = signal(this.config.mode).asReadonly();

  async signIn(email: string, password: string): Promise<Session> {
    const identity = await this.adapter.signIn(email.trim().toLowerCase(), password);
    return this.start(identity);
  }

  enterDemo(role: Role): Session {
    if (this.mode() !== 'demo') throw new Error('Demo entry is disabled in live mode.');
    if (role === 'admin') return this.start(demoAdmin);

    const doctors = this.store.state().doctors;
    const doctor = doctors.find(account => account.id === DEMO_DOCTOR_ID && account.active)
      ?? doctors.find(account => account.active);
    if (!doctor) throw new Error('Activate a doctor account in the Administrator Demo to continue.');
    return this.start({ id: doctor.id, name: doctor.name, email: doctor.email, role: 'doctor' });
  }

  signOut(): void {
    this.current.set(null);
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  }

  private start(identity: Pick<Session, 'id' | 'name' | 'email' | 'role'>): Session {
    const session: Session = {
      ...identity,
      mode: this.mode(),
      signedInAt: new Date().toISOString(),
    };
    if (session.mode === 'demo') sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    this.current.set(session);
    return session;
  }

  private restore(): Session | null {
    if (this.config.mode !== 'demo') return null;
    try {
      const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (!saved) return null;
      const session = JSON.parse(saved) as Session;
      if (session.mode !== 'demo' || !session.signedInAt) return null;
      if (session.role === 'admin' && session.id === demoAdmin.id) {
        return { ...session, ...demoAdmin };
      }
      if (session.role !== 'doctor') return null;
      const doctor = this.store.state().doctors.find(account => account.id === session.id && account.active);
      return doctor ? { ...session, name: doctor.name, email: doctor.email } : null;
    } catch {
      return null;
    }
  }
}
