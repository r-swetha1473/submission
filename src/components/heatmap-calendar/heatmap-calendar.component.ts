import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { SubmissionData } from '../../services/data.service';

@Component({
  selector: 'app-heatmap-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Submission Heatmap Calendar</h3>
      </div>
      <div class="card-content">
        <div class="chart-container" style="height: 200px;">
          <svg #chartRef></svg>
        </div>
      </div>
    </div>
  `
})
export class HeatmapCalendarComponent implements OnInit {
  @Input() data: SubmissionData[] = [];
  @ViewChild('chartRef') chartRef!: ElementRef;

  ngOnInit() {
    setTimeout(() => this.createChart(), 100);
  }

  private createChart() {
    const element = this.chartRef.nativeElement;
    const margin = { top: 20, right: 20, bottom: 20, left: 50 };
    const cellSize = 15;
    const width = 53 * cellSize + margin.left + margin.right; // 53 weeks
    const height = 7 * cellSize + margin.top + margin.bottom; // 7 days

    d3.select(element).selectAll("*").remove();

    const svg = d3.select(element)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data by date
    const dataByDate = d3.rollup(
      this.data,
      v => d3.sum(v, d => d.submissions),
      d => d.date
    );

    // Get date range for the last year
    const now = new Date();
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    const maxValue = d3.max(Array.from(dataByDate.values())) || 0;
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxValue]);

    // Create calendar grid
    const days = d3.timeDays(yearAgo, now);
    
    const rects = g.selectAll(".day")
      .data(days)
      .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize - 1)
      .attr("height", cellSize - 1)
      .attr("x", d => d3.timeWeek.count(yearAgo, d) * cellSize)
      .attr("y", d => d.getDay() * cellSize)
      .attr("fill", d => {
        const dateStr = d.toISOString().split('T')[0];
        const value = dataByDate.get(dateStr) || 0;
        return value > 0 ? colorScale(value) : '#ebedf0';
      })
      .attr("stroke", "var(--border-color)")
      .attr("stroke-width", 1);

    // Add day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    g.selectAll(".day-label")
      .data(dayLabels)
      .enter().append("text")
      .attr("class", "day-label")
      .attr("x", -5)
      .attr("y", (d, i) => i * cellSize + cellSize / 2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .style("fill", "var(--text-secondary)")
      .text(d => d);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

    rects.on("mouseover", (event, d) => {
      const dateStr = d.toISOString().split('T')[0];
      const value = dataByDate.get(dateStr) || 0;
      
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d)}<br/>Submissions: ${value}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });
  }
}