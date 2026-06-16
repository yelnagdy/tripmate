import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiDestination } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class DestinationService {

  private readonly http = inject(HttpClient);

  getAll(): Observable<ApiDestination[]> {
    return this.http.get<ApiDestination[]>('/api/destinations').pipe(
      catchError(() => of([]))
    );
  }

  getById(id: number): Observable<ApiDestination | null> {
    return this.http.get<ApiDestination>(`/api/destinations/${id}`).pipe(
      catchError(() => of(null))
    );
  }

  search(query: string): Observable<ApiDestination[]> {
    return this.http.get<ApiDestination[]>(`/api/destinations/search?query=${encodeURIComponent(query)}`).pipe(
      catchError(() => of([]))
    );
  }
}
