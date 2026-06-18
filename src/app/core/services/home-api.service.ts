import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { ApiHomeResponse } from '../../models/api.models';

const EMPTY: ApiHomeResponse = { recommended: [], popular: [] };

@Injectable({ providedIn: 'root' })
export class HomeApiService {

  private readonly http = inject(HttpClient);

  getData(budget: number, from: string): Observable<ApiHomeResponse> {
    const params = `budget=${budget}&from=${encodeURIComponent(from)}`;
    return this.http.get<ApiHomeResponse>(`/api/Home?${params}`).pipe(
      catchError(() => of(EMPTY))
    );
  }
}
