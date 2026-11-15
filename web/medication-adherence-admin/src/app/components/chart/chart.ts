import { Component, input } from '@angular/core';

export interface ChartDay {
  label: string;
  rate: number | null;
  date?: string;
}

@Component({
  selector: 'mm-chart',
  standalone: true,
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class Chart {

  readonly days = input.required<readonly ChartDay[]>();

  protected description(): string {
    const daySummaries = this.days().map(day => {
      const outcome = day.rate === null ? 'no doses due' : `${day.rate}% taken`;
      return `${day.label}: ${outcome}`;
    });
    return 'Adherence by day. ' + daySummaries.join('; ');
  }

  protected short(label: string, index: number): string {
    const totalCount = this.days().length;
    if (totalCount <= 10) {
      return label;
    }
    if (index === 0 || index === totalCount - 1) {
      return label;
    }
    const step = Math.ceil(totalCount / 6);
    if (index % step === 0) {
      return label;
    }
    return '';
  }
}
