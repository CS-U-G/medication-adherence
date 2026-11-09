import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TimeoutError } from 'rxjs';
import { MedMinderApi } from '../core/api.service';
import { localDateKey } from '../core/report';
import { Brand } from '../shared/brand';
import { Icon } from '../shared/icon';

type FieldKey = 'fullName' | 'phoneNumber' | 'gender' | 'dateOfBirth' | 'email' | 'password' | 'confirmPassword' | 'specialization' | 'licenseNumber';
interface RegistrationField {
  key: FieldKey; label: string; type: string; autocomplete: string;
  required: boolean; maxLength?: number;
}

function birthDate(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value);
  if (!value) return null;
  const parsed = new Date(`${value}T12:00:00`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parsed.valueOf()) && localDateKey(parsed) === value && value <= localDateKey(new Date())
    ? null : { birthDate: true };
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, Brand, Icon],
  templateUrl: './register-doctor.html',
  styleUrl: './register-doctor.scss',
})
export class RegisterDoctor {
  private readonly api = inject(MedMinderApi);
  protected readonly busy = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal('');
  protected readonly serverFields = signal<Partial<Record<FieldKey, string>>>({});
  protected readonly today = localDateKey(new Date());
  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    phoneNumber: ['', Validators.maxLength(20)],
    gender: ['', [Validators.required, Validators.maxLength(1)]],
    dateOfBirth: ['', [Validators.required, birthDate]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    specialization: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    licenseNumber: ['', Validators.maxLength(50)],
  }, { validators: control => control.get('password')?.value === control.get('confirmPassword')?.value ? null : { passwordMismatch: true } });

  protected readonly sections: { title: string; fields: RegistrationField[] }[] = [
    { title: 'Personal details', fields: [
      { key: 'fullName', label: 'Full name', type: 'text', autocomplete: 'name', required: true, maxLength: 100 },
      { key: 'phoneNumber', label: 'Phone number', type: 'tel', autocomplete: 'tel', required: false, maxLength: 20 },
      { key: 'gender', label: 'Gender', type: 'select', autocomplete: 'sex', required: true },
      { key: 'dateOfBirth', label: 'Date of birth', type: 'date', autocomplete: 'bday', required: true },
    ] },
    { title: 'Professional details', fields: [
      { key: 'specialization', label: 'Specialization', type: 'text', autocomplete: 'off', required: true, maxLength: 100 },
      { key: 'licenseNumber', label: 'License number', type: 'text', autocomplete: 'off', required: false, maxLength: 50 },
    ] },
    { title: 'Account access', fields: [
      { key: 'email', label: 'Email address', type: 'email', autocomplete: 'username', required: true, maxLength: 150 },
      { key: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', required: true },
      { key: 'confirmPassword', label: 'Confirm password', type: 'password', autocomplete: 'new-password', required: true },
    ] },
  ];

  protected fieldError(key: FieldKey): string {
    const serverError = this.serverFields()[key];
    if (serverError) return serverError;
    const control = this.form.controls[key];
    if (!control.touched) return '';
    if (key === 'confirmPassword' && this.form.hasError('passwordMismatch')) return 'Passwords must match.';
    if (key === 'dateOfBirth' && control.invalid) return 'Enter a valid date of birth that is today or earlier.';
    if (key === 'email' && control.invalid) return 'Enter a valid email address (up to 150 characters).';
    if (control.hasError('maxlength')) return 'This value is too long.';
    if (control.invalid) return key === 'fullName' ? 'Enter your full name.' : key === 'specialization' ? 'Enter your specialization.' : key === 'gender' ? 'Choose your gender.' : 'Enter a password.';
    return '';
  }

  protected async submit(): Promise<void> {
    if (this.busy() || this.success()) return;
    this.error.set('');
    this.serverFields.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.busy.set(true);
    const value = this.form.getRawValue();
    try {
      await this.api.registerDoctor({ fullName: value.fullName.trim(), phoneNumber: value.phoneNumber.trim() || null,
        gender: value.gender, dateOfBirth: value.dateOfBirth, email: value.email.trim().toLowerCase(), password: value.password,
        specialization: value.specialization.trim(), licenseNumber: value.licenseNumber.trim() || null });
      this.form.reset();
      this.success.set(true);
    } catch (failure: unknown) {
      if (failure instanceof HttpErrorResponse) {
        if (failure.status === 0) this.error.set('The registration service could not be reached. Check your connection and try again.');
        else if (failure.status === 401 || failure.status === 409) this.error.set('This email address could not be registered. It may already be in use. Try signing in or use another email address.');
        else if (failure.status === 400) {
          const details: unknown = failure.error;
          const fields: Partial<Record<FieldKey, string>> = {};
          if (details && typeof details === 'object' && 'errors' in details && details.errors && typeof details.errors === 'object') {
            for (const [serverKey, messages] of Object.entries(details.errors)) {
              const key = Object.keys(this.form.controls).find(name => name.toLowerCase() === serverKey.toLowerCase()) as FieldKey | undefined;
              if (key && Array.isArray(messages) && typeof messages[0] === 'string') fields[key] = messages[0];
            }
          }
          this.serverFields.set(fields);
          this.error.set('The server could not accept these details. Review the form and try again.');
        } else this.error.set('Account creation could not be confirmed. Please try again later or contact support.');
      } else if (failure instanceof TimeoutError) this.error.set('The request timed out. Account creation could not be confirmed. Try signing in before submitting again.');
      else this.error.set(failure instanceof Error ? failure.message : 'Account creation could not be confirmed. Please try again later.');
    } finally { this.busy.set(false); }
  }
}
