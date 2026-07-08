import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  attendanceList: any[] = [];
  todayReport: any = null;
  loading = true;
  error = '';
  memberId = '';
  userRole = '';
  myMemberId: number | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getStoredRole();
    this.loadTodayReport();

    if (this.isMember()) {
      this.loadMyProfile();
    } else {
      this.loadAttendance();
    }
  }

  isMember(): boolean {
    return this.userRole === 'member';
  }

  loadMyProfile(): void {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        const user = res.user || res;
        this.myMemberId = user.member?.member_id || null;
        this.loadMyAttendance();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAttendance(): void {
    this.loading = true;
    this.attendanceService.getAttendance().subscribe({
      next: (res) => {
        this.attendanceList = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load attendance';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMyAttendance(): void {
    this.loading = true;
    this.attendanceService.getMyAttendance().subscribe({
      next: (res) => {
        this.attendanceList = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Failed to load attendance';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTodayReport(): void {
    this.attendanceService.getTodayReport().subscribe({
      next: (res) => { this.todayReport = res; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  checkIn(): void {
    if (this.isMember()) {
      this.attendanceService.myCheckIn().subscribe({
        next: () => {
          this.loadMyAttendance();
          this.loadTodayReport();
        },
        error: (err) => { this.error = err.message; }
      });
    } else {
      if (!this.memberId) return;
      this.attendanceService.checkIn(+this.memberId).subscribe({
        next: () => {
          this.memberId = '';
          this.loadAttendance();
          this.loadTodayReport();
        },
        error: (err) => { this.error = err.message; }
      });
    }
  }

  checkOut(memberId: number): void {
    if (this.isMember()) {
      this.attendanceService.myCheckOut().subscribe({
        next: () => {
          this.loadMyAttendance();
          this.loadTodayReport();
        },
        error: (err) => { this.error = err.message; }
      });
    } else {
      this.attendanceService.checkOut(memberId).subscribe({
        next: () => {
          this.loadAttendance();
          this.loadTodayReport();
        },
        error: (err) => { this.error = err.message; }
      });
    }
  }
}
