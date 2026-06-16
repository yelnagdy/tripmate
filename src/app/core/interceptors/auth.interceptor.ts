import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = sessionStorage.getItem('token');
  console.log(`[Interceptor] ${req.method} ${req.url} — token: ${token ? '✔ attached' : '✘ none'}`);

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        console.warn('[Interceptor] 401 received — clearing token and redirecting to login');
        sessionStorage.removeItem('token');
        router.createUrlTree(['/auth/login']);
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};
