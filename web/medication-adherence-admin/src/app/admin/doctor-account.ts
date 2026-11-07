import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'mm-doctor-account',
  imports: [DatePipe, RouterLink, Icon],
  templateUrl: './doctor-account.html',
  styleUrl: './management.scss',
})
export class DoctorAccountPage {
  private readonly data = inject(MedMinderData);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly confirmation = viewChild.required<ElementRef<HTMLDialogElement>>('confirmation');

  protected readonly account = computed(() => this.data.doctors().find(doctor => doctor.id === this.params().get('id')));
  protected readonly feedback = signal(this.router.currentNavigation()?.extras.state?.['doctorCreated'] ? 'Doctor account created.' : '');
  protected readonly error = signal('');

  protected openConfirmation(): void {
    this.error.set('');
    this.confirmation().nativeElement.showModal();
  }

  protected changeAccess(): void {
    const doctor = this.account();
    if (!doctor) return;

    try {
      const updated = this.data.setDoctorActive(doctor.id, !doctor.active);
      this.feedback.set(updated.active ? 'Doctor account activated.' : 'Doctor account deactivated.');
      this.confirmation().nativeElement.close();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The account status could not be changed.');
    }
  }
}
