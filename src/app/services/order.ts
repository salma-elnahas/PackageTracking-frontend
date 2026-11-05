import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateOrderPayload {
  pickupLocation: string;
  dropoffLocation: string;
  packageDetails: string;
  deliveryTime: string;
}

export interface Order {
  _id: string;
  user: string;
  courier: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  packageDetails: string;
  deliveryTime: string;
  status:
    'Pending' | 'Accepted' | 'Declined' | 'Picked Up' | 'In Transit' | 'Delivered' | 'Cancelled';
  statusHistory: { status: string; at: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface MyOrdersResponse {
  count: number;
  orders: Order[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  private api = environment.api_url + '/orders';

  // Feature 4: Create a new order
  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http.post<Order>(this.api, payload);
  }

  // Feature 5: Get orders belonging to the logged-in user
  getMyOrders(): Observable<MyOrdersResponse> {
    return this.http.get<MyOrdersResponse>(`${this.api}/my-orders`);
  }
}
