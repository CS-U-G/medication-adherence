import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MedMinderData } from '../core/medminder-data.service';
import {
  PrescriptionApi, PrescriptionRecord, PrescriptionStatus, prescriptionFrequency,
  prescriptionMedicationSource, prescriptionStatuses,
} from '../core/prescription-api';
import { staffId } from '../core/staff-http';
import { Icon } from '../shared/icon';
import { initials } from './doctor-format';

interface PrescriptionRow {
  id: string | number;
  patientId: string | number;
  name: string;
  medicationNames: string[];
  issuedAt: string;
  status: PrescriptionStatus;
}

@Component({
  selector: 'mm-prescriptions',
  imports: [DatePipe, RouterLink, Icon],
  templateUrl: './prescriptions.html',
})
export class PrescriptionsPage {
  private readonly auth = inject(AuthService);
  private readonly live = this.auth.mode() === 'live';
  private readonly demo = this.live ? null : inject(MedMinderData);
  private readonly api = this.live ? inject(PrescriptionApi) : null;
  private readonly records = signal<PrescriptionRecord[]>([]);
  private detailRequest = 0;

  protected readonly loading = signal(this.live);
  protected readonly loadError = signal('');
  protected readonly detailId = signal<number | null>(null);
  protected readonly detail = signal<PrescriptionRecord | null>(null);
  protected readonly detailLoading = signal(false);
  protected readonly detailError = signal('');
  protected readonly selectedStatus = signal<PrescriptionStatus>('Active');
  protected readonly saving = signal(false);
  protected readonly statusSaved = signal(false);
  protected readonly query = signal('');
  protected readonly initials = initials;
  protected readonly frequencyLabel = prescriptionFrequency;
  protected readonly sourceLabel = prescriptionMedicationSource;
  protected readonly statuses = prescriptionStatuses;

  private readonly rows = computed<PrescriptionRow[]>(() => {
    if (this.demo) {
      const patients = new Map(this.demo.patients().map(patient => [patient.id, patient.name]));
      return this.demo.prescriptions().map(prescription => ({
        id: prescription.id,
        patientId: prescription.patientId,
        name: patients.get(prescription.patientId) ?? 'Patient',
        medicationNames: prescription.items.map(item => item.medicationName),
        issuedAt: prescription.issuedAt,
        status: prescription.status,
      }));
    }
    return this.records().map(prescription => ({
      id: prescription.prescriptionId,
      patientId: prescription.patientId,
      name: prescription.patientName ?? `Patient ${prescription.patientId}`,
      medicationNames: prescription.items.map(item => item.prescribedMedName),
      issuedAt: prescription.issuedDate,
      status: prescription.status,
    }));
  });

  protected readonly results = computed(() => {
    const search = this.query().trim().toLowerCase();
    return this.rows().filter(row =>
      [row.name, String(row.id), ...row.medicationNames].some(value => value.toLowerCase().includes(search)),
    );
  });

  constructor() {
    if (this.live) void this.load();
  }

  protected async load(): Promise<void> {
    if (!this.api) return;
    this.loading.set(true);
    this.loadError.set('');
    try {
      const doctorId = staffId(this.auth.session()?.id);
      this.records.set(await this.api.listByDoctor(doctorId));
    } catch (error) {
      this.loadError.set(error instanceof Error ? error.message : 'Prescriptions could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }

  protected openDetail(dialog: HTMLDialogElement, id: number): void {
    void this.loadDetail(id);
    dialog.showModal();
  }

  protected async loadDetail(id: number): Promise<void> {
    if (!this.api) return;
    const request = ++this.detailRequest;
    this.detailId.set(id);
    this.detail.set(null);
    this.detailLoading.set(true);
    this.detailError.set('');
    this.statusSaved.set(false);
    try {
      const doctorId = staffId(this.auth.session()?.id);
      const prescription = await this.api.get(id);
      if (request !== this.detailRequest) return;
      if (prescription.doctorId !== doctorId) {
        throw new Error('This prescription is unavailable in your account.');
      }
      this.selectedStatus.set(prescription.status);
      this.detail.set(prescription);
      this.replaceRecord(prescription);
    } catch (error) {
      if (request === this.detailRequest) {
        this.detailError.set(error instanceof Error ? error.message : 'The prescription could not be loaded.');
      }
    } finally {
      if (request === this.detailRequest) this.detailLoading.set(false);
    }
  }

  protected selectStatus(value: string): void {
    const status = this.statuses.find(entry => entry === value);
    if (!status) return;
    this.selectedStatus.set(status);
    this.detailError.set('');
    this.statusSaved.set(false);
  }

  protected async saveStatus(): Promise<void> {
    const prescription = this.detail();
    const status = this.selectedStatus();
    if (!this.api || !prescription || status === prescription.status || this.saving()) return;
    this.saving.set(true);
    this.detailError.set('');
    this.statusSaved.set(false);
    try {
      await this.api.updateStatus(prescription.prescriptionId, status);
      const updated = { ...prescription, status };
      this.detail.set(updated);
      this.replaceRecord(updated);
      this.statusSaved.set(true);
    } catch (error) {
      this.detailError.set(error instanceof Error ? error.message : 'The status could not be updated.');
    } finally {
      this.saving.set(false);
    }
  }

  private replaceRecord(prescription: PrescriptionRecord): void {
    this.records.update(records => records.map(record =>
      record.prescriptionId === prescription.prescriptionId ? prescription : record,
    ));
  }
}
