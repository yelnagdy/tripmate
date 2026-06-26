import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiBooking, ApiBookingCreateRequest, ApiBookingDetails } from '../../models/api.models';
import { UserStatsService } from './user-stats.service';

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

@Injectable({ providedIn: 'root' })
export class BookingService {

  private readonly http      = inject(HttpClient);
  private readonly userStats = inject(UserStatsService);

  /* ── Server-backed signal — single source of truth ──────── */
  private readonly _bookings = signal<ApiBooking[]>([]);

  readonly bookings = this._bookings.asReadonly();

  /** Non-cancelled bookings — what the UI actually displays. */
  readonly activeBookings = computed(() =>
    this._bookings().filter(
      b => !['cancelled', 'deleted'].includes(b.status?.toLowerCase() ?? '')
    )
  );

  // ── Kept for backward-compat with my-profile ─────────────
  readonly localBookings = computed(() => [] as never[]);

  /* ── API calls ───────────────────────────────────────────── */

  getByUser(userId: number): Observable<ApiBooking[]> {
    return this.http.get<BookingListResponse>(`/api/Bookings/${userId}`).pipe(
      map(res => res.data ?? []),
      tap(bookings => {
        this._bookings.set(bookings);
        const activeCount = bookings.filter(
          b => !['cancelled', 'deleted'].includes(b.status?.toLowerCase() ?? '')
        ).length;
        this.userStats.setStats(this.userStats.totalFavorites(), activeCount);
      }),
      catchError(() => of([]))
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

  /**
   * Adds a booking to the signal immediately so my-trip reflects it
   * without waiting for the next getByUser() call.
   */
  addOptimistic(patch: {
    id: number;
    destinationId: number;
    destinationName: string;
    numberOfPeople: number;
    totalPrice: number;
  }): void {
    const userId = this.getUserId();
    const optimistic: ApiBooking = {
      id:              patch.id,
      userId,
      destinationId:   patch.destinationId,
      bookingDate:     new Date().toISOString(),
      numberOfPeople:  patch.numberOfPeople,
      status:          'Confirmed',
      bookingNumber:   '',
      bookingType:     'packge',
      totalPrice:      patch.totalPrice,
      currency:        'USD',
      paymentStatus:   'Paid',
      destinationName: patch.destinationName,
      packageName:     null,
    };
    this._bookings.update(list => [optimistic, ...list]);
  }

  cancel(bookingId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean; message: string; data: string }>(
      `/api/Bookings/${bookingId}`
    ).pipe(
      map(res => {
        if (res.success === true) {
          // Mark as cancelled in the signal — getByUser() will confirm on next load
          this._bookings.update(list =>
            list.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b)
          );
          this.userStats.decrementBookings();
        }
        return res.success === true;
      }),
      catchError(() => of(false))
    );
  }

  getAll(): Observable<ApiBooking[]> {
    return this.http.get<BookingListResponse>('/api/Bookings').pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }

  getDetails(userId: number): Observable<ApiBookingDetails | null> {
    return this.http.get<BookingResponse>(`/api/Bookings/details/${userId}`).pipe(
      map(res => {
        if (!res.data || typeof res.data === 'string') return null;
        return res.data as ApiBookingDetails;
      }),
      catchError(() => of(null))
    );
  }

  private getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }
}
