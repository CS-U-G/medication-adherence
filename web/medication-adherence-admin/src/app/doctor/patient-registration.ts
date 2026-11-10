import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MedMinderData } from '../core/medminder-data.service';
import { PatientApi } from '../core/patient-api';
import { localDateKey } from '../core/report';
import { staffId } from '../core/staff-http';
import { Icon } from '../shared/icon';
import { patientFields, patientInputDto } from './patient-form';

@Component({
  selector: 'mm-patient-registration',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './patient-registration.html',
})
export class PatientRegistrationPage {
  private readonly auth = inject(AuthService);
  protected readonly live = this.auth.mode() === 'live';
  private readonly data = this.live ? null : inject(MedMinderData);
  private readonly api = inject(PatientApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly today = localDateKey(new Date());
  protected readonly patient = signal<{ id: string; name: string; accessCode: string } | null>(null);
  protected readonly feedback = signal('');
  protected readonly copyStatus = signal('');
  protected readonly saving = signal(false);
  protected readonly form = this.fb.group({
    ...patientFields(this.fb, this.today, this.live),
    email: ['', this.live ? [] : [Validators.required, Validators.email, Validators.maxLength(254)]],
  });

  protected async save(dialog: HTMLDialogElement): Promise<void> {
    if (this.saving()) return;
    this.feedback.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.feedback.set('Check the highlighted patient details.');
      return;
    }
    this.saving.set(true);
    try {
      const input = this.form.getRawValue();
      if (this.data) {
        this.patient.set(this.data.registerPatient(input));
      } else {
        const session = this.auth.session();
        if (session?.role !== 'doctor' || session.mode !== 'live') throw new Error('Sign in as a doctor to register a patient.');
        const record = await this.api.register({ ...patientInputDto(input), primaryDoctorId: staffId(session.id) });
        if (this.destroyRef.destroyed) return;
        this.patient.set({ id: String(record.patientId), name: record.fullName, accessCode: record.patientAccessCode });
      }
      this.copyStatus.set('');
      this.form.reset();
      dialog.showModal();
    } catch (error) {
      this.feedback.set(this.live
        ? 'Patient registration could not be confirmed. Check the directory before trying again.'
        : error instanceof Error ? error.message : 'Patient registration could not be saved.');
    } finally {
      this.saving.set(false);
    }
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
}
