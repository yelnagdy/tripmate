import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiHotel, ApiResponse } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class HotelService {

  private readonly http = inject(HttpClient);

  getByCity(city: string): Observable<ApiHotel[]> {
    return this.http.get<ApiResponse<ApiHotel>>(`/api/hotels?city=${encodeURIComponent(city)}`).pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }
}
