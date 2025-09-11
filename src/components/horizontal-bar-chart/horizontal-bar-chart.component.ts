import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-horizontal-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">SPOC-wise Submissions</h3>
      </div>
      <div class="card-content">
        <div class="chart-container">
          <svg #chartRef></svg>
        </div>
      </div>
    </div>
  `
})
export class HorizontalBarChartComponent implements OnInit {
  @Input() data: { [key: string]: number } = {};
  @ViewChild('chartRef') chartRef!: ElementRef;

  ngOnInit() {
    setTimeout(() => this.createChart(), 100);
  }

  private createChart() {
    const element = this.chartRef.nativeElement;
    const margin = { top: 20, right: 30, bottom: 40, left: 120 };
    const containerWidth = element.parentElement?.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = Math.max(400, Object.keys(this.data).length * 35) - margin.top - margin.bottom;

    d3.select(element).selectAll("*").remove();

    const svg = d3.select(element)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Convert data to array and sort
    const chartData = Object.entries(this.data)
      .map(([spoc, submissions]) => ({ spoc, submissions }))
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 12); // Top 12 items

    console.log('Horizontal Bar Chart Data:', chartData);

    if (chartData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-secondary)")
        .text("No data available");
      return;
    }

    const yScale = d3.scaleBand()
      .domain(chartData.map(d => d.spoc))
      .range([0, height])
      .padding(0.1);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.submissions) || 0])
      .range([0, width]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);

    // Add axes
    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("color", "var(--text-secondary)")
      .selectAll("text")
      .style("font-size", "11px");

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .style("color", "var(--text-secondary)");

    // Add bars
    g.selectAll(".bar")
      .data(chartData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.spoc) || 0)
      .attr("height", yScale.bandwidth())
      .attr("x", 0)
      .attr("width", 0)
      .attr("fill", "var(--chart-primary)")
      .attr("rx", 4)
      .transition()
      .delay((d, i) => i * 100)
      .duration(800)
      .attr("width", d => xScale(d.submissions));

    // Add value labels
    g.selectAll(".label")
      .data(chartData)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => xScale(d.submissions) + 5)
      .attr("y", d => (yScale(d.spoc) || 0) + yScale.bandwidth() / 2)
      .attr("dy", ".35em")
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", "var(--text-primary)")
      .style("opacity", 0)
      .text(d => d.submissions)
      .transition()
      .delay((d, i) => i * 100 + 400)
      .duration(500)
      .style("opacity", 1);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

g.selectAll(".bar")
  .on("mouseover", (event, d) => {
    const dataPoint = d as { spoc: string; submissions: number };
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`SPOC: ${dataPoint.spoc}<br/>Submissions: ${dataPoint.submissions}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  }
}