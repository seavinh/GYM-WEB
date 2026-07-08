import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private roleSubject = new BehaviorSubject<string>(this.getStoredRole());
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((res: any) => {
          this.setToken(res.token);
          if (res.user?.role) {
            this.setRole(res.user.role);
          }
        }),
        catchError(this.handleError)
      );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data)
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => this.clearSession()),
        catchError(this.handleError)
      );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`)
      .pipe(
        tap((res: any) => {
          if (res.user?.role) {
            this.setRole(res.user.role);
          }
        }),
        catchError(this.handleError)
      );
  }

  updatePassword(data: { current_password: string; new_password: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/password`, data)
      .pipe(catchError(this.handleError));
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setRole(role: string): void {
    localStorage.setItem('user_role', role);
    this.roleSubject.next(role);
  }

  getStoredRole(): string {
    return localStorage.getItem('user_role') || '';
  }

  getRole(): string {
    return this.roleSubject.value;
  }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.getRole());
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isReceptionist(): boolean {
    return this.getRole() === 'receptionist';
  }

  isMember(): boolean {
    return this.getRole() === 'member';
  }

  clearSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    this.roleSubject.next('');
  }

  clearToken(): void {
    this.clearSession();
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401: errorMessage = 'Invalid credentials.'; break;
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
