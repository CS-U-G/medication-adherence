import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'mm-doctor-accounts',
  imports: [RouterLink, Icon],
  templateUrl: './doctor-accounts.html',
  styleUrl: './management.scss',
})
export class DoctorAccountsPage {
  protected readonly data = inject(MedMinderData);
  protected readonly query = signal('');
  protected readonly status = signal('all');

  protected readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    return this.data.doctors().filter(doctor => {
      const matchesStatus = status === 'all' || doctor.active === (status === 'active');
      return matchesStatus && [doctor.name, doctor.email, doctor.specialty, doctor.license]
        .some(value => value.toLowerCase().includes(query));
    });
  });

  protected initials(name: string): string {
    return name.replace(/^Dr\.?\s+/i, '').split(/\s+/).slice(0, 2).map(part => part[0]).join('');
  }
}
