import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from './order';

// The backend may send user/courier as just an id, or "populated" with the person's details
export interface UserSummary {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export type CourierOrder = Omit<Order, 'user' | 'courier'> & {
  user: string | UserSummary;
  courier: string | UserSummary | null;
};

export type CourierStatus = 'Picked Up' | 'In Transit' | 'Delivered';

// Feature 10: an admin can only (re)assign before the package is picked up (same rule as the backend)
export const ASSIGNABLE: Order['status'][] = ['Pending', 'Accepted', 'Declined'];

// Feature 8: the only forward moves a courier can make (Accepted -> Picked Up -> In Transit -> Delivered)
export const NEXT_STATUS: Partial<Record<Order['status'], CourierStatus>> = {
  Accepted: 'Picked Up',
  'Picked Up': 'In Transit',
  'In Transit': 'Delivered',
};

// Shows a person's name when populated, otherwise a short id
export function personLabel(p: string | UserSummary | null | undefined): string {
  if (!p) return 'Not assigned';
  if (typeof p === 'string') return 'User #' + p.slice(-6);
  return p.phone ? `${p.name} (${p.phone})` : p.name;
}

export function personId(p: string | UserSummary | null | undefined): string {
  if (!p) return '';
  return typeof p === 'string' ? p : p._id;
}

// Accepts either a plain array or a wrapper like { count, orders } / { users }
function unwrap<T>(key: string) {
  return map((res: any): T[] => (Array.isArray(res) ? res : (res?.[key] ?? [])));
}

/*
 * ALL ENDPOINTS FOR PERSON 4 LIVE HERE.
 * If the backend team agrees on different paths, only change them in this file.
 */
@Injectable({ providedIn: 'root' })
export class CourierService {
  private http = inject(HttpClient);
  private api = environment.api_url + '/courier';

  // Feature 7: orders assigned to the logged-in courier (backend reads the courier id from the JWT)
  getAssignedOrders(): Observable<CourierOrder[]> {
    return this.http.get(`${this.api}/orders`).pipe(unwrap<CourierOrder>('orders'));
  }

  // Feature 7: accept / decline an assigned order
  accept(orderId: string) {
    return this.http.patch(`${this.api}/orders/${orderId}/accept`, {});
  }

  decline(orderId: string) {
    return this.http.patch(`${this.api}/orders/${orderId}/decline`, {});
  }

  // Feature 8: Picked Up -> In Transit -> Delivered (backend also adds a statusHistory entry)
  updateStatus(orderId: string, status: CourierStatus) {
    return this.http.patch(`${this.api}/orders/${orderId}/status`, { status });
  }

  // Feature 10 (admin): every order — Person 3's endpoint (GET /api/orders)
  getAllOrders(): Observable<CourierOrder[]> {
    return this.http.get(`${environment.api_url}/orders`).pipe(unwrap<CourierOrder>('orders'));
  }

  // Feature 10 (admin): list of couriers for the assign dropdown
  getCouriers(): Observable<UserSummary[]> {
    return this.http.get(`${this.api}/couriers`).pipe(unwrap<UserSummary>('couriers'));
  }

  // Feature 10 (admin): assign or reassign a courier to an order
  assignCourier(orderId: string, courierId: string) {
    return this.http.put(`${this.api}/orders/${orderId}/assign`, { courierId });
  }
}
