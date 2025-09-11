import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { DemandData, SubmissionData } from '../../services/data.service';

@Component({
  selector: 'app-grouped-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Skill Demand Analysis</h3>
      </div>
      <div class="card-content">
        <div class="chart-container">
          <svg #chartRef></svg>
        </div>
      </div>
    </div>
  `
})
export class GroupedBarChartComponent implements OnInit {
  @Input() demands: DemandData[] = [];
  @Input() submissions: SubmissionData[] = [];
  @ViewChild('chartRef') chartRef!: ElementRef;

  ngOnInit() {
    setTimeout(() => this.createChart(), 100);
  }

  private createChart() {
    const element = this.chartRef.nativeElement;
    const margin = { top: 20, right: 80, bottom: 40, left: 40 };
    const containerWidth = element.parentElement?.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    d3.select(element).selectAll("*").remove();

    const svg = d3.select(element)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process demand data by skill
    const demandBySkill = this.demands.reduce((acc, d) => {
      acc[d.skill] = (acc[d.skill] || 0) + d.positions;
      return acc;
    }, {} as { [key: string]: number });

    // Process submission data by skill
    const submissionBySkill = this.submissions.reduce((acc, s) => {
      acc[s.skills] = (acc[s.skills] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Combine data
    const allSkills = new Set([...Object.keys(demandBySkill), ...Object.keys(submissionBySkill)]);
    const chartData = Array.from(allSkills).map(skill => ({
      skill,
      demand: demandBySkill[skill] || 0,
      supply: submissionBySkill[skill] || 0
    })).filter(d => d.demand > 0 || d.supply > 0)
    .sort((a, b) => (b.demand + b.supply) - (a.demand + a.supply))
    .slice(0, 10); // Top 10 skills

    console.log('Grouped Bar Chart Data:', chartData);

    if (chartData.length === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "var(--text-secondary)")
        .text("No data available");
      return;
    }

    const skills = chartData.map(d => d.skill);

    const x0 = d3.scaleBand()
      .domain(skills)
      .range([0, width])
      .padding(0.1);

    const x1 = d3.scaleBand()
      .domain(['demand', 'supply'])
      .range([0, x0.bandwidth()])
      .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => Math.max(d.demand, d.supply)) || 0])
    .range([height, 0]);


    const color = d3.scaleOrdinal(['var(--chart-primary)', 'var(--chart-tertiary)']);
    // Updated colors to match reference image
    const color = d3.scaleOrdinal(['#4A90E2', '#1B365D']);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .style("color", "var(--text-secondary)");

    g.append("g")
      .call(d3.axisLeft(y))
      .style("color", "var(--text-secondary)");

    // Add grouped bars
    const skillGroups = g.selectAll(".skill-group")
      .data(chartData)
      .enter().append("g")
      .attr("class", "skill-group")
      .attr("transform", d => `translate(${x0(d.skill)},0)`);

    // Demand bars
    skillGroups.append("rect")
      .attr("x", x1('demand') || 0)
      .attr("width", x1.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", color('demand'))
      .transition()
      .delay((d, i) => i * 100)
      .duration(800)
      .attr("y", d => y(d.demand))
      .attr("height", d => height - y(d.demand));

    // Supply bars
    skillGroups.append("rect")
      .attr("x", x1('supply') || 0)
      .attr("width", x1.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", color('supply'))
      .transition()
      .delay((d, i) => i * 100 + 200)
      .duration(800)
      .attr("y", d => y(d.supply))
      .attr("height", d => height - y(d.supply));


    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 10}, 20)`);

    const legendData = [
      { label: 'Demand', color: color('demand') },
      { label: 'Supply', color: color('supply') }
    ];

    const legendItems = legend.selectAll(".legend-item")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItems.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", d => d.color);

    legendItems.append("text")
      .attr("x", 18)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("font-size", "12px")
      .style("fill", "var(--text-primary)")
      .text(d => d.label);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

skillGroups.selectAll("rect")
  .on("mouseover", function(event, d) {
    const dataPoint = d as { skill: string; supply: number; demand: number };

    const isSupply = d3.select(this).attr("fill") === color('supply');
    const value = isSupply ? dataPoint.supply : dataPoint.demand;
    const type = isSupply ? 'Supply' : 'Demand';
    
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`${dataPoint.skill}<br/>${type}: ${value}`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(500).style("opacity", 0);
  });

  }
}