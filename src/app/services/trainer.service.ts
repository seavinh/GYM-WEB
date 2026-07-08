import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Trainer, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = `${environment.apiUrl}/trainers`;

  constructor(private http: HttpClient) {}

  getTrainers(search?: string): Observable<PaginatedResponse<Trainer>> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PaginatedResponse<Trainer>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getTrainer(id: number): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTrainer(trainer: Partial<Trainer>): Observable<Trainer> {
    return this.http.post<Trainer>(this.apiUrl, trainer)
      .pipe(catchError(this.handleError));
  }

  updateTrainer(id: number, trainer: Partial<Trainer>): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/${id}`, trainer)
      .pipe(catchError(this.handleError));
  }

  deleteTrainer(id: number): Observable<{ message: string }> {
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
