// src/app/services/language.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type LangCode = 'en' | 'vi';

@Injectable({ providedIn: 'root' })
export class LangService {
  private currentLang: LangCode = 'vi';

  constructor(private translate: TranslateService) {
    const saved = (localStorage.getItem('lang') as LangCode) || 'vi';

    this.translate.addLangs(['en', 'vi']);
    this.translate.setDefaultLang('vi');
    this.setLanguage(saved);
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
