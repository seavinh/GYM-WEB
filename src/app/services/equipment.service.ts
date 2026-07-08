import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Equipment, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipment(): Observable<PaginatedResponse<Equipment>> {
    return this.http.get<PaginatedResponse<Equipment>>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getEquipmentItem(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createEquipment(equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equipment)
      .pipe(catchError(this.handleError));
  }

  updateEquipment(id: number, equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, equipment)
      .pipe(catchError(this.handleError));
  }

  deleteEquipment(id: number): Observable<{ message: string }> {
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
        case 500: errorMessage = 'Server error.'; break;
        default: errorMessage = `Error: ${error.status}`;
      }
    }
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
