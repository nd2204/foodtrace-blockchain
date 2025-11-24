// src/app/pages/dashboard/dashboard-content.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';

import {
  DashboardService,
  DashboardSummary,
  FarmLocation,
} from '../../services/dashboard.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

(L.Marker.prototype.options.icon as any) = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

@Component({
  standalone: true,
  selector: 'app-dashboard-content',
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard-content.component.html',
  // 👇 QUAN TRỌNG: Dòng này giúp Component nhận diện file CSS mới tạo
  styleUrls: ['./dashboard-content.component.css'] 
})
export class DashboardContentComponent implements OnInit, OnDestroy {
  summary: DashboardSummary | null = null;
  farms: FarmLocation[] = [];
  isLoading = false;

  private map?: L.Map;
  private markersLayer?: L.LayerGroup;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadFarms();
    this.initMap(); 
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadSummary() {
    this.isLoading = true;
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.isLoading = false;
      },
      error: () => {
        this.summary = { farms: 0, batches: 0, policies: 0, sessions: 0 };
        this.isLoading = false;
      },
    });
  }

  private loadFarms() {
    this.dashboardService.getFarmLocations().subscribe({
      next: (farms) => {
        this.farms = farms;
        this.renderFarmsOnMap();
      },
      error: () => {
        this.farms = [];
      },
    });
  }

  private initMap() {
    this.map = L.map('dashboard-map', {
      zoomControl: true,
    }).setView([16.047079, 108.20623], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    if (this.farms.length) {
      this.renderFarmsOnMap();
    }
  }

  private renderFarmsOnMap() {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    this.farms.forEach((farm) => {
      const marker = L.marker([farm.lat, farm.lng]);

      marker.bindPopup(
        `<strong>${farm.name}</strong><br/>
         Khu vực: ${farm.region}<br/>
         Trạng thái: ${farm.status}`
      );
      marker.addTo(this.markersLayer!);
    });

    if (this.farms.length) {
      const bounds = L.latLngBounds(
        this.farms.map((f) => [f.lat, f.lng] as [number, number])
      );
      this.map!.fitBounds(bounds, { padding: [24, 24] });
    }
  }
}