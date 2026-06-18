import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, timeout } from 'rxjs';
import { ApiExternalPackage, ApiExternalPackageResponse, ApiPackage, ApiPackageCreateRequest, ApiPackageCreateResponse, ApiResponse, ApiSmartPackage } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class PackageService {

  private readonly http = inject(HttpClient);

  getAll(): Observable<ApiPackage[]> {
    return this.http.get<ApiResponse<ApiPackage> | ApiPackage[]>('/api/packages').pipe(
      timeout(12_000),
      map(res => Array.isArray(res) ? res : (res.data ?? [])),
      catchError(() => of([]))
    );
  }

  getById(id: number): Observable<ApiPackage | null> {
    return this.http.get<ApiPackage>(`/api/packages/${id}`).pipe(
      catchError(() => of(null))   // 404 or any error → null
    );
  }

  create(body: ApiPackageCreateRequest): Observable<ApiPackageCreateResponse | null> {
    return this.http.post<ApiPackageCreateResponse>('/api/packages', body).pipe(
      catchError(() => of(null))
    );
  }

  update(id: number, body: ApiPackageCreateRequest): Observable<boolean> {
    return this.http.put(`/api/packages/${id}`, body).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete(`/api/packages/${id}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getExternal(from: string, to: string): Observable<ApiExternalPackage | null> {
    const params = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    return this.http.get<ApiExternalPackageResponse>(`/api/packages/external?${params}`).pipe(
      map(res => res.data ?? null),
      catchError(() => of(null))
    );
  }

  getSmart(userId: number, budget: number, from: string): Observable<ApiSmartPackage[]> {
    const params = `userId=${userId}&budget=${budget}&from=${encodeURIComponent(from)}`;
    return this.http.get<ApiSmartPackage[]>(`/api/packages/smart?${params}`).pipe(
      catchError(() => of([]))
    );
  }
}
