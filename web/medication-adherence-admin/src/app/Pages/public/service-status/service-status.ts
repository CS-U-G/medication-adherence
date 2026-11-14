import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TimeoutError } from 'rxjs';

import { MEDMINDER_CONFIG } from '../../../services';
import { MedMinderApi } from '../../../services';
import { Brand } from '../../../components/brand/brand';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-service-status',
  standalone: true,
  imports: [Brand, Icon, RouterLink, DatePipe],
  templateUrl: './service-status.html',
  styleUrl: './service-status.css',
})
export class ServiceStatus {

  private readonly api = inject(MedMinderApi);
  private readonly config = inject(MEDMINDER_CONFIG);

  protected readonly live = this.config.mode === 'live';
  protected readonly busy = signal(false);
  protected readonly message = signal('Connection has not been checked.');
  protected readonly checkedAt = signal<Date | null>(null);

  protected async check(): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.busy.set(true);
    this.message.set('Contacting the API…');

    try {
      await this.api.health();
      this.message.set('The API is reachable and reports healthy. Authorized staff can sign in to their workspace.');
    } catch (failure: unknown) {
      if (failure instanceof TimeoutError) {
        this.message.set('The API did not respond in time. Wait a moment and check again.');
      } else if (failure instanceof HttpErrorResponse && failure.status !== 0) {
        if ([502, 503, 504].includes(failure.status)) {
          this.message.set(`The API is temporarily unavailable (HTTP ${failure.status}). Wait a moment and check again.`);
        } else {
          this.message.set(`The API could not be verified (HTTP ${failure.status}). Check again or contact your administrator.`);
        }
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
