import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MEDMINDER_CONFIG } from '../core/app-mode';
import { MedMinderData } from '../core/medminder-data.service';
import { staffId } from '../core/staff-http';
import { UserApi } from '../core/user-api';
import { Icon } from '../shared/icon';
import { doctorAccount, LiveDoctorAccount } from './admin-doctor';

@Component({
  selector: 'mm-doctor-account',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './doctor-account.html',
  styleUrl: './management.scss',
})
export class DoctorAccountPage {
  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly api = inject(UserApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly confirmation = viewChild.required<ElementRef<HTMLDialogElement>>('confirmation');
  private readonly editor = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  private readonly liveAccount = signal<LiveDoctorAccount | null>(null);
  private requestId = 0;

  protected readonly account = computed(() => this.demo
    ? this.demo.doctors().find(doctor => doctor.id === this.params().get('id'))
    : this.liveAccount());
  protected readonly editable = computed(() => this.liveAccount()?.doctorId != null);
  protected readonly loading = signal(!this.demo);
  protected readonly loadError = signal('');
  protected readonly saving = signal(false);
  protected readonly feedback = signal(this.router.currentNavigation()?.extras.state?.['doctorCreated'] ? 'Doctor account created.' : '');
  protected readonly error = signal('');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    specialty: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    phone: ['', Validators.maxLength(20)],
    license: ['', Validators.maxLength(50)],
  });

  constructor() {
    if (!this.demo) effect(() => { void this.loadAccount(); });
  }

  protected async loadAccount(): Promise<void> {
    const requestId = ++this.requestId;
    this.liveAccount.set(null);
    this.loadError.set('');
    this.loading.set(false);
    let userId: number;
    try {
      userId = staffId(this.params().get('id'));
    } catch {
      return;
    }

    this.loading.set(true);
    try {
      const profile = await this.api.get(userId);
      if (requestId === this.requestId && profile.role === 'Doctor') {
        this.liveAccount.set(doctorAccount(profile));
      }
    } catch (error) {
      if (requestId === this.requestId && !(error instanceof HttpErrorResponse && error.status === 404)) {
        this.loadError.set('The doctor account could not be loaded.');
      }
    } finally {
      if (requestId === this.requestId) this.loading.set(false);
    }
  }

  protected openConfirmation(): void {
    this.error.set('');
    this.confirmation().nativeElement.showModal();
  }

  protected async changeAccess(): Promise<void> {
    const doctor = this.account();
    if (!doctor || this.saving()) return;

    const active = !doctor.active;
    this.saving.set(true);
    this.error.set('');
    try {
      if ('doctorId' in doctor) {
        await this.api.setActive(doctor.id, active);
        if (this.liveAccount() !== doctor) return;
        this.liveAccount.set({ ...doctor, active });
      } else {
        this.demo?.setDoctorActive(doctor.id, active);
      }
      this.feedback.set(active ? 'Doctor account activated.' : 'Doctor account deactivated.');
      this.confirmation().nativeElement.close();
    } catch (error) {
      if (this.account() === doctor) {
        this.error.set(error instanceof Error ? error.message : 'The account status could not be changed.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  protected openEditor(): void {
    const doctor = this.liveAccount();
    if (!doctor || doctor.doctorId === null) return;
    const { name, specialty, phone, license } = doctor;
    this.form.reset({ name, specialty, phone, license });
    this.error.set('');
    this.editor().nativeElement.showModal();
  }

  protected async saveProfile(): Promise<void> {
    const doctor = this.liveAccount();
    if (!doctor || doctor.doctorId === null || this.saving()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const values = this.form.getRawValue();
    const name = values.name.trim();
    const specialty = values.specialty.trim();
    const phone = values.phone.trim();
    const license = values.license.trim();
    this.saving.set(true);
    this.error.set('');
    try {
      await this.api.updateDoctor(doctor.doctorId, {
        fullName: name, specialization: specialty, phoneNumber: phone || null, licenseNumber: license || null,
      });
      if (this.liveAccount() !== doctor) return;
      this.liveAccount.set({ ...doctor, name, specialty, phone, license });
      this.feedback.set('Doctor profile updated.');
      this.editor().nativeElement.close();
    } catch {
      if (this.liveAccount() === doctor) this.error.set('The doctor profile could not be updated.');
    } finally {
      this.saving.set(false);
    }
  }
}
