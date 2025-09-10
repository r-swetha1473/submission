import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { SubmissionData } from '../../services/data.service';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Weekly Submissions Distribution</h3>
      </div>
      <div class="card-content">
        <div class="chart-container">
          <svg #chartRef></svg>
        </div>
      </div>
    </div>
  `
})
export class BarChartComponent implements OnInit {
  @Input() data: SubmissionData[] = [];
  @ViewChild('chartRef') chartRef!: ElementRef;

  ngOnInit() {
    setTimeout(() => this.createChart(), 100);
  }

  private createChart() {
    const element = this.chartRef.nativeElement;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const containerWidth = element.parentElement?.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    d3.select(element).selectAll("*").remove();

    const svg = d3.select(element)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Group data by week
    const weeklyData = this.data.reduce((acc, d) => {
      const week = d.week || 'Unknown';
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const chartData = Object.entries(weeklyData)
      .map(([week, submissions]) => ({ week, submissions }))
      .sort((a, b) => a.week.localeCompare(b.week));

    console.log('Bar Chart Data:', chartData);

    if (chartData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-secondary)")
        .text("No data available");
      return;
    }

    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.week))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.submissions) || 0])
      .range([height, 0]);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .style("color", "var(--text-secondary)");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("color", "var(--text-secondary)");

    // Add bars
    g.selectAll(".bar")
      .data(chartData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.week) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "var(--chart-2)")
      .transition()
      .delay((d, i) => i * 100)
      .duration(800)
      .attr("y", d => yScale(d.submissions))
      .attr("height", d => height - yScale(d.submissions));

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

g.selectAll(".bar")
  .on("mouseover", (event, d) => {
    const dataPoint = d as { week: string; submissions: number }; // cast to correct type

    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`Week: ${dataPoint.week}<br/>Submissions: ${dataPoint.submissions}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  }
}