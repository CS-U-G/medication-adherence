import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

import { MEDMINDER_CONFIG } from '../../../services';
import { MedicationApi } from '../../../services';
import { MedMinderData } from '../../../services';
import { UserApi } from '../../../services';
import { PatientApi } from '../../../services';
import { PrescriptionApi } from '../../../services';
import { Icon } from '../../../components/icon/icon';
import { OverviewPanels, OverviewStat } from '../../../components/overview-panels/overview-panels';
import { doctorAccount, doctorInitials, LiveDoctorAccount } from '../../../services';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, OverviewPanels, Icon],
  templateUrl: './admin-overview.html',
  styleUrl: './admin-overview.css',
})
export class AdminOverview implements OnInit {

  private readonly config = inject(MEDMINDER_CONFIG);
  private readonly demo = this.config.mode === 'demo' ? inject(MedMinderData) : null;
  private readonly users = inject(UserApi);
  private readonly medications = inject(MedicationApi);
  private readonly patientApi = inject(PatientApi);
  private readonly prescriptionApi = inject(PrescriptionApi);

  private readonly liveDoctors = signal<LiveDoctorAccount[] | null>(null);
  private readonly liveMedicationCount = signal<number | null>(null);
  private readonly livePatientsCount = signal<number | null>(null);
  private readonly livePrescriptionsCount = signal<number | null>(null);
  private readonly medicationError = signal(false);

  protected readonly doctorsError = signal(false);

  protected readonly doctors = computed(() => {
    if (this.demo) {
      return this.demo.doctors();
    }
    return this.liveDoctors();
  });

  protected readonly report = computed(() => {
    return this.demo ? this.demo.aggregate() : null;
  });

  protected readonly initials = doctorInitials;

  protected readonly doctorCountLabel = computed(() => {
    const accounts = this.doctors();
    if (accounts) {
      const activeCount = accounts.filter(doctor => doctor.active).length;
      return activeCount + ' active accounts';
    }
    if (this.doctorsError()) {
      return 'Accounts unavailable';
    }
    return 'Loading accounts…';
  });

  protected readonly medicationCountLabel = computed(() => {
    let count: number | null = null;
    if (this.demo) {
      count = this.demo.medications().filter(med => !med.archived).length;
    } else {
      count = this.liveMedicationCount();
    }

    if (count !== null) {
      return count + ' available medications';
    }
    if (this.medicationError()) {
      return 'Catalogue unavailable';
    }
    return 'Loading medications…';
  });

  protected readonly stats = computed<OverviewStat[]>(() => {
    const rate = this.report()?.rate;
    const doctorList = this.doctors();

    const patientCount = this.demo
      ? this.demo.patients().length
      : (this.livePatientsCount() !== null ? this.livePatientsCount()! : (doctorList ? 0 : '…'));

    const rxCount = this.demo
      ? this.demo.prescriptions().length
      : (this.livePrescriptionsCount() !== null ? this.livePrescriptionsCount()! : (doctorList ? 0 : '…'));

    return [
      {
        icon: 'users',
        label: 'Doctor accounts',
        value: doctorList ? doctorList.length : '—',
        note: this.doctorCountLabel(),
      },
      {
        icon: 'shield',
        label: 'Registered patients',
        value: patientCount,
        note: this.demo ? 'Across all doctor rosters' : 'Across all registered doctors',
      },
      {
        icon: 'file',
        label: 'Prescriptions issued',
        value: rxCount,
        note: this.demo ? 'Across all patients' : 'Active and completed prescriptions',
      },
      {
        icon: 'activity',
        label: 'Weekly adherence',
        value: rate == null ? (this.demo ? '85%' : 'N/A') : rate + '%',
        note: this.demo ? 'Taken out of all due doses' : 'Tracked via mobile app',
      },
    ];
  });

  ngOnInit(): void {
    if (this.demo) {
      return;
    }
    void this.loadDoctors();
    void this.loadMedicationCount();
  }

  protected async loadDoctors(): Promise<void> {
    this.doctorsError.set(false);
    try {
      const result = await this.users.listDoctors();
      const accounts = result.map(doctorAccount);
      this.liveDoctors.set(accounts);

      const docIds = accounts
        .map(d => d.doctorId)
        .filter((id): id is number => typeof id === 'number' && id > 0);

      if (docIds.length > 0) {
        void this.loadPlatformStats(docIds);
      } else {
        this.livePatientsCount.set(0);
        this.livePrescriptionsCount.set(0);
      }
    } catch {
      this.doctorsError.set(true);
    }
  }

  private async loadPlatformStats(docIds: number[]): Promise<void> {
    try {
      const pResults = await Promise.allSettled(
        docIds.map(id => this.patientApi.listByDoctor(id))
      );
      let totalPatients = 0;
      let anyLoaded = false;
      for (const r of pResults) {
        if (r.status === 'fulfilled') {
          totalPatients += r.value.length;
          anyLoaded = true;
        }
      }
      this.livePatientsCount.set(anyLoaded ? totalPatients : 0);
    } catch {
      this.livePatientsCount.set(0);
    }

    try {
      const rxResults = await Promise.allSettled(
        docIds.map(id => this.prescriptionApi.listByDoctor(id))
      );
      let totalRx = 0;
      let anyLoaded = false;
      for (const r of rxResults) {
        if (r.status === 'fulfilled') {
          totalRx += r.value.length;
          anyLoaded = true;
        }
      }
      if (anyLoaded) {
        this.livePrescriptionsCount.set(totalRx);
        try { localStorage.setItem('medminder_prescriptions_count', String(totalRx)); } catch {}
      } else {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('medminder_prescriptions_count') : null;
        if (saved !== null && !isNaN(Number(saved)) && Number(saved) > 0) {
          this.livePrescriptionsCount.set(Number(saved));
        } else {
          const pCount = this.livePatientsCount();
          this.livePrescriptionsCount.set(pCount && pCount > 0 ? pCount : 0);
        }
      }
    } catch {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('medminder_prescriptions_count') : null;
      if (saved !== null && !isNaN(Number(saved)) && Number(saved) > 0) {
        this.livePrescriptionsCount.set(Number(saved));
      } else {
        const pCount = this.livePatientsCount();
        this.livePrescriptionsCount.set(pCount && pCount > 0 ? pCount : 0);
      }
    }
  }

  private async loadMedicationCount(): Promise<void> {
    try {
      const activeList = await this.medications.active();
      this.liveMedicationCount.set(activeList.length);
    } catch {
      this.medicationError.set(true);
    }
  }
}
