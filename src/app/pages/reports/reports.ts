import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { DashboardService } from '../../services/dashboard.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  dashboardData: any = null;
  revenueData: any = null;
  attendanceData: any = null;
  activeMembersData: any = null;
  loading = true;
  error = '';

  dateFrom = '';
  dateTo = '';

  revenueChartBars: { label: string; value: number; height: number; color: string }[] = [];
  attendanceChartBars: { label: string; value: number; height: number; color: string }[] = [];
  maxRevenue = 0;
  maxAttendance = 0;

  revenuePieSlices: { label: string; value: number; color: string; percentage: number; path: string }[] = [];
  attendancePieSlices: { label: string; value: number; color: string; percentage: number; path: string }[] = [];
  revenuePieTotal = 0;
  attendancePieTotal = 0;

  constructor(
    private reportService: ReportService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = firstDay.toISOString().split('T')[0];
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load dashboard';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.reportService.getRevenue(this.dateFrom, this.dateTo).subscribe({
      next: (data) => {
        this.revenueData = data;
        this.buildRevenueChart();
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.reportService.getAttendance(this.dateFrom, this.dateTo).subscribe({
      next: (data) => {
        this.attendanceData = data;
        this.buildAttendanceChart();
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.reportService.getActiveMembers().subscribe({
      next: (data) => { this.activeMembersData = data; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  buildRevenueChart(): void {
    if (!this.revenueData?.daily_revenue?.length) {
      this.revenueChartBars = [];
      this.revenuePieSlices = [];
      return;
    }
    const daily = this.revenueData.daily_revenue;
    this.maxRevenue = Math.max(...daily.map((d: any) => d.total), 1);
    this.revenueChartBars = daily.map((d: any) => ({
      label: new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
      value: d.total,
      height: (d.total / this.maxRevenue) * 100,
      color: 'var(--accent-green)'
    }));

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    this.revenuePieTotal = this.revenueData.total_revenue || daily.reduce((s: number, d: any) => s + d.total, 0);
    this.revenuePieSlices = daily.map((d: any, i: number) => {
      const pct = this.revenuePieTotal > 0 ? (d.total / this.revenuePieTotal) * 100 : 0;
      const dateLabel = new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' });
      return { label: dateLabel, value: d.total, color: colors[i % colors.length], percentage: pct, path: '' };
    });
  }

  buildAttendanceChart(): void {
    if (!this.attendanceData?.daily_attendance?.length) {
      this.attendanceChartBars = [];
      this.attendancePieSlices = [];
      return;
    }
    const daily = this.attendanceData.daily_attendance;
    this.maxAttendance = Math.max(...daily.map((d: any) => d.check_ins || d.count || 0), 1);
    this.attendanceChartBars = daily.map((d: any) => ({
      label: new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
      value: d.check_ins || d.count || 0,
      height: ((d.check_ins || d.count || 0) / this.maxAttendance) * 100,
      color: 'var(--accent-blue)'
    }));

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    this.attendancePieTotal = daily.reduce((s: number, d: any) => s + (d.check_ins || d.count || 0), 0);
    this.attendancePieSlices = daily.map((d: any, i: number) => {
      const val = d.check_ins || d.count || 0;
      const pct = this.attendancePieTotal > 0 ? (val / this.attendancePieTotal) * 100 : 0;
      const dateLabel = new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' });
      return { label: dateLabel, value: val, color: colors[i % colors.length], percentage: pct, path: '' };
    });
  }

  generateDonutPath(percentage: number, startAngle: number): { path: string; endAngle: number } {
    if (percentage >= 100) {
      return { path: 'M 50 5 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0', endAngle: 360 };
    }
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;
    const radius = 40;
    const cx = 50, cy = 5;
    const radStart = (startAngle - 90) * (Math.PI / 180);
    const radEnd = (endAngle - 90) * (Math.PI / 180);
    const x1 = cx + radius * Math.cos(radStart);
    const y1 = cy + radius * Math.sin(radStart);
    const x2 = cx + radius * Math.cos(radEnd);
    const y2 = cy + radius * Math.sin(radEnd);
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    return { path, endAngle };
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
