import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, timeout } from 'rxjs';
import { ApiDestination, ApiDestinationCreateRequest, ApiSmartPackage } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class DestinationService {

  private readonly http = inject(HttpClient);

  getAll(page = 1, pageSize = 50): Observable<ApiDestination[]> {
    return this.http.get<ApiDestination[]>(`/api/destinations?page=${page}&pageSize=${pageSize}`).pipe(
      timeout(12_000),
      map(res => Array.isArray(res) ? res : []),
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
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  filter(params: { country?: string; category?: string; budget?: number }): Observable<ApiDestination[]> {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&');
    return this.http.get<ApiDestination[]>(`/api/destinations/filter?${qs}`).pipe(
      timeout(12_000),
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  getSmartPackages(userId: number, budget: number, from: string): Observable<ApiSmartPackage[]> {
    const params = `userId=${userId}&budget=${budget}&from=${encodeURIComponent(from)}`;
    return this.http.get<ApiSmartPackage[]>(`/api/destinations/smart-packages?${params}`).pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  getSmartRecommendations(userId: number, budget: number): Observable<ApiDestination[]> {
    return this.http.get<ApiDestination[]>(
      `/api/destinations/smart-recommendations?userId=${userId}&budget=${budget}`
    ).pipe(
      timeout(12_000),
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  recordView(id: number, userId: number): Observable<ApiDestination | null> {
    return this.http.get<ApiDestination>(`/api/destinations/${id}/view?userId=${userId}`).pipe(
      catchError(() => of(null))
    );
  }

  create(body: ApiDestinationCreateRequest): Observable<boolean> {
    return this.http.post('/api/destinations', body, { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
