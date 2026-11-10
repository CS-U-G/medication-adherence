import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MEDMINDER_CONFIG } from '../core/app-mode';
import { MedMinderData } from '../core/medminder-data.service';
import { UserApi } from '../core/user-api';
import { Icon } from '../shared/icon';
import { doctorAccount, doctorInitials, LiveDoctorAccount } from './admin-doctor';

@Component({
  selector: 'mm-doctor-accounts',
  imports: [RouterLink, Icon],
  templateUrl: './doctor-accounts.html',
  styleUrl: './management.scss',
})
export class DoctorAccountsPage {
  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly api = inject(UserApi);
  private readonly liveDoctors = signal<LiveDoctorAccount[]>([]);
  protected readonly doctors = computed(() => this.demo?.doctors() ?? this.liveDoctors());
  protected readonly loading = signal(!this.demo);
  protected readonly error = signal('');
  protected readonly query = signal('');
  protected readonly status = signal('all');

  protected readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    return this.doctors().filter(doctor => {
      const matchesStatus = status === 'all' || doctor.active === (status === 'active');
      return matchesStatus && [doctor.name, doctor.email, doctor.specialty, doctor.license]
        .some(value => value.toLowerCase().includes(query));
    });
  });

  protected readonly initials = doctorInitials;

  ngOnInit(): void {
    if (!this.demo) void this.loadDoctors();
  }

  protected async loadDoctors(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const doctors = await this.api.listDoctors();
      this.liveDoctors.set(doctors.map(doctorAccount));
    } catch {
      this.error.set('Doctor accounts could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }
}
