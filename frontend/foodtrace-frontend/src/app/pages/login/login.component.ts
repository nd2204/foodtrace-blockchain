import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangService, LangCode } from '../../services/language.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // ... (Giữ nguyên logic cũ)
  email = '';
  password = '';
  isSubmitting = false; 
  errorMessage = '';
  currentLang: LangCode;

  constructor(private router: Router, public langService: LangService) {
    this.currentLang = this.langService.getLanguage();
  }

  setLang(lang: string) { // Lưu ý: kiểu string ở template truyền vào
    this.langService.setLanguage(lang as LangCode);
    this.currentLang = lang as LangCode;
  }

  // ... (hàm login, onSubmit giữ nguyên)
  login() { this.onSubmit(); }
  
  onSubmit() {
    this.errorMessage = '';
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/dashboard']);
    }, 500);
  }
}