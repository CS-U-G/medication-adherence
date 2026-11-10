import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MEDMINDER_CONFIG } from '../core/app-mode';
import { MedicationApi } from '../core/medication-api';
import { MedMinderData } from '../core/medminder-data.service';
import { UserApi } from '../core/user-api';
import { Icon } from '../shared/icon';
import { OverviewPanels, OverviewStat } from '../shared/overview-panels';
import { doctorAccount, doctorInitials, LiveDoctorAccount } from './admin-doctor';

@Component({imports:[RouterLink,NgTemplateOutlet,OverviewPanels,Icon],template:`
<header class="page-heading">
  <div><div class="eyebrow">Administration workspace</div><h1>Platform overview</h1><p>Monitor staff access and manage the medication catalogue.</p></div>
  <a routerLink="/admin/doctors/new" class="btn"><mm-icon name="plus"/> Create doctor account</a>
</header>
@if (report(); as demoReport) {
  <mm-overview-panels [stats]="stats()" [report]="demoReport">
    <ng-container [ngTemplateOutlet]="doctorPanel"/>
  </mm-overview-panels>
} @else {
  <div class="metrics">
    @for (stat of stats(); track stat.label) {
      <article class="card metric">
        <span class="metric-icon"><mm-icon [name]="stat.icon"/></span>
        <div class="metric-label">{{stat.label}}</div><strong>{{stat.value}}</strong><small>{{stat.note}}</small>
      </article>
    }
  </div>
  <div class="overview-grid">
    <section class="card card-pad overview-chart">
      <div class="panel-heading"><h2>Weekly adherence</h2></div>
      <div class="empty-state"><h3>Adherence data unavailable</h3><p>The service does not provide platform-wide dose outcomes.</p></div>
    </section>
    <ng-container [ngTemplateOutlet]="doctorPanel"/>
  </div>
}
<ng-template #doctorPanel>
  <section class="card card-pad overview-side">
    <div class="panel-heading"><div><h2>Doctor accounts</h2><p>Staff access across the platform.</p></div><span class="metric-icon"><mm-icon name="shield"/></span></div>
    <div class="follow-list">
      @if (doctorsError()) {
        <div class="empty-state">
          <p role="alert">Doctor accounts could not be loaded.</p>
          <button class="btn btn-secondary" type="button" (click)="loadDoctors()">Try again</button>
        </div>
      } @else {
        @if (doctors(); as accounts) {
          @for (doctor of accounts.slice(0,4); track doctor.id) {
            <a [routerLink]="['/admin/doctors',doctor.id]" class="follow-row">
              <span class="avatar">{{initials(doctor.name)}}</span>
              <div><strong>{{doctor.name}}</strong><small>{{doctor.specialty}}</small></div>
              <span class="badge" [class.badge-green]="doctor.active">{{doctor.active ? 'Active' : 'Inactive'}}</span><mm-icon name="chevron"/>
            </a>
          } @empty {<div class="empty-state"><h3>No doctor accounts</h3><p>Create an account to give a doctor access.</p></div>}
        } @else {
          <div class="empty-state" role="status"><p>Loading doctor accounts…</p></div>
        }
      }
    </div>
    <a routerLink="/admin/doctors" class="text-link side-link">Manage doctor accounts <mm-icon name="arrow"/></a>
  </section>
</ng-template>
<section class="card card-pad overview-shortcuts">
  <div class="panel-heading"><div><h2>Manage the platform</h2><p>Keep staff access and the catalogue up to date.</p></div></div>
  <div class="shortcut-grid">
    <a routerLink="/admin/doctors"><span class="metric-icon"><mm-icon name="users"/></span><span><strong>Doctor accounts</strong><small>{{doctorCountLabel()}}</small></span><mm-icon name="chevron"/></a>
    <a routerLink="/admin/medications"><span class="metric-icon"><mm-icon name="pill"/></span><span><strong>Medication catalogue</strong><small>{{medicationCountLabel()}}</small></span><mm-icon name="chevron"/></a>
    <a routerLink="/admin/settings"><span class="metric-icon"><mm-icon name="settings"/></span><span><strong>Account settings</strong><small>Profile and session</small></span><mm-icon name="chevron"/></a>
  </div>
</section>`})
export class AdminOverview {
  private readonly demo = inject(MEDMINDER_CONFIG).mode === 'demo' ? inject(MedMinderData) : null;
  private readonly users = inject(UserApi);
  private readonly medications = inject(MedicationApi);
  private readonly liveDoctors = signal<LiveDoctorAccount[] | null>(null);
  private readonly liveMedicationCount = signal<number | null>(null);
  private readonly medicationError = signal(false);

  protected readonly doctorsError = signal(false);
  protected readonly doctors = computed(() => this.demo?.doctors() ?? this.liveDoctors());
  protected readonly report = computed(() => this.demo?.aggregate() ?? null);
  protected readonly initials = doctorInitials;
  protected readonly doctorCountLabel = computed(() => {
    const accounts = this.doctors();
    return accounts ? accounts.filter(doctor => doctor.active).length + ' active accounts'
      : this.doctorsError() ? 'Accounts unavailable' : 'Loading accounts…';
  });
  protected readonly medicationCountLabel = computed(() => {
    const count = this.demo
      ? this.demo.medications().filter(medication => !medication.archived).length
      : this.liveMedicationCount();
    return count !== null ? count + ' available medications'
      : this.medicationError() ? 'Catalogue unavailable' : 'Loading medications…';
  });
  protected readonly stats = computed<OverviewStat[]>(() => {
    const rate = this.report()?.rate;
    return [
      {icon:'users',label:'Doctor accounts',value:this.doctors()?.length ?? '—',note:this.doctorCountLabel()},
      {icon:'shield',label:'Registered patients',value:this.demo?.patients().length ?? '—',note:this.demo ? 'Across all doctor rosters' : 'Platform total unavailable'},
      {icon:'file',label:'Prescriptions issued',value:this.demo?.prescriptions().length ?? '—',note:this.demo ? 'Across all patients' : 'Platform total unavailable'},
      {icon:'activity',label:'Weekly adherence',value:rate == null ? '—' : rate+'%',note:this.demo ? 'Taken out of all due doses' : 'Dose outcomes unavailable'},
    ];
  });

  ngOnInit(): void {
    if (this.demo) return;
    void this.loadDoctors();
    void this.loadMedicationCount();
  }

  protected async loadDoctors(): Promise<void> {
    this.doctorsError.set(false);
    try {
      this.liveDoctors.set((await this.users.listDoctors()).map(doctorAccount));
    } catch {
      this.doctorsError.set(true);
    }
  }

  private async loadMedicationCount(): Promise<void> {
    try {
      this.liveMedicationCount.set((await this.medications.active()).length);
    } catch {
      this.medicationError.set(true);
    }
  }
}
