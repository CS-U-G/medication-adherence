import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MEDMINDER_CONFIG, MedMinderApi, MedMinderData, localDateKey } from '../../../services';
import { Icon } from '../../../components/icon/icon';

function validBirthDate(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }
  const today = new Date().toISOString().split('T')[0];
  if (value > today) {
    return { invalidDate: true };
  }
  return null;
}

@Component({
  selector: 'mm-create-doctor',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './create-doctor.html',
  styleUrl: './create-doctor.css',
})
export class CreateDoctorPage {

  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly api = inject(MedMinderApi);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly today = localDateKey(new Date());
  protected readonly emailLimit = 150;
  protected readonly phoneLimit = 20;
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly passwordVisible = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    specialty: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.maxLength(20)]],
    license: ['', [Validators.maxLength(50)]],
    dob: ['', [Validators.required, validBirthDate]],
    gender: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected invalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }

  protected async save(): Promise<void> {
    this.error.set('');
    this.form.markAllAsTouched();

    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);

    try {
      const data = this.form.getRawValue();

      if (this.demo) {

        const newDoc = await this.demo.createDoctor(data as any);
        await this.router.navigate(['/admin/doctors', newDoc.id]);
      } else {
        const genderChar = (data.gender === 'Female' || data.gender === 'F') ? 'F' : 'M';
        await this.api.registerDoctor({
          fullName: data.name ? data.name.trim() : '',
          email: data.email ? data.email.trim() : '',
          specialization: data.specialty ? data.specialty.trim() : '',
          phoneNumber: data.phone ? data.phone.trim() : null,
          licenseNumber: data.license ? data.license.trim() : null,
          dateOfBirth: data.dob ?? '',
          gender: genderChar,
          password: data.password ?? '',
        });

        await this.router.navigate(['/admin/doctors'], {
          state: { doctorCreated: true },
        });
      }
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        if (err.error?.message) {
          this.error.set(err.error.message);
        } else if (err.status === 400) {
          this.error.set('Please check the details. Password must be at least 8 characters with letters, numbers, and special characters (e.g. @#$%).');
        } else if (err.status === 401 || err.status === 409) {
          this.error.set('This email address is already registered. Please use another email.');
        } else {
          this.error.set('Account creation could not be confirmed. Check the doctor directory before submitting again.');
        }
      } else if (err instanceof Error) {
        this.error.set(err.message);
      } else {
        this.error.set('Account creation could not be confirmed. Check the doctor directory before submitting again.');
      }
    } finally {
      this.saving.set(false);
    }
  }
}
