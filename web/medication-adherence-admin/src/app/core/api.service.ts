import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { MEDMINDER_CONFIG } from './app-mode';
import { HealthResponse, RegisterDoctorRequest, WebLoginRequest, WebLoginResponse } from './api.models';

@Injectable({ providedIn: 'root' })
export class MedMinderApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(MEDMINDER_CONFIG).apiBaseUrl.replace(/\/$/, '');

  login(request: WebLoginRequest): Promise<WebLoginResponse> {
    return firstValueFrom(this.http.post<WebLoginResponse>(`${this.base}/api/auth/web-login`, request).pipe(timeout(15000)));
  }

  async registerDoctor(request: RegisterDoctorRequest): Promise<WebLoginResponse> {
    const response = await firstValueFrom(this.http.post<WebLoginResponse>(`${this.base}/api/auth/SignIn`, request).pipe(timeout(15000)));
    if (response?.role !== 'Doctor' || !(response.userId > 0) || !(response.doctorId && response.doctorId > 0)) {
      throw new Error('The server did not confirm doctor account creation. Contact support before trying again.');
    }
    return response;
  }

  async health(): Promise<HealthResponse> {
    const response = await firstValueFrom(this.http.get<HealthResponse>(`${this.base}/health`).pipe(timeout(10000)));
    if (response?.status !== 'healthy') throw new Error('The API returned an unexpected health response.');
    return response;
  }
}
