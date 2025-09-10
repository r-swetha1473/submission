import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, map } from 'rxjs';
import * as d3 from 'd3-dsv';

export interface SubmissionData {
  date: string;
  week: string;
  skills: string;
  spoc: string;
  recruiter: string;
  submissions: number;
}

export interface DemandData {
  skill: string;
  date: string;
  positions: number;
  recruiter: string;
  status: string;
  client: string;
  spoc: string;
}

export interface DashboardData {
  submissions: SubmissionData[];
  demands: DemandData[];
  totalSubmissions: number;
  currentDemand: number;
  statusCounts: { [key: string]: number };
  spocSubmissions: { [key: string]: number };
  skillDemands: { [key: string]: number };
  weeklySubmissions: { [key: string]: number };
  dailySubmissions: { [key: string]: number };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private SUBMISSION_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSOAQJWd7Pm_7pTn04ONGLY_xA69cq2ZHP9wf7Hb5VlFBJLFdGjL9ocdgnHo5fxeA6Dtjq5dPzGDs7/pub?output=csv&gid=0';
  private DEMAND_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSOAQJWd7Pm_7pTn04ONGLY_xA69cq2ZHP9wf7Hb5VlFBJLFdGjL9ocdgnHo5fxeA6Dtjq5dPzGDs7/pub?output=csv&gid=1';

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
      week: r['week'] || r['Week'] || '',
      skills: r['Skills'] || '',
      spoc: r['SPOC'] || '',
      recruiter: r['Recruiter'] || '',
      submissions: 1 // Each row represents one submission
    })).filter(r => r.date && r.spoc); // Filter out empty rows
  }

  private parseDemands(csv: string): DemandData[] {
    const rows = d3.csvParse(csv);
    return rows.map(r => ({
      skill: r['Skill'] || '',
      date: r['Date'] || '',
      positions: parseInt(r['No. of Positions'] || '0', 10),
      recruiter: r['Recruiter'] || '',
      status: r['Status'] || 'Open',
      client: r['Client'] || '',
      spoc: r['SPOC'] || ''
    })).filter(r => r.skill && r.positions > 0); // Filter out empty rows
  }

  private processDashboardData(submissions: SubmissionData[], demands: DemandData[]): DashboardData {
    const totalSubmissions = submissions.length;
    const currentDemand = demands.reduce((sum, d) => sum + d.positions, 0);

    // Status counts from demands
    const statusCounts = demands.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + d.positions;
      return acc;
    }, {} as { [key: string]: number });

    // SPOC-wise submissions
    const spocSubmissions = submissions.reduce((acc, s) => {
      acc[s.spoc] = (acc[s.spoc] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Skill-wise demands
    const skillDemands = demands.reduce((acc, d) => {
      acc[d.skill] = (acc[d.skill] || 0) + d.positions;
      return acc;
    }, {} as { [key: string]: number });

    // Weekly submissions
    const weeklySubmissions = submissions.reduce((acc, s) => {
      const week = s.week || 'Unknown';
      acc[week] = (acc[week] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Daily submissions
    const dailySubmissions = submissions.reduce((acc, s) => {
      acc[s.date] = (acc[s.date] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      submissions,
      demands,
      totalSubmissions,
      currentDemand,
      statusCounts,
      spocSubmissions,
      skillDemands,
      weeklySubmissions,
      dailySubmissions
    };
  }
}