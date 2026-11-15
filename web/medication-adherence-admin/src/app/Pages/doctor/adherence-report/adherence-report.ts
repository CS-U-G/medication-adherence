import { Component, computed, inject, signal, resource } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../services';
import { PatientApi } from '../../../services';
import { StaffHttp, staffId } from '../../../services/api/staff-http';
import { ReportPeriod, AdherenceReport } from '../../../services';
import { Icon } from '../../../components/icon/icon';

interface DoseReportDto {
  patientId: number;
  totalScheduledDoses: number;
  takenDoses: number;
  skippedDoses: number;
  missedDoses: number;
  adherencePercentage: number;
}

@Component({
  selector: 'mm-adherence-report',
  standalone: true,
  imports: [Icon, RouterLink],
  templateUrl: './adherence-report.html',
  styleUrl: './adherence-report.css',
})
export class AdherenceReportPage {
  private readonly auth = inject(AuthService);
  private readonly patientsApi = inject(PatientApi);
  private readonly doses = inject(StaffHttp);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly live = this.auth.mode() === 'live';
  protected readonly periods: ReportPeriod[] = [7, 14, 30, 90];
  protected readonly period = signal<ReportPeriod>(7);

  // 1. جلب قائمة المرضى الحقيقية من الـ API
  protected readonly patientsList = resource({
    loader: async () => {
      const session = this.auth.session();
      if (!session || session.role !== 'doctor') return [];
      return await this.patientsApi.listByDoctor(Number(session.id));
    }
  });

  // 2. تحديد المريض المختار حالياً
  protected readonly patient = computed(() => {
    const list = this.patientsList.value() || [];
    const patientId = this.query().get('patient');
    // نرجع المريض المختار أو أول مريض في القائمة
    return list.find((p: any) => p.patientId?.toString() === patientId) ?? list[0];
  });

  // 3. جلب التقرير الحقيقي من الـ API
  protected readonly report = resource({
    params: () => {
      const patient = this.patient();
      if (!patient) return undefined;
      return { patientId: patient.patientId, period: this.period() };
    },
    loader: async ({ params }): Promise<AdherenceReport> => {
      const { patientId, period } = params;
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - period);

      // StaffHttp supplies the Render origin, auth token and timeout.
      const data = await this.doses.get<DoseReportDto>(`/api/Doses/patient/${staffId(patientId)}/report`, { startDate: start.toISOString(), endDate: end.toISOString() });
      return {
        rate: data.totalScheduledDoses > 0 ? data.adherencePercentage : null,
        taken: data.takenDoses,
        skipped: data.skippedDoses,
        missed: data.missedDoses,
        due: data.totalScheduledDoses,
        // This backend DTO contains totals only; it does not include chart series.
        days: [],
        medications: [],
      };
    }
  });

  protected changePatient(id: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { patient: id },
      replaceUrl: true,
    });
  }

  protected changePeriod(value: string): void {
    const period = this.periods.find(p => p === Number(value));
    if (period) this.period.set(period);
  }
}