import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { roleGuard } from './guards/role-guard';
import { MyOrders } from './pages/my-orders/my-orders';
import { CreateOrder } from './pages/create-order/create-order';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'create-order', component: CreateOrder, canActivate: [roleGuard(['user'])] },
  { path: 'my-orders', component: MyOrders, canActivate: [roleGuard(['user'])] },
  { path: 'assigned-orders', component: Login, canActivate: [roleGuard(['courier'])] },
  { path: 'manage-orders', component: Login, canActivate: [roleGuard(['admin'])] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
