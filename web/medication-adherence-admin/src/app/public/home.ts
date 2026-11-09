import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Brand } from '../shared/brand';
import { Icon } from '../shared/icon';

@Component({imports:[RouterLink,Brand,Icon],templateUrl:'./home.html',styleUrl:'./home.scss'})
export class Home {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly demoError = signal('');
  protected readonly steps = [
    {icon:'users', title:'Connect', detail:'The platform’s patient registration service links a patient record with a primary doctor and generates a mobile access code.'},
    {icon:'phone', title:'Support the routine', detail:'The separate patient mobile application is the companion for everyday medication routines. Patients do not sign in to this staff portal.'},
    {icon:'stethoscope', title:'Keep care connected', detail:'Dedicated doctor and administrator workspaces organize clinical and account responsibilities. Live access is pending server authorization.'}
  ];
  protected demo(role:'doctor'|'admin') { this.demoError.set(''); try { this.auth.enterDemo(role); void this.router.navigate(['/',role]); } catch(error) { this.demoError.set(error instanceof Error ? error.message : 'Could not start the demo.'); } }
}
