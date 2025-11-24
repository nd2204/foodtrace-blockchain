import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { en } from '../i18n/en';
import { vi } from '../i18n/vi';

export type LangCode = 'en' | 'vi';

@Injectable({
  providedIn: 'root',
})
export class LangService {
  private langSource = new BehaviorSubject<LangCode>('vi');
  lang$ = this.langSource.asObservable();

  private dictionaries = { en, vi };

  get current(): LangCode {
    return this.langSource.value;
  }

  setLang(lang: LangCode) {
    this.langSource.next(lang);
  }

  translate(key: string): string {
    const parts = key.split('.');
    let value: any = this.dictionaries[this.current];

    for (const p of parts) {
      value = value?.[p];
      if (!value) return key;
    }
    return value;
  }
}
