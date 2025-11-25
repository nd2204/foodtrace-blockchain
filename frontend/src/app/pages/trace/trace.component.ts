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
  result: any = null;
  timelineEvents: any[] = [];

  constructor(
    private traceService: TraceService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['batch_number']) {
        this.code = params['batch_number'];
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

  private buildTimeline(data: any) {
    const events = [];

    // 1. Gieo trồng / Sản xuất
    if (data.batch && data.batch.production_date) {
      events.push({
        label: 'Gieo trồng & Thu hoạch',
        time: new Date(data.batch.production_date).toLocaleString('vi-VN'),
        location: data.farm ? data.farm.farm_name : 'Nông trại',
        actor: data.farm?.owner_name || 'Nông dân',
        status: 'done'
      });
    }

    // 2. Kiểm định chất lượng
    if (data.lab_tests && data.lab_tests.length > 0) {
      data.lab_tests.forEach((test: any) => {
        events.push({
          label: `Kiểm định: ${test.test_type}`,
          time: new Date(test.test_date).toLocaleString('vi-VN'),
          location: 'Trung tâm kiểm định',
          actor: test.tested_by || 'QC',
          status: 'done',
          note: `Kết quả: ${test.result}`
        });
      });
    }

    // --- FAKE EVENTS (Chỉ thêm vào nếu là mã Demo để timeline đẹp hơn) ---
    if (data.batch?.batch_number === 'LOT-2025-001') {
      events.push({
        label: 'Đóng gói & Dán tem',
        time: '21/11/2025, 14:00:00',
        location: 'Xưởng đóng gói Đà Lạt',
        actor: 'Nhân viên đóng gói',
        status: 'done'
      });
      events.push({
        label: 'Vận chuyển',
        time: '21/11/2025, 20:00:00',
        location: 'Đang di chuyển đến TP.HCM',
        actor: 'Đơn vị vận chuyển FastShip',
        status: 'done' // Có thể là 'in_transit'
      });
    }
    // ---------------------------------------------------------------------

    // 3. Blockchain Verification
    if (data.blockchain && data.blockchain.verified) {
      // Nếu là fake timestamp (string) thì parse int, nếu là date thì giữ nguyên
      let timeDisplay = 'N/A';
      if (data.blockchain.onChainTime) {
        const timestamp = parseInt(data.blockchain.onChainTime);
        // Nếu timestamp nhỏ (seconds) thì nhân 1000, nếu lớn (ms) thì giữ nguyên
        const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
        timeDisplay = date.toLocaleString('vi-VN');
      }

      events.push({
        label: 'Xác thực trên Blockchain',
        time: timeDisplay,
        location: 'FoodTrace Smart Contract',
        actor: 'Hệ thống',
        status: 'done',
        isBlockchain: true
      });
    }

    // Đảo ngược để cái mới nhất lên đầu
    this.timelineEvents = events.reverse();
  }
}
