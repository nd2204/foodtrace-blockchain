import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Factory để load file JSON
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Hàm khởi tạo ứng dụng để set ngôn ngữ mặc định ngay lập tức
export function appInitializerFactory(translate: TranslateService) {
  return () => {
    translate.setDefaultLang('vi');
    const savedLang = localStorage.getItem('lang') || 'vi';
    return translate.use(savedLang).toPromise();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(), // Quan trọng cho các hiệu ứng chuyển động
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        }
        // Đã xóa defaultLanguage ở đây để tránh cảnh báo deprecated
      })
    ),
    // Provider đặc biệt để khởi tạo ngôn ngữ trước khi App render
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService],
      multi: true
    }
  ],
};