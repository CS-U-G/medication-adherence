import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MedMinderData } from '../core/medminder-data.service';
import { PatientApi } from '../core/patient-api';
import { staffId } from '../core/staff-http';
import { Icon } from '../shared/icon';
import { adherenceStatus, initials } from './doctor-format';

@Component({
  selector: 'mm-patient-directory',
  imports: [RouterLink, Icon],
  templateUrl: './patient-directory.html',
})
export class PatientDirectoryPage {
  private readonly auth = inject(AuthService);
  protected readonly live = this.auth.mode() === 'live';
  private readonly data = this.live ? null : inject(MedMinderData);
  private readonly api = inject(PatientApi);
  protected readonly roster = resource({
    params: () => {
      const session = this.auth.session();
      return session?.mode === 'live' && session.role === 'doctor' ? session.id : undefined;
    },
    loader: ({ params }) => this.api.listByDoctor(staffId(params)),
  });
  protected readonly query = signal('');
  private readonly allStatuses = this.live ? 'All account statuses' : 'All adherence statuses';
  protected readonly filter = signal(this.allStatuses);
  protected readonly filters = this.live ? [this.allStatuses, 'Active', 'Inactive'] :
    [this.allStatuses, 'Needs follow-up', 'Monitor', 'On track', 'No data'];
  protected readonly initials = initials;

  protected readonly rows = computed(() => {
    if (this.data) {
      const data = this.data;
      return data.patients().map(patient => {
        const rate = data.report(patient.id, 7).rate;
        return { patient, rate, status: adherenceStatus(rate) };
      });
    }
    return (this.roster.hasValue() ? this.roster.value() : []).map(record => ({
      patient: { id: String(record.patientId), name: record.fullName, phone: record.phoneNumber ?? '', email: '' },
      rate: null,
      status: record.isActive ? { label: 'Active', tone: 'badge-green' } : { label: 'Inactive', tone: '' },
    }));
  });

  protected readonly results = computed(() => {
    const search = this.query().trim().toLowerCase();
    const filter = this.filter();
    return this.rows().filter(({ patient, status }) =>
      (filter === this.allStatuses || status.label === filter) &&
      [patient.name, patient.email, patient.id, patient.phone]
        .some(value => value.toLowerCase().includes(search)),
    );
  });

  protected resetFilters(): void {
    this.query.set('');
    this.filter.set(this.allStatuses);
  }
}
