import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Brand } from '../shared/brand';
import { Icon } from '../shared/icon';

@Component({imports:[RouterLink,Brand,Icon],templateUrl:'./home.html',styleUrl:'./home.scss'})
export class Home {
  protected readonly auth = inject(AuthService);
  protected readonly staffTarget = computed((): string[] => {
    const session = this.auth.session();
    return session ? ['/', session.role] : ['/login'];
  });
  protected readonly staffAction = computed(() => this.auth.session() ? 'Open staff workspace' : 'Staff sign in');
  protected readonly steps = [
    {icon:'users', title:'Connect', detail:'The platform’s patient registration service links a patient record with a primary doctor and generates a mobile access code.'},
    {icon:'phone', title:'Support the routine', detail:'The separate patient mobile application is the companion for everyday medication routines. Patients do not sign in to this staff portal.'},
    {icon:'stethoscope', title:'Keep care connected', detail:'Doctors support clinical follow-up, while authorized administrators manage staff accounts and the medication catalogue.'}
  ];
}
