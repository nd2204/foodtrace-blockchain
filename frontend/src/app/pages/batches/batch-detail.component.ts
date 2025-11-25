import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // Thêm Location
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BatchService } from '../../services/batches.service';
import { BatchDetail } from '../../../core/types';

@Component({
  selector: 'app-batch-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './batch-detail.component.html',
  styleUrls: ['./batch-detail.component.css']
})
export class BatchDetailComponent {
  private id: number;
  data: BatchDetail = {
    blockchain_verification: {
      onChainHash: '',
      onChainTime: new Date(),
      match: false
    },
    applied_license_id: 0,
    batch_id: 0,
    batch_number: '',
    blockchain_tx: '',
    farm_id: 0,
    farm_name: '',
    origin_type: '',
    product_id: 0,
    product_name: '',
    proof_hash: '',
    updated_at: new Date(),
    created_at: new Date(),
    expiry_date: new Date(),
    production_date: new Date(),
    created_by: null,
    updated_by: null
  };

  // timeline = [
  //   {
  //     label: 'Tạo batch bởi Farmer',
  //     time: '2025-10-01 08:00',
  //     by: 'Nguyễn Văn A',
  //   },
  //   {
  //     label: 'Cập nhật thông tin thu hoạch',
  //     time: '2025-10-10 09:30',
  //     by: 'QC Team',
  //   },
  //   {
  //     label: 'Xử lý & đóng gói',
  //     time: '2025-10-11 14:00',
  //     by: 'Packaging Center',
  //   },
  //   {
  //     label: 'Push record lên Blockchain',
  //     time: '2025-10-11 14:05',
  //     by: 'System',
  //   },
  // ];

  constructor(
    private route: ActivatedRoute,
    private batchService: BatchService,
    private location: Location // Inject Location
  ) {
    this.id = this.route.snapshot.params['id'];
    this.batchService.detail(this.id).subscribe({
      next: (value) => {
        this.data = value.data;
        console.log(value);
      },
      error: (err) => { console.log(err) },
      complete: () => { }
    })
  }

  goBack() {
    this.location.back();
  }
}
