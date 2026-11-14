import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../services';
import { MedMinderData } from '../../../services';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DatePipe, Icon],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {

  protected readonly auth = inject(AuthService);
  private readonly data = inject(MedMinderData);
  private readonly router = inject(Router);

  protected readonly error = signal('');

  protected signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/']);
  }

  protected reset(dialog: HTMLDialogElement): void {
    try {
      this.data.resetDemo();
      dialog.close();
      this.signOut();
    } catch (error) {
      dialog.close();
      if (error instanceof Error) {
        this.error.set(error.message);
      } else {
        this.error.set('Demo data could not be reset.');
      }
    }
  }
}
