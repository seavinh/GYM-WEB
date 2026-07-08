import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Member, MemberCreatePayload, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  getMembers(search?: string, page?: number): Observable<PaginatedResponse<Member>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (page) params = params.set('page', page.toString());
    return this.http.get<PaginatedResponse<Member>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getMember(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createMember(member: MemberCreatePayload): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member)
      .pipe(catchError(this.handleError));
  }

  updateMember(id: number, member: Partial<Member>): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, member)
      .pipe(catchError(this.handleError));
  }

  deleteMember(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  assignTrainer(memberId: number, trainerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${memberId}/assign-trainer`, { trainer_id: trainerId })
      .pipe(catchError(this.handleError));
  }

  removeTrainer(memberId: number, trainerId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${memberId}/remove-trainer/${trainerId}`)
      .pipe(catchError(this.handleError));
  }

  getMembershipStatus(memberId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${memberId}/membership-status`)
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
