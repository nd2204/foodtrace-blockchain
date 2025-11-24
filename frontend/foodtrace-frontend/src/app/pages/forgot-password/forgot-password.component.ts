import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LangService, LangCode } from '../../services/language.service'; // Import LangService

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email = '';
  isSent = false;
  isLoading = false;
  errorMessage = '';
  currentLang: LangCode; // Biến ngôn ngữ

  constructor(
    private auth: AuthService, 
    public langService: LangService // Inject Service
  ) {
    this.currentLang = this.langService.getLanguage();
  }

  // Hàm đổi ngôn ngữ
  setLang(lang: string) {
    this.langService.setLanguage(lang as LangCode);
    this.currentLang = lang as LangCode;
  }

  submit() {
    if (!this.email) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.isSent = false;

    // Giả lập API
    setTimeout(() => {
      this.isSent = true;
      this.isLoading = false;
    }, 1000);
  }
}