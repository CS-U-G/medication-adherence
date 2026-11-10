import { Routes } from '@angular/router';

export const doctorFeatureRoutes: Routes = [
  {
    path: 'patients',
    title: 'Patients | MedMinder',
    loadComponent: () => import('./patient-directory').then(module => module.PatientDirectoryPage),
  },
  {
    path: 'patients/register',
    title: 'Register patient | MedMinder',
    loadComponent: () => import('./patient-registration').then(module => module.PatientRegistrationPage),
  },
  {
    path: 'patients/:id',
    title: 'Patient record | MedMinder',
    loadComponent: () => import('./patient-detail').then(module => module.PatientDetailPage),
  },
  {
    path: 'prescriptions',
    title: 'Prescriptions | MedMinder',
    loadComponent: () => import('./prescriptions').then(module => module.PrescriptionsPage),
  },
  {
    path: 'prescriptions/new',
    title: 'New prescription | MedMinder',
    loadComponent: () => import('./prescription-builder').then(module => module.PrescriptionBuilderPage),
  },
  {
    path: 'reports',
    title: 'Adherence report | MedMinder',
    loadComponent: () => import('./adherence-report').then(module => module.AdherenceReportPage),
  },
];
