import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // signals so the screen updates after the server replies (the app is zoneless)
  error = signal('');
  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        const dest =
          res.user.role === 'admin'
            ? '/manage-orders'
            : res.user.role === 'courier'
              ? '/assigned-orders'
              : '/my-orders';
        this.router.navigateByUrl(dest);
      },

      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }
}
