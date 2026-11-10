import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { DEMO_ADMIN_EMAIL, DEMO_PASSWORD } from './demo-fixtures';
import { matchesDemoPassword } from './demo-password';
import { DemoStore } from './demo-store';
import { AppMode, Session } from './models';
import { MedMinderApi } from './api.service';

type Identity = Pick<Session, 'id' | 'name' | 'email' | 'role'>;

export interface AuthAdapter {
  signIn(email: string, password: string): Promise<Identity>;
}

export const demoAdmin: Identity = {
  id: 'ADMIN-1001', name: 'Alex Morgan', email: DEMO_ADMIN_EMAIL, role: 'admin',
};

@Injectable({ providedIn: 'root' })
export class DemoAuthAdapter implements AuthAdapter {
  private readonly store = inject(DemoStore);

  async signIn(email: string, password: string): Promise<Identity> {
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_PASSWORD) return demoAdmin;

    const doctor = this.store.state().doctors.find(account => account.email === email);
    if (!doctor) throw new Error('The email or password is incorrect.');
    const saved = this.store.state().doctorPasswords?.[doctor.id];
    const correct = saved
      ? await matchesDemoPassword(password, saved)
      : password === DEMO_PASSWORD;
    if (!correct) throw new Error('The email or password is incorrect.');
    if (!doctor.active) throw new Error('This doctor account is inactive. Contact your administrator.');

    return { id: doctor.id, name: doctor.name, email: doctor.email, role: 'doctor' };
  }
}

@Injectable({ providedIn: 'root' })
export class HttpAuthAdapter implements AuthAdapter {
  private readonly api = inject(MedMinderApi);

  async signIn(email: string, password: string): Promise<Identity> {
    await this.api.login({ email, password }).catch((error: unknown) => {
      if (error instanceof TimeoutError) throw new Error('The staff sign-in request timed out. Check service availability and try again.');
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) throw new Error('The staff sign-in service could not be reached from this browser. Check service availability and try again.');
        if (error.status === 400) throw new Error('Check your email and password and try again.');
        if (error.status === 401) throw new Error('The email or password was rejected, or the account is inactive.');
        if (error.status === 403) throw new Error('The server denied staff access for this account.');
        if ([502, 503, 504].includes(error.status)) throw new Error(`The staff sign-in service is temporarily unavailable (HTTP ${error.status}). Try again later.`);
        if (error.status >= 200 && error.status < 300) throw new Error('The server returned an unexpected sign-in response.');
        throw new Error(`The staff sign-in service returned HTTP ${error.status}. Please try again.`);
      }
      throw error;
    });

    // The API returns a profile but does not issue a backend-authorized session.
    throw new Error('The server accepted the credentials but could not establish a protected staff session. Ask your administrator to enable staff authorization on the API.');
  }
}

export function adapterFor(mode: AppMode): AuthAdapter {
  return mode === 'live' ? inject(HttpAuthAdapter) : inject(DemoAuthAdapter);
}
