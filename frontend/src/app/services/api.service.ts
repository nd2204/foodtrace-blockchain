import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch } from '../../core/types';

export const ENDPOINTS = {
  AUTH: {
    BASE: "auth",
    LOGIN: "auth/login",
    REGISTER: "auth/register",
    VERIFY_CODE: "auth/verify-code",
    FORGOT_PASSWORD: "auth/forgot-password",
    RESET_PASSWORD: "auth/reset-password",
  },
  FARM: {
    BASE: "farms",
    BY_ID: (id: string | number) => `farms/${id}`,
    SEARCH: "farms/search"
  },
  BATCH: {
    BASE: "batches",
    SEARCH: "batches/search",
    DETAIL: (id: number) => `batches/${id}`
  },
  TRACE: {
    BASE: "trace",
    TRACE_BATCH_NUMBER: (batch_number: Batch["batch_number"]) => `trace/${batch_number}`,
    TRACE_BATCH_NUMBER_DETAILED: (batch_number: Batch["batch_number"]) => `trace/${batch_number}/details`
  }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private client: HttpClient) { }

  public post<T>(endpoint: string, body: any): Observable<any> {
    return this.client.post<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  public get<T>(endpoint: string) {
    return this.client.get<T>(`${this.apiUrl}/${endpoint}`);
  }

  public put<T>(endpoint: string, body: any): Observable<any> {
    return this.client.put<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  public delete<T>(endpoint: string): Observable<any> {
    return this.client.delete<T>(`${this.apiUrl}/${endpoint}`);
  }
}
