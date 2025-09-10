import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { importProvidersFrom } from '@angular/core';
import { DataService, DashboardData } from './services/data.service';
import { ThemeService } from './services/theme.service';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { DonutChartComponent } from './components/donut-chart/donut-chart.component';
import { GroupedBarChartComponent } from './components/grouped-bar-chart/grouped-bar-chart.component';
import { AreaChartComponent } from './components/area-chart/area-chart.component';
import { HorizontalBarChartComponent } from './components/horizontal-bar-chart/horizontal-bar-chart.component';
import { HeatmapCalendarComponent } from './components/heatmap-calendar/heatmap-calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardsComponent,
    LineChartComponent,
    BarChartComponent,
    DonutChartComponent,
    GroupedBarChartComponent,
    AreaChartComponent,
    HorizontalBarChartComponent,
    HeatmapCalendarComponent
  ],
  template: `
    <div style="min-height: 100vh; background-color: var(--primary-bg);">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div>
              <h1 class="header-title">
                SPOC Demand & Submission Analytics
              </h1>
              <p class="header-subtitle">Real-time analytics dashboard</p>
            </div>
            <button class="btn btn-primary" (click)="toggleTheme()">
              {{ (themeService.isDarkMode$ | async) ? '☀️' : '🌙' }} Toggle Theme
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container" style="padding: 2rem 0 0 0;">
        <div *ngIf="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading dashboard data...</p>
        </div>

        <div *ngIf="!loading && dashboardData" class="animate-slide-up">
          <!-- KPI Cards -->
          <app-kpi-cards 
            [totalSubmissions]="dashboardData.totalSubmissions"
            [currentDemand]="dashboardData.currentDemand"
            [statusCount]="getActiveStatusCount()">
          </app-kpi-cards>

          <!-- Primary Charts -->
          <div class="charts-grid">
            <app-line-chart [data]="dashboardData.submissions"></app-line-chart>
            <app-donut-chart [statusCounts]="dashboardData.statusCounts"></app-donut-chart>
          </div>

          <!-- Secondary Charts -->
          <div class="charts-grid">
            <app-bar-chart [data]="dashboardData.submissions"></app-bar-chart>
            <app-horizontal-bar-chart [data]="dashboardData.spocSubmissions"></app-horizontal-bar-chart>
          </div>

          <!-- Analysis Charts -->
          <div class="charts-grid">
            <app-area-chart [data]="dashboardData.submissions"></app-area-chart>
            <app-grouped-bar-chart 
              [demands]="dashboardData.demands" 
              [submissions]="dashboardData.submissions">
            </app-grouped-bar-chart>
          </div>

          <!-- Heatmap -->
          <div style="margin-bottom: 2rem;">
            <app-heatmap-calendar [data]="dashboardData.submissions"></app-heatmap-calendar>
          </div>
        </div>

        <div *ngIf="!loading && !dashboardData" style="text-align: center; padding: 4rem 0;">
          <p style="color: var(--text-secondary); font-size: 1.125rem;">No data available</p>
          <button class="btn btn-primary" (click)="loadDashboardData()" style="margin-top: 1rem;">
            Retry Loading Data
          </button>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p class="footer-text">
            © 2025 SPOC Analytics Dashboard. Built with Angular & D3.js for Real-time Insights
          </p>
        </div>
      </footer>
    </div>
  `
})
export class App implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;

  constructor(
    private dataService: DataService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.dataService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
        // You can add error handling UI here
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  getActiveStatusCount(): number {
    if (!this.dashboardData) return 0;
    // Count only active/open statuses
    const activeStatuses = ['Open', 'Pending', 'In Progress', 'Active'];
    return Object.entries(this.dashboardData.statusCounts)
      .filter(([status]) => activeStatuses.some(active => status.toLowerCase().includes(active.toLowerCase())))
      .reduce((sum, [, count]) => sum + count, 0);
  }
}

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(HttpClientModule)
  ]
});