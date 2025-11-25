import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit {
  isEditMode = false;
  categoryId: any = null;
  isLoading = false;
  category = { name: '', description: '' };

  constructor(private categoryService: CategoryService, private route: ActivatedRoute, private location: Location) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.categoryId = params['id'];
        // Load data nếu cần
      }
    });
  }

  onSubmit() {
    if (!this.category.name) return alert('Nhập tên danh mục');
    this.isLoading = true;
    const obs = this.isEditMode 
      ? this.categoryService.updateCategory(this.categoryId, this.category)
      : this.categoryService.createCategory(this.category);
    
    obs.subscribe({
      next: () => { alert('Thành công'); this.goBack(); },
      error: () => { this.isLoading = false; alert('Lỗi'); }
    });
  }

  goBack() { this.location.back(); }
}