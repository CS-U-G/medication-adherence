import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { Icon } from '../shared/icon';
import { initials } from './doctor-format';

@Component({
  selector: 'mm-prescriptions',
  imports: [DatePipe, RouterLink, Icon],
  templateUrl: './prescriptions.html',
})
export class PrescriptionsPage {
  protected readonly data = inject(MedMinderData);
  protected readonly query = signal('');
  protected readonly initials = initials;
  protected readonly results = computed(() => {
    const search = this.query().trim().toLowerCase();
    const patients = new Map(this.data.patients().map(patient => [patient.id, patient.name]));
    return this.data.prescriptions().map(prescription => ({
      prescription,
      name: patients.get(prescription.patientId) ?? 'Patient',
    })).filter(({ prescription, name }) =>
      [name, prescription.id, ...prescription.items.map(item => item.medicationName)]
        .some(value => value.toLowerCase().includes(search)),
    );
  });
}
