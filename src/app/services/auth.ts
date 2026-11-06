import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = environment.api_url + '/auth';

  // logged-in user as a signal, so the navbar updates right after login/logout
  readonly user = signal<CurrentUser | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.api}/login`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.user.set(res.user);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.user.set(null);
  }

  get role(): string | null {
    return this.user()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}