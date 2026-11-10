import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, linkedSignal, resource, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MedMinderData } from '../core/medminder-data.service';
import { PatientApi, PatientRecord } from '../core/patient-api';
import { PrescriptionApi, prescriptionFrequency, prescriptionMedicationSource } from '../core/prescription-api';
import { localDateKey } from '../core/report';
import { staffId } from '../core/staff-http';
import { Icon } from '../shared/icon';
import { adherenceStatus, initials, medicationSourceTone } from './doctor-format';
import { patientFields, patientInputDto } from './patient-form';

@Component({
  selector: 'mm-patient-detail',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './patient-detail.html',
  styles: [`.record-actions { margin-top: 16px; }`],
})
export class PatientDetailPage {
  private readonly auth = inject(AuthService);
  protected readonly live = this.auth.mode() === 'live';
  private readonly data = this.live ? null : inject(MedMinderData);
  private readonly api = inject(PatientApi);
  private readonly prescriptionApi = inject(PrescriptionApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly today = localDateKey(new Date());
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly editForm = this.fb.group(patientFields(this.fb, this.today, true));
  protected readonly mutating = signal(false);
  protected readonly feedback = linkedSignal({ source: this.params, computation: () => '' });
  protected readonly failure = linkedSignal({ source: this.params, computation: () => '' });
  protected readonly copyStatus = signal('');
  protected readonly codeUnconfirmed = linkedSignal({ source: this.params, computation: () => false });

  protected readonly record = resource({
    params: () => {
      const session = this.auth.session();
      return session?.mode === 'live' && session.role === 'doctor'
        ? { doctorId: session.id, patientId: this.params().get('id') }
        : undefined;
    },
    loader: async ({ params }) => {
      const doctorId = staffId(params.doctorId);
      const patient = await this.api.get(staffId(params.patientId));
      if (patient.primaryDoctorId !== doctorId) throw new Error('This patient is outside your directory.');
      return patient;
    },
  });

  protected readonly livePatient = computed(() => this.record.hasValue() ? this.record.value() : undefined);
  protected readonly history = resource({
    params: () => this.livePatient()?.patientId,
    loader: ({ params }) => this.prescriptionApi.listByPatient(params),
  });

  protected readonly initials = initials;
  protected readonly medicationSourceTone = medicationSourceTone;
  protected readonly patient = computed(() => {
    if (this.data) return this.data.patients().find(patient => patient.id === this.params().get('id'));
    const record = this.livePatient();
    if (!record) return undefined;
    return {
      id: String(record.patientId), name: record.fullName, email: '', phone: record.phoneNumber,
      dob: record.dateOfBirth, gender: this.genderLabel(record.gender), notes: record.medicalNotes, createdAt: null,
    };
  });
  protected readonly prescriptions = computed(() => {
    if (this.data) return this.data.prescriptions().filter(prescription => prescription.patientId === this.patient()?.id);
    return (this.history.hasValue() ? this.history.value() : []).map(prescription => ({
      id: String(prescription.prescriptionId), issuedAt: prescription.issuedDate,
      status: prescription.status, notes: prescription.diagnosisNotes,
      items: prescription.items.map(item => ({
        id: item.prescriptionItemId, medicationName: item.prescribedMedName, dose: item.dosage,
        frequency: prescriptionFrequency(item.frequencyPerDay), duration: item.durationDays,
        source: prescriptionMedicationSource(item.medicationSource),
      })),
    }));
  });
  protected readonly issued = computed(() => this.prescriptions().some(prescription => prescription.id === this.query().get('issued')));
  protected readonly rate = computed(() => this.data?.report(this.patient()?.id ?? '').rate ?? null);
  protected readonly status = computed(() => adherenceStatus(this.rate()));

  protected openEdit(dialog: HTMLDialogElement): void {
    const patient = this.livePatient();
    if (!patient || this.mutating()) return;
    this.feedback.set('');
    this.failure.set('');
    this.editForm.reset({
      name: patient.fullName, phone: patient.phoneNumber ?? '', dob: patient.dateOfBirth,
      gender: patient.gender ?? '', notes: patient.medicalNotes ?? '',
    });
    dialog.showModal();
  }

  protected async saveEdit(dialog: HTMLDialogElement): Promise<void> {
    if (this.mutating()) return;
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.failure.set('Check the highlighted patient details.');
      return;
    }
    const input = patientInputDto(this.editForm.getRawValue());
    const saved = await this.mutate(async record => {
      await this.api.update(record.patientId, input);
      return { ...record, ...input };
    }, 'Patient information updated.', 'The patient information update could not be confirmed.');
    if (saved) dialog.close();
  }

  protected toggleStatus(): void {
    const patient = this.livePatient();
    if (!patient) return;
    const isActive = !patient.isActive;
    void this.mutate(async record => {
      await this.api.setActive(record.patientId, isActive);
      return { ...record, isActive };
    }, isActive ? 'Patient access activated.' : 'Patient access deactivated.', 'The patient status update could not be confirmed.');
  }

  protected openCode(dialog: HTMLDialogElement): void {
    if (this.mutating()) return;
    this.feedback.set('');
    this.failure.set('');
    this.copyStatus.set('');
    dialog.showModal();
  }

  protected reloadCode(dialog: HTMLDialogElement): void {
    dialog.close();
    this.failure.set('');
    this.codeUnconfirmed.set(false);
    this.record.reload();
  }

  protected async regenerateCode(): Promise<void> {
    const patient = this.livePatient();
    if (!patient || this.mutating() || this.codeUnconfirmed()) return;
    this.copyStatus.set('');
    const saved = await this.mutate(async record => ({ ...record, patientAccessCode: await this.api.regenerateCode(record.patientId) }),
      'A new access code is ready to share.', 'The replacement access code could not be confirmed. Reload the record before trying again.');
    if (!saved && this.livePatient() === patient) this.codeUnconfirmed.set(true);
  }

  protected async copyCode(field: HTMLInputElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(field.value);
      this.copyStatus.set('Access code copied.');
    } catch {
      field.select();
      this.copyStatus.set('The code is selected. Use your device’s copy command.');
    }
  }

  private async mutate(
    change: (record: PatientRecord) => Promise<PatientRecord>, success: string, failure: string,
  ): Promise<boolean> {
    const record = this.livePatient();
    if (!record || this.mutating()) return false;
    this.mutating.set(true);
    this.feedback.set('');
    this.failure.set('');
    try {
      const updated = await change(record);
      if (this.destroyRef.destroyed || this.livePatient() !== record) return false;
      this.record.set(updated);
      this.feedback.set(success);
      return true;
    } catch {
      if (!this.destroyRef.destroyed && this.livePatient() === record) this.failure.set(failure);
      return false;
    } finally {
      this.mutating.set(false);
    }
  }

  private genderLabel(gender: string | null): string {
    if (gender === 'F') return 'Female';
    if (gender === 'M') return 'Male';
    return '';
  }
}
