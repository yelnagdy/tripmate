import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // On 401: clear the stale token so the guard redirects on the next
      // navigation, but do NOT navigate here — the individual services already
      // handle errors gracefully, and forcing a redirect on every 401 (e.g.
      // from the home page's API calls right after login) causes a redirect loop.
      if (err.status === 401 && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      return throwError(() => err);
    })
  );
};
