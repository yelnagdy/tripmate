import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiFlightResult, ApiResponse } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class FlightService {

  private readonly http = inject(HttpClient);

  search(from: string, to: string): Observable<ApiFlightResult[]> {
    const params = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    return this.http.get<ApiResponse<ApiFlightResult>>(`/api/flights?${params}`).pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }
}
