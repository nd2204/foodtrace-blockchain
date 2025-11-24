import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangService, LangCode } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  isSubmitting = false; 
  errorMessage = '';
  currentLang: LangCode;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    public langService: LangService,
    private authService: AuthService
  ) {
    this.currentLang = this.langService.getLanguage();
    // Tự điền email nếu quay lại từ trang verify
    this.route.queryParams.subscribe(params => {
      if (params['email']) this.email = params['email'];
    });
  }

  setLang(lang: string) {
    this.langService.setLanguage(lang as LangCode);
    this.currentLang = lang as LangCode;
  }

  login() {
    this.errorMessage = '';
    this.isSubmitting = true;

    // Call backend api
    const result = this.authService.login({ username: this.email, password: this.password })
    result.subscribe( {
      next: (value) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Đăng nhập thất bại.';
        this.isSubmitting = false;
        const errorMsg = err.error?.error || '';

        // BẮT LỖI CHƯA KÍCH HOẠT
        if (errorMsg === 'Email not verified') {
          if (confirm('Tài khoản này chưa được kích hoạt. Bạn có muốn nhập mã xác thực ngay không?')) {
            this.router.navigate(['/verify'], { queryParams: { email: this.email } });
          }
        } else {
          this.errorMessage = errorMsg || 'Tên đăng nhập hoặc mật khẩu không đúng.';
        }
      },
      complete: () => { this.isSubmitting = false; }
    });
  }
}