import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeoutError } from 'rxjs';
import { MEDMINDER_CONFIG } from '../core/app-mode';
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
        <div><span class="metric-icon"><mm-icon name="activity"/></span><h2 id="connection-title">Live API connection</h2></div>
        <p role="status" aria-live="polite">{{message()}}</p>
        @if(checkedAt()){<small>Last checked {{checkedAt() | date:'medium'}}</small>}
        <button class="btn" type="button" [disabled]="busy()" (click)="check()">{{busy() ? 'Checking connection…' : 'Check connection'}} <mm-icon name="arrow"/></button>
        <p class="fine-print">This checks service reachability only. It does not establish a staff session or load patient information.</p>
      </section>
      <section class="capabilities" aria-labelledby="capabilities-title">
        <h2 id="capabilities-title">Staff service availability</h2>
        <article><span class="step-no"><mm-icon name="stethoscope"/></span><div><h3>Doctor account creation</h3>
          @if (live) {
            <p>Doctor registration sends your details to the live service. The connection check does not confirm account creation.</p><a class="text-link" routerLink="/register">Create doctor account <mm-icon name="arrow"/></a>
          } @else {
            <p>Live account creation is disabled in this demo.</p>
          }
        </div></article>
        <article><span class="step-no">01</span><div><h3>Staff sign in</h3><p>Workspace access needs a secure session from the server. That support is currently unavailable.</p></div><span class="badge badge-amber">Pending authorization</span></article>
        <article><span class="step-no">02</span><div><h3>Patient records, doctor accounts and medications</h3><p>Live access is unavailable until the server can verify staff roles and restrict patient records to the right doctors.</p></div><span class="badge badge-amber">Pending authorization</span></article>
        <article><span class="step-no">03</span><div><h3>Prescriptions and adherence</h3><p>Live prescription and dose reporting services are not available in this release.</p></div><span class="badge">Not available</span></article>
      </section>
      <div class="status-footer"><p>Your administrator can help with access and service availability.</p><a class="btn btn-outline" routerLink="/login">Staff sign in</a></div>
    </main>`,
  styleUrl: './service-status.scss',
})
export class ServiceStatus {
  private readonly api = inject(MedMinderApi);
  protected readonly live = inject(MEDMINDER_CONFIG).mode === 'live';
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
    } catch (failure: unknown) {
      if (failure instanceof TimeoutError) {
        this.message.set('The API did not respond in time. Wait a moment and check again.');
      } else if (failure instanceof HttpErrorResponse && failure.status !== 0) {
        this.message.set([502, 503, 504].includes(failure.status)
          ? `The API is temporarily unavailable (HTTP ${failure.status}). Wait a moment and check again.`
          : `The API could not be verified (HTTP ${failure.status}). Check again or contact your administrator.`);
      } else if (failure instanceof HttpErrorResponse) {
        this.message.set('The API could not be verified because the browser did not receive a response. Check your connection and try again.');
      } else {
        this.message.set('The API did not return a valid health response. Check again or contact your administrator.');
      }
    } finally {
      this.checkedAt.set(new Date());
      this.busy.set(false);
    }
  }
}
