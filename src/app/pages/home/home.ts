import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { DashboardData } from '../../models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  dashboardData: DashboardData | null = null;
  loading = true;
  error = '';
  username = 'Admin';
  userInitials = 'A';
  userRole = '';

  weeklyProgress: { day: string; value: number }[] = [];

  popularWorkouts = [
    { name: 'HIIT Cardio Blast', time: 30, kcal: 320, level: 'beginner', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop' },
    { name: 'Lower Body Strength', time: 40, kcal: 450, level: 'intermediate', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop' },
    { name: 'Morning Yoga Flow', time: 35, kcal: 250, level: 'beginner', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop' },
    { name: 'Upper Body Power', time: 40, kcal: 460, level: 'advanced', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop' },
  ];

  challenges = [
    { name: '7-Day Workout Streak', progress: 5, total: 7, pct: 71, icon: 'bi-fire', color: 'orange' },
    { name: '10,000 Steps a Day', progress: 6, total: 7, pct: 86, icon: 'bi-flag-fill', color: 'green' },
    { name: 'Burn 2,500 Calories', progress: 1850, total: 2500, pct: 74, icon: 'bi-lightning-fill', color: 'red' },
  ];

  nutrition = {
    total: 1820,
    target: 2200,
    carbs: { pct: 45, kcal: 819 },
    protein: { pct: 30, kcal: 546 },
    fats: { pct: 25, kcal: 455 },
  };

  quickLinks: { label: string; icon: string; route: string; color: string }[] = [];

  private allQuickLinks = [
    { label: 'Members', icon: 'bi-people-fill', route: '/members', color: 'green', roles: ['admin', 'receptionist'] },
    { label: 'Trainers', icon: 'bi-person-badge-fill', route: '/trainers', color: 'blue', roles: ['admin'] },
    { label: 'Attendance', icon: 'bi-calendar-check-fill', route: '/attendance', color: 'orange', roles: ['admin', 'receptionist', 'member'] },
    { label: 'Payments', icon: 'bi-credit-card-fill', route: '/payments', color: 'purple', roles: ['admin', 'receptionist'] },
    { label: 'Equipment', icon: 'bi-tools', route: '/equipment', color: 'red', roles: ['admin'] },
    { label: 'Reports', icon: 'bi-bar-chart-fill', route: '/reports', color: 'blue', roles: ['admin', 'receptionist'] },
    { label: 'Users', icon: 'bi-shield-lock', route: '/users', color: 'orange', roles: ['admin'] },
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private reportService: ReportService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getStoredRole();
    this.loadUser();
    this.loadDashboard();
    this.loadWeeklyProgress();
    this.filterQuickLinks();
  }

  loadUser(): void {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        const user = res.user || res;
        this.username = user.username || 'Admin';
        this.userRole = user.role || 'admin';
        this.authService.setRole(this.userRole);
        this.userInitials = this.username.substring(0, 2).toUpperCase();
        this.filterQuickLinks();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  loadDashboard(): void {
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
  }

  loadWeeklyProgress(): void {
    this.reportService.getWeeklyAttendance().subscribe({
      next: (data) => {
        const days = data.days || [];
        const maxCheckIns = Math.max(...days.map((d: any) => d.check_ins), 1);
        this.weeklyProgress = days.map((d: any) => ({
          day: d.day,
          value: Math.round((d.check_ins / maxCheckIns) * 100) || 0
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.weeklyProgress = [
          { day: 'Mon', value: 0 },
          { day: 'Tue', value: 0 },
          { day: 'Wed', value: 0 },
          { day: 'Thu', value: 0 },
          { day: 'Fri', value: 0 },
          { day: 'Sat', value: 0 },
          { day: 'Sun', value: 0 },
        ];
      }
    });
  }

  filterQuickLinks(): void {
    this.quickLinks = this.allQuickLinks.filter(link => link.roles.includes(this.userRole));
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getBarHeight(value: number): string {
    return `${value}%`;
  }

  getDonutDash(pct: number): string {
    const circumference = 2 * Math.PI * 52;
    const filled = (pct / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  isReceptionist(): boolean {
    return this.userRole === 'receptionist';
  }

  isMember(): boolean {
    return this.userRole === 'member';
  }
}
