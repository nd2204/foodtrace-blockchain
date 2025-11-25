import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService, ENDPOINTS } from './api.service';
import { Farm, IPaginated } from '../../core/types';

@Injectable({ providedIn: 'root' })
export class FarmService {
  constructor(private apiService: ApiService) { }

  // Hàm tạo nông trại có upload file
  create(data: any, files: File[]): Observable<any> {
    const formData = new FormData();

    // Append các trường text
    formData.append('name', data.name);
    formData.append('address', data.address);
    formData.append('owner_name', data.ownerName);
    formData.append('contact_email', data.email);
    formData.append('contact_phone', data.phone);

    // Append file (Key là 'files' giống backend multer config)
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    return this.apiService.post(`${ENDPOINTS.FARM.BASE}`, formData);
  }

  // Hàm lấy danh sách (Search)
  search(query: any): Observable<IPaginated<Farm>> {
    return this.apiService.post<IPaginated<Farm>>(`${ENDPOINTS.FARM.SEARCH}`, query);
  }
}
