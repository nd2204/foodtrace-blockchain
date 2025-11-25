import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  // 1. Tìm kiếm / Lấy danh sách (cho trang danh sách)
  searchProducts(query: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, query);
  }

  // 👇 FIX: THÊM HÀM NÀY ĐỂ SỬA LỖI
  // 2. Lấy tất cả sản phẩm (cho dropdown chọn khi tạo batch)
  getAllProducts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // 3. Lấy chi tiết 1 sản phẩm (cho trang Sửa)
  getProductById(id: string | number): Observable<any> {
    // Nếu backend chưa có API GET /:id, dùng search tạm
    return this.http.post(`${this.apiUrl}/search`, { productId: id });
  }

  // 4. Tạo mới
  createProduct(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // 5. Cập nhật
  updateProduct(id: string | number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // 6. Xóa
  deleteProduct(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}