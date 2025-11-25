import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms'; // <--- Cần import FormsModule
import { BatchService } from '../../services/batches.service';
import { Batch, BatchQuery } from '../../../core/types';

@Component({
  selector: 'app-batches-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './batches-list.component.html',
  styleUrls: ['./batches-list.component.css'],
})
export class BatchesListComponent implements OnInit {
  searchTerm: string = ''; // Biến lưu từ khóa tìm kiếm
  isLoading: boolean = false;
  batches: Batch[] = [];
  errorMessage = '';
  openDropdownId: any = null;
  // State cho Bộ lọc
  isFilterVisible = false;
  filter = { code: '', product: '', farm: '', status: '', fromDate: '', toDate: '' };

  constructor(private batchService: BatchService) { }

  ngOnInit() { this.loadBatches(); }

  toggleFilter() { this.isFilterVisible = !this.isFilterVisible; }

  loadBatches() {
    const query: BatchQuery = {
      pageIndex: 1,
      pageSize: 20,
      filter: this.searchTerm,
      // Nếu bộ lọc đang mở thì lấy giá trị từ form, không thì rỗng
      batchNumber: this.isFilterVisible ? this.filter.code : '',
      productName: this.isFilterVisible ? this.filter.product : '',
      // farmName: this.isFilterVisible ? this.filter.farm : '',
      // status: this.isFilterVisible ? this.filter.status : '',
      // sortColumn: 'created_at',
      sortAscending: false
    };

    this.isLoading = true;
    this.batchService.search(query).subscribe({
      next: (value) => { this.batches = value.data },
      error: (err) => { console.log(err) },
      complete: () => { this.isLoading = false; }
    });
  }
  onSearch() { this.loadBatches(); }

  resetFilter() {
    this.filter = { code: '', product: '', farm: '', status: '', fromDate: '', toDate: '' };
    this.searchTerm = '';
    this.loadBatches();
  }

  toggleMenu(id: any, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu() { this.openDropdownId = null; }
}
