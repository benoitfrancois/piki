import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'pages',
    loadComponent: () => import('./features/pages/page-list/page-list').then(m => m.PageListComponent)
  },
  {
    path: 'pages/new',
    loadComponent: () => import('./features/pages/page-form/page-form').then(m => m.PageFormComponent)
  },
  {
    path: 'pages/:id',
    loadComponent: () => import('./features/pages/page-detail/page-detail').then(m => m.PageDetailComponent)
  },
  {
    path: 'pages/:id/edit',
    loadComponent: () => import('./features/pages/page-form/page-form').then(m => m.PageFormComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.AdminComponent)
  },
  {
    path: 'import-export',
    loadComponent: () => import('./features/import-export/import-export')
      .then(m => m.ImportExportComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
