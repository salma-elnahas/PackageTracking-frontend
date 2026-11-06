import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

// links each role sees; the first one is that role's home page
const LINKS: Record<string, { label: string; path: string }[]> = {
  user: [
    { label: 'My Orders', path: '/my-orders' },
    { label: 'Create Order', path: '/create-order' },
  ],
  courier: [{ label: 'Assigned Orders', path: '/assigned-orders' }],
  admin: [
    { label: 'Manage Orders', path: '/manage-orders' },
    { label: 'Courier Assignments', path: '/courier-assignments' },
  ],
};

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;
  links = computed(() => LINKS[this.user()?.role ?? ''] ?? []);
  home = computed(() => this.links()[0]?.path ?? '/login');

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
