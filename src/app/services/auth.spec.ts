import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = environment.api_url + '/auth';

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.api}/login`, data).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  get role(): string | null {
    return JSON.parse(localStorage.getItem('user') || 'null')?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}