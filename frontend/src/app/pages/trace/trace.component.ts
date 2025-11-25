import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TraceService } from '../../services/trace.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-trace',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './trace.component.html',
  styleUrls: ['./trace.component.css']
})
export class TraceComponent {
  code = '';
  isLoading = false;
  errorMessage = '';

  // Dữ liệu hiển thị
  result: any = null;
  timelineEvents: any[] = [];

  constructor(
    private traceService: TraceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Lấy query param nếu có (vd: ?code=BATCH-123)
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.code = params['code'];
        this.trace();
      }
    });
  }

  trace() {
    if (!this.code.trim()) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.result = null;
    this.timelineEvents = [];

    // Cập nhật URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { code: this.code },
      queryParamsHandling: 'merge',
    });

    this.traceService.traceFullInfo(this.code).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.result = data;
        this.buildTimeline(data);
        console.log(data)
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Không tìm thấy lô hàng.';
      }
    });
  }

  // Chuyển đổi dữ liệu thô thành Timeline sự kiện
  private buildTimeline(data: any) {
    const events = [];

    // 1. Sự kiện Tạo Batch (Tại Farm)
    if (data.batch && data.batch.production_date) {
      events.push({
        label: 'Sản xuất / Thu hoạch',
        time: new Date(data.batch.production_date).toLocaleString(),
        location: data.farm ? data.farm.farm_name : 'Nông trại',
        actor: 'Farmer',
        status: 'done'
      });
    }

    // 2. Sự kiện Kiểm định (Lab Tests)
    if (data.lab_tests && data.lab_tests.length > 0) {
      data.lab_tests.forEach((test: any) => {
        events.push({
          label: `Kiểm định: ${test.test_type}`,
          time: new Date(test.test_date).toLocaleString(),
          location: 'Phòng Lab',
          actor: test.tested_by || 'QC',
          status: 'done',
          note: `Kết quả: ${test.result}`
        });
      });
    }

    // 3. Blockchain Timestamp (Nếu có)
    if (data.blockchain && data.blockchain.verified) {
      events.push({
        label: 'Xác thực Blockchain',
        time: data.blockchain.onChainTime
          ? new Date(parseInt(data.blockchain.onChainTime) * 1000).toLocaleString()
          : 'N/A',
        location: 'Blockchain Network',
        actor: 'System Smart Contract',
        status: 'done',
        isBlockchain: true
      });
    }

    // Sắp xếp theo thời gian mới nhất lên đầu
    this.timelineEvents = events.reverse();
  }
}
