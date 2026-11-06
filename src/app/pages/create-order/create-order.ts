import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order';

// parses "DD/MM/YYYY" + an hour (default 12) into a local Date or null if it is not a real day
function parseDay(day: string, hour = 12): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((day ?? '').trim());
  if (!m) return null;
  const d = Number(m[1]),
    mo = Number(m[2]),
    y = Number(m[3]);
  const date = new Date(y, mo - 1, d, hour, 0, 0);
  // reject things like 31/02/2026 (JS would silently roll over to March)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

// the typed day must look like DD/MM/YYYY, be a real day, and be tomorrow or later
function validDeliveryDay(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const date = parseDay(control.value);
  if (!date) return { invalidDay: true };
  const startOfTomorrow = new Date();
  startOfTomorrow.setHours(0, 0, 0, 0);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  return date.getTime() >= startOfTomorrow.getTime() ? null : { pastDate: true };
}

@Component({
  selector: 'app-create-order',
  imports: [ReactiveFormsModule],
  templateUrl: './create-order.html',
  styleUrl: './create-order.css',
})
export class CreateOrder {
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  private router = inject(Router);

  // signals so the screen updates after the server replies (the app is zoneless)
  error = signal('');
  loading = signal(false);

  form = this.fb.nonNullable.group({
    pickupLocation: ['', [Validators.required, Validators.minLength(3)]],
    dropoffLocation: ['', [Validators.required, Validators.minLength(3)]],
    packageDetails: ['', [Validators.required, Validators.minLength(3)]],
    deliveryDate: ['', [Validators.required, validDeliveryDay]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const v = this.form.getRawValue();
    this.orders
      .createOrder({
        pickupLocation: v.pickupLocation.trim(),
        dropoffLocation: v.dropoffLocation.trim(),
        packageDetails: v.packageDetails.trim(),
        deliveryTime: parseDay(v.deliveryDate)!.toISOString(),
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/my-orders'),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Could not create the order. Please try again.');
        },
      });
  }
}
