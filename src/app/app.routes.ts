import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'my-orders', component: Login },
  { path: 'assigned-orders', component: Login },
  { path: 'manage-orders', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];