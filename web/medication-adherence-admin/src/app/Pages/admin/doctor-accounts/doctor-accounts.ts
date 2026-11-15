import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MEDMINDER_CONFIG, MedMinderData, UserApi, doctorAccount, doctorInitials, LiveDoctorAccount } from '../../../services';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'mm-doctor-accounts',
  standalone: true,
  imports: [RouterLink, Icon],
  templateUrl: './doctor-accounts.html',
  styleUrl: './doctor-accounts.css',
})
export class DoctorAccountsPage implements OnInit {

  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly api = inject(UserApi);

  private readonly liveDoctors = signal<LiveDoctorAccount[]>([]);
  protected readonly doctors = computed(() => this.demo?.doctors() ?? this.liveDoctors());
  protected readonly loading = signal(!this.demo);
  protected readonly error = signal('');
  protected readonly query = signal('');
  protected readonly status = signal('all');

  protected readonly results = computed(() => {
    const searchText = this.query().trim().toLowerCase();
    const currentStatus = this.status();

    return this.doctors().filter(doctor => {

      const matchesStatus = currentStatus === 'all' || doctor.active === (currentStatus === 'active');
      if (!matchesStatus) {
        return false;
      }

      if (!searchText) {
        return true;
      }
      const matchName = doctor.name.toLowerCase().includes(searchText);
      const matchEmail = doctor.email.toLowerCase().includes(searchText);
      const matchSpecialty = doctor.specialty.toLowerCase().includes(searchText);

      return matchName || matchEmail || matchSpecialty;
    });
  });

  protected readonly initials = doctorInitials;

  ngOnInit(): void {
    if (!this.demo) {
      void this.loadDoctors();
    }
  }

  protected async loadDoctors(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    try {
      const list = await this.api.listDoctors();
      this.liveDoctors.set(list.map(doctorAccount));
    } catch {
      this.error.set('Doctor accounts could not be loaded.');
    } finally {
      this.loading.set(false);
    }
  }
}
