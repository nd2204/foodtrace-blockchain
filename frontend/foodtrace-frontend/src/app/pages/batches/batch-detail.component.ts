import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
// FIX: Import TranslateModule để sử dụng pipe 'translate' trong HTML
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-batch-detail',
  standalone: true,
  // FIX: Thêm TranslateModule vào mảng imports
  imports: [CommonModule, TranslateModule], 
  templateUrl: './batch-detail.component.html',
  styleUrls: ['./batch-detail.component.css'],
})
export class BatchDetailComponent {
  batchId!: string;

  // ... (phần còn lại giữ nguyên)
  batch = {
    code: 'LOT-2025-001',
    productName: 'Dâu tây hữu cơ FoodTrace',
    farmName: 'Farm A - Đà Lạt',
    facilityName: 'Facility B - Lâm Đồng',
    quantity: 1200,
    unit: 'kg',
    harvestedAt: '2025-10-10 09:30',
    producedAt: '2025-10-11 14:00',
    status: 'In transit',
  };

  timeline = [
    {
      label: 'Tạo batch bởi Farmer',
      time: '2025-10-01 08:00',
      by: 'Nguyễn Văn A',
    },
    {
      label: 'Cập nhật thông tin thu hoạch',
      time: '2025-10-10 09:30',
      by: 'QC Team',
    },
    {
      label: 'Xử lý & đóng gói',
      time: '2025-10-11 14:00',
      by: 'Packaging Center',
    },
    {
      label: 'Push record lên Blockchain',
      time: '2025-10-11 14:05',
      by: 'System',
    },
  ];

  constructor(private route: ActivatedRoute) {
    this.batchId = this.route.snapshot.params['id'];
  }
}