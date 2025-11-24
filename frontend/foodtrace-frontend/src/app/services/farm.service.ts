import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FarmService {
  private apiUrl = `${environment.apiUrl}/api/farms`;

  constructor(private http: HttpClient) {}

  // Hàm tạo nông trại có upload file
  createFarm(data: any, files: File[]): Observable<any> {
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

    return this.http.post(`${this.apiUrl}/create`, formData);
  }

  // Hàm lấy danh sách (Search)
  searchFarms(query: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, query);
  }
}