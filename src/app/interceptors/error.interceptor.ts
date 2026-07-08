import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, timeout } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    timeout(10000),
    catchError((error: any) => {
      let errorMessage = 'An error occurred';

      if (error.name === 'TimeoutError') {
        errorMessage = 'Server is not responding. Make sure backend is running (php artisan serve).';
      } else if (error instanceof HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          errorMessage = error.error.message;
        } else if (error.status) {
          switch (error.status) {
            case 401:
              errorMessage = 'Session expired. Please login again.';
              localStorage.removeItem('auth_token');
              router.navigate(['/login']);
              break;
            case 403:
              errorMessage = 'Access denied.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 422:
              errorMessage = error.error?.message || 'Validation error.';
              break;
            case 500:
              errorMessage = 'Server error.';
              break;
            case 0:
              errorMessage = 'Cannot connect to server. Make sure backend is running (php artisan serve).';
              break;
            default:
              errorMessage = `Error: ${error.status}`;
          }
        }
      } else {
        errorMessage = error.message || 'An unknown error occurred';
      }

      console.error('HTTP Error:', error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
