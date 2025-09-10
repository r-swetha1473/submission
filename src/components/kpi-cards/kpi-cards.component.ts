import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-grid">
      <div class="kpi-card animate-fade-in" style="animation-delay: 0.1s">
        <div class="kpi-header">
          <div class="kpi-icon blue">📊</div>
        </div>
        <div class="kpi-value" #totalSubmissionsRef>0</div>
        <div class="kpi-label">Total Submissions</div>
        <div class="kpi-change positive">+12% from last month</div>
      </div>

      <div class="kpi-card animate-fade-in" style="animation-delay: 0.2s">
        <div class="kpi-header">
          <div class="kpi-icon green">🎯</div>
        </div>
        <div class="kpi-value" #currentDemandRef>0</div>
        <div class="kpi-label">Current Demand</div>
        <div class="kpi-change positive">+8% from last month</div>
      </div>

      <div class="kpi-card animate-fade-in" style="animation-delay: 0.3s">
        <div class="kpi-header">
          <div class="kpi-icon orange">⏳</div>
        </div>
        <div class="kpi-value" #activeStatusRef>0</div>
        <div class="kpi-label">Active Requests</div>
        <div class="kpi-change negative">-3% from last month</div>
      </div>

      <!-- <div class="kpi-card animate-fade-in" style="animation-delay: 0.4s">
        <div class="kpi-header">
          <div class="kpi-icon purple">👥</div>
        </div>
        <div class="kpi-value" #spocCountRef>0</div>
        <div class="kpi-label">Active SPOCs</div>
        <div class="kpi-change positive">+2 new this month</div>
      </div> -->
    </div>
  `
})
export class KpiCardsComponent implements OnInit, AfterViewInit {
  @Input() totalSubmissions: number = 0;
  @Input() currentDemand: number = 0;
  @Input() statusCount: number = 0;
  @Input() spocCount: number = 0;

  @ViewChild('totalSubmissionsRef') totalSubmissionsRef!: ElementRef;
  @ViewChild('currentDemandRef') currentDemandRef!: ElementRef;
  @ViewChild('activeStatusRef') activeStatusRef!: ElementRef;
  @ViewChild('spocCountRef') spocCountRef!: ElementRef;

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.animateCounter(this.totalSubmissionsRef.nativeElement, this.totalSubmissions);
      this.animateCounter(this.currentDemandRef.nativeElement, this.currentDemand);
      this.animateCounter(this.activeStatusRef.nativeElement, this.statusCount);
      this.animateCounter(this.spocCountRef.nativeElement, this.spocCount);
    }, 500);
  }

  private animateCounter(element: HTMLElement, targetValue: number) {
    d3.select(element)
      .transition()
      .duration(2000)
      .ease(d3.easeQuadOut)
      .tween("text", function() {
        const i = d3.interpolate(0, targetValue);
        return function(t: number) {
          this.textContent = Math.round(i(t)).toLocaleString();
        };
      });
  }
}