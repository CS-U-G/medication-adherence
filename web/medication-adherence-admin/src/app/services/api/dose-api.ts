import { inject, Injectable } from '@angular/core';
import { StaffHttp, staffId } from './staff-http';

export interface DoseReportDto {
  patientId: number;
  totalScheduledDoses: number;
  takenDoses: number;
  skippedDoses: number;
  missedDoses: number;
  adherencePercentage: number;
}

@Injectable({ providedIn: 'root' })
export class DoseApi {
  private readonly http = inject(StaffHttp);

  report(patientId: number, start: Date, end: Date): Promise<DoseReportDto> {
    return this.http.get<DoseReportDto>(
      `/api/Doses/patient/${staffId(patientId)}/report`,
      { startDate: start.toISOString(), endDate: end.toISOString() },
    );
  }
}
