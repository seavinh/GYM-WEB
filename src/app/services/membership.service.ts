import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Membership } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private apiUrl = `${environment.apiUrl}/memberships`;

  constructor(private http: HttpClient) {}

  getMemberships(): Observable<Membership[]> {
    return this.http.get<Membership[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getMembership(id: number): Observable<Membership> {
    return this.http.get<Membership>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createMembership(membership: Partial<Membership>): Observable<Membership> {
    return this.http.post<Membership>(this.apiUrl, membership)
      .pipe(catchError(this.handleError));
  }

  updateMembership(id: number, membership: Partial<Membership>): Observable<Membership> {
    return this.http.put<Membership>(`${this.apiUrl}/${id}`, membership)
      .pipe(catchError(this.handleError));
  }

  deleteMembership(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`)
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
        case 422: errorMessage = error.error?.message || 'Validation error.'; break;
        case 500: errorMessage = 'Server error.'; break;
        default: errorMessage = `Error: ${error.status}`;
      }
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
