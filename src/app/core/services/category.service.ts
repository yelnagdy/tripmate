import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ApiCategory, ApiCategoryCreateResponse, ApiResponse } from '../../models/api.models';

const DEFAULT_CATEGORIES = [
  'Beach', 'Cultural', 'Adventure', 'City Break',
  'Romantic', 'Family', 'Luxury', 'Nature',
];

@Injectable({ providedIn: 'root' })
export class CategoryService {

  private readonly http = inject(HttpClient);

  getAll(): Observable<ApiCategory[]> {
    return this.http.get<ApiResponse<ApiCategory>>('/api/Categories').pipe(
      map(res => res.data ?? []),
      switchMap(cats => {
        if (cats.length > 0) return of(cats);
        // Database is empty — seed default categories once, then return them
        return forkJoin(
          DEFAULT_CATEGORIES.map((name, i) =>
            this.http.post<ApiResponse<ApiCategoryCreateResponse>>('/api/Categories', { name }).pipe(
              map(res => {
                const id = (Array.isArray(res.data) ? res.data[0] : res.data)?.categoryId ?? i + 1;
                return { id, name } as ApiCategory;
              }),
              catchError(() => of({ id: i + 1, name } as ApiCategory))
            )
          )
        );
      }),
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
