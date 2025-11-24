import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
// src/app/core/auth.service.ts

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'ft_token';

  constructor(private http: HttpClient, private router: Router) {}

  // Tạm thời fake: khi có backend em thay bằng http.post(...)
  login(email: string, password: string): Observable<void> {
    if (!email || !password) {
      return of(void 0);
    }

    return of({ token: 'demo-token' }).pipe(
      tap((res) => localStorage.setItem(this.tokenKey, res.token)),
      map(() => void 0)
    );
  }

  register(fullName: string, email: string, password: string): Observable<void> {
    return of(void 0);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
