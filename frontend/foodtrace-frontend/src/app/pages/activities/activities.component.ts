import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core'; // QUAN TRỌNG

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, TranslateModule], // QUAN TRỌNG
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent {
  activities = [
    {
      time: '2025-11-17 10:30',
      type: 'Batch created',
      farmName: 'Farm A',
      status: 'OK',
    },
    {
      time: '2025-11-17 12:10',
      type: 'Shipment departed',
      farmName: 'Farm B',
      status: 'In transit',
    },
  ];
}