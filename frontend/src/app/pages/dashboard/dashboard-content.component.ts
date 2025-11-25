import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';

import {
  DashboardService,
  DashboardSummary,
  FarmLocation, // FIX: Bây giờ đã import được
} from '../../services/dashboard.service';

// Fix icon Leaflet
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
  styleUrls: ['./dashboard-content.component.css']
})
export class DashboardContentComponent implements OnInit, OnDestroy {
  // FIX: Khởi tạo mặc định đúng với interface mới
  summary: DashboardSummary = { farms: 0, batches: 0, products: 0 };
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
      next: (data) => {
        this.summary = data;
        this.isLoading = false;
      },
      error: () => {
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
    // Tọa độ trung tâm Việt Nam
    this.map = L.map('dashboard-map', {
      zoomControl: true,
    }).setView([16.047079, 108.20623], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  private renderFarmsOnMap() {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    this.farms.forEach((farm) => {
      // Kiểm tra tọa độ hợp lệ
      if (farm.lat && farm.lng) {
        const marker = L.marker([farm.lat, farm.lng]);
        marker.bindPopup(
          `<strong>${farm.name}</strong><br/>
           ${farm.address}<br/>
           <span style="color:green">${farm.status}</span>`
        );
        marker.addTo(this.markersLayer!);
      }
    });

    if (this.farms.length > 0) {
      const bounds = L.latLngBounds(
        this.farms.map((f) => [f.lat, f.lng] as [number, number])
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}