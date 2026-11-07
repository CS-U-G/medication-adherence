import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Brand } from './brand';
import { Icon } from './icon';

const doctor = [
  {label:'Overview',path:'/doctor',icon:'grid'},
  {label:'Patients',path:'/doctor/patients',icon:'users'},
  {label:'Prescriptions',path:'/doctor/prescriptions',icon:'file'},
  {label:'Adherence reports',path:'/doctor/reports',icon:'chart'}
];
const admin = [
  {label:'Overview',path:'/admin',icon:'grid'},
  {label:'Doctor accounts',path:'/admin/doctors',icon:'users'},
  {label:'Medication catalogue',path:'/admin/medications',icon:'pill'}
];

@Component({imports:[RouterLink,RouterLinkActive,RouterOutlet,Brand,Icon],templateUrl:'./portal-shell.html',styleUrl:'./portal-shell.scss',host:{'(document:keydown.escape)':'mobileNav.set(false)'}})
export class PortalShell {
  protected readonly auth = inject(AuthService);
  protected readonly role = computed(() => this.auth.session()?.role ?? 'doctor');
  protected readonly links = computed(() => this.role() === 'admin' ? admin : doctor);
  protected readonly mobileNav = signal(false);
  protected readonly title = signal('Overview');
  protected readonly initials = computed(() => (this.auth.session()?.name ?? '').replace(/^Dr\.\s*/i,'').split(/\s+/).slice(0,2).map(word => word[0]).join(''));
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mobileNav.set(false);
        let current = this.route;
        while (current.firstChild) current = current.firstChild;
        this.title.set(current.snapshot.title?.split(' | ')[0] ?? 'Workspace');
      }
    });
  }
  protected signOut() {
    this.auth.signOut();
    void this.router.navigate(['/']);
  }
}
