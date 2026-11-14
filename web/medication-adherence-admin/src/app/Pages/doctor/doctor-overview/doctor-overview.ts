import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../services';
import { MedMinderData } from '../../../services';
import { PatientApi } from '../../../services';
import { PrescriptionApi } from '../../../services';
import { staffId } from '../../../services';
import { OverviewPanels, OverviewStat } from '../../../components/overview-panels/overview-panels';
import { Icon } from '../../../components/icon/icon';

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

  protected readonly live = this.auth.mode() === 'live';

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
      try { localStorage.setItem('medminder_prescriptions_count', String(prescriptionList.length)); } catch {}
      return {
        patients: patientList.length,
        activePrescriptions: activeCount,
      };
    },
  });

  protected readonly report = computed(() => {
    return this.data.aggregate();
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
        value: rate === null ? '—' : rate + '%',
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
