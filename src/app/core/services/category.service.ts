import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiCategory, ApiCategoryCreateResponse, ApiResponse } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  private readonly http = inject(HttpClient);

  getAll(): Observable<ApiCategory[]> {
    return this.http.get<ApiResponse<ApiCategory>>('/api/Categories').pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }

  create(name: string): Observable<ApiCategoryCreateResponse | null> {
    return this.http.post<ApiResponse<ApiCategoryCreateResponse>>('/api/Categories', { name }).pipe(
      map(res => (Array.isArray(res.data) ? res.data[0] : res.data) ?? null),
      catchError(() => of(null))
    );
  }
}
