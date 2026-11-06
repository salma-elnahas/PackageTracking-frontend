import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { roleGuard } from './guards/role-guard';
import { ManageOrders } from './pages/manage-orders/manage-orders';
import { OrderDetails } from './pages/order-details/order-details';
import { MyOrders } from './pages/my-orders/my-orders';
import { CreateOrder } from './pages/create-order/create-order';
import { AssignedOrders } from './pages/assigned-orders/assigned-orders';
import { CourierAssignments } from './pages/courier-assignments/courier-assignments';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'orders/:id', component: OrderDetails, canActivate: [roleGuard(['user', 'courier', 'admin'])] },
  { path: 'create-order', component: CreateOrder, canActivate: [roleGuard(['user'])] },
  { path: 'my-orders', component: MyOrders, canActivate: [roleGuard(['user'])] },
  { path: 'assigned-orders', component: AssignedOrders, canActivate: [roleGuard(['courier'])] },
  { path: 'manage-orders', component: ManageOrders, canActivate: [roleGuard(['admin'])] },
  { path: 'courier-assignments', component: CourierAssignments, canActivate: [roleGuard(['admin'])] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];