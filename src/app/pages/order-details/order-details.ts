import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { OrderService, Order, Person } from '../../services/order';

@Component({
  selector: 'app-order-details',
  imports: [DatePipe],                 // the template uses the date pipe
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {
  private route = inject(ActivatedRoute);      // reads the id from the URL
  private orderService = inject(OrderService); // calls the backend API
  private location = inject(Location);         // used by the Back button

  //signals update the page automatically
  order = signal<Order | null>(null);   // the loaded order 
  loading = signal(true);               // true while the order is being fetched
  cancelling = signal(false);           // true while the cancel request is running
  error = signal('');                   
  success = signal('');               

  // The courier field can be an object , null or id string.
  courier = computed(() => {
    const c = this.order()?.courier;
    return c && typeof c === 'object' ? (c as Person) : null;
  });

  // Runs once when the page opens
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    //backend returns { order }
    this.orderService.getOrderById(id).subscribe({
      // success: store the order so the template shows it
      next: res => {
        this.order.set(res.order);
        this.loading.set(false);
      },
      // show the backend's message, or a fallback if there is none
      error: e => {
        this.error.set(e.error?.message || 'Could not load the order');
        this.loading.set(false);
      }
    });
  }

  // Runs when the user clicks cancel
  cancel() {
    // 1. The order currently shown on the page
    const o = this.order();

    // 2. Stop if nothing is loaded, or the user clicks "Cancel" in the confirmation popup
    if (!o || !confirm('Are you sure you want to cancel this order?')) return;

    // 3. Prepare the page: disable the button and clear old messages
    this.cancelling.set(true);
    this.error.set('');
    this.success.set('');

    // 4. backend returns { message, order }
    this.orderService.cancelOrder(o._id).subscribe({
      // 5a. Success: show the updated order (status = Cancelled) and the success message
      next: res => {
        this.order.set(res.order);
        this.success.set(res.message);
        this.cancelling.set(false);
      },
      // 5. Failure 
      error: e => {
        this.error.set(e.error?.message || 'Could not cancel the order');
        this.cancelling.set(false);
      }
    });
  }

  // back button
  back() {
    this.location.back();
  }
}