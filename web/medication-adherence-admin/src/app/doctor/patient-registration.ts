import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { Patient } from '../core/models';
import { localDateKey } from '../core/report';
import { Icon } from '../shared/icon';

@Component({
  selector: 'mm-patient-registration',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './patient-registration.html',
})
export class PatientRegistrationPage {
  private readonly data = inject(MedMinderData);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly today = localDateKey(new Date());
  protected readonly patient = signal<Patient | null>(null);
  protected readonly feedback = signal('');
  protected readonly copyStatus = signal('');
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    phone: ['', [Validators.maxLength(25), Validators.pattern(/^\+?(?:[(). -]*\d){7,15}[(). -]*$/)]],
    dob: ['', [Validators.required, this.checkBirthDate.bind(this)]],
    gender: [''],
    notes: ['', [Validators.maxLength(500)]],
  });

  private checkBirthDate(control: AbstractControl<string>) {
    const date = control.value;
    return date && (date > this.today || localDateKey(new Date(date + 'T12:00:00')) !== date)
      ? { birthDate: true }
      : null;
  }

  protected save(dialog: HTMLDialogElement): void {
    this.feedback.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.feedback.set('Check the highlighted patient details.');
      return;
    }
    try {
      this.patient.set(this.data.registerPatient(this.form.getRawValue()));
      this.copyStatus.set('');
      this.form.reset();
      dialog.showModal();
    } catch (error) {
      this.feedback.set(error instanceof Error ? error.message : 'Patient registration could not be saved.');
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
