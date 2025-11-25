import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms'; // <--- Cần import FormsModule
import { BatchService } from '../../services/batches.service';
import { Batch } from '../../../core/types';

@Component({
  selector: 'app-batches-list',
  standalone: true,
  // Nhớ thêm FormsModule vào imports
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './batches-list.component.html',
  styleUrls: ['./batches-list.component.css'],
})
export class BatchesListComponent {
  searchTerm: string = ''; // Biến lưu từ khóa tìm kiếm
  isLoading: boolean = false;
  batches: Batch[] = [];
  errorMessage = '';

  constructor(private batchService: BatchService) {
    this.isLoading = true;
    this.batchService.search().subscribe({
      next: (value) => { this.batches = value.data },
      error: (err) => { console.log(err) },
      complete: () => { this.isLoading = false; }
    });
  }

  // Getter để lọc dữ liệu động
  get filteredBatches() {
    if (!this.searchTerm) {
      return this.batches;
    }
    const lowerTerm = this.searchTerm.toLowerCase();
    // TODO: switch to search api
    return this.batches.filter(b =>
      b.product_name.toLowerCase().includes(lowerTerm) ||
      b.farm_name.toLowerCase().includes(lowerTerm)
    );
  }
}
