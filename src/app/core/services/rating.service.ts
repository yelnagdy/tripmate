import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RatingService {

  private readonly http = inject(HttpClient);

  submit(itemId: number, itemType: string, value: number): Observable<boolean> {
    const userId = this.getUserId();
    if (!userId) return of(false);

    const params = `userId=${userId}&itemId=${itemId}&itemType=${encodeURIComponent(itemType)}&value=${value}`;
    return this.http
      .post(`/api/ratings?${params}`, null, { responseType: 'text' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getCount(itemId: number, itemType: string): Observable<number> {
    const params = `itemId=${itemId}&itemType=${encodeURIComponent(itemType)}`;
    return this.http
      .get<number>(`/api/ratings/count?${params}`)
      .pipe(map(v => v ?? 0), catchError(() => of(0)));
  }

  getAverage(itemId: number, itemType: string): Observable<number> {
    const params = `itemId=${itemId}&itemType=${encodeURIComponent(itemType)}`;
    return this.http
      .get<number>(`/api/ratings/average?${params}`)
      .pipe(map(v => v ?? 0), catchError(() => of(0)));
  }

  getUserRating(itemId: number, itemType: string): Observable<number> {
    const userId = this.getUserId();
    if (!userId) return of(0);

    const params = `userId=${userId}&itemId=${itemId}&itemType=${encodeURIComponent(itemType)}`;
    return this.http
      .get<number | null>(`/api/ratings/user?${params}`)
      // 204 No Content → body is null → treat as 0 (user hasn't rated yet)
      .pipe(map(v => v ?? 0), catchError(() => of(0)));
  }

  remove(itemId: number, itemType: string): Observable<boolean> {
    const userId = this.getUserId();
    if (!userId) return of(false);

    const params = `userId=${userId}&itemId=${itemId}&itemType=${encodeURIComponent(itemType)}`;
    return this.http
      .delete(`/api/ratings?${params}`, { responseType: 'text' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  private getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim   = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }
}
