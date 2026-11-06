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

export interface Person {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export const ORDER_STATUSES = [
  'Pending', 'Accepted', 'Declined', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'
] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];


export interface Order {
  _id: string;
  user: string | Person;             
  courier: string | Person | null; 
  pickupLocation: string;
  dropoffLocation: string;
  packageDetails: string;
  deliveryTime: string;
  status: OrderStatus;
  statusHistory: { status: string; at: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface MyOrdersResponse {
  count: number;
  orders: Order[];
}

//response structures from the backend
export interface OrderResponse { order: Order; }
export interface OrderMessageResponse { message: string; order: Order; }
export interface MessageResponse { message: string; }

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

   getOrderById(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.api}/${id}`);
  }

  // Feature 6: Cancel own pending order
  cancelOrder(id: string): Observable<OrderMessageResponse> {
    return this.http.patch<OrderMessageResponse>(`${this.api}/${id}/cancel`, {});
  }

  // Feature 9: get all orders for admin
  getAllOrders(): Observable<MyOrdersResponse> {
    return this.http.get<MyOrdersResponse>(this.api);
  }

  // Feature 9: update any order's status
  updateOrderStatus(id: string, status: OrderStatus): Observable<OrderMessageResponse> {
    return this.http.put<OrderMessageResponse>(`${this.api}/${id}/status`, { status });
  }

  // Feature 9: delete an order
  deleteOrder(id: string): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.api}/${id}`);
  }
}
