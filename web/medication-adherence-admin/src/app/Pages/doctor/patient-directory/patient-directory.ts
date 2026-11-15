import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../services';
import { MedMinderData } from '../../../services';
import { PatientApi } from '../../../services';
import { staffId } from '../../../services';
import { Icon } from '../../../components/icon/icon';
import { adherenceStatus, initials } from '../../../services';

@Component({
  selector: 'mm-patient-directory',
  standalone: true,
  imports: [RouterLink, Icon],
  templateUrl: './patient-directory.html',
  styleUrl: './patient-directory.css',
})
export class PatientDirectoryPage {

  private readonly auth = inject(AuthService);
  protected readonly live = this.auth.mode() === 'live';
  private readonly data = this.live ? null : inject(MedMinderData);
  private readonly api = inject(PatientApi);

  protected readonly roster = resource({
    params: () => {
      const session = this.auth.session();
      if (session?.mode === 'live' && session.role === 'doctor') {
        return session.id;
      }
      return undefined;
    },
    loader: ({ params }) => {
      return this.api.listByDoctor(staffId(params));
    },
  });

  protected readonly query = signal('');
  private readonly allStatuses = this.live ? 'All account statuses' : 'All adherence statuses';
  protected readonly filter = signal(this.allStatuses);

  protected readonly filters = this.live
    ? [this.allStatuses, 'Active', 'Inactive']
    : [this.allStatuses, 'Needs follow-up', 'Monitor', 'On track', 'No data'];

  protected readonly initials = initials;

  protected readonly rows = computed(() => {
    if (this.data) {
      const store = this.data;
      return store.patients().map(patient => {
        const rate = store.report(patient.id, 7).rate;
        return {
          patient,
          rate,
          status: adherenceStatus(rate),
        };
      });
    }

    const records = this.roster.hasValue() ? this.roster.value() : [];
    return (records ?? []).map(record => ({
      patient: {
        id: String(record.patientId),
        name: record.fullName,
        phone: record.phoneNumber ?? '',
        email: '',
      },
      rate: null,
      status: record.isActive
        ? { label: 'Active', tone: 'badge-green' }
        : { label: 'Inactive', tone: '' },
    }));
  });

  protected readonly results = computed(() => {
    const search = this.query().trim().toLowerCase();
    const currentFilter = this.filter();

    return this.rows().filter(row => {
      const matchesSearch =
        !search ||
        row.patient.name.toLowerCase().includes(search) ||
        row.patient.phone.includes(search) ||
        row.patient.id.toLowerCase().includes(search);

      const matchesStatus =
        currentFilter === this.allStatuses ||
        row.status.label === currentFilter;

      return matchesSearch && matchesStatus;
    });
  });

  protected resetFilters(): void {
    this.query.set('');
    this.filter.set(this.allStatuses);
  }
}
