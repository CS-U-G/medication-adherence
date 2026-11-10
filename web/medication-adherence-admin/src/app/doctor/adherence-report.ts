import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MedMinderData } from '../core/medminder-data.service';
import { ReportPeriod } from '../core/models';
import { Chart } from '../shared/chart';
import { Icon } from '../shared/icon';

@Component({
  selector: 'mm-adherence-report',
  imports: [Chart, Icon, RouterLink],
  templateUrl: './adherence-report.html',
})
export class AdherenceReportPage {
  protected readonly data = inject(MedMinderData);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly query = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly periods: ReportPeriod[] = [7, 14, 30, 90];
  protected readonly period = signal<ReportPeriod>(7);
  protected readonly patient = computed(() => {
    const patients = this.data.patients();
    return patients.find(patient => patient.id === this.query().get('patient')) ?? patients[0];
  });
  protected readonly report = computed(() => this.data.report(this.patient()?.id ?? '', this.period()));

  protected changePatient(id: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { patient: id },
      replaceUrl: true,
    });
  }

  protected changePeriod(value: string): void {
    const period = this.periods.find(period => period === Number(value));
    if (period) this.period.set(period);
  }
}
