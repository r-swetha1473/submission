import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { SubmissionData } from '../../services/data.service';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Daily Submissions Trend</h3>
      </div>
      <div class="card-content">
        <div class="chart-container">
          <svg #chartRef></svg>
        </div>
      </div>
    </div>
  `
})
export class LineChartComponent implements OnInit {
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

    // Clear any existing chart
    d3.select(element).selectAll("*").remove();

    const svg = d3.select(element)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data - group by date and sum submissions
    const groupedData = d3.rollup(
      this.data,
      v => v.length, // Count submissions per date
      d => d.date
    ).entries();

    const chartData = Array.from(groupedData, ([date, submissions]) => ({
      date: new Date(date),
      submissions
    }))
    .filter(d => !isNaN(d.date.getTime())) // Filter out invalid dates
    .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log('Line Chart Data:', chartData);

    if (chartData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-secondary)")
        .text("No data available");
      return;
    }
    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.submissions) || 0])
      .range([height, 0]);

    // Line generator
    const line = d3.line<any>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.submissions))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d")))
      .style("color", "var(--text-secondary)");


    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("color", "var(--text-secondary)");

    // Add the line path
    const path = g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "var(--chart-primary)")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animate the line
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Add circles
    g.selectAll(".dot")
      .data(chartData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.submissions))
      .attr("r", 0)
      .attr("fill", "var(--chart-primary)")
      .transition()
      .delay((d, i) => i * 100)
      .duration(500)
      .attr("r", 4);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

g.selectAll(".dot")
  .on("mouseover", (event, d) => {
    const dataPoint = d as { date: Date; submissions: number }; // cast to correct type

    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(dataPoint.date)}<br/>Submissions: ${dataPoint.submissions}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  }
}