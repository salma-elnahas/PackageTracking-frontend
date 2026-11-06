import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { roleGuard } from './guards/role-guard';
import { ManageOrders } from './pages/manage-orders/manage-orders';
import { OrderDetails } from './pages/order-details/order-details';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'my-orders', component: OrderDetails, canActivate: [roleGuard(['user'])] },
  { path: 'assigned-orders', component: ManageOrders, canActivate: [roleGuard(['courier'])] },
  { path: 'manage-orders', component: Login, canActivate: [roleGuard(['admin'])] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];