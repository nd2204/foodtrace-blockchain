import { APP_INITIALIZER, importProvidersFrom } from '@angular/core'; // Cần thêm APP_INITIALIZER
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpClient, HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'; // Cần thêm TranslateService
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initializeApp(translate: TranslateService) {
  return () => {
    // FIX: Sử dụng setDefaultLang thay vì defaultLanguage
    translate.setDefaultLang('vi');
    // Khởi tạo một lần để load ngôn ngữ mặc định
    return Promise.resolve();
  };
}


bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));