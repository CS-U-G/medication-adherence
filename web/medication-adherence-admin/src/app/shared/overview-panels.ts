import { Component, input } from '@angular/core';
import { AdherenceReport } from '../core/models';
import { Chart } from './chart';
import { Icon } from './icon';

export interface OverviewStat { icon:string; label:string; value:number|string; note:string; tone?:'warn'; }

@Component({selector:'mm-overview-panels',imports:[Chart,Icon],template:`
 <div class="metrics">
 @for (stat of stats(); track stat.label) {
   <article class="card metric">
     <span class="metric-icon" [class.warn]="stat.tone==='warn'"><mm-icon [name]="stat.icon"/></span>
     <div class="metric-label">{{stat.label}}</div><strong>{{stat.value}}</strong><small>{{stat.note}}</small>
   </article>
 }
 </div>
 <div class="overview-grid">
   <section class="card card-pad overview-chart">
     <div class="panel-heading"><div><h2>Weekly adherence</h2><p>Share of due doses taken each day.</p></div><span class="period"><mm-icon name="calendar"/> Last 7 days</span></div>
     @if(report().due) {<mm-chart [days]="report().days"/>}
     @else {<div class="empty-state"><h3>No doses due</h3><p>Outcomes will appear here as dose schedules begin.</p></div>}
     <div class="dose-legend">
       <div><span><i></i>Taken</span><strong>{{report().taken}}</strong></div>
       <div><span><i></i>Skipped</span><strong>{{report().skipped}}</strong></div>
       <div><span><i></i>Missed</span><strong>{{report().missed}}</strong></div>
     </div>
   </section>
   <ng-content/>
 </div>`})
export class OverviewPanels { readonly stats = input.required<readonly OverviewStat[]>(); readonly report = input.required<AdherenceReport>(); }
