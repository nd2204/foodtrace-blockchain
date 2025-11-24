import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type LangCode = 'vi' | 'en';

@Injectable({ providedIn: 'root' })
export class LangService {
  private currentLang: LangCode = 'vi';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['vi', 'en']);
    
    // Lấy ngôn ngữ từ localStorage, nếu không có thì mặc định là 'vi'
    const savedLang = (localStorage.getItem('lang') as LangCode) || 'vi';
    
    // Set ngôn ngữ mặc định (fallback)
    this.translate.setDefaultLang('vi');
    
    // Kích hoạt ngôn ngữ đã lưu
    this.setLanguage(savedLang);
  }

  getLanguage(): LangCode {
    return this.currentLang;
  }

  setLanguage(lang: LangCode) {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }
}