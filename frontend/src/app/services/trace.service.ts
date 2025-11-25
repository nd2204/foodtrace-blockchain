import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService, ENDPOINTS } from './api.service';

@Injectable({ providedIn: 'root' })
export class TraceService {
  constructor(private apiService: ApiService) { }

  /**
   * Gọi đồng thời 2 API để lấy full thông tin:
   * 1. Thông tin cơ bản (Batch, Product, LabTests)
   * 2. Thông tin chi tiết (Blockchain, Farm, Media)
   */
  traceFullInfo(batchCode: string): Observable<any> {
    const basic$ = this.apiService.get<any>(
      ENDPOINTS.TRACE.TRACE_BATCH_NUMBER(batchCode)
    ).pipe(
      catchError(err => of({ error: true, msg: 'Không tìm thấy thông tin cơ bản' }))
    );

    const details$ = this.apiService.get<any>(
      ENDPOINTS.TRACE.TRACE_BATCH_NUMBER_DETAILED(batchCode),
    ).pipe(
      catchError(err => of({ error: true, msg: 'Không tìm thấy thông tin chi tiết' }))
    );

    return forkJoin([basic$, details$]).pipe(
      map(([basicRes, detailRes]) => {
        // Kiểm tra nếu cả 2 đều lỗi
        if (basicRes.error && detailRes.error) {
          throw new Error('Không tìm thấy lô hàng này.');
        }

        // Merge dữ liệu lại
        return {
          ...basicRes.data,   // batch, product, lab_tests
          ...detailRes.data   // farm, media_files, blockchain
        };
      })
    );
  }
}
