// src/app/pages/layout/app-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router'; // Thêm RouterOutlet để hiển thị nội dung trang con
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Xóa bỏ các imports liên quan đến Map (Leaflet) và Dashboard Service
// import * as L from 'leaflet';
// import { DashboardService, ... } from '../../services/dashboard.service';

import { LangService, LangCode } from '../../services/language.service';

@Component({
  standalone: true,
  // Đổi selector và class name
  selector: 'app-layout', 
  // FIX: Đảm bảo có RouterModule (chứa RouterOutlet) để routing lồng nhau hoạt động
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule], 
  templateUrl: './app-layout.component.html', // Bạn cũng cần đổi tên file HTML
  styleUrls: ['./app-layout.component.css'],
})
export class AppLayoutComponent implements OnInit {
  // 👉 CHỈ GIỮ LẠI LOGIC VÀ BIẾN LIÊN QUAN ĐẾN SIDEBAR VÀ NGÔN NGỮ

  // Thuộc tính điều khiển Sidebar
  isSidebarCollapsed = false; 
  
  // Thuộc tính ngôn ngữ
  currentLang: LangCode;

  constructor(public langService: LangService) {
    this.currentLang = this.langService.getLanguage();
  }

  ngOnInit(): void {
    // Không cần load dữ liệu, Map hay Summary ở Layout này nữa
  }

  // --- Chức năng Sidebar ---
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
  
  // Thu gọn khi chuyển trang (tùy chọn)
  collapseSidebarOnNavigate() {
    this.isSidebarCollapsed = true; 
  }

  // --- Chức năng Ngôn ngữ ---
  setLang(lang: LangCode) {
    this.langService.setLanguage(lang);
    this.currentLang = lang;
  }
}