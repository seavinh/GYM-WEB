import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getRevenue(from: string, to: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue`, { params: { from, to } })
      .pipe(catchError(this.handleError));
  }

  getAttendance(from: string, to: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance`, { params: { from, to } })
      .pipe(catchError(this.handleError));
  }

  getActiveMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/active-members`)
      .pipe(catchError(this.handleError));
  }

  getWeeklyAttendance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/weekly-attendance`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
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
