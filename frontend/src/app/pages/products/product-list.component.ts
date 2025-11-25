import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  openDropdownId: any = null;
  searchTerm = '';

  // FIX: Thêm các biến cho bộ lọc
  isFilterVisible = false;
  filter = { name: '', category: '', status: '' };

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  // FIX: Hàm bật tắt bộ lọc
  toggleFilter() { this.isFilterVisible = !this.isFilterVisible; }

  loadProducts() {
    const query = {
      pageIndex: 1,
      pageSize: 20,
      filter: this.searchTerm,
      // FIX: Thêm tham số lọc nâng cao
      name: this.isFilterVisible ? this.filter.name : '',
      // categoryId: ... nếu muốn lọc theo danh mục
      sortColumn: 'created_at',
      sortAscending: false
    };
    this.productService.searchProducts(query).subscribe({
      next: (res) => {
        this.products = res.data || [];
      }
    });
  }

  onSearch() {
    this.loadProducts();
  }

  // FIX: Hàm reset bộ lọc
  resetFilter() {
    this.filter = { name: '', category: '', status: '' };
    this.searchTerm = '';
    this.loadProducts();
  }

  editProduct(id: any) {
    this.router.navigate(['/products/edit', id]);
  }

  deleteProduct(id: any) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert('Đã xóa thành công!');
          this.loadProducts();
          this.openDropdownId = null;
        },
        error: (err) => alert('Lỗi xóa: ' + (err.error?.error || 'Lỗi server'))
      });
    }
  }

  toggleMenu(id: any, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu() {
    this.openDropdownId = null;
  }
}