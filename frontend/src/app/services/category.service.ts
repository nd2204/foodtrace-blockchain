import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/api/categories`;
  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<any> { return this.http.get(this.apiUrl); }
  searchCategories(query: any): Observable<any> { return this.http.post(`${this.apiUrl}/search`, query); }
  getCategoryById(id: any): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`); } // Nếu backend chưa có, dùng getAll rồi filter
  createCategory(data: any): Observable<any> { return this.http.post(this.apiUrl, data); }
  updateCategory(id: any, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, data); }
  deleteCategory(id: any): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}