import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MedMinderApi } from '../core/api.service';
import { Brand } from '../shared/brand';
import { Icon } from '../shared/icon';

@Component({
  imports: [Brand, Icon, RouterLink, DatePipe],
  template: `
    <header class="status-header"><mm-brand/><a class="text-link" routerLink="/">Back to homepage</a></header>
    <main id="main" class="status-main">
      <div class="eyebrow">Platform availability</div>
      <h1>A clear view of what’s ready.</h1>
      <p class="intro">Check the connection and review the availability of staff services before signing in.</p>
      <section class="card card-pad connection" aria-labelledby="connection-title" [attr.aria-busy]="busy()">
        <div><span class="metric-icon"><mm-icon name="activity"/></span><h2 id="connection-title">API connection</h2></div>
        <p role="status" aria-live="polite">{{message()}}</p>
        @if(checkedAt()){<small>Last checked {{checkedAt() | date:'medium'}}</small>}
        <button class="btn" type="button" [disabled]="busy()" (click)="check()">{{busy() ? 'Checking connection…' : 'Check connection'}} <mm-icon name="arrow"/></button>
        <p class="fine-print">This checks service reachability only. It does not establish a staff session or load patient information.</p>
      </section>
      <section class="capabilities" aria-labelledby="capabilities-title">
        <h2 id="capabilities-title">Staff service availability</h2>
        <article><span class="step-no"><mm-icon name="stethoscope"/></span><div><h3>Doctor account creation</h3><p>Doctors can register with their personal and professional details. Administrator accounts are provisioned in the database.</p><a class="text-link" routerLink="/register">Create doctor account <mm-icon name="arrow"/></a></div><span class="badge badge-green">Connected</span></article>
        <article><span class="step-no">01</span><div><h3>Staff sign in</h3><p>Credential verification is connected. Workspace access is waiting for server-issued sessions and role authorization.</p></div><span class="badge badge-amber">Pending authorization</span></article>
        <article><span class="step-no">02</span><div><h3>Patient and doctor records</h3><p>Record endpoints exist. Access is unavailable until the server can verify staff roles and patient ownership.</p></div><span class="badge badge-amber">Pending authorization</span></article>
        <article><span class="step-no">03</span><div><h3>Prescriptions and adherence</h3><p>Live medication, prescription and dose reporting services are not available in this release.</p></div><span class="badge">Not available</span></article>
      </section>
      <div class="status-footer"><p>Your administrator can help with access and service availability.</p><a class="btn btn-outline" routerLink="/login">Staff sign in</a></div>
    </main>`,
  styleUrl: './service-status.scss',
})
export class ServiceStatus {
  private readonly api = inject(MedMinderApi);
  protected readonly busy = signal(false);
  protected readonly message = signal('Connection has not been checked.');
  protected readonly checkedAt = signal<Date | null>(null);

  protected async check(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.message.set('Contacting the API…');
    try {
      await this.api.health();
      this.message.set('The API is reachable and reports healthy. Staff authorization is still pending.');
    } catch {
      this.message.set('The API could not be verified. Try again, or ask your administrator to check the API address and connection permissions.');
    } finally {
      this.checkedAt.set(new Date());
      this.busy.set(false);
    }
  }
}
