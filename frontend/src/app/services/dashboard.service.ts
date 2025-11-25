import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardSummary {
  farms: number;
  products: number;
  batches: number;
}

export interface FarmLocation {
  id: string | number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api/dashboard`;
  private farmApiUrl = `${environment.apiUrl}/api/farms`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<any>(`${this.apiUrl}/summary`).pipe(
      map(res => res.data),
      catchError(() => of({ farms: 0, products: 0, batches: 0 }))
    );
  }

  // Lấy danh sách farm có tọa độ để vẽ bản đồ
  getFarmLocations(): Observable<FarmLocation[]> {
    return this.http.post<any>(`${this.farmApiUrl}/search`, { pageIndex: 1, pageSize: 100 }).pipe(
      map(res => {
        const farms = res.data || [];
        return farms
          .filter((f: any) => f.latitude && f.longitude)
          .map((f: any) => ({
            id: f.farm_id,
            name: f.name,
            address: f.address,
            lat: parseFloat(f.latitude),
            lng: parseFloat(f.longitude),
            status: f.is_active ? 'Active' : 'Inactive'
          }));
      }),
      catchError(() => of([]))
    );
  }
}