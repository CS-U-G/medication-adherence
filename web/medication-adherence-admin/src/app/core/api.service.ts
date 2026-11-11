import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { MEDMINDER_API_ORIGIN, MEDMINDER_CONFIG } from './app-mode';
import { HealthResponse, RegisterDoctorRequest, WebLoginRequest, WebLoginResponse } from './api.models';

// Allow a Render cold start, without automatically replaying account submissions.
const API_TIMEOUT_MS = 75_000;

function isId(value: number | null): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isIdentity(value: WebLoginResponse | null): value is WebLoginResponse {
  return !!value && isId(value.userId) && (value.doctorId === null || isId(value.doctorId)) &&
    typeof value.fullName === 'string' && typeof value.email === 'string' &&
    (value.role === 'Admin' || value.role === 'Doctor') && typeof value.message === 'string' &&
    (value.token === undefined || typeof value.token === 'string');
}

@Injectable({ providedIn: 'root' })
export class MedMinderApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(MEDMINDER_CONFIG);

  async login(request: WebLoginRequest): Promise<WebLoginResponse> {
    if (this.config.mode !== 'live') throw new Error('Live sign-in is unavailable in demo mode.');
    const response = await firstValueFrom(
      this.http.post<WebLoginResponse>(`${MEDMINDER_API_ORIGIN}/api/auth/web-login`, request).pipe(timeout(API_TIMEOUT_MS)),
    );
    if (!isIdentity(response) || !response.token?.trim()) throw new Error('The server returned an unexpected sign-in response.');
    return response;
  }

  async registerDoctor(request: RegisterDoctorRequest): Promise<WebLoginResponse> {
    if (this.config.mode !== 'live') throw new Error('Live doctor registration is unavailable in demo mode.');
    const response = await firstValueFrom(
      this.http.post<WebLoginResponse>(`${MEDMINDER_API_ORIGIN}/api/auth/SignIn`, request).pipe(timeout(API_TIMEOUT_MS)),
    );
    if (!isIdentity(response) || response.role !== 'Doctor' || !isId(response.doctorId)) {
      throw new Error('The server did not confirm doctor account creation. Contact support before trying again.');
    }
    return response;
  }

  async health(): Promise<HealthResponse> {
    const response = await firstValueFrom(
      this.http.get<HealthResponse>(`${MEDMINDER_API_ORIGIN}/health`).pipe(timeout(API_TIMEOUT_MS)),
    );
    if (response?.status !== 'healthy') throw new Error('The API returned an unexpected health response.');
    return response;
  }
}
