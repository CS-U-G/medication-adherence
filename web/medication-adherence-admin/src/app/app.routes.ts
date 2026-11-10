import { Routes } from '@angular/router';
import { roleGuard } from './core/role.guard';
import { Home } from './public/home';
import { PortalShell } from './shared/portal-shell';
import { Settings } from './shared/settings';
import { ErrorPage } from './shared/error-page';

export const routes: Routes = [
  {path:'',pathMatch:'full',component:Home,title:'MedMinder · Medication adherence'},
  {path:'login',loadComponent:()=>import('./auth/login').then(m=>m.Login),title:'Staff sign in'},
  {path:'register',loadComponent:()=>import('./auth/register-doctor').then(m=>m.RegisterDoctor),title:'Create doctor account · MedMinder'},
  {path:'availability',loadComponent:()=>import('./public/service-status').then(m=>m.ServiceStatus),title:'MedMinder · Service availability'},
  {path:'doctor',component:PortalShell,canActivate:[roleGuard('doctor')],canActivateChild:[roleGuard('doctor')],children:[
    {path:'',pathMatch:'full',title:'Doctor overview',loadComponent:()=>import('./doctor/doctor-overview').then(m=>m.DoctorOverview)},
    {path:'settings',title:'Account settings',component:Settings},
    {path:'',loadChildren:()=>import('./doctor/doctor.routes').then(m=>m.doctorFeatureRoutes)}
  ]},
  {path:'admin',component:PortalShell,canActivate:[roleGuard('admin')],canActivateChild:[roleGuard('admin')],children:[
    {path:'',pathMatch:'full',title:'Platform overview',loadComponent:()=>import('./admin/admin-overview').then(m=>m.AdminOverview)},
    {path:'settings',title:'Account settings',component:Settings},
    {path:'',loadChildren:()=>import('./admin/admin-management.routes').then(m=>m.ADMIN_MANAGEMENT_ROUTES)}
  ]},
  {path:'forbidden',component:ErrorPage,title:'Access restricted',data:{forbidden:true}},
  {path:'**',component:ErrorPage,title:'Page not found'}
];
