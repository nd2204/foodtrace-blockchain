import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LangService, LangCode } from '../../services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  
  // Biến cho màn hình xác thực
  verificationCode = '';
  step: 'register' | 'verify' = 'register';

  isLoading = false;
  errorMessage = '';
  currentLang: LangCode;

  constructor(
    public langService: LangService, 
    private router: Router,
    private authService: AuthService
  ) {
    this.currentLang = this.langService.getLanguage();
  }

  setLang(lang: LangCode) {
    this.langService.setLanguage(lang);
    this.currentLang = lang;
  }

  // BƯỚC 1: Đăng ký
  register() {
    if (!this.fullName || !this.email || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu không khớp.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      username: this.email, // Backend dùng email làm username
      email: this.email,
      full_name: this.fullName,
      password: this.password,
      role: 'user' // Mặc định role
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        // Chuyển sang bước xác thực
        this.step = 'verify'; 
        alert('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Đăng ký thất bại.';
      }
    });
  }

  // BƯỚC 2: Xác thực
  verify() {
    if (!this.verificationCode) return;
    
    this.isLoading = true;
    this.authService.verifyCode(this.email, this.verificationCode).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Xác thực thành công! Bạn có thể đăng nhập ngay.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Mã xác thực không đúng.';
      }
    });
  }
}