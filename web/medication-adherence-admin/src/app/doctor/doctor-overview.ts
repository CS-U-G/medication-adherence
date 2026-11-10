import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { MedMinderData } from '../core/medminder-data.service';
import { PatientApi } from '../core/patient-api';
import { PrescriptionApi } from '../core/prescription-api';
import { staffId } from '../core/staff-http';
import { OverviewPanels, OverviewStat } from '../shared/overview-panels';
import { Icon } from '../shared/icon';

@Component({imports:[RouterLink,OverviewPanels,Icon],template:`
<header class="page-heading">
  <div><div class="eyebrow">Clinical workspace</div><h1>Doctor overview</h1><p>Welcome, {{ auth.session()?.name }}. Review your patients and prescriptions.</p></div>
  <a routerLink="/doctor/patients/register" class="btn"><mm-icon name="plus"/> Register patient</a>
</header>
@if (live) {
  @if (summary.isLoading()) {
    <p class="notice" role="status">Loading patients and prescriptions…</p>
  } @else if (summary.error()) {
    <div class="notice error" role="alert">Could not load your overview.
      <button class="btn btn-outline" type="button" (click)="summary.reload()">Retry</button>
    </div>
  } @else if (summary.value(); as totals) {
    <div class="metrics">
      <article class="card metric"><span class="metric-icon"><mm-icon name="users"/></span><div class="metric-label">My patients</div><strong>{{totals.patients}}</strong><small>Registered in your roster</small></article>
      <article class="card metric"><span class="metric-icon"><mm-icon name="file"/></span><div class="metric-label">Active prescriptions</div><strong>{{totals.activePrescriptions}}</strong><small>Across your patient roster</small></article>
    </div>
  }
  <section class="card card-pad"><h2>Adherence reports</h2><p>Live dose outcomes are unavailable.</p></section>
} @else {
<mm-overview-panels [stats]="stats()" [report]="report()">
  <section class="card card-pad overview-side">
    <div class="panel-heading"><div><h2>Needs follow-up</h2><p>Below 70% adherence over the last 7 days.</p></div><span class="metric-icon warn"><mm-icon name="alert"/></span></div>
    <div class="follow-list">
    @for(row of followUps(); track row.patient.id) {
      <a [routerLink]="['/doctor/patients',row.patient.id]" class="follow-row">
        <span class="avatar alt">{{ initials(row.patient.name) }}</span>
        <div><strong>{{row.patient.name}}</strong><small>{{row.report.missed}} missed · {{row.report.due}} due</small></div>
        <span class="badge badge-amber">{{row.report.rate}}%</span><mm-icon name="chevron"/>
      </a>
    } @empty {
      <div class="empty-state"><h3>No patients flagged</h3><p>Patients below 70% will appear here once doses are recorded.</p></div>
    }
    </div>
    <a routerLink="/doctor/patients" class="text-link side-link">View patient directory <mm-icon name="arrow"/></a>
  </section>
</mm-overview-panels>
}
<section class="card card-pad overview-shortcuts">
  <div class="panel-heading"><div><h2>Patient care</h2><p>Open the tools you use most often.</p></div></div>
  <div class="shortcut-grid">
    <a routerLink="/doctor/patients"><span class="metric-icon"><mm-icon name="users"/></span><span><strong>Patient directory</strong><small>Find a patient record</small></span><mm-icon name="chevron"/></a>
    <a routerLink="/doctor/prescriptions/new"><span class="metric-icon"><mm-icon name="file"/></span><span><strong>Issue prescription</strong><small>Set dose, frequency, and duration</small></span><mm-icon name="chevron"/></a>
    <a routerLink="/doctor/reports"><span class="metric-icon"><mm-icon name="chart"/></span><span><strong>Adherence reports</strong><small>Review dose outcomes by patient</small></span><mm-icon name="chevron"/></a>
  </div>
</section>`})
export class DoctorOverview {
  protected readonly auth = inject(AuthService);
  private readonly data = inject(MedMinderData);
  private readonly patients = inject(PatientApi);
  private readonly prescriptions = inject(PrescriptionApi);
  protected readonly live = this.auth.mode() === 'live';
  protected readonly summary = resource({
    params: () => {
      const session = this.auth.session();
      return this.live && session?.mode === 'live' && session.role === 'doctor' ? session.id : undefined;
    },
    loader: async ({ params }) => {
      const doctorId = staffId(params);
      const [patients, prescriptions] = await Promise.all([
        this.patients.listByDoctor(doctorId),
        this.prescriptions.listByDoctor(doctorId),
      ]);
      return { patients: patients.length, activePrescriptions: prescriptions.filter(item => item.status === 'Active').length };
    },
  });
  protected readonly report = computed(() => this.data.aggregate());
  protected readonly followUps = computed(() => this.data.patients().map(patient => ({patient,report:this.data.report(patient.id)}))
    .filter(row => row.report.rate !== null && row.report.rate < 70).sort((a,b)=>(a.report.rate ?? 0)-(b.report.rate ?? 0)));
  protected readonly stats = computed<OverviewStat[]>(() => [
    {icon:'users', label:'My patients', value:this.data.patients().length, note:'Registered in your roster'},
    {icon:'activity', label:'Weekly adherence', value:this.report().rate === null ? '—' : this.report().rate + '%', note:'Taken out of all due doses'},
    {icon:'file', label:'Active prescriptions', value:this.data.prescriptions().filter(rx=>rx.status==='Active').length, note:'Across your patient roster'},
    {icon:'alert', label:'Needs follow-up', value:this.followUps().length, note:'Below 70% adherence', tone:'warn'}
  ]);
  protected initials(name: string) { return name.split(/\s+/).slice(0,2).map(x=>x[0]).join(''); }
}
