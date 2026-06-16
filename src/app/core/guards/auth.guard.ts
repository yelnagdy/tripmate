

import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // ✅ On the server (SSR), skip the guard — no sessionStorage available
  if (!isPlatformBrowser(platformId)) {
    console.log('[Guard] Running on server — skipping auth check');
    return true;
  }

  const token = sessionStorage.getItem('token');
  console.log('[Guard] Token check:', token ? '✔ found' : '✘ missing');

  if (token) {
    return true;
  }

  // ✅ Return a UrlTree instead of calling navigate() — cleaner and avoids double navigation
  console.log('[Guard] No token — redirecting to /auth/login');
  return _router.createUrlTree(['/auth/login']);
};




