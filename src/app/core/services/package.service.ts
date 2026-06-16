import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiPackage, ApiResponse } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class PackageService {

  private readonly http = inject(HttpClient);

  getAll(): Observable<ApiPackage[]> {
    return this.http.get<ApiResponse<ApiPackage>>('/api/packages').pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }
}
