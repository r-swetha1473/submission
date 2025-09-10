import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, map } from 'rxjs';
import * as d3 from 'd3-dsv';

export interface SubmissionData {
  date: string;
  spocName: string;
  submissions: number;
  status: string;
  skill?: string;
}

export interface DemandData {
  skill: string;
  demand: number;
  supply?: number;
  status: string;
  priority?: string;
}

export interface DashboardData {
  submissions: SubmissionData[];
  demands: DemandData[];
  totalSubmissions: number;
  
  currentDemand: number;
  statusCounts: { [key: string]: number };
  spocSubmissions: { [key: string]: number };
  skillDemands: { [key: string]: number };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private SUBMISSION_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSOAQJWd7Pm_7pTn04ONGLY_xA69cq2ZHP9wf7Hb5VlFBJLFdGjL9ocdgnHo5fxeA6Dtjq5dPzGDs7/pubhtml?output=csv&gid=0';
  private DEMAND_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSOAQJWd7Pm_7pTn04ONGLY_xA69cq2ZHP9wf7Hb5VlFBJLFdGjL9ocdgnHo5fxeA6Dtjq5dPzGDs7/pubhtml?output=csv&gid=1';

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      submissionsCsv: this.http.get(this.SUBMISSION_CSV, { responseType: 'text' }),
      demandsCsv: this.http.get(this.DEMAND_CSV, { responseType: 'text' })
    }).pipe(
      map(({ submissionsCsv, demandsCsv }) => {
        const submissions = this.parseSubmissions(submissionsCsv);
        const demands = this.parseDemands(demandsCsv);
        return this.processDashboardData(submissions, demands);
      })
    );
  }

  private parseSubmissions(csv: string): SubmissionData[] {
    const rows = d3.csvParse(csv);
    return rows.map(r => ({
      date: r['Date'] || '',
      spocName: r['SPOC'] || r['spocName'] || '',
      submissions: 1, // Each row = 1 submission
      status: 'Pending', // Default status if not in sheet
      skill: r['Skills'] || r['Skills'] || ''
    }));
  }

  private parseDemands(csv: string): DemandData[] {
    const rows = d3.csvParse(csv);
    return rows.map(r => ({
      skill: r['Skill'] || r['Skills'] || '',
      demand: parseInt(r['No. of Positions'] || '0', 10),
      supply: 0, // optional, can be added if sheet has it
      status: r['Status'] || 'Open',
      priority: 'Medium'
    }));
  }

  private processDashboardData(submissions: SubmissionData[], demands: DemandData[]): DashboardData {
    const totalSubmissions = submissions.reduce((sum, s) => sum + s.submissions, 0);
    const currentDemand = demands.reduce((sum, d) => sum + d.demand, 0);

    const statusCounts = submissions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const spocSubmissions = submissions.reduce((acc, s) => {
      acc[s.spocName] = (acc[s.spocName] || 0) + s.submissions;
      return acc;
    }, {} as { [key: string]: number });

    const skillDemands = demands.reduce((acc, d) => {
      acc[d.skill] = (acc[d.skill] || 0) + d.demand;
      return acc;
    }, {} as { [key: string]: number });

    return { submissions, demands, totalSubmissions, currentDemand, statusCounts, spocSubmissions, skillDemands };
  }
}
