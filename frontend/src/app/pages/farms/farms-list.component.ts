import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { FarmService } from '../../services/farm.service';
import { Farm } from '../../../core/types';

@Component({
  selector: 'app-farms-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule, FormsModule],
  templateUrl: './farms-list.component.html',
  styleUrls: ['./farms-list.component.css'],
})
export class FarmsListComponent {
  searchTerm: string = '';
  farms: Farm[] = [];
  isLoading: boolean;

  constructor(
    private farmService: FarmService
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

  get filteredFarms() {
    if (!this.searchTerm) return this.farms;
    const lowerTerm = this.searchTerm.toLowerCase();
    return this.farms.filter(f =>
      f.name.toLowerCase().includes(lowerTerm) ||
      f.owner_name.toLowerCase().includes(lowerTerm) ||
      f.address.toLowerCase().includes(lowerTerm)
    );
  }
}
