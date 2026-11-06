import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { roleGuard } from './guards/role-guard';
import { MyOrders } from './pages/my-orders/my-orders';
import { CreateOrder } from './pages/create-order/create-order';
import { AssignedOrders } from './pages/assigned-orders/assigned-orders';
import { CourierAssignments } from './pages/courier-assignments/courier-assignments';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'create-order', component: CreateOrder, canActivate: [roleGuard(['user'])] },
  { path: 'my-orders', component: MyOrders, canActivate: [roleGuard(['user'])] },
  { path: 'assigned-orders', component: AssignedOrders, canActivate: [roleGuard(['courier'])] },
  // TEMP: Person 3's Manage Orders page isn't merged yet, so admins land on Courier Assignments.
  // Replace this line with the real page when it is added.
  { path: 'manage-orders', redirectTo: 'courier-assignments' },
  { path: 'courier-assignments', component: CourierAssignments, canActivate: [roleGuard(['admin'])] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
