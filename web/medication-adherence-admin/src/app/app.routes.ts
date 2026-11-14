import { Routes } from '@angular/router';
import { roleGuard } from './services';

import { Home } from './Pages/public/home/home';
import { Login } from './Pages/public/login/login';
import { RegisterDoctor } from './Pages/public/register-doctor/register-doctor';
import { ServiceStatus } from './Pages/public/service-status/service-status';
import { DashboardLayout } from './components/dashboard-layout/dashboard-layout';
import { DoctorOverview } from './Pages/doctor/doctor-overview/doctor-overview';
import { PatientDirectoryPage } from './Pages/doctor/patient-directory/patient-directory';
import { PatientRegistrationPage } from './Pages/doctor/patient-registration/patient-registration';
import { PatientDetailPage } from './Pages/doctor/patient-detail/patient-detail';
import { PrescriptionsPage } from './Pages/doctor/prescriptions/prescriptions';
import { PrescriptionBuilderPage } from './Pages/doctor/prescription-builder/prescription-builder';
import { AdherenceReportPage } from './Pages/doctor/adherence-report/adherence-report';
import { AdminOverview } from './Pages/admin/admin-overview/admin-overview';
import { DoctorAccountsPage } from './Pages/admin/doctor-accounts/doctor-accounts';
import { CreateDoctorPage } from './Pages/admin/create-doctor/create-doctor';
import { DoctorAccountPage } from './Pages/admin/doctor-account/doctor-account';
import { MedicationCataloguePage } from './Pages/admin/medication-catalogue/medication-catalogue';
import { Settings } from './Pages/public/settings/settings';
import { ErrorPage } from './Pages/public/error-page/error-page';

export const routes: Routes = [

  { path: '', component: Home },

  { path: 'login', component: Login },
  { path: 'register', component: RegisterDoctor },
  { path: 'availability', component: ServiceStatus },

  {
    path: 'doctor',
    component: DashboardLayout,
    canActivate: [roleGuard('doctor')],
    children: [
      { path: '', component: DoctorOverview },
      { path: 'patients', component: PatientDirectoryPage },
      { path: 'patients/register', component: PatientRegistrationPage },
      { path: 'patients/:id', component: PatientDetailPage },
      { path: 'prescriptions', component: PrescriptionsPage },
      { path: 'prescriptions/new', component: PrescriptionBuilderPage },
      { path: 'reports', component: AdherenceReportPage },
      { path: 'settings', component: Settings },
    ],
  },

  {
    path: 'admin',
    component: DashboardLayout,
    canActivate: [roleGuard('admin')],
    children: [
      { path: '', component: AdminOverview },
      { path: 'doctors', component: DoctorAccountsPage },
      { path: 'doctors/new', component: CreateDoctorPage },
      { path: 'doctors/:id', component: DoctorAccountPage },
      { path: 'medications', component: MedicationCataloguePage },
      { path: 'settings', component: Settings },
    ],
  },

  { path: 'forbidden', component: ErrorPage, data: { forbidden: true } },
  { path: '**', component: ErrorPage },
];
