import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService, ENDPOINTS } from './api.service';

@Injectable({ providedIn: 'root' })
export class TraceService {
  constructor(private apiService: ApiService) { }

  /**
   * Gọi API lấy thông tin.
   */
  traceFullInfo(batchCode: string): Observable<any> {
    // --- MOCK DATA CHO DEMO ---
    // -----------------------------
    if (batchCode === 'LOT-2025-001') {
      return of({
        batch: {
          batch_number: 'LOT-2025-001',
          production_date: '2025-11-20T08:00:00Z',
          expiry_date: '2025-12-20T08:00:00Z',
        },
        product: {
          name: 'Dâu Tây Giống Nhật (Hữu Cơ)',
          description: 'Dâu tây được trồng theo tiêu chuẩn VietGAP, không thuốc trừ sâu, ngọt đậm đà.',
          origin: 'Đà Lạt, Lâm Đồng'
        },
        farm: {
          farm_name: 'Nông Trại Rau Sạch Đà Lạt',
          address: 'Phường 12, Thành phố Đà Lạt, Lâm Đồng',
          owner: 'Nguyễn Văn A'
        },
        lab_tests: [
          {
            test_type: 'Kiểm định dư lượng Nitrat',
            result: 'Đạt chuẩn (Negative)',
            test_date: '2025-11-21T10:30:00Z',
            tested_by: 'Trung tâm kiểm định Lâm Đồng'
          }
        ],
        media_files: [], // Có thể thêm link ảnh nếu muốn
        blockchain: {
          verified: true,
          blockchain_tx: '0x8f9a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8',
          onChainTime: '1732180000' // Timestamp giả
        }
      });
    }

    // Gọi API thật nếu không phải mã demo
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
        if (basicRes.error && detailRes.error) {
          throw new Error('Không tìm thấy dữ liệu cho lô hàng này.');
        }
        return {
          ...basicRes.data,
          ...detailRes.data
        };
      })
    );
  }
}
