import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
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

  getAll(): Observable<ApiBooking[]> {
    return this.http.get<BookingListResponse>('/api/Bookings').pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }

  getByUser(userId: number): Observable<ApiBooking[]> {
    return this.http.get<BookingListResponse>(`/api/Bookings/${userId}`).pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }

  cancel(bookingId: number): Observable<boolean> {
    return this.http.delete<{ success: boolean; message: string; data: string }>(
      `/api/Bookings/${bookingId}`
    ).pipe(
      map(res => res.success === true),
      catchError(() => of(false))
    );
  }

  create(destinationId: number, numberOfPeople: number): Observable<boolean> {
    const body: ApiBookingCreateRequest = { destinationId, numberOfPeople };
    return this.http.post<{ success: boolean; message: string; data: string }>('/api/Bookings', body).pipe(
      map(res => {
        const ok = res.success === true;
        if (ok) this.userStats.incrementBookings();
        return ok;
      }),
      catchError(() => of(false))
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
