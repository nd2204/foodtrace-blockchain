import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FarmService } from '../../services/farm.service';
import { Farm, FarmQuery } from '../../../core/types';

@Component({
  selector: 'app-farms-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FormsModule],
  templateUrl: './farms-list.component.html',
  styleUrls: ['./farms-list.component.css'],
})
export class FarmsListComponent implements OnInit {
  searchTerm: string = '';
  farms: Farm[] = [];
  isLoading: boolean;
  openDropdownId: any = null;
  isFilterVisible = false;
  filter = { name: '', owner: '', province: '', status: '' };

  constructor(
    private farmService: FarmService,
    private router: Router
  ) {
    this.isLoading = true;
    this.farmService.search(this.searchTerm).subscribe({
      next: (value) => {
        this.farms = value.data;
        console.log(value)
      },
      error: (err) => { console.log(err) },
      complete: () => { this.isLoading = false }
    });
  }

  ngOnInit() { this.loadFarms(); }

  toggleFilter() { this.isFilterVisible = !this.isFilterVisible; }

  loadFarms() {
    const query: FarmQuery = {
      pageIndex: 1, pageSize: 20,
      filter: this.searchTerm,
      farmName: this.isFilterVisible ? this.filter.name : '',
      province: this.isFilterVisible ? this.filter.province : '',
      sortColumn: 'created_at', sortAscending: false
    };
    this.farmService.search(query).subscribe({
      next: (res) => { this.farms = res.data || []; }
    });
  }

  onSearch() { this.loadFarms(); }

  resetFilter() {
    this.filter = { name: '', owner: '', province: '', status: '' };
    this.searchTerm = '';
    this.loadFarms();
  }

  editFarm(id: any) {
    this.router.navigate(['/farms/edit', id]);
  }

  deleteFarm(id: any) {
    if (confirm('Bạn có chắc chắn muốn xóa nông trại này?')) {
      this.farmService.delete(id).subscribe({
        next: () => {
          alert('Đã xóa thành công!');
          this.loadFarms();
          this.openDropdownId = null;
        },
        error: (err) => alert('Lỗi xóa: ' + err.error?.error)
      });
    }
  }

  toggleMenu(id: any, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  @HostListener('document:click')
  closeMenu() { this.openDropdownId = null; }
}
