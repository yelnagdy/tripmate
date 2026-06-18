import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// Prevents multiple parallel 401 responses from triggering multiple redirects.
let isRedirectingToLogin = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = sessionStorage.getItem('token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        sessionStorage.removeItem('token');
        router.navigate(['/auth/login']).then(() => {
          isRedirectingToLogin = false;
        });
      }
      return throwError(() => err);
    })
  );
};
