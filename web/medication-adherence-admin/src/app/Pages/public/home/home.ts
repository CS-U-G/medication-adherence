import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../services';
import { Brand } from '../../../components/brand/brand';
import { Icon } from '../../../components/icon/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, Brand, Icon],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly auth = inject(AuthService);

  protected readonly staffTarget = computed((): string[] => {
    const session = this.auth.session();
    if (session) {
      return ['/', session.role];
    }
    return ['/login'];
  });

  protected readonly staffAction = computed(() => {
    return this.auth.session() ? 'Open staff workspace' : 'Staff sign in';
  });

  protected readonly steps = [
    {
      icon: 'users',
      title: 'Connect',
      detail: 'The platform’s patient registration service links a patient record with a primary doctor and generates a mobile access code.',
    },
    {
      icon: 'phone',
      title: 'Support the routine',
      detail: 'The separate patient mobile application is the companion for everyday medication routines. Patients do not sign in to this staff portal.',
    },
    {
      icon: 'stethoscope',
      title: 'Keep care connected',
      detail: 'Doctors review adherence metrics, configure reminder schedules, and adjust medications to keep care on track.',
    },
  ];
}
