import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    SEARCH: "farms/search"
  }
}

@Injectable({ providedIn: 'root'})
export class ApiService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private client: HttpClient) {}

  public post(endpoint: string, body: any): Observable<any> {
    return this.client.post(`${this.apiUrl}/${endpoint}`, body);
  }

  public get(endpoint: string) {
    return this.client.get(`${this.apiUrl}/${endpoint}`);
  }

  public put(endpoint: string, body: any): Observable<any> {
    return this.client.put(`${this.apiUrl}/${endpoint}`, body);
  }

  public delete(endpoint: string): Observable<any> {
    return this.client.delete(`${this.apiUrl}/${endpoint}`);
  }
}