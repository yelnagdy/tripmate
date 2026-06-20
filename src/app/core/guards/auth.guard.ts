import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/** Returns true if a JWT token string is present and not yet expired. */
function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is Unix seconds; Date.now() is milliseconds
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const authGuard: CanActivateFn = (_route, _state) => {
  const router     = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // SSR: no localStorage, skip
  }

  const token = sessionStorage.getItem('token');

  if (token && isTokenValid(token)) {
    return true;
  }

  // Token missing or expired — clean up and redirect
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  return router.createUrlTree(['/auth/login']);
};
