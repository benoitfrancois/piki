import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { SetupGuard } from './guards/setup.guard';

export const routes: Routes = [
  // Public — setup
  {
    path: 'setup',
    loadComponent: () => import('./features/setup/setup').then(m => m.SetupComponent),
    canActivate: [SetupGuard]
  },
  // Public — login
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.LoginComponent)
  },
  // Public — reset password
  {
    path: 'reset-password',
    loadComponent: () => import('./features/reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },
  // Protected
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages',
    loadComponent: () => import('./features/pages/page-list/page-list').then(m => m.PageListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages/new',
    loadComponent: () => import('./features/pages/page-form/page-form').then(m => m.PageFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages/:id',
    loadComponent: () => import('./features/pages/page-detail/page-detail').then(m => m.PageDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages/:id/edit',
    loadComponent: () => import('./features/pages/page-form/page-form').then(m => m.PageFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.AdminComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'import-export',
    loadComponent: () => import('./features/import-export/import-export').then(m => m.ImportExportComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
