import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserWithMember, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(search?: string, page?: number, role?: string): Observable<PaginatedResponse<UserWithMember>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (page) params = params.set('page', page.toString());
    if (role) params = params.set('role', role);
    return this.http.get<PaginatedResponse<UserWithMember>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  updateUserRole(id: number, role: string): Observable<UserWithMember> {
    return this.http.put<UserWithMember>(`${this.apiUrl}/${id}`, { role })
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: number): Observable<{ message: string }> {
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
