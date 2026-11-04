import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'my-orders', component: Login, canActivate: [roleGuard(['user'])] },
  { path: 'assigned-orders', component: Login, canActivate: [roleGuard(['courier'])] },
  { path: 'manage-orders', component: Login, canActivate: [roleGuard(['admin'])] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];