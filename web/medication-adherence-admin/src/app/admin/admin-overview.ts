import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MedMinderData } from '../core/medminder-data.service';
import { OverviewPanels, OverviewStat } from '../shared/overview-panels';
import { Icon } from '../shared/icon';

@Component({imports:[RouterLink,OverviewPanels,Icon],template:`
<header class="page-heading">
  <div><div class="eyebrow">Administration workspace</div><h1>Platform overview</h1><p>Monitor staff access, prescriptions, and adherence across MedMinder.</p></div>
  <a routerLink="/admin/doctors/new" class="btn"><mm-icon name="plus"/> Create doctor account</a>
</header>
<mm-overview-panels [stats]="stats()" [report]="report()">
  <section class="card card-pad overview-side">
    <div class="panel-heading"><div><h2>Doctor accounts</h2><p>Staff access across the platform.</p></div><span class="metric-icon"><mm-icon name="shield"/></span></div>
    <div class="follow-list">
    @for (doctor of data.doctors().slice(0,4); track doctor.id) {
      <a [routerLink]="['/admin/doctors',doctor.id]" class="follow-row">
        <span class="avatar">{{initials(doctor.name)}}</span>
        <div><strong>{{doctor.name}}</strong><small>{{doctor.specialty}}</small></div>
        <span class="badge" [class.badge-green]="doctor.active">{{doctor.active ? 'Active' : 'Inactive'}}</span><mm-icon name="chevron"/>
      </a>
    } @empty {<div class="empty-state"><h3>No doctor accounts</h3><p>Create an account to give a doctor access.</p></div>}
    </div>
    <a routerLink="/admin/doctors" class="text-link side-link">Manage doctor accounts <mm-icon name="arrow"/></a>
  </section>
</mm-overview-panels>
<section class="card card-pad overview-shortcuts">
  <div class="panel-heading"><div><h2>Manage the platform</h2><p>Keep staff access and the catalogue up to date.</p></div></div>
  <div class="shortcut-grid">
    <a routerLink="/admin/doctors"><span class="metric-icon"><mm-icon name="users"/></span><span><strong>Doctor accounts</strong><small>{{active()}} active accounts</small></span><mm-icon name="chevron"/></a>
    <a routerLink="/admin/medications"><span class="metric-icon"><mm-icon name="pill"/></span><span><strong>Medication catalogue</strong><small>{{medications()}} available medications</small></span><mm-icon name="chevron"/></a>
    <a routerLink="/admin/settings"><span class="metric-icon"><mm-icon name="settings"/></span><span><strong>Account settings</strong><small>Profile and session</small></span><mm-icon name="chevron"/></a>
  </div>
</section>`})
export class AdminOverview {
  protected readonly data = inject(MedMinderData);
  protected readonly report = computed(() => this.data.aggregate());
  protected readonly active = computed(() => this.data.doctors().filter(doctor => doctor.active).length);
  protected readonly medications = computed(() => this.data.medications().filter(med => !med.archived).length);
  protected readonly stats = computed<OverviewStat[]>(() => [
    {icon:'users',label:'Doctor accounts',value:this.data.doctors().length,note:this.active()+' active accounts'},
    {icon:'shield',label:'Registered patients',value:this.data.patients().length,note:'Across all doctor rosters'},
    {icon:'file',label:'Prescriptions issued',value:this.data.prescriptions().length,note:'Across all patients'},
    {icon:'activity',label:'Weekly adherence',value:this.report().rate === null ? '—' : this.report().rate+'%',note:'Taken out of all due doses'}
  ]);
  protected initials(name: string) { return name.replace(/^Dr\.\s*/i,'').split(/\s+/).slice(0,2).map(x=>x[0]).join(''); }
}
