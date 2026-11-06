import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import {
  ASSIGNABLE,
  CourierOrder,
  CourierService,
  UserSummary,
  personId,
  personLabel,
} from '../../services/courier';

const CLOSED = ['Delivered', 'Cancelled'];

@Component({
  selector: 'app-courier-assignments',
  imports: [DatePipe],
  templateUrl: './courier-assignments.html',
  styleUrl: './courier-assignments.css',
})
export class CourierAssignments {
  private courier = inject(CourierService);

  orders = signal<CourierOrder[]>([]);
  couriers = signal<UserSummary[]>([]);
  loading = signal(true);
  error = signal('');
  message = signal('');
  busyId = signal<string | null>(null);
  showClosed = signal(false);
  // orderId -> courierId picked in the dropdown (not saved until "Assign" is clicked)
  picked = signal<Record<string, string>>({});

  readonly personLabel = personLabel;
  readonly personId = personId;

  visibleOrders = computed(() =>
    this.orders().filter((o) => this.showClosed() || !CLOSED.includes(o.status)),
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      orders: this.courier.getAllOrders(),
      couriers: this.courier.getCouriers(),
    }).subscribe({
      next: ({ orders, couriers }) => {
        this.orders.set(orders);
        this.couriers.set(couriers);
        this.picked.set({});
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not load orders or couriers.');
      },
    });
  }

  isClosed(order: CourierOrder): boolean {
    return CLOSED.includes(order.status);
  }

  isAssignable(order: CourierOrder): boolean {
    return ASSIGNABLE.includes(order.status);
  }

  needsCourier(order: CourierOrder): boolean {
    return !order.courier || order.status === 'Declined';
  }

  // value shown in the dropdown: what the admin picked, otherwise the current courier
  selectedFor(order: CourierOrder): string {
    return this.picked()[order._id] ?? personId(order.courier);
  }

  pick(order: CourierOrder, event: Event): void {
    const courierId = (event.target as HTMLSelectElement).value;
    this.picked.update((p) => ({ ...p, [order._id]: courierId }));
  }

  canAssign(order: CourierOrder): boolean {
    const chosen = this.selectedFor(order);
    if (!chosen || !this.isAssignable(order)) return false;
    // allow re-sending the same courier only when they declined it
    return chosen !== personId(order.courier) || order.status === 'Declined';
  }

  assign(order: CourierOrder): void {
    const courierId = this.selectedFor(order);
    if (!courierId) return;
    this.busyId.set(order._id);
    this.error.set('');
    this.message.set('');
    this.courier.assignCourier(order._id, courierId).subscribe({
      next: () => {
        const name = this.couriers().find((c) => c._id === courierId)?.name ?? 'courier';
        this.busyId.set(null);
        this.message.set(`Order #${order._id.slice(-6)} assigned to ${name}.`);
        this.load();
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(err.error?.message ?? 'Could not assign the courier.');
      },
    });
  }

  toggleClosed(event: Event): void {
    this.showClosed.set((event.target as HTMLInputElement).checked);
  }

  statusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}
