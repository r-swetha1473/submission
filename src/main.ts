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
                Demand & Submission Report
              </h1>
              <p class="header-subtitle">Comprehensive analysis of recruitment metrics</p>
            </div>
            <div class="header-actions">
              <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="(themeService.isDarkMode$ | async) ? 'Switch to light mode' : 'Switch to dark mode'">
                <span *ngIf="!(themeService.isDarkMode$ | async)">🌙</span>
                <span *ngIf="themeService.isDarkMode$ | async">☀️</span>
              </button>
              <div class="report-badge">
                📊 Report Overview
              </div>
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
                <div class="highlight-subtitle">From Aug 18th to Sep 11th</div>
              </div>
              <div class="highlight-item">
                <div class="highlight-number">{{ getSupplyGap() }}</div>
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
                <!-- <h3 class="card-title">Daily Submissions Trend</h3>
                <p class="card-subtitle">Track daily submission patterns over time</p> -->
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
                <h3 class="card-title">Current Demand</h3>
                <p class="card-subtitle">Distribution of Demand by SPOCs</p>
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
                <h3 class="card-title">Demand by Status</h3>
                <p class="card-subtitle">Breakdown of Demands by status</p>
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
                <h3 class="card-title">Demand by Skill</h3>
                <p class="card-subtitle">Demand Distribution by Skills</p>
              </div>
              <div class="card-content">
                <app-horizontal-bar-chart [data]="getSkillCurrentDemand()"></app-horizontal-bar-chart>

              </div>
            </div>
          </div>

          <!-- Part 5: Top Performing Recruiters -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 5</div>
                <!-- <h3 class="card-title">Top Performing Recruiters</h3>
                <p class="card-subtitle">Recruiters with most submissions this period</p> -->
              </div>
              <div class="card-content">
                <app-bar-chart [data]="dashboardData.submissions"></app-bar-chart>
              </div>
            </div>
          </div>

          <!-- Part 6: SPOC-wise Submissions -->
          <div class="charts-grid">
            <div class="card">
              <div class="card-header">
                <div class="part-label">Part 6</div>
                <h3 class="card-title">SPOC-wise Submissions</h3>
                <p class="card-subtitle">Number of profiles submitted to each SPOC</p>
              </div>
              <div class="card-content">
                <app-horizontal-bar-chart [data]="dashboardData.spocSubmissions"></app-horizontal-bar-chart>
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
                  <li>Supply Required: {{ getSupplyGap() }} total profiles needed across all skills</li>
                  <li>Profiles Submitted: {{ dashboardData.totalSubmissions }} profiles submitted to date</li>
                  <li>SPOC-wise Submissions: {{ getTopSpoc() }} gets the maximum supply of {{ getTopSpocCount() }} submissions</li>
                  <li>High Demand Skill: {{ getTopDemandSkill() }} requires {{ getTopDemandCount() }} profiles</li>
                </ul>
              </div>
              <div>
                <!-- <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">Recommendations</h3>
                <ul class="observations-list">
                  <li>Prioritize {{ getTopDemandSkill() }} skill recruitment to meet {{ getTopDemandCount() }} profile requirement</li>
                  <li>{{ getSupplyGap() > 0 ? 'Need ' + getSupplyGap() + ' more profiles to meet total demand' : 'Supply targets are being met effectively' }}</li>
                  <li>Leverage top-performing SPOCs to mentor others and share best practices</li>
                  <li>Focus on skills with highest supply requirements for maximum impact</li>
                </ul> -->
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !dashboardData" style="text-align: center; padding: 4rem 0;">
          <p style="color: var(--text-secondary); font-size: 1.125rem;">No data available</p>
          <button class="btn btn-primary" (click)="loadDashboardData()" style="margin-top: 1rem;">
            Load Publicis Report Data
          </button>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p class="footer-text">
            © 2025 Publicis SPOC Analytics Dashboard - Supply & Demand Report
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

  // getActiveStatusCount(): number {
  //   if (!this.dashboardData) return 0;
  //   // Count only active/open statuses
  //   const activeStatuses = ['Covered', 'Cancelled', 'Closed', 'Supply Required', 'On Hold'];
  //   return Object.entries(this.dashboardData.statusCounts)
  //     .filter(([status]) => activeStatuses.some(active => status.toLowerCase().includes(active.toLowerCase())))
  //     .reduce((sum, [, count]) => sum + count, 0);
  // }
getSupplyRequiredCount(): number {
  if (!this.dashboardData || !this.dashboardData.statusCounts) return 0;

  return Object.entries(this.dashboardData.statusCounts)
    .filter(([status]) => status.toLowerCase() === 'supply required')
    .reduce((sum, [, count]) => sum + count, 0);
}

  getDailyAverage(): number {
    if (!this.dashboardData) return 0;
    const uniqueDates = new Set(this.dashboardData.submissions.map(s => s.date));
    return Math.round(this.dashboardData.totalSubmissions / Math.max(uniqueDates.size, 1)) || 0;
  }

  // Demand all shows Functions
  // getSpocDemandCounts(): { [key: string]: number } {
  //   if (!this.dashboardData) return {};
  //   return this.dashboardData.demands.reduce((acc, d) => {
  //     const spoc = d.spoc || 'Unknown';
  //     acc[spoc] = (acc[spoc] || 0) + (d.supplyRequired || d.positions);
  //     return acc;
  //   }, {} as { [key: string]: number });
  // }
  getSpocDemandCounts(): { [key: string]: number } {
    if (!this.dashboardData || !this.dashboardData.demands) return {};

    return this.dashboardData.demands.reduce((acc, d) => {
      if (d.status?.toLowerCase() === "supply required") {
        const spoc = d.spoc || "Unknown";
        const positions = d.positions ?? 0;
        acc[spoc] = (acc[spoc] || 0) + positions;
      }
      return acc;
    }, {} as { [key: string]: number });
  }
getSkillCurrentDemand(): { [key: string]: number } {
  if (!this.dashboardData || !this.dashboardData.demands) return {};

  return this.dashboardData.demands.reduce((acc, d) => {
    if (d.status?.toLowerCase() === "supply required") {
      const skill = d.skill || "Unknown";
      const positions = d.positions  ?? 0;
      acc[skill] = (acc[skill] || 0) + positions;
    }
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
     if (!this.dashboardData || !this.dashboardData.statusCounts) return 0;
    const supplyRequired = this.dashboardData.statusCounts['Supply Required'] ?? 0;

    const gap = supplyRequired;
    return Math.max(0, gap);
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