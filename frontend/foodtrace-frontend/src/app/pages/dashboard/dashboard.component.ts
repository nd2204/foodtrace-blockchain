// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 
import { TranslateModule } from '@ngx-translate/core';

import { LangService, LangCode } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard', 
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, RouterOutlet], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  
  isSidebarCollapsed = false; 
  currentLang: LangCode;

  // Thông tin User giả lập (Sau này lấy từ AuthService)
  currentUser = {
    name: 'Admin User',
    role: 'Quản trị viên',
    avatar: '👤' 
  };

  constructor(
    public langService: LangService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentLang = this.langService.getLanguage();
  }

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  
  collapseSidebarOnNavigate() {
    // Giữ sidebar mở hay đóng tùy ý bạn, ở đây tôi tạm comment
    // this.isSidebarCollapsed = true; 
  }

  setLang(lang: LangCode) {
    this.langService.setLanguage(lang);
    this.currentLang = lang;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}