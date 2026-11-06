import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OrderService, Order, Person, ORDER_STATUSES, OrderStatus } from '../../services/order';

@Component({
  selector: 'app-manage-orders',
  imports: [DatePipe, RouterLink],     // template uses | date and the "View" link
  templateUrl: './manage-orders.html',
  styleUrl: './manage-orders.css',
})
export class ManageOrders implements OnInit {
 private orderService = inject(OrderService);   

  orders = signal<Order[]>([]);   // all orders shown in the table
  loading = signal(true);         // true while orders are being fetched
  error = signal('');            
  success = signal('');          
  statuses = ORDER_STATUSES;      // options for the status dropdown

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.orderService.getAllOrders().subscribe({
      // success: fill the table
      next: res => {
        this.orders.set(res.orders);
        this.loading.set(false);
      },
      // failure: show the reason
      error: e => {
        this.error.set(e.error?.message || 'Could not load orders');
        this.loading.set(false);
      }
    });
  }

  // Used by the template for the Customer and Courier columns:
  name(p: string | Person | null): string {
    return p && typeof p === 'object' ? p.name : '—';
  }

  // Runs when the admin picks a new status in a row's dropdown
  updateStatus(o: Order, status: string) {
    this.clearMessages();
    this.orderService.updateOrderStatus(o._id, status as OrderStatus).subscribe({
      next: res => {
        this.success.set(res.message);
        this.load();
      },
      // failure: show the reason
      // and reload so the dropdown goes back to the real status
      error: e => {
        this.error.set(e.error?.message || 'Could not update the status');
        this.load();
      }
    });
  }

  // Runs when the admin clicks "Delete" on a row
  deleteOrder(o: Order) {
    // ask first, deleting cannot be undone
    if (!confirm('Delete this order permanently?')) return;
    this.clearMessages();
    this.orderService.deleteOrder(o._id).subscribe({
      next: res => {
        this.success.set(res.message);
        this.load();
      },
      error: e => this.error.set(e.error?.message || 'Could not delete the order')
    });
  }

  // Hide old messages before a new action
  private clearMessages() {
    this.error.set('');
    this.success.set('');
  }
}