import { Component, input } from '@angular/core';

import { AdherenceReport } from '../../services';
import { Chart } from '../chart/chart';
import { Icon } from '../icon/icon';

export interface OverviewStat {
  icon: string;
  label: string;
  value: number | string;
  note: string;
  tone?: 'warn';
}

@Component({
  selector: 'mm-overview-panels',
  standalone: true,
  imports: [Chart, Icon],
  templateUrl: './overview-panels.html',
  styleUrl: './overview-panels.css',
})
export class OverviewPanels {
  readonly stats = input.required<readonly OverviewStat[]>();
  readonly report = input.required<AdherenceReport>();
}
