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
        <h3 class="card-title">{{ title || 'Submissions by Recruiters' }}</h3>
        <p class="card-subtitle">{{ subtitle || 'Average submissions during this period' }}</p>
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
  @Input() title: string = '';
  @Input() subtitle: string = '';
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

    // Group data by recruiter
    const recruiterData = this.data.reduce((acc, d) => {
      const recruiter = d.recruiter || 'Unknown';
      acc[recruiter] = (acc[recruiter] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const chartData = Object.entries(recruiterData)
      .map(([recruiter, submissions]) => ({ recruiter, submissions }))
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 8); // Top 8 recruiters

    console.log('Bar Chart Data:', chartData);

    if (chartData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 - 10)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-secondary)")
        .style("font-size", "14px")
        .text("No recruiter data available");
        
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2 + 20)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-muted)")
        .style("font-size", "12px")
        .text("Recruiter performance will be shown here");
      return;
    }

    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.recruiter))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.submissions) || 0])
      .range([height, 0]);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.2);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .style("color", "var(--text-secondary)")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "11px");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("color", "var(--text-secondary)");

    // Add bars
    g.selectAll(".bar")
      .data(chartData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.recruiter) || 0)
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "#4A90E2")
      .attr("rx", 4)
      .transition()
      .delay((d, i) => i * 100)
      .duration(800)
      .attr("y", d => yScale(d.submissions))
      .attr("height", d => height - yScale(d.submissions));

    // Add value labels on top of bars
    g.selectAll(".label")
      .data(chartData)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => (xScale(d.recruiter) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.submissions) - 5)
      .attr("text-anchor", "middle")
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
    const dataPoint = d as { recruiter: string; submissions: number }; // cast to correct type

    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`Recruiter: ${dataPoint.recruiter}<br/>Submissions: ${dataPoint.submissions}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  }
}