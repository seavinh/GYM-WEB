import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Payment, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getPayments(): Observable<PaginatedResponse<Payment>> {
    return this.http.get<PaginatedResponse<Payment>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getPayment(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createPayment(payment: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment)
      .pipe(catchError(this.handleError));
  }

  getReceipt(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/receipt`)
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
