import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, retry, throwError, timeout, timer } from 'rxjs';
import { ApiPost, ApiPostCreateRequest } from '../../models/api.models';

/** null = success; string = server/network error message */
export type PostResult = null | string;

const TIMEOUT_MS  = 15_000;
const MAX_RETRIES = 2;

@Injectable({ providedIn: 'root' })
export class PostService {

  private readonly http = inject(HttpClient);

  getById(postId: number): Observable<ApiPost | null> {
    return this.http.get<ApiPost>(`/api/Posts/${postId}`).pipe(
      catchError(() => of(null))
    );
  }

  getAll(): Observable<ApiPost[]> {
    return this.http.get<ApiPost[]>('/api/Posts').pipe(
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  delete(postId: number): Observable<boolean> {
    return this.http.delete<{ message: string }>(`/api/Posts/${postId}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  create(body: ApiPostCreateRequest): Observable<PostResult> {
    return this.http.post('/api/Posts', body, { responseType: 'text' }).pipe(
      timeout(TIMEOUT_MS),
      this.withRetry(),
      map(() => null as PostResult),
      catchError((err: HttpErrorResponse | Error) => of(this.extractError(err)))
    );
  }

  update(postId: number, body: ApiPostCreateRequest): Observable<PostResult> {
    return this.http.put(`/api/Posts/${postId}`, body, { responseType: 'text' }).pipe(
      timeout(TIMEOUT_MS),
      this.withRetry(),
      map(() => null as PostResult),
      catchError((err: HttpErrorResponse | Error) => of(this.extractError(err)))
    );
  }

  /**
   * Retry up to MAX_RETRIES times, but ONLY for transient errors
   * (network drop or timeout). Server errors (4xx/5xx) pass through immediately.
   */
  private withRetry() {
    return retry<string>({
      count: MAX_RETRIES,
      delay: (error: unknown, attempt: number) => {
        const isTransient =
          error instanceof Error && error.name === 'TimeoutError' ||
          error instanceof HttpErrorResponse && error.status === 0;

        if (!isTransient) return throwError(() => error);
        return timer(1_500 * attempt); // 1.5 s, then 3 s
      },
    });
  }

  private extractError(err: HttpErrorResponse | Error): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.length) return body;
      if (body?.message) return body.message;
      if (body?.title)   return body.title;
      if (err.status === 0)   return 'Network error — check your connection.';
      if (err.status === 401) return 'Not authorised — please log in again.';
      if (err.status === 413) return 'Image is too large to upload.';
      return `Server error ${err.status}: ${err.statusText}`;
    }
    if (err.name === 'TimeoutError')
      return `Request timed out after ${MAX_RETRIES + 1} attempts.`;
    return err.message || 'Unknown error.';
  }
}
