import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiFavorite } from '../../models/api.models';
import { UserStatsService } from './user-stats.service';

// 'packge' = API typo used by POST, 'backge' = API typo used by DELETE
export type FavoriteItemType = 'packge' | 'backge' | 'destination' | 'hotel' | 'flight';

const LS_KEY = 'tripmate_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {

  private readonly http      = inject(HttpClient);
  private readonly userStats = inject(UserStatsService);

  /** In-memory set of "type:id" keys, initialised from localStorage. */
  private readonly favSet: Set<string>;

  constructor() {
    this.favSet = this.readStorage();
    // Seed the stats counter from the persisted count
    const currentBookings = this.userStats.totalBookings();
    this.userStats.setStats(this.favSet.size, currentBookings);
  }

  /* ── localStorage helpers ───────────────────────────────── */

  private readStorage(): Set<string> {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  }

  private writeStorage(): void {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...this.favSet]));
    } catch { /* quota exceeded — silently ignore */ }
  }

  private favKey(itemId: number, itemType: string): string {
    return `${itemType}:${itemId}`;
  }

  /* ── Public API ─────────────────────────────────────────── */

  /**
   * Add a favourite.
   * localStorage is updated immediately → UI is always instant and survives refresh.
   * The API call runs in the background; its failure doesn't affect the UI.
   */
  add(itemId: number, itemType: FavoriteItemType): Observable<boolean> {
    const key = this.favKey(itemId, itemType);
    if (!this.favSet.has(key)) {
      this.favSet.add(key);
      this.writeStorage();
      this.userStats.incrementFavorites();
    }

    // Background API sync — fire and forget
    const userId = this.getUserId();
    if (userId) {
      const params = `userId=${userId}&itemId=${itemId}&itemType=${itemType}`;
      this.http.post(`/api/favorites?${params}`, null, { responseType: 'text' })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    return of(true);  // always succeeds from the UI perspective
  }

  /**
   * Remove a favourite.
   * Same pattern: localStorage first, API in background.
   */
  remove(itemId: number, itemType: FavoriteItemType): Observable<boolean> {
    // Try both the add-type and delete-type API strings
    const addKey = this.favKey(itemId, itemType);
    if (this.favSet.has(addKey)) {
      this.favSet.delete(addKey);
      this.writeStorage();
      this.userStats.decrementFavorites();
    }

    // Background API sync — fire and forget
    const userId = this.getUserId();
    if (userId) {
      // API uses 'backge' for DELETE even when 'packge' was used for POST
      const deleteType = itemType === 'packge' ? 'backge' : itemType;
      const params = `userId=${userId}&itemId=${itemId}&itemType=${deleteType}`;
      this.http.delete(`/api/favorites?${params}`, { responseType: 'text' })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    return of(true);  // always succeeds from the UI perspective
  }

  /** Instant check from localStorage — no network call. */
  isActive(itemId: number, itemType: string): boolean {
    return this.favSet.has(this.favKey(itemId, itemType));
  }

  /** Observable wrapper of isActive for use in components that already call check(). */
  check(itemId: number, itemType: FavoriteItemType): Observable<boolean> {
    return of(this.isActive(itemId, itemType));
  }

  /** Returns a map of id → isFavorite from localStorage — synchronous & instant. */
  checkMany(ids: number[], itemType: FavoriteItemType): Observable<Record<number, boolean>> {
    const result: Record<number, boolean> = {};
    ids.forEach(id => { result[id] = this.isActive(id, itemType); });
    return of(result);
  }

  /** Full list from API — still needed by the Favourites page to get item details. */
  getAll(): Observable<ApiFavorite[]> {
    const userId = this.getUserId();
    if (!userId) return of([]);
    return this.http.get<ApiFavorite[]>(`/api/favorites/${userId}`).pipe(
      catchError(() => of([]))
    );
  }

  /** Clear all stored favourites (call on logout). */
  clearStorage(): void {
    this.favSet.clear();
    this.writeStorage();
  }

  private getUserId(): number {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  }
}
