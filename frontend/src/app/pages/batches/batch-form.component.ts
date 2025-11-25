import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BatchService } from '../../services/batch.service';
import { ProductService } from '../../services/product.service';
import { FarmService } from '../../services/farm.service';

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './batch-form.component.html',
  styleUrls: ['./batch-form.component.css']
})
export class BatchFormComponent implements OnInit {
  isLoading = false;

  // Model dữ liệu
  batch = {
    product_id: '',
    farm_id: '',
    production_date: '',
    expiry_date: '',
    origin_type: ''
  };

  selectedFiles: File[] = [];
  products: any[] = [];
  farms: any[] = [];

  constructor(
    private batchService: BatchService,
    private productService: ProductService,
    private farmService: FarmService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    // 1. Load danh sách Sản phẩm
    this.productService.getAllProducts().subscribe({
      next: (res: any) => {
        this.products = res.data || [];
      },
      error: (err: any) => console.error('Lỗi load sản phẩm', err)
    });

    // 2. Load danh sách Nông trại
    this.farmService.search({ pageIndex: 1, pageSize: 100 }).subscribe({
      next: (res: any) => {
        this.farms = res.data || [];
      },
      error: (err: any) => console.error('Lỗi load nông trại', err)
    });
  }

  // FIX LỖI: Xử lý sự kiện chọn file an toàn hơn
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit() {
    if (!this.batch.product_id || !this.batch.farm_id || !this.batch.production_date) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc (*)!');
      return;
    }

    this.isLoading = true;

    this.batchService.createBatch(this.batch, this.selectedFiles).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert('Tạo lô hàng thành công!');
        this.router.navigate(['/batches']);
      },
      error: (err: any) => {
        this.isLoading = false;
        // Hiển thị lỗi chi tiết từ backend
        const msg = err.error?.error || 'Không thể tạo lô hàng';
        alert('Lỗi: ' + msg);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
