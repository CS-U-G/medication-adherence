import { Component, input } from '@angular/core';
export interface ChartDay { label: string; rate: number | null; date?: string; }
@Component({
 selector:'mm-chart',
 template:`
 <div class="chart" role="img" [attr.aria-label]="description()">
   <div class="chart-y" aria-hidden="true"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
   <div class="chart-plot" aria-hidden="true">
     <div class="chart-grid"><i></i><i></i><i></i><i></i><i></i></div>
     <div class="chart-bars">
      @for(day of days(); track $index; let last = $last) {
        <div class="chart-col" [title]="day.label + ': ' + (day.rate === null ? 'no doses due' : day.rate + '% taken')"><span class="chart-bar" [class.chart-bar-last]="last" [style.height.%]="day.rate ?? 0"></span><span class="chart-label">{{ short(day.label, $index) }}</span></div>
      }
     </div>
   </div>
 </div>`
})
export class Chart {
  readonly days = input.required<readonly ChartDay[]>();
  protected description() { return 'Adherence by day. ' + this.days().map(day => day.label + ': ' + (day.rate === null ? 'no doses due' : day.rate + '% taken')).join('; '); }
  protected short(label: string, index: number) { const count = this.days().length; return count <= 10 || index === 0 || index === count - 1 || index % Math.ceil(count / 6) === 0 ? label : ''; }
}
