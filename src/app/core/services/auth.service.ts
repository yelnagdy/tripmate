import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  RegisterRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  AuthTokenResponse,
  UpdateUserProfileRequest,
  UpdateUserPreferenceRequest,
  ApiUserProfile,
  ApiRecentItem,
} from '../../models/api.models';

// Re-export so existing imports from this file keep working
export type { ApiUserProfile, ApiRecentItem };

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);

  /* ── Auth ───────────────────────────────────────────────── */

  register(body: RegisterRequest): Observable<boolean> {
    return this.http.post('/api/auth/register', body, { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  login(body: LoginRequest): Observable<AuthTokenResponse> {
    return this.http.post<AuthTokenResponse>('/api/auth/login', body);
  }

  refresh(body: RefreshTokenRequest): Observable<AuthTokenResponse | null> {
    return this.http.post<AuthTokenResponse>('/api/auth/refresh', body).pipe(
      catchError(() => of(null))
    );
  }

  logout(refreshToken: string): Observable<void> {
    const body: LogoutRequest = { refreshToken };
    return this.http.post('/api/auth/logout', body, { responseType: 'text' }).pipe(
      map(() => undefined as void),
      catchError(() => of(undefined as void))
    );
  }

  deleteAccount(): Observable<boolean> {
    return this.http.delete('/api/auth/delete-account', { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /* ── Users / Profile ────────────────────────────────────── */

  getMyProfile(): Observable<ApiUserProfile> {
    return this.http.get<ApiUserProfile>('/api/users/profile');
  }

  getProfile(userId: number): Observable<ApiUserProfile> {
    return this.http.get<ApiUserProfile>(`/api/users/profile/${userId}`);
  }

  updateProfile(userId: number, body: UpdateUserProfileRequest): Observable<string> {
    return this.http.put(`/api/users/profile/${userId}`, body, { responseType: 'text' });
  }

  updatePreferences(userId: number, body: UpdateUserPreferenceRequest): Observable<string> {
    return this.http.put(`/api/users/preferences/${userId}`, body, { responseType: 'text' });
  }

  getRecentActivity(userId: number): Observable<ApiRecentItem[]> {
    return this.http.get<ApiRecentItem[]>(`/api/users/recent/${userId}`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  /* ── Helpers ─────────────────────────────────────────────── */

  getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /** @deprecated  Use login() — kept for compatibility with login component */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginuser(userdata: object): Observable<any> {
    return this.http.post<any>('/api/auth/login', userdata);
  }

  /** @deprecated  Use register() — kept for compatibility with sign-up component */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RegisterUser(userdata: object): Observable<any> {
    return this.http.post<any>('/api/auth/register', userdata);
  }
}
