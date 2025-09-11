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
                SPOC Demand & Submission Report
              </h1>
              <p class="header-subtitle">Comprehensive analysis of recruitment metrics</p>
            </div>
            <div class="report-badge">
              📊 Report Overview
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container" style="padding: 2rem 0;">
        <div *ngIf="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading dashboard data...</p>
        </div>

        <div *ngIf="!loading && dashboardData" class="animate-slide-up">
          <!-- Key Highlights -->
          <div class="key-highlights">
            <h2>Key Highlights</h2>
            <div class="highlights-grid">
              <div class="highlight-item">
                <div class="highlight-number">{{ dashboardData.totalSubmissions }}</div>
                <div class="highlight-label">Total Submissions</div>
                <div class="highlight-subtitle">From Jan 1st to Dec 31st</div>
              </div>
              <div class="highlight-item">
                <div class="highlight-number">{{ dashboardData.currentDemand }}</div>
                <div class="highlight-label">Current Demand</div>
                <div class="highlight-subtitle">Open positions requiring supply</div>
              </div>
              <div class="highlight-item">
                <div class="highlight-number">{{ getDailyAverage() }}</div>
                <div class="highlight-label">Daily Submissions</div>
                <div class="highlight-subtitle">Average daily submission rate</div>
              </div>
            </div>
          </div>

          <!-- Part 1: Submissions Analysis -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 1</div>
                <h3 class="card-title">Submissions: By Skill & SPOC</h3>
              </div>
              <div class="card-content">
                <app-line-chart [data]="dashboardData.submissions"></app-line-chart>
              </div>
            </div>
          </div>

          <!-- Part 2: Current Demand by SPOC -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 2</div>
                <h3 class="card-title">Current Demand: By SPOC</h3>
              </div>
              <div class="card-content">
                <app-donut-chart [statusCounts]="getSpocDemandCounts()"></app-donut-chart>
              </div>
            </div>
          </div>

          <!-- Part 3: Demand by Status -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 3</div>
                <h3 class="card-title">Demand: By Status</h3>
              </div>
              <div class="card-content">
                <app-donut-chart [statusCounts]="dashboardData.statusCounts"></app-donut-chart>
              </div>
            </div>
          </div>

          <!-- Part 4: Current Demand by Skill -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 4</div>
                <h3 class="card-title">Current Demand: By Skill</h3>
              </div>
              <div class="card-content">
                <app-horizontal-bar-chart [data]="dashboardData.skillDemands"></app-horizontal-bar-chart>
              </div>
            </div>
          </div>

          <!-- Part 5: Weekly Submissions by Recruiters -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 5</div>
                <h3 class="card-title">Weekly Submissions: Recruiters</h3>
              </div>
              <div class="card-content">
                <app-bar-chart [data]="dashboardData.submissions"></app-bar-chart>
              </div>
            </div>
          </div>

          <!-- Part 6: Daily Submissions by Recruiters -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 6</div>
                <h3 class="card-title">Daily Submissions: Recruiters</h3>
              </div>
              <div class="card-content">
                <app-horizontal-bar-chart [data]="getRecruiterSubmissions()"></app-horizontal-bar-chart>
              </div>
            </div>
          </div>

          <!-- Observations Section -->
          <div class="observations">
            <h2>Observations: Supply vs. Demand</h2>
            <div class="observations-content">
              <div>
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Key Insights</h3>
                <ul class="observations-list">
                  <li>Aligned Submissions: {{ getAlignmentPercentage() }}% of submissions match current demand skills</li>
                  <li>Supply Gap: {{ getSupplyGap() }} positions still need to be filled across all skills</li>
                  <li>Top Performing SPOC: {{ getTopSpoc() }} leads with {{ getTopSpocCount() }} submissions</li>
                  <li>Skill Shortage: {{ getTopDemandSkill() }} has the highest demand with {{ getTopDemandCount() }} open positions</li>
                </ul>
              </div>
              <div>
                <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Recommendations</h3>
                <ul class="observations-list">
                  <li>Focus recruitment efforts on high-demand skills like {{ getTopDemandSkill() }}</li>
                  <li>Increase daily submission targets to meet current demand of {{ dashboardData.currentDemand }} positions</li>
                  <li>Leverage top-performing SPOCs to mentor others and share best practices</li>
                  <li>Implement skill-specific recruitment strategies to reduce supply-demand gaps</li>
                </ul>
              </div>
            </div>
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

  getDailyAverage(): number {
    if (!this.dashboardData) return 0;
    const uniqueDates = new Set(this.dashboardData.submissions.map(s => s.date));
    return Math.round(this.dashboardData.totalSubmissions / uniqueDates.size) || 0;
  }

  getSpocDemandCounts(): { [key: string]: number } {
    if (!this.dashboardData) return {};
    return this.dashboardData.demands.reduce((acc, d) => {
      const spoc = d.spoc || 'Unknown';
      acc[spoc] = (acc[spoc] || 0) + d.positions;
      return acc;
    }, {} as { [key: string]: number });
  }

  getRecruiterSubmissions(): { [key: string]: number } {
    if (!this.dashboardData) return {};
    return this.dashboardData.submissions.reduce((acc, s) => {
      const recruiter = s.recruiter || 'Unknown';
      acc[recruiter] = (acc[recruiter] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  getAlignmentPercentage(): number {
    if (!this.dashboardData) return 0;
    const demandSkills = new Set(this.dashboardData.demands.map(d => d.skill.toLowerCase()));
    const alignedSubmissions = this.dashboardData.submissions.filter(s => 
      demandSkills.has(s.skills.toLowerCase())
    ).length;
    return Math.round((alignedSubmissions / this.dashboardData.totalSubmissions) * 100) || 0;
  }

  getSupplyGap(): number {
    if (!this.dashboardData) return 0;
    return Math.max(0, this.dashboardData.currentDemand - this.dashboardData.totalSubmissions);
  }

  getTopSpoc(): string {
    if (!this.dashboardData) return 'N/A';
    const spocCounts = this.dashboardData.spocSubmissions;
    const topSpoc = Object.entries(spocCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['N/A', 0]);
    return topSpoc[0];
  }

  getTopSpocCount(): number {
    if (!this.dashboardData) return 0;
    const spocCounts = this.dashboardData.spocSubmissions;
    const topSpoc = Object.entries(spocCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['N/A', 0]);
    return topSpoc[1];
  }

  getTopDemandSkill(): string {
    if (!this.dashboardData) return 'N/A';
    const skillCounts = this.dashboardData.skillDemands;
    const topSkill = Object.entries(skillCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['N/A', 0]);
    return topSkill[0];
  }

  getTopDemandCount(): number {
    if (!this.dashboardData) return 0;
    const skillCounts = this.dashboardData.skillDemands;
    const topSkill = Object.entries(skillCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['N/A', 0]);
    return topSkill[1];
  }
}

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(HttpClientModule)
  ]
});