import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { Session } from './models';
import { MedMinderApi } from './api.service';

type Identity = Pick<Session, 'id' | 'name' | 'email' | 'role'> &
  Pick<Session, 'token' | 'userId' | 'doctorId'>;

export interface AuthAdapter {
  signIn(email: string, password: string): Promise<Identity>;
}

@Injectable({ providedIn: 'root' })
export class HttpAuthAdapter implements AuthAdapter {
  private readonly api = inject(MedMinderApi);

  async signIn(email: string, password: string): Promise<Identity> {
    const response = await this.api.login({ email, password }).catch((error: unknown) => {
      if (error instanceof TimeoutError) throw new Error('The staff sign-in request timed out. Check service availability and try again.');
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) throw new Error('The staff sign-in service could not be reached from this browser. Check service availability and try again.');
        if (error.status === 400) throw new Error('Check your email and password and try again.');
        if (error.status === 401) throw new Error('We could not sign you in with those details. Check them and try again.');
        if (error.status === 403) throw new Error('The server denied staff access for this account.');
        if ([502, 503, 504].includes(error.status)) throw new Error(`The staff sign-in service is temporarily unavailable (HTTP ${error.status}). Try again later.`);
        if (error.status >= 200 && error.status < 300) throw new Error('The server returned an unexpected sign-in response.');
        throw new Error(`The staff sign-in service returned HTTP ${error.status}. Please try again.`);
      }
      throw error;
    });
    if (response.role === 'Doctor' && response.doctorId === null) {
      throw new Error('The server did not return a doctor record for this account. Contact support.');
    }
    return {
      id: String(response.role === 'Doctor' ? response.doctorId : response.userId),
      name: response.fullName,
      email: response.email,
      role: response.role === 'Admin' ? 'admin' : 'doctor',
      token: response.token,
      userId: response.userId,
      doctorId: response.doctorId,
    };
  }
}
