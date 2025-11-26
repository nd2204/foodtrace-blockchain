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
  styles: './product-form.component.css'
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
    category_name: '',
    status: 'active'
  };

  categories: any[] = []; // Danh sách danh mục để chọn

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

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
    this.productService.search({ productId: id }).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          const data = res.data[0];
          this.product = {
            name: data.name,
            description: data.description,
            origin: data.origin,
            category_name: data.category_name,
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
      this.productService.update(this.productId, this.product).subscribe({
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
      this.productService.create(this.product).subscribe({
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
