import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ApiService, ENDPOINTS } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'ft_token';

  constructor(private apiService: ApiService, private router: Router) {}

  // 1. Đăng ký
  register(data: any): Observable<any> {
    return this.apiService.post(`${ENDPOINTS.AUTH.REGISTER}`, data);
  }

  // 2. Xác thực mã OTP (Backend yêu cầu bước này)
  verifyCode(email: string, code: string): Observable<any> {
    return this.apiService.post(`${ENDPOINTS.AUTH.VERIFY_CODE}`, { email, code });
  }

  // 3. Đăng nhập
  login(data: any): Observable<any> {
    return this.apiService.post(`${ENDPOINTS.AUTH.LOGIN}`, data).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
        }
      })
    );
  }

  // 4. Quên mật khẩu (Gửi OTP)
  forgotPassword(email: string): Observable<any> {
    return this.apiService.post(`${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, { email });
  }

  // 5. Đặt lại mật khẩu
  resetPassword(data: any): Observable<any> {
    return this.apiService.post(`${ENDPOINTS.AUTH.RESET_PASSWORD}`, data);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }
}