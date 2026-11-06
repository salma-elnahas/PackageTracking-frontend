import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order, OrderService } from '../../services/order';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal('');

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.orderService.getMyOrders().subscribe({
      next: (response) => {
        console.log('Orders response:', response);

        this.orders.set(response.orders);
        this.loading.set(false);

        console.log('Orders loaded:', this.orders());
      },

      error: (err) => {
        console.error('Error loading orders:', err);

        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load your orders. Please try again.');
      },
    });
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}
