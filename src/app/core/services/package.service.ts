import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap, timeout } from 'rxjs';
import { ApiDestination, ApiExternalPackage, ApiExternalPackageResponse, ApiPackage, ApiPackageCreateRequest, ApiPackageCreateResponse, ApiResponse, ApiSmartPackage, CreatePackageRequest } from '../../models/api.models';

const FALLBACK_SMART: ApiSmartPackage[] = [
  {
    id: 1, title: 'Cairo → Dubai Explorer', price: 820, durationDays: 5,
    imageUrl: 'assets/images/destination-dubai.jpeg',
    destination: { id: 7, name: 'Dubai', country: 'UAE', city: 'Dubai', airportCode: 'DXB', description: 'Luxury in the desert', imageUrl: 'assets/images/destination-dubai.jpeg', price: 820, durationDays: 5, itinerary: '', activities: 'Burj Khalifa, Desert Safari', rating: 4.8 },
    hotels: [],
    flights: [
      { airline: 'EgyptAir',   from: 'Cairo', to: 'Dubai', price: '388', duration: '240 min' },
      { airline: 'Emirates',   from: 'Cairo', to: 'Dubai', price: '420', duration: '210 min' },
    ],
  },
  {
    id: 2, title: 'Cairo → Paris Discovery', price: 1100, durationDays: 7,
    imageUrl: 'assets/images/place-paris.jpeg',
    destination: { id: 1, name: 'Paris', country: 'France', city: 'Paris', airportCode: 'CDG', description: 'City of Light', imageUrl: 'assets/images/place-paris.jpeg', price: 899, durationDays: 7, itinerary: '', activities: 'Eiffel Tower, Louvre', rating: 4.9 },
    hotels: [],
    flights: [
      { airline: 'Air France',  from: 'Cairo', to: 'Paris', price: '560', duration: '330 min' },
      { airline: 'EgyptAir',   from: 'Cairo', to: 'Paris', price: '490', duration: '360 min' },
    ],
  },
  {
    id: 3, title: 'Cairo → Istanbul Getaway', price: 720, durationDays: 6,
    imageUrl: 'assets/images/place-istanbul.jpeg',
    destination: { id: 2, name: 'Istanbul', country: 'Turkey', city: 'Istanbul', airportCode: 'IST', description: 'Where East meets West', imageUrl: 'assets/images/place-istanbul.jpeg', price: 650, durationDays: 6, itinerary: '', activities: 'Hagia Sophia, Grand Bazaar', rating: 4.7 },
    hotels: [],
    flights: [
      { airline: 'Turkish Airlines', from: 'Cairo', to: 'Istanbul', price: '310', duration: '180 min' },
      { airline: 'EgyptAir',        from: 'Cairo', to: 'Istanbul', price: '295', duration: '195 min' },
    ],
  },
];

// Extra metadata for each destination seed — keyed by destination name (lowercase)
const PKG_META: Record<string, { desc: string; duration: number; image: string }> = {
  paris:      { desc: 'Art, cuisine, and the Eiffel Tower await you.',               duration: 7, image: 'assets/images/place-paris.jpeg' },
  istanbul:   { desc: 'Where East meets West across the Bosphorus.',                 duration: 6, image: 'assets/images/place-istanbul.jpeg' },
  rome:       { desc: 'Walk through 2,000 years of history in the Eternal City.',    duration: 5, image: 'assets/images/place-rome.jpeg' },
  barcelona:  { desc: 'Gaudí masterpieces and vibrant Mediterranean beaches.',       duration: 5, image: 'assets/images/place-barcelona.jpeg' },
  london:     { desc: 'Royal palaces, world-class museums, and the Thames.',         duration: 6, image: 'assets/images/place-london.jpeg' },
  'new york': { desc: 'Times Square, Central Park, and the Statue of Liberty.',     duration: 8, image: 'assets/images/place-newyork.jpeg' },
  dubai:      { desc: 'Luxury shopping, Burj Khalifa, and desert adventures.',       duration: 5, image: 'assets/images/destination-dubai.jpeg' },
  berlin:     { desc: 'History, street art, and legendary nightlife.',               duration: 5, image: 'assets/images/place-berlin.jpeg' },
  manarola:   { desc: 'Cliffside villages and coastal hikes in the Cinque Terre.',   duration: 4, image: 'assets/images/place-manarola.jpeg' },
  cairo:      { desc: 'The Pyramids, Sphinx, and the timeless Nile.',                duration: 6, image: 'assets/images/destination-egypt.jpeg' },
  santorini:  { desc: 'Iconic blue domes and breathtaking caldera sunsets.',         duration: 5, image: 'assets/images/fav-santorini.jpeg' },
  cappadocia: { desc: 'Hot-air balloons over a surreal fairy-chimney landscape.',    duration: 4, image: 'assets/images/destination-turkey.jpeg' },
};

function buildSeedPackage(d: ApiDestination): CreatePackageRequest {
  const key  = d.name.toLowerCase();
  const meta = PKG_META[key] ?? { desc: d.description ?? d.name, duration: d.durationDays || 5, image: d.imageUrl ?? null };
  const start = '2026-08-01';
  const end   = new Date(new Date(start).getTime() + meta.duration * 86_400_000).toISOString().slice(0, 10);
  return {
    destinationId: d.id,
    title:         `${d.name} Adventure Package`,
    description:   meta.desc,
    price:         d.price || 799,
    durationDays:  meta.duration,
    imageUrl:      meta.image,
    startDate:     start,
    endDate:       end,
    maxGuests:     10,
  };
}

@Injectable({ providedIn: 'root' })
export class PackageService {

  private readonly http = inject(HttpClient);

  private fetchAll(): Observable<ApiPackage[]> {
    return this.http.get<ApiResponse<ApiPackage> | ApiPackage[]>('/api/packages').pipe(
      timeout(12_000),
      map(res => Array.isArray(res) ? res : (res.data ?? [])),
      catchError(() => of([]))
    );
  }

  getAll(): Observable<ApiPackage[]> {
    return this.fetchAll().pipe(
      switchMap(packages => {
        if (packages.length > 0) return of(packages);
        // Seed one package per destination then re-fetch
        return this.http.get<ApiDestination[]>('/api/destinations?page=1&pageSize=50').pipe(
          timeout(10_000),
          map(res => Array.isArray(res) ? res : []),
          catchError(() => of([])),
          switchMap(destinations => {
            if (destinations.length === 0) return of([]);
            return forkJoin(
              destinations.map(d =>
                this.http.post<ApiPackageCreateResponse>('/api/packages', buildSeedPackage(d)).pipe(
                  catchError(() => of(null))
                )
              )
            ).pipe(switchMap(() => this.fetchAll()));
          })
        );
      })
    );
  }

  getById(id: number): Observable<ApiPackage | null> {
    return this.http.get<ApiResponse<ApiPackage> | ApiPackage>(`/api/packages/${id}`).pipe(
      map(res => {
        if (!res) return null;
        // Unwrap { success, message, data } envelope when present
        if ('success' in res && 'data' in res) {
          const wrapped = res as ApiResponse<ApiPackage>;
          return Array.isArray(wrapped.data) ? (wrapped.data[0] ?? null) : (wrapped.data ?? null);
        }
        return res as ApiPackage;
      }),
      catchError(() => of(null))
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
      timeout(12_000),
      map(res => (Array.isArray(res) && res.length > 0) ? res : FALLBACK_SMART),
      catchError(() => of(FALLBACK_SMART))
    );
  }
}
