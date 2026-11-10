import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  private readonly data = inject(MedMinderData);
  private readonly router = inject(Router);

  protected readonly today = localDateKey(new Date());
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly passwordVisible = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    specialty: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    phone: ['', [Validators.pattern(/^\+?[\d ().-]{7,25}$/)]],
    license: ['', [Validators.maxLength(50)]],
    dob: ['', [Validators.required, control => control.value > this.today ? { futureDate: true } : null]],
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
      const account = await this.data.createDoctor(this.form.getRawValue());
      await this.router.navigate(['/admin/doctors', account.id], { state: { doctorCreated: true } });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The doctor account could not be created.');
    } finally {
      this.saving.set(false);
    }
  }
}
