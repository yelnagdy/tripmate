import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiFavorite } from '../../models/api.models';
import { UserStatsService } from './user-stats.service';

// API item type strings used for both POST and DELETE
export type FavoriteItemType = 'destination' | 'packge' | 'hotel' | 'flight';

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
      const params = `userId=${userId}&itemId=${itemId}&itemType=${itemType}`;
      this.http.delete(`/api/favorites?${params}`, { responseType: 'text' })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    return of(true);  // always succeeds from the UI perspective
  }

  /** Exact count of favorited items stored locally — authoritative for UI display. */
  getLocalCount(): number {
    return this.favSet.size;
  }

  /** Instant check from localStorage — no network call. */
  isActive(itemId: number, itemType: string): boolean {
    return this.favSet.has(this.favKey(itemId, itemType));
  }

  /** Instant check from localStorage — no network call. */
  check(itemId: number, itemType: FavoriteItemType): Observable<boolean> {
    return of(this.isActive(itemId, itemType));
  }

  /**
   * Server-side single-item check: GET /api/favorites/check
   * Use when you need the authoritative state (e.g. after login on a fresh session).
   */
  checkFromApi(itemId: number, itemType: FavoriteItemType): Observable<boolean> {
    const userId = this.getUserId();
    if (!userId) return of(false);
    return this.http
      .get<boolean>(`/api/favorites/check?userId=${userId}&itemId=${itemId}&itemType=${itemType}`)
      .pipe(
        map(isFav => {
          // Keep localStorage in sync with server truth
          const key = this.favKey(itemId, itemType);
          if (isFav) this.favSet.add(key); else this.favSet.delete(key);
          this.writeStorage();
          return isFav;
        }),
        catchError(() => of(this.isActive(itemId, itemType))),
      );
  }

  /**
   * Returns a map of id → isFavorite.
   * Uses GET /api/favorites/{userId} in one call when a user is logged in,
   * so the isFavorite badges match the real server state after login.
   * Falls back to localStorage when not logged in.
   */
  checkMany(ids: number[], itemType: FavoriteItemType): Observable<Record<number, boolean>> {
    const userId = this.getUserId();
    if (!userId) {
      const result: Record<number, boolean> = {};
      ids.forEach(id => { result[id] = this.isActive(id, itemType); });
      return of(result);
    }

    return this.getAll().pipe(
      map(favorites => {
        const serverIds = new Set(
          favorites.filter(f => f.itemType === itemType).map(f => f.itemId)
        );
        const result: Record<number, boolean> = {};
        ids.forEach(id => {
          const isFav = serverIds.has(id);
          result[id]  = isFav;
          const key   = this.favKey(id, itemType);
          if (isFav) this.favSet.add(key); else this.favSet.delete(key);
        });
        this.writeStorage();
        // Sync counter with the REAL server total (all types combined)
        this.userStats.setStats(favorites.length, this.userStats.totalBookings());
        return result;
      }),
      catchError(() => {
        const result: Record<number, boolean> = {};
        ids.forEach(id => { result[id] = this.isActive(id, itemType); });
        return of(result);
      }),
    );
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
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  }
}
