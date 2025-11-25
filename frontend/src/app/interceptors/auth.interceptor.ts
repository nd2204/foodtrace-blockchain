import { inject, Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService);
  const router = inject(Router)

  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token.getToken()}`)
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error for:', req.url);
      console.error('Error Status:', error.status);
      console.error('Error Body:', error.error);
      if (error.status === 401) {
        router.navigate(["/login"])
      }

      // Add your global error handling logic here (e.g., show a notification)
      // Example: this is where you might inject a NotificationService

      // Re-throw the error so downstream components/services can still handle it if needed
      return throwError(() => error);
    })
  );
};
