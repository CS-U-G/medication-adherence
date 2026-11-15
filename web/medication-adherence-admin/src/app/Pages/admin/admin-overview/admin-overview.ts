import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

import {
  MEDMINDER_CONFIG, MedMinderData, UserApi, MedicationApi, PatientApi,
  PatientRecord, MedicationRecord, doctorAccount, doctorInitials,
  LiveDoctorAccount,
} from '../../../services';
import { Icon } from '../../../components/icon/icon';
import { OverviewPanels, OverviewStat } from '../../../components/overview-panels/overview-panels';

interface DoctorWorkload {
  doctor: LiveDoctorAccount;
  patients: number | null;
  percent: number;
  color: string;
}

interface StatusBreakdown {
  title: string;
  total: number | null;
  active: number;
  inactive: number;
  activePercent: number;
  inactivePercent: number;
  gradient: string;
}

const PIE_COLORS = [
  '#0d9488', '#3b82f6', '#e6a23c', '#8b5cf6', '#ed6a5a',
  '#16a34a', '#0ea5e9', '#a855f7', '#ca8a04', '#64748b',
];

function percentage(part: number, whole: number): number {
  return whole > 0 ? Math.round(part / whole * 1000) / 10 : 0;
}

function statusBreakdown(title: string, total: number | null, activeCount: number | null): StatusBreakdown {
  const active = activeCount ?? 0;
  const inactive = total === null ? 0 : total - active;
  const activePercent = total === null ? 0 : percentage(active, total);
  const inactivePercent = total === null ? 0 : percentage(inactive, total);
  return {
    title, total, active, inactive, activePercent, inactivePercent,
    gradient: total === null || total === 0
      ? '#e2e8f0'
      : `conic-gradient(#0d9488 0% ${active / total * 100}%, #e6a23c ${active / total * 100}% 100%)`,
  };
}

function workloadGradient(rows: readonly DoctorWorkload[]): string {
  const total = rows.reduce((sum, row) => sum + (row.patients ?? 0), 0);
  if (total === 0) return '#e2e8f0';
  let cursor = 0;
  const stops: string[] = [];
  for (const row of rows) {
    if (!row.patients) continue;
    const end = cursor + row.patients / total * 100;
    stops.push(`${row.color} ${cursor}% ${end}%`);
    cursor = end;
  }
  return `conic-gradient(${stops.join(', ')})`;
}

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

  private readonly liveDoctors = signal<LiveDoctorAccount[] | null>(null);
  private readonly livePatients = signal<PatientRecord[] | null>(null);
  private readonly liveMedications = signal<MedicationRecord[] | null>(null);
  private readonly patientsByDoctor = signal<Map<number, number>>(new Map());

  protected readonly doctorsError = signal(false);
  protected readonly patientsError = signal(false);
  protected readonly medicationsError = signal(false);
  protected readonly loadingDoctors = signal(false);
  protected readonly loadingPatients = signal(false);
  protected readonly loadingMedications = signal(false);
  private requestVersion = 0;

  protected readonly initials = doctorInitials;
  protected readonly demoReport = computed(() => this.demo ? this.demo.aggregate() : null);
  protected readonly doctors = computed(() => this.demo ? this.demo.doctors() : this.liveDoctors());

  protected readonly doctorCountLabel = computed(() => {
    const doctors = this.doctors();
    if (doctors) return `${doctors.filter(doctor => doctor.active).length} active accounts`;
    return this.doctorsError() ? 'Unable to load doctors' : 'Loading doctor accounts…';
  });

  protected readonly medicationCountLabel = computed(() => {
    const medications = this.demo ? this.demo.medications().filter(m => !m.archived) : this.liveMedications()?.filter(m => m.isActive);
    if (medications) return `${medications.length} available medications`;
    return this.medicationsError() ? 'Unable to load catalogue' : 'Loading medications…';
  });

  protected readonly activeDoctors = computed(() => this.liveDoctors()?.filter(doctor => doctor.active).length ?? null);
  protected readonly inactiveDoctors = computed(() => {
    const doctors = this.liveDoctors();
    return doctors ? doctors.length - doctors.filter(doctor => doctor.active).length : null;
  });
  protected readonly activePatients = computed(() => this.livePatients()?.filter(patient => patient.isActive).length ?? null);
  protected readonly inactivePatients = computed(() => {
    const patients = this.livePatients();
    return patients ? patients.length - patients.filter(patient => patient.isActive).length : null;
  });
  protected readonly activeMedications = computed(() => this.liveMedications()?.filter(med => med.isActive).length ?? null);
  protected readonly inactiveMedications = computed(() => {
    const meds = this.liveMedications();
    return meds ? meds.length - meds.filter(med => med.isActive).length : null;
  });

  protected readonly workload = computed<DoctorWorkload[]>(() => {
    const doctors = this.liveDoctors() ?? [];
    const counts = this.patientsByDoctor();
    // Doctor shares use total roster assignments as the denominator, so they sum to 100%.
    const totalAssignments = [...counts.values()].reduce((sum, count) => sum + count, 0);
    return doctors.map(doctor => {
      const patients = doctor.doctorId === null ? null : (counts.get(doctor.doctorId) ?? null);
      return { doctor, patients, percent: patients === null ? 0 : percentage(patients, totalAssignments), color: '' };
    }).sort((left, right) => (right.patients ?? -1) - (left.patients ?? -1))
      .map((row, index) => ({ ...row, color: PIE_COLORS[index % PIE_COLORS.length] }));
  });

  protected readonly workloadCount = computed(() =>
    this.workload().reduce((sum, row) => sum + (row.patients ?? 0), 0),
  );
  protected readonly workloadPie = computed(() => workloadGradient(this.workload()));

  protected readonly statusBreakdowns = computed<StatusBreakdown[]>(() => [
    statusBreakdown('Doctor accounts', this.liveDoctors()?.length ?? null, this.activeDoctors()),
    statusBreakdown('Registered patients', this.livePatients()?.length ?? null, this.activePatients()),
    statusBreakdown('Medication catalogue', this.liveMedications()?.length ?? null, this.activeMedications()),
  ]);

  protected readonly stats = computed<OverviewStat[]>(() => {
    if (this.demo) {
      return [
        { icon: 'users', label: 'Doctor accounts', value: this.demo.doctors().length, note: this.doctorCountLabel() },
        { icon: 'shield', label: 'Registered patients', value: this.demo.patients().length, note: 'Across all doctors' },
        { icon: 'pill', label: 'Available medications', value: this.demo.medications().filter(med => !med.archived).length, note: this.medicationCountLabel() },
      ];
    }
    const doctors = this.liveDoctors();
    const patients = this.livePatients();
    const medications = this.liveMedications();
    return [
      { icon: 'users', label: 'Doctor accounts', value: doctors?.length ?? '—', note: this.doctorCountLabel() },
      { icon: 'shield', label: 'Registered patients', value: patients?.length ?? '—', note: patients ? `${this.activePatients()} active patients` : this.patientsError() ? 'Unable to load all patient rosters' : 'Loading patient rosters…' },
      { icon: 'pill', label: 'Available medications', value: this.activeMedications() ?? '—', note: this.medicationCountLabel() },
      { icon: 'activity', label: 'Catalogue entries', value: medications?.length ?? '—', note: medications ? `${this.inactiveMedications()} inactive entries` : this.medicationsError() ? 'Catalogue unavailable' : 'Loading catalogue…' },
    ];
  });

  ngOnInit(): void {
    if (!this.demo) void this.refresh();
  }

  protected async refresh(): Promise<void> {
    if (this.demo) return;
    const version = ++this.requestVersion;
    this.doctorsError.set(false);
    this.patientsError.set(false);
    this.medicationsError.set(false);
    this.loadingDoctors.set(true);
    this.loadingPatients.set(true);
    this.loadingMedications.set(true);
    this.liveDoctors.set(null);
    this.livePatients.set(null);
    this.liveMedications.set(null);
    this.patientsByDoctor.set(new Map());
    await Promise.all([this.loadPlatformDoctorsAndPatients(version), this.loadPlatformMedications(version)]);
  }

  private async loadPlatformDoctorsAndPatients(version: number): Promise<void> {
    let doctors: LiveDoctorAccount[];
    try {
      doctors = (await this.users.listDoctors()).map(doctorAccount);
      if (version !== this.requestVersion) return;
      this.liveDoctors.set(doctors);
    } catch (error) {
      if (version !== this.requestVersion) return;
      console.error('Admin doctor directory request failed', error);
      this.doctorsError.set(true);
      this.patientsError.set(true);
      this.loadingDoctors.set(false);
      this.loadingPatients.set(false);
      return;
    }
    this.loadingDoctors.set(false);

    const ids = doctors.map(d => d.doctorId);
    // Never claim a platform-wide patient count if any doctor lacks a usable ID.
    if (ids.some(id => id === null || !Number.isSafeInteger(id) || id <= 0)) {
      this.patientsError.set(true);
      this.loadingPatients.set(false);
      return;
    }
    const uniqueIds = [...new Set(ids as number[])];
    try {
      const lists = await Promise.all(uniqueIds.map(id => this.patientApi.listByDoctor(id)));
      if (version !== this.requestVersion) return;
      const counts = new Map<number, number>();
      lists.forEach((patients, index) => counts.set(uniqueIds[index], new Set(patients.map(p => p.patientId)).size));
      const uniquePatients = new Map<number, PatientRecord>();
      for (const patient of lists.flat()) uniquePatients.set(patient.patientId, patient);
      this.patientsByDoctor.set(counts);
      this.livePatients.set([...uniquePatients.values()]);
    } catch (error) {
      if (version !== this.requestVersion) return;
      console.error('Admin patient roster request failed', error);
      this.patientsError.set(true);
    } finally {
      if (version === this.requestVersion) this.loadingPatients.set(false);
    }
  }

  private async loadPlatformMedications(version: number): Promise<void> {
    try {
      const medications = await this.medications.list();
      if (version !== this.requestVersion) return;
      this.liveMedications.set(medications);
    } catch (error) {
      if (version !== this.requestVersion) return;
      console.error('Admin medication catalogue request failed', error);
      this.medicationsError.set(true);
    } finally {
      if (version === this.requestVersion) this.loadingMedications.set(false);
    }
  }
}
