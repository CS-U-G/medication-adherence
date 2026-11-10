import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { Icon } from '../shared/icon';
import { adherenceStatus, initials } from './doctor-format';

@Component({
  selector: 'mm-patient-directory',
  imports: [RouterLink, Icon],
  templateUrl: './patient-directory.html',
})
export class PatientDirectoryPage {
  protected readonly data = inject(MedMinderData);
  protected readonly query = signal('');
  protected readonly filter = signal('All adherence statuses');
  protected readonly filters = [
    'All adherence statuses', 'Needs follow-up', 'Monitor', 'On track', 'No data',
  ];
  protected readonly initials = initials;

  protected readonly results = computed(() => {
    const search = this.query().trim().toLowerCase();
    const filter = this.filter();
    return this.data.patients().filter(patient =>
      [patient.name, patient.email, patient.id, patient.phone]
        .some(value => value.toLowerCase().includes(search)),
    ).map(patient => {
      const rate = this.data.report(patient.id, 7).rate;
      return { patient, rate, status: adherenceStatus(rate) };
    }).filter(row => filter === 'All adherence statuses' || row.status.label === filter);
  });

  protected resetFilters(): void {
    this.query.set('');
    this.filter.set('All adherence statuses');
  }
}
