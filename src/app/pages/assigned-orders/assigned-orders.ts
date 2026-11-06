import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { CourierOrder, CourierService, NEXT_STATUS, personLabel } from '../../services/courier';

// Signals are used for all page state: the app is zoneless, so plain fields
// changed inside an HTTP callback would not refresh the screen.
@Component({
  selector: 'app-assigned-orders',
  imports: [DatePipe],
  templateUrl: './assigned-orders.html',
  styleUrl: './assigned-orders.css',
})
export class AssignedOrders {
  private courier = inject(CourierService);

  orders = signal<CourierOrder[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<string | null>(null);

  readonly nextStatus = NEXT_STATUS;
  readonly personLabel = personLabel;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.courier.getAssignedOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load your assigned orders.');
      },
    });
  }

  accept(order: CourierOrder): void {
    this.run(order, this.courier.accept(order._id));
  }

  decline(order: CourierOrder): void {
    this.run(order, this.courier.decline(order._id));
  }

  advance(order: CourierOrder): void {
    const next = this.nextStatus[order.status];
    if (next) this.run(order, this.courier.updateStatus(order._id, next));
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  private run(order: CourierOrder, request: Observable<unknown>): void {
    this.busyId.set(order._id);
    this.error.set('');
    request.subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(err.error?.message ?? 'That action failed. Please try again.');
      },
    });
  }
}
