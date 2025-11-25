import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Thêm 'of'
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private apiUrl = `${environment.apiUrl}/api/batches`;

  constructor(private http: HttpClient) {}

  searchBatches(query: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, query);
  }

  getBatchById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createBatch(data: any, files: File[]): Observable<any> {
    const formData = new FormData();

    formData.append('product_id', data.product_id);
    formData.append('farm_id', data.farm_id);
    formData.append('production_date', data.production_date);
    
    if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
    if (data.origin_type) formData.append('origin_type', data.origin_type);
    
    // Gửi file lên với key 'files' (khớp backend upload.array('files'))
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    return this.http.post(this.apiUrl, formData);
  }

  // Placeholder cho Update/Delete (Backend chưa có)
  updateBatch(id: string | number, data: any): Observable<any> {
    console.warn('API Update chưa có, trả về thành công giả lập');
    return of({ success: true });
  }

  deleteBatch(id: string | number): Observable<any> {
    console.warn('API Delete chưa có, trả về thành công giả lập');
    return of({ success: true });
  }
}