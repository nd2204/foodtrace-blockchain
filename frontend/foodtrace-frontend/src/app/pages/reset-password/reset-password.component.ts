// src/app/pages/reset-password/reset-password.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  password = '';
  confirmPassword = '';
  token = '';
  isDone = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {
    if (!this.token) {
      this.errorMessage = 'Token không hợp lệ.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp.';
      return;
    }

    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.isDone = true;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMessage =
          err.error?.error || 'Không đặt lại được mật khẩu, vui lòng thử lại.';
      },
    });
  }
}
