import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ENDPOINTS } from './api.service';
import { IPaginated, IResponse, Product } from '../../core/types';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private apiService: ApiService) { }

  search(query: any): Observable<IPaginated<Product>> {
    return this.apiService.post<IPaginated<Product>>(ENDPOINTS.PRODUCTS.SEARCH, query);
  }

  getAll(): Observable<any> {
    return this.apiService.get(ENDPOINTS.PRODUCTS.BASE);
  }

  detail(id: string | number): Observable<IResponse<Product>> {
    return this.apiService.get<IResponse<Product>>(ENDPOINTS.PRODUCTS.BY_ID(id));
  }

  create(data: any): Observable<any> {
    return this.apiService.post<IResponse<Product>>(ENDPOINTS.PRODUCTS.BASE, data);
  }

  update(id: string | number, data: any): Observable<any> {
    return this.apiService.put(ENDPOINTS.PRODUCTS.BY_ID(id), data);
  }

  delete(id: string | number): Observable<any> {
    return this.apiService.delete(ENDPOINTS.PRODUCTS.BY_ID(id));
  }
}
