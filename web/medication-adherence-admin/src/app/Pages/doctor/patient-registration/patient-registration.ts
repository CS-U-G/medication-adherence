import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService, MedMinderData, PatientApi, localDateKey, staffId } from '../../../services';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'mm-patient-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './patient-registration.html',
  styleUrl: './patient-registration.css',
})
export class PatientRegistrationPage {

  private readonly auth = inject(AuthService);
  protected readonly live = this.auth.mode() === 'live';
  private readonly data = this.live ? null : inject(MedMinderData);
  private readonly api = inject(PatientApi);
  private readonly fb = inject(FormBuilder);

  protected readonly today = localDateKey(new Date());

  protected readonly patient = signal<{ id: string; name: string; accessCode: string } | null>(null);
  protected readonly feedback = signal('');
  protected readonly copyStatus = signal('');
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(20)]],
    dob: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(500)]],
    email: [''],
  });

  protected async save(dialog: HTMLDialogElement): Promise<void> {
    if (this.saving()) {
      return;
    }

    this.feedback.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.feedback.set('Check the highlighted patient details.');
      return;
    }

    this.saving.set(true);

    try {
      const formValues = this.form.getRawValue();

      if (this.data) {

        this.patient.set(this.data.registerPatient(formValues as any));
      } else {

        const session = this.auth.session();
        if (!session || session.role !== 'doctor') {
          throw new Error('Sign in as a doctor to register a patient.');
        }

        const newPatient = await this.api.register({
          fullName: (formValues.name ?? '').trim(),
          phoneNumber: formValues.phone ? formValues.phone.trim() : null,
          gender: formValues.gender ?? '',
          dateOfBirth: formValues.dob ?? '',
          medicalNotes: formValues.notes ? formValues.notes.trim() : null,
          primaryDoctorId: staffId(session.id),
        });

        this.patient.set({
          id: String(newPatient.patientId),
          name: newPatient.fullName,
          accessCode: newPatient.patientAccessCode,
        });
      }

      this.form.reset();
      dialog.showModal();
    } catch (error) {
      if (error instanceof Error) {
        this.feedback.set(error.message);
      } else {
        this.feedback.set('Patient registration could not be confirmed. Check the directory before trying again.');
      }
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
