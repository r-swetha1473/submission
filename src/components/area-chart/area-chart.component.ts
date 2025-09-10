import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { SubmissionData } from '../../services/data.service';

@Component({
  selector: 'app-area-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Monthly Submissions Trend</h3>
      </div>
      <div class="card-content">
        <div class="chart-container">
          <svg #chartRef></svg>
        </div>
      </div>
    </div>
  `
})
export class AreaChartComponent implements OnInit {
  @Input() data: SubmissionData[] = [];
  @ViewChild('chartRef') chartRef!: ElementRef;

  ngOnInit() {
    setTimeout(() => this.createChart(), 100);
  }

  private createChart() {
    const element = this.chartRef.nativeElement;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    d3.select(element).selectAll("*").remove();

    const svg = d3.select(element)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data - group by month
    const monthlyData = this.groupDataByMonth(this.data);

    const xScale = d3.scaleTime()
      .domain(d3.extent(monthlyData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(monthlyData, d => d.submissions) || 0])
      .range([height, 0]);

    // Define gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "var(--primary-blue)")
      .attr("stop-opacity", 0.1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "var(--primary-blue)")
      .attr("stop-opacity", 0.8);

    // Area generator
    const area = d3.area<any>()
      .x(d => xScale(d.date))
      .y0(height)
      .y1(d => yScale(d.submissions))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line<any>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.submissions))
      .curve(d3.curveMonotoneX);

    // Add axes
g.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xScale).tickFormat(d3.format("d"))) // integer format
  .style("color", "var(--text-secondary)");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("color", "var(--text-secondary)");

    // Add area
    const areaPath = g.append("path")
      .datum(monthlyData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Add line
    const linePath = g.append("path")
      .datum(monthlyData)
      .attr("fill", "none")
      .attr("stroke", "var(--primary-blue)")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animate area and line
    const totalLength = linePath.node()?.getTotalLength() || 0;
    linePath
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Add dots
    g.selectAll(".dot")
      .data(monthlyData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.submissions))
      .attr("r", 0)
      .attr("fill", "var(--primary-blue)")
      .transition()
      .delay((d, i) => i * 100)
      .duration(500)
      .attr("r", 5);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

g.selectAll(".dot")
  .on("mouseover", (event, d) => {
    const dataPoint = d as { date: Date; submissions: number }; // cast to correct type

    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`Month: ${d3.timeFormat("%B %Y")(dataPoint.date)}<br/>Submissions: ${dataPoint.submissions}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  }

  private groupDataByMonth(data: SubmissionData[]) {
    const monthFormat = d3.timeFormat("%Y-%m");
    const monthlyMap = d3.rollup(
      data,
      v => d3.sum(v, d => d.submissions),
      d => monthFormat(new Date(d.date))
    );

    return Array.from(monthlyMap, ([month, submissions]) => ({
      date: new Date(month + "-01"),
      submissions
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}