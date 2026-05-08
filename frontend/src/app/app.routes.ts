import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () =>
          import('./layout/home.component').then((m) => m.HomeComponent)
      },
      {
        path: 'services',
        canActivate: [roleGuard(['USER', 'ADMIN'])],
        loadComponent: () =>
          import('./features/user/services/user-services.component').then(
            (m) => m.UserServicesComponent
          )
      },
      {
        path: 'my-orders',
        canActivate: [roleGuard(['USER', 'ADMIN'])],
        loadComponent: () =>
          import('./features/user/orders/user-orders.component').then(
            (m) => m.UserOrdersComponent
          )
      },
      {
        path: 'admin/services',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/admin/services/admin-services.component').then(
            (m) => m.AdminServicesComponent
          )
      },
      {
        path: 'admin/orders',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () =>
          import('./features/admin/orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
