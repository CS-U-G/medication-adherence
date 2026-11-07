import { Routes } from '@angular/router';

export const ADMIN_MANAGEMENT_ROUTES: Routes = [
  { path: 'doctors', title: 'Doctor accounts', loadComponent: () => import('./doctor-accounts').then(module => module.DoctorAccountsPage) },
  { path: 'doctors/new', title: 'Create doctor account', loadComponent: () => import('./create-doctor').then(module => module.CreateDoctorPage) },
  { path: 'doctors/:id', title: 'Doctor account', loadComponent: () => import('./doctor-account').then(module => module.DoctorAccountPage) },
  { path: 'medications', title: 'Medication catalogue', loadComponent: () => import('./medication-catalogue').then(module => module.MedicationCataloguePage) },
];
