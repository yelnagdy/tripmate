import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface PaymentItem {
  itemType: string;
  itemId:   number;
  price:    number;
}

export interface PaymentRequest {
  userId:    number;
  amount:    number;
  email:     string;
  firstName: string;
  lastName:  string;
  bookingId: number;
  items:     PaymentItem[];
}

export interface PaymentResponse {
  paymentUrl: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private readonly http = inject(HttpClient);

  createPayment(req: PaymentRequest): Observable<string | null> {
    return this.http.post<PaymentResponse>('/api/payments', req).pipe(
      map(res => res?.paymentUrl ?? null),
      catchError(() => of(null))
    );
  }

  confirmPayment(bookingId: number): Observable<boolean> {
    return this.http.post(
      `/api/payments/confirm-payment?bookingId=${bookingId}`,
      null,
      { responseType: 'text' }
    ).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /** Reads userId from the stored JWT without re-injecting AuthService */
  getUserId(): number {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const claim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      return parseInt(payload[claim] ?? '0', 10) || 0;
    } catch { return 0; }
  }

  /** Splits fullName → { firstName, lastName } */
  parseFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] ?? '',
      lastName:  (parts.slice(1).join(' ') || parts[0]) ?? '',
    };
  }
}
