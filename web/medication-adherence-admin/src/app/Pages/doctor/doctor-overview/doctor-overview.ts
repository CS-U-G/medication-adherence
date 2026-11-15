import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService, AdherenceReport } from '../../../services';
import { MedMinderData } from '../../../services';
import { PatientApi } from '../../../services';
import { StaffHttp, staffId } from '../../../services/api/staff-http';
import { PrescriptionApi } from '../../../services';
import { OverviewPanels, OverviewStat } from '../../../components/overview-panels/overview-panels';
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
  selector: 'app-doctor-overview',
  standalone: true,
  imports: [RouterLink, OverviewPanels, Icon],
  templateUrl: './doctor-overview.html',
  styleUrl: './doctor-overview.css',
})
export class DoctorOverview {

  protected readonly auth = inject(AuthService);
  private readonly data = inject(MedMinderData);
  private readonly patients = inject(PatientApi);
  private readonly prescriptions = inject(PrescriptionApi);
  private readonly doses = inject(StaffHttp);

  protected readonly live = this.auth.mode() === 'live';

  protected readonly actualRate = signal<number | null>(null);
  protected readonly realTaken = signal<number>(0);
  protected readonly realMissed = signal<number>(0);
  protected readonly realDue = signal<number>(0);

  protected readonly summary = resource({
    params: () => {
      const session = this.auth.session();
      if (this.live && session?.mode === 'live' && session.role === 'doctor') {
        return session.id;
      }
      return undefined;
    },
    loader: async ({ params }) => {
      const doctorId = staffId(params);
      const [patientList, prescriptionList] = await Promise.all([
        this.patients.listByDoctor(doctorId),
        this.prescriptions.listByDoctor(doctorId),
      ]);

      const activeCount = prescriptionList.filter(item => item.status === 'Active').length;
      try { localStorage.setItem('medminder_prescriptions_count', String(prescriptionList.length)); } catch { }

      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      try {
        // A doctor-wide report must include every patient, not only patientList[0].
        const reports = await Promise.all(
          patientList.map(patient => this.doses.get<DoseReportDto>(`/api/Doses/patient/${staffId(patient.patientId)}/report`, { startDate: start.toISOString(), endDate: end.toISOString() })),
        );
        const totals = reports.reduce(
          (sum, report) => ({
            due: sum.due + report.totalScheduledDoses,
            taken: sum.taken + report.takenDoses,
            missed: sum.missed + report.missedDoses,
          }),
          { due: 0, taken: 0, missed: 0 },
        );
        this.realDue.set(totals.due);
        this.realTaken.set(totals.taken);
        this.realMissed.set(totals.missed);
        this.actualRate.set(
          totals.due > 0 ? Math.round((totals.taken / totals.due) * 10000) / 100 : null,
        );
      } catch (error) {
        // Do not show incomplete data as an overall adherence rate.
        console.error('Could not load doctor-wide adherence reports', error);
        this.actualRate.set(null);
        this.realDue.set(0);
        this.realTaken.set(0);
        this.realMissed.set(0);
      }

      return {
        patients: patientList.length,
        activePrescriptions: activeCount,
      };
    },
  });

  protected readonly report = computed(() => {
    const result: AdherenceReport = {
      rate: this.actualRate(),
      days: [],
      medications: [],
      taken: this.realTaken(),
      skipped: 0,
      missed: this.realMissed(),
      due: this.realDue()
    };
    return result;
  });

  protected readonly followUps = computed(() => {
    return this.data
      .patients()
      .map(patient => {
        return {
          patient,
          report: this.data.report(patient.id),
        };
      })
      .filter(row => row.report.rate !== null && row.report.rate < 70)
      .sort((a, b) => (a.report.rate ?? 0) - (b.report.rate ?? 0));
  });

  protected readonly stats = computed<OverviewStat[]>(() => {
    const rate = this.report().rate;
    const activeRxCount = this.data
      .prescriptions()
      .filter(rx => rx.status === 'Active').length;

    return [
      {
        icon: 'users',
        label: 'My patients',
        value: this.data.patients().length,
        note: 'Registered in your roster',
      },
      {
        icon: 'activity',
        label: 'Weekly adherence',
        value: rate === null ? 'N/A' : rate + '%',
        note: 'Taken out of all due doses',
      },
      {
        icon: 'file',
        label: 'Active prescriptions',
        value: activeRxCount,
        note: 'Across your patient roster',
      },
      {
        icon: 'alert',
        label: 'Needs follow-up',
        value: this.followUps().length,
        note: 'Below 70% adherence',
        tone: 'warn',
      },
    ];
  });

  protected initials(name: string): string {
    const words = name.split(/\s+/).slice(0, 2);
    return words.map(w => w[0]).join('');
  }
}