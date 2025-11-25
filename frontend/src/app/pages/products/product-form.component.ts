import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './product-form.component.html',
  // CSS riêng cho form để đẹp hơn
  styles: [`
    .page { padding: 32px; max-width: 800px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .btn-back { background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; cursor: pointer; color: #64748b; font-weight: 500; transition: all 0.2s; }
    .btn-back:hover { background: #f1f5f9; color: #0f172a; }
    h1 { margin: 0; font-size: 24px; color: #111827; }
    
    .form-card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .form-group { margin-bottom: 24px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #374151; font-size: 14px; }
    .form-control { width: 100%; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; background: #fff; }
    .form-control:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1); }
    textarea.form-control { min-height: 120px; resize: vertical; font-family: inherit; }
    
    .form-actions { margin-top: 32px; display: flex; justify-content: flex-end; gap: 16px; border-top: 1px solid #f3f4f6; padding-top: 24px; }
    .btn-cancel { background: white; border: 1px solid #d1d5db; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; color: #4b5563; }
    .btn-cancel:hover { background: #f9fafb; }
    .btn-save { background: #22c55e; border: none; padding: 10px 32px; border-radius: 8px; cursor: pointer; font-weight: 600; color: white; }
    .btn-save:hover { background: #16a34a; }
    .btn-save:disabled { background: #9ca3af; cursor: not-allowed; }
  `]
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId: any = null;
  isLoading = false;

  // Model dữ liệu
  product = {
    name: '',
    description: '',
    origin: '',
    category_id: '', // Lưu ID danh mục được chọn
    status: 'active'
  };

  categories: any[] = []; // Danh sách danh mục để chọn

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    // 1. Load danh mục để đổ vào dropdown
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
      }
    });

    // 2. Kiểm tra xem có phải đang Sửa không (có ID trên URL)
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.loadProductData(this.productId);
      }
    });
  }

  // Load dữ liệu cũ lên form
  loadProductData(id: any) {
    this.isLoading = true;
    // Backend của bạn có thể chưa có API getById chuẩn, nên ta dùng search tạm
    // Hoặc nếu có: this.productService.getProductById(id)
    this.productService.searchProducts({ productId: id }).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          const data = res.data[0];
          this.product = {
            name: data.name,
            description: data.description,
            origin: data.origin,
            category_id: data.category_id,
            status: data.status
          };
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSubmit() {
    if (!this.product.name) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      // CẬP NHẬT
      this.productService.updateProduct(this.productId, this.product).subscribe({
        next: () => {
          alert('Cập nhật thành công!');
          this.goBack();
        },
        error: (err) => {
          alert('Lỗi: ' + (err.error?.error || 'Unknown'));
          this.isLoading = false;
        }
      });
    } else {
      // TẠO MỚI
      this.productService.createProduct(this.product).subscribe({
        next: () => {
          alert('Thêm mới thành công!');
          this.goBack();
        },
        error: (err) => {
          alert('Lỗi: ' + (err.error?.error || 'Unknown'));
          this.isLoading = false;
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}