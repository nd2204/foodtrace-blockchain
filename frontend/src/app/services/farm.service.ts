import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ENDPOINTS } from './api.service';
import { Farm, IPaginated, IResponse } from '../../core/types';

@Injectable({ providedIn: 'root' })
export class FarmService {
  constructor(private apiService: ApiService) { }

  search(query: any): Observable<IPaginated<Farm>> {
    return this.apiService.post<IPaginated<Farm>>(`${ENDPOINTS.FARM.SEARCH}`, query);
  }

  detail(id: string | number): Observable<IResponse<Farm>> {
    return this.apiService.get<IResponse<Farm>>(ENDPOINTS.FARM.BY_ID(id));
  }

  // Hàm lấy danh sách (Search)
  create(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('address', data.address);
    if (data.owner_name) formData.append('owner_name', data.owner_name);
    if (data.contact_email) formData.append('contact_email', data.contact_email);
    if (data.contact_phone) formData.append('contact_phone', data.contact_phone);
    if (data.website) formData.append('website', data.website);

    return this.apiService.post(`${ENDPOINTS.FARM.BASE}`, formData);
  }

  update(id: string | number, data: any): Observable<any> {
    return this.apiService.put(ENDPOINTS.FARM.BY_ID(id), data);
  }

  delete(id: string | number): Observable<any> {
    return this.apiService.delete(ENDPOINTS.FARM.BY_ID(id));
  }
}
