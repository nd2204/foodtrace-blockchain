import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-farms-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, FormsModule],
  templateUrl: './farms-list.component.html',
  styleUrls: ['./farms-list.component.css'],
})
export class FarmsListComponent {
  searchTerm: string = '';

  allFarms = [
    { id: 1, name: 'Farm A', province: 'Đà Lạt', owner: 'Nguyễn Văn A', status: 'active' },
    { id: 2, name: 'Farm B', province: 'Lâm Đồng', owner: 'Trần Thị B', status: 'warning' },
    { id: 3, name: 'Green Farm', province: 'Đồng Nai', owner: 'Lê Văn C', status: 'active' },
  ];

  get filteredFarms() {
    if (!this.searchTerm) return this.allFarms;
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.allFarms.filter(f => 
      f.name.toLowerCase().includes(lowerTerm) || 
      f.owner.toLowerCase().includes(lowerTerm) ||
      f.province.toLowerCase().includes(lowerTerm)
    );
  }
}