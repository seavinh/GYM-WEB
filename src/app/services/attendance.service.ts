import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Attendance, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAttendance(): Observable<PaginatedResponse<Attendance>> {
    return this.http.get<PaginatedResponse<Attendance>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getMyAttendance(): Observable<PaginatedResponse<Attendance>> {
    return this.http.get<PaginatedResponse<Attendance>>(`${this.apiUrl}/my`)
      .pipe(catchError(this.handleError));
  }

  getTodayReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/today`)
      .pipe(catchError(this.handleError));
  }

  checkIn(memberId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-in`, { member_id: memberId })
      .pipe(catchError(this.handleError));
  }

  myCheckIn(): Observable<any> {
    return this.http.post(`${this.apiUrl}/my/check-in`, {})
      .pipe(catchError(this.handleError));
  }

  checkOut(attendanceId: number, memberId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-out`, { attendance_id: attendanceId, member_id: memberId })
      .pipe(catchError(this.handleError));
  }

  myCheckOut(): Observable<any> {
    return this.http.post(`${this.apiUrl}/my/check-out`, {})
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401: errorMessage = 'Unauthorized. Please login.'; break;
        case 403: errorMessage = 'Access denied.'; break;
        case 404: errorMessage = 'Resource not found.'; break;
        case 500: errorMessage = 'Server error.'; break;
        default: errorMessage = `Error: ${error.status}`;
      }
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
