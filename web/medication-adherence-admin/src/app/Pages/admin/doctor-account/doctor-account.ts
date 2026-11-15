import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MEDMINDER_CONFIG, MedMinderData, staffId, UserApi, doctorAccount, LiveDoctorAccount } from '../../../services';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'mm-doctor-account',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './doctor-account.html',
  styleUrl: './doctor-account.css',
})
export class DoctorAccountPage implements OnInit {

  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly api = inject(UserApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private requestNumber = 0;
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly confirmation = viewChild.required<ElementRef<HTMLDialogElement>>('confirmation');
  protected readonly editor = viewChild.required<ElementRef<HTMLDialogElement>>('editor');

  private readonly liveAccount = signal<LiveDoctorAccount | null>(null);
  protected accountId = this.route.snapshot.paramMap.get('id');

  protected readonly account = computed(() => {
    if (this.demo) {
      return this.demo.doctors().find(doc => doc.id === this.accountId);
    }
    return this.liveAccount();
  });

  protected readonly editable = computed(() => {
    return this.liveAccount()?.doctorId != null;
  });

  protected readonly loading = signal(!this.demo);
  protected readonly loadError = signal('');
  protected readonly saving = signal(false);
  protected readonly feedback = signal('');
  protected readonly error = signal('');

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    specialty: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', Validators.maxLength(20)],
    license: ['', Validators.maxLength(50)],
  });

  ngOnInit(): void {
    if (!this.demo) {
      this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        this.accountId = params.get('id');
        void this.loadAccount();
      });
    }
  }

  protected async loadAccount(): Promise<void> {
    const requestNumber = ++this.requestNumber;
    const rawId = this.accountId;

    this.liveAccount.set(null);
    this.feedback.set('');
    this.loadError.set('');
    this.loading.set(true);

    let userId: number;
    try {
      userId = staffId(rawId);
    } catch {
      this.loadError.set('A valid doctor account ID is required.');
      this.loading.set(false);
      return;
    }

    try {
      const profile = await this.api.get(userId);
      if (requestNumber === this.requestNumber && profile.role === 'Doctor') {
        this.liveAccount.set(doctorAccount(profile));
      }
    } catch (err: unknown) {
      if (requestNumber === this.requestNumber && !(err instanceof HttpErrorResponse && err.status === 404)) {
        this.loadError.set('The doctor account could not be loaded.');
      }
    } finally {
      if (requestNumber === this.requestNumber) this.loading.set(false);
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
        if (this.accountId === String(doctor.id)) this.liveAccount.set({ ...doctor, active });
      } else {
        this.demo?.setDoctorActive(doctor.id, active);
      }
      this.feedback.set(active ? 'Doctor account activated.' : 'Doctor account deactivated.');
      this.confirmation().nativeElement.close();
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'The account status could not be changed.');
    } finally {
      this.saving.set(false);
    }
  }

  protected openEditor(): void {
    const doctor = this.liveAccount();
    if (!doctor || doctor.doctorId === null) return;

    this.form.reset({
      name: doctor.name,
      specialty: doctor.specialty,
      phone: doctor.phone,
      license: doctor.license,
    });
    this.error.set('');
    this.editor().nativeElement.showModal();
  }

  protected async saveProfile(): Promise<void> {
    const doctor = this.liveAccount();
    if (!doctor || doctor.doctorId === null || this.saving()) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const values = this.form.getRawValue();
    const name = values.name?.trim() ?? '';
    const specialty = values.specialty?.trim() ?? '';
    const phone = values.phone?.trim() ?? '';
    const license = values.license?.trim() ?? '';

    this.saving.set(true);
    this.error.set('');

    try {
      await this.api.updateDoctor(doctor.doctorId, {
        fullName: name,
        specialization: specialty,
        phoneNumber: phone || null,
        licenseNumber: license || null,
      });

      if (this.accountId === String(doctor.id)) this.liveAccount.set({ ...doctor, name, specialty, phone, license });      this.feedback.set('Doctor profile updated.');
      this.editor().nativeElement.close();
    } catch {
      this.error.set('The doctor profile could not be updated.');
    } finally {
      this.saving.set(false);
    }
  }
}
