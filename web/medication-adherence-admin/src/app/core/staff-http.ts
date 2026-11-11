import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { MEDMINDER_API_ORIGIN } from './app-mode';
import { AuthService } from './auth.service';

type Query = Record<string, string | number | boolean>;

export function staffId(value: string | number | null | undefined): number {
  const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 1 || id > 2_147_483_647) {
    throw new Error('A valid record ID is required.');
  }
  return id;
}

@Injectable({ providedIn: 'root' })
export class StaffHttp {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  get<T>(path: string, params?: Query): Promise<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body: unknown, params?: Query): Promise<T> {
    return this.request<T>('POST', path, body, params);
  }

  put<T>(path: string, body: unknown, params?: Query): Promise<T> {
    return this.request<T>('PUT', path, body, params);
  }

  private async request<T>(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown, params?: Query): Promise<T> {
    const session = this.auth.session();
    if (this.auth.mode() !== 'live' || session?.mode !== 'live') {
      throw new Error('Sign in with a live staff session to continue.');
    }
    if (this.auth.expireIfNeeded()) throw new Error('Your staff session has expired. Please sign in again.');
    if (!session.token) throw new Error('Your staff session is missing its security token. Please sign in again.');

    let response: T;
    try {
      response = await firstValueFrom(
        this.http.request<T>(method, `${MEDMINDER_API_ORIGIN}${path}`, {
          body, params, headers: new HttpHeaders({ Authorization: `Bearer ${session.token}` }),
        }).pipe(timeout(75_000)),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401 && this.auth.session() === session) {
        this.auth.expireSession();
      }
      throw error;
    }
    if (this.auth.session() !== session) throw new Error('Your staff session changed. Please sign in again.');
    return response;
  }
}
