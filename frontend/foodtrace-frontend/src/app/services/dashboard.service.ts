// src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Tóm tắt dashboard – dùng cho 4 ô vùng (1) trên đầu
export interface DashboardSummary {
  farms: number;
  batches: number;
  policies: number;
  sessions: number;
}

// Vị trí nông trại hiển thị trên map
export interface FarmLocation {
  id: string;
  name: string;
  region: string;   // Bắc / Trung / Nam, hay tên tỉnh
  lat: number;
  lng: number;
  status: 'active' | 'warning' | 'inactive';
}

// Dòng lịch sử hoạt động
export interface RecentActivity {
  id: string;
  time: string;     // ISO datetime
  type: string;
  farmName: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // sau này có API thì trỏ baseUrl vào đây
  private readonly apiBase = '/api/dashboard';

  constructor(private http: HttpClient) {}

  // --- MOCK DATA: tạm thời dùng of(...) để FE chạy được ---

  getSummary(): Observable<DashboardSummary> {
    const mock: DashboardSummary = {
      farms: 17,
      batches: 3,
      policies: 6,
      sessions: 3,
    };
    return of(mock);
    // sau này: return this.http.get<DashboardSummary>(`${this.apiBase}/summary`);
  }

  getFarmLocations(): Observable<FarmLocation[]> {
    const mock: FarmLocation[] = [
      {
        id: 'farm-1',
        name: 'HTX Rau Sạch Đà Lạt',
        region: 'Lâm Đồng',
        lat: 11.938,
        lng: 108.458,
        status: 'active',
      },
      {
        id: 'farm-2',
        name: 'Trang trại lúa Đồng Tháp',
        region: 'Đồng Tháp',
        lat: 10.493,
        lng: 105.688,
        status: 'active',
      },
      {
        id: 'farm-3',
        name: 'Trang trại chăn nuôi Bắc Ninh',
        region: 'Bắc Ninh',
        lat: 21.179,
        lng: 106.051,
        status: 'warning',
      },
      {
        id: 'farm-4',
        name: 'Vùng cây ăn trái Tiền Giang',
        region: 'Tiền Giang',
        lat: 10.354,
        lng: 106.365,
        status: 'active',
      },
    ];
    return of(mock);
    // sau này: return this.http.get<FarmLocation[]>(`${this.apiBase}/farms`);
  }

  getRecentActivities(): Observable<RecentActivity[]> {
    const now = new Date();
    const mock: RecentActivity[] = [
      {
        id: 'act-1',
        time: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        type: 'New batch created',
        farmName: 'HTX Rau Sạch Đà Lạt',
        status: 'Success',
      },
      {
        id: 'act-2',
        time: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        type: 'Shipment scanned',
        farmName: 'Trang trại lúa Đồng Tháp',
        status: 'In transit',
      },
      {
        id: 'act-3',
        time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        type: 'Policy updated',
        farmName: 'Vùng cây ăn trái Tiền Giang',
        status: 'Updated',
      },
    ];
    return of(mock);
    // sau này: return this.http.get<RecentActivity[]>(`${this.apiBase}/activities`);
  }
}
