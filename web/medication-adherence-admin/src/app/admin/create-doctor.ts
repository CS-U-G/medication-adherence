import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MEDMINDER_CONFIG } from '../core/app-mode';
import { MedMinderApi } from '../core/api.service';
import { MedMinderData } from '../core/medminder-data.service';
import { localDateKey } from '../core/report';
import { Icon } from '../shared/icon';

@Component({
  selector: 'mm-create-doctor',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './create-doctor.html',
  styleUrl: './management.scss',
})
export class CreateDoctorPage {
  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly api = inject(MedMinderApi);
  private readonly router = inject(Router);

  protected readonly today = localDateKey(new Date());
  protected readonly emailLimit = this.demo ? 254 : 150;
  protected readonly phoneLimit = this.demo ? 25 : 20;
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly passwordVisible = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(this.emailLimit)]],
    specialty: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    phone: ['', [Validators.pattern(/^\+?[\d ().-]{7,25}$/), Validators.maxLength(this.phoneLimit)]],
    license: ['', [Validators.maxLength(50)]],
    dob: ['', [Validators.required, control => {
      const value = control.value;
      const parsed = new Date(`${value}T12:00:00`);
      return /^\d{4}-\d{2}-\d{2}$/.test(value) && localDateKey(parsed) === value && value <= this.today
        ? null : { invalidDate: true };
    }]],
    gender: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }

  protected async save(): Promise<void> {
    this.error.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      const userId = this.demo ? (await this.demo.createDoctor(value)).id : (await this.api.registerDoctor({
        fullName: value.name.trim(),
        email: value.email.trim(),
        specialization: value.specialty.trim(),
        phoneNumber: value.phone.trim() || null,
        licenseNumber: value.license.trim() || null,
        dateOfBirth: value.dob,
        gender: value.gender === 'Female' ? 'F' : 'M',
        password: value.password,
      })).userId;
      this.form.reset();
      await this.router.navigate(['/admin/doctors', userId], { state: { doctorCreated: true } });
    } catch (error) {
      if (this.demo) {
        this.error.set(error instanceof Error ? error.message : 'The doctor account could not be created.');
      } else if (error instanceof HttpErrorResponse && [401, 409].includes(error.status)) {
        this.error.set('This email address could not be registered. Check whether a doctor account already exists.');
      } else if (error instanceof HttpErrorResponse && error.status === 400) {
        this.error.set('The server could not accept these details. Review the form and try again.');
      } else {
        this.error.set('Account creation could not be confirmed. Check the doctor directory before submitting again.');
      }
    } finally {
      this.saving.set(false);
    }
  }
}
