import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms'; // <--- Cần import FormsModule

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

  // Dữ liệu gốc
  allBatches = [
    {
      id: 1,
      code: 'LOT-2025-001',
      product: 'Rau xà lách',
      farm: 'Farm A',
      status: 'In farm',
      createdAt: '2025-11-01',
    },
    {
      id: 2,
      code: 'LOT-2025-002',
      product: 'Dâu tây',
      farm: 'Farm B',
      status: 'In transit',
      createdAt: '2025-11-02',
    },
    {
      id: 3,
      code: 'LOT-2025-003',
      product: 'Cà chua bi',
      farm: 'Farm A',
      status: 'Delivered',
      createdAt: '2025-11-05',
    },
  ];

  // Getter để lọc dữ liệu động
  get filteredBatches() {
    if (!this.searchTerm) {
      return this.allBatches;
    }
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.allBatches.filter(b => 
      b.code.toLowerCase().includes(lowerTerm) ||
      b.product.toLowerCase().includes(lowerTerm) ||
      b.farm.toLowerCase().includes(lowerTerm)
    );
  }
}