import { Injectable, signal } from '@angular/core';

/**
 * Single source of truth for the current user's aggregate stats.
 * Any component that adds/removes a favourite or creates a booking
 * updates this service, and MyProfileComponent reacts automatically.
 */
@Injectable({ providedIn: 'root' })
export class UserStatsService {

  readonly totalFavorites = signal(0);
  readonly totalBookings  = signal(0);

  /** Called once when the profile API response arrives */
  setStats(favorites: number, bookings: number): void {
    this.totalFavorites.set(Math.max(0, favorites));
    this.totalBookings.set(Math.max(0, bookings));
  }

  incrementFavorites(): void { this.totalFavorites.update(n => n + 1); }
  decrementFavorites(): void { this.totalFavorites.update(n => Math.max(0, n - 1)); }
  incrementBookings():  void { this.totalBookings.update(n => n + 1); }
}
