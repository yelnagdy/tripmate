import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiBooking, ApiBookingCreateRequest, ApiBookingDetails } from '../../models/api.models';
import { UserStatsService } from './user-stats.service';

export interface LocalBooking {
  id:          string;   // 'local_<timestamp>'
  destination: string;
  from:        string;
  to:          string;
  flight:      string;
  date:        string;
  guests:      number;
  totalPrice:  number;
  status:      string;
  bookedAt:    string;   // ISO date
}

interface BookingListResponse {
  success: boolean;
  message: string;
  data: ApiBooking[];
}

interface BookingResponse {
  success: boolean;
  message: string;
  data: ApiBookingDetails | string;
}

const LOCAL_KEY = 'tripmate_bookings';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private readonly http      = inject(HttpClient);
  private readonly userStats = inject(UserStatsService);

  /* ── localStorage-backed bookings (instant, no API wait) ──── */
  private readonly _local = signal<LocalBooking[]>(this.loadLocal());

  readonly localBookings = this._local.asReadonly();

  constructor() {
    // Seed the stats counter from localStorage on startup so the profile shows
    // the correct count even for bookings made in previous sessions.
    this.userStats.seedBookings(this._local().length);
  }

  saveLocal(b: Omit<LocalBooking, 'id' | 'bookedAt'>): string {
    const id = `local_${Date.now()}`;
    const entry: LocalBooking = {
      ...b,
      id,
      bookedAt: new Date().toISOString(),
    };
    this._local.update(list => {
      const next = [entry, ...list];
      this.persistLocal(next);
      return next;
    });
    this.userStats.incrementBookings();
    return id;
  }

  updateLocalStatus(id: string, status: string): void {
    this._local.update(list => {
      const next = list.map(b => b.id === id ? { ...b, status } : b);
      this.persistLocal(next);
      return next;
    });
  }

  removeLocal(id: string): void {
    this._local.update(list => {
      const next = list.filter(b => b.id !== id);
      this.persistLocal(next);
      return next;
    });
    this.userStats.decrementBookings();
  }

  private loadLocal(): LocalBooking[] {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? (JSON.parse(raw) as LocalBooking[]) : [];
    } catch { return []; }
  }

  private persistLocal(items: LocalBooking[]): void {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(items)); } catch {}
  }

  getAll(): Observable<ApiBooking[]> {
    return this.http.get<BookingListResponse>('/api/Bookings').pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }

  getByUser(userId: number): Observable<ApiBooking[]> {
    return this.http.get<BookingListResponse>(`/api/Bookings/${userId}`).pipe(
      map(res => {
        const bookings = res.data ?? [];
        // Seed the reactive counter with the real server total
        this.userStats.setStats(this.userStats.totalFavorites(), bookings.length);
        return bookings;
      }),
      catchError(() => of([]))
    );
  }

  cancel(bookingId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean; message: string; data: string }>(
      `/api/Bookings/${bookingId}`
    ).pipe(
      map(res => {
        if (res.success === true) this.userStats.decrementBookings();
        return res.success === true;
      }),
      catchError(() => of(false))
    );
  }

  create(destinationId: number, numberOfPeople: number): Observable<number | null> {
    const body: ApiBookingCreateRequest = { destinationId, numberOfPeople };
    return this.http.post<{ success: boolean; message: string; data: number | string }>(
      '/api/Bookings', body
    ).pipe(
      map(res => {
        if (res.success !== true) return null;
        this.userStats.incrementBookings();
        const id = typeof res.data === 'number'
          ? res.data
          : parseInt(String(res.data), 10);
        return isNaN(id) ? null : id;
      }),
      catchError(() => of(null))
    );
  }

  getDetails(userId: number): Observable<ApiBookingDetails | null> {
    return this.http.get<BookingResponse>(`/api/Bookings/details/${userId}`).pipe(
      map(res => {
        // data is a string ("Booking not found") when no booking exists
        if (!res.data || typeof res.data === 'string') return null;
        return res.data as ApiBookingDetails;
      }),
      catchError(() => of(null))
    );
  }
}
