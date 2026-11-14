import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services';
import { Brand } from '../brand/brand';
import { Icon } from '../icon/icon';

const DOCTOR_NAV_LINKS = [
  { label: 'Overview', path: '/doctor', icon: 'grid' },
  { label: 'Patients', path: '/doctor/patients', icon: 'users' },
  { label: 'Prescriptions', path: '/doctor/prescriptions', icon: 'file' },
  { label: 'Adherence reports', path: '/doctor/reports', icon: 'chart' },
];

const ADMIN_NAV_LINKS = [
  { label: 'Overview', path: '/admin', icon: 'grid' },
  { label: 'Doctor accounts', path: '/admin/doctors', icon: 'users' },
  { label: 'Medication catalogue', path: '/admin/medications', icon: 'pill' },
];

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Brand, Icon],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  host: {
    '(document:keydown.escape)': 'mobileNav.set(false)',
  },
})
export class DashboardLayout {

  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly role = computed(() => {
    return this.auth.session()?.role ?? 'doctor';
  });

  protected readonly links = computed(() => {
    return this.role() === 'admin' ? ADMIN_NAV_LINKS : DOCTOR_NAV_LINKS;
  });

  protected readonly mobileNav = signal(false);
  protected readonly title = signal('Overview');

  protected readonly initials = computed(() => {
    const rawName = this.auth.session()?.name ?? '';
    const cleanName = rawName.replace(/^Dr\.\s*/i, '');
    const words = cleanName.split(/\s+/).slice(0, 2);
    return words.map(word => word[0]).join('');
  });

  constructor() {

    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.mobileNav.set(false);

        let currentRoute = this.route;
        while (currentRoute.firstChild) {
          currentRoute = currentRoute.firstChild;
        }

        const routeTitle = currentRoute.snapshot.title?.split(' | ')[0] ?? 'Workspace';
        this.title.set(routeTitle);
      }
    });
  }

  protected signOut(): void {
    this.auth.signOut();
    void this.router.navigate(['/']);
  }
}

export { DashboardLayout as PortalShell };
