import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { Icon } from '../shared/icon';
import { adherenceStatus, initials, medicationSourceTone } from './doctor-format';

@Component({
  selector: 'mm-patient-detail',
  imports: [DatePipe, RouterLink, Icon],
  templateUrl: './patient-detail.html',
})
export class PatientDetailPage {
  private readonly data = inject(MedMinderData);
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });

  protected readonly initials = initials;
  protected readonly medicationSourceTone = medicationSourceTone;
  protected readonly patient = computed(() => this.data.patients().find(patient => patient.id === this.params().get('id')));
  protected readonly prescriptions = computed(() => this.data.prescriptions()
    .filter(prescription => prescription.patientId === this.patient()?.id));
  protected readonly issued = computed(() => this.prescriptions().some(prescription => prescription.id === this.query().get('issued')));
  protected readonly rate = computed(() => this.data.report(this.patient()?.id ?? '').rate);
  protected readonly status = computed(() => adherenceStatus(this.rate()));
}
