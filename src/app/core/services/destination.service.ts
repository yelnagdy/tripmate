import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap, timeout } from 'rxjs';
import { ApiDestination, ApiDestinationCreateRequest, ApiSmartPackage, CreateDestinationRequest } from '../../models/api.models';

// Seeded once when the backend has no destinations
const SEED_DESTINATIONS: CreateDestinationRequest[] = [
  { name: 'Paris',      country: 'France',  description: 'The City of Light — art, food, and the Eiffel Tower.',      imageUrl: 'assets/images/place-paris.jpeg',       price: 899,  durationDays: 7,  itinerary: 'Eiffel Tower, Louvre, Versailles, Montmartre, Seine cruise',    activities: 'Eiffel Tower, Louvre, Seine cruise',         categoryId: 1 },
  { name: 'Istanbul',   country: 'Turkey',  description: 'Where East meets West across the Bosphorus strait.',          imageUrl: 'assets/images/place-istanbul.jpeg',    price: 650,  durationDays: 6,  itinerary: 'Hagia Sophia, Grand Bazaar, Topkapi Palace, Bosphorus',        activities: 'Hagia Sophia, Grand Bazaar, Bosphorus',      categoryId: 1 },
  { name: 'Rome',       country: 'Italy',   description: 'The Eternal City — ancient history at every corner.',         imageUrl: 'assets/images/place-rome.jpeg',        price: 750,  durationDays: 5,  itinerary: 'Colosseum, Vatican, Trevi Fountain, Roman Forum',             activities: 'Colosseum, Vatican, Trevi Fountain',         categoryId: 1 },
  { name: 'Barcelona',  country: 'Spain',   description: 'Gaudí masterpieces and vibrant Mediterranean culture.',       imageUrl: 'assets/images/place-barcelona.jpeg',   price: 700,  durationDays: 5,  itinerary: 'Sagrada Família, Park Güell, Las Ramblas, Gothic Quarter',   activities: 'Sagrada Família, Park Güell, Las Ramblas',   categoryId: 1 },
  { name: 'London',     country: 'UK',      description: 'Royal history, world-class museums, and iconic landmarks.',   imageUrl: 'assets/images/place-london.jpeg',      price: 950,  durationDays: 6,  itinerary: 'Big Ben, Tower of London, British Museum, Buckingham Palace', activities: 'Big Ben, Tower Bridge, British Museum',       categoryId: 1 },
  { name: 'New York',   country: 'USA',     description: 'The city that never sleeps — from Times Square to Central Park.', imageUrl: 'assets/images/place-newyork.jpeg', price: 1100, durationDays: 8,  itinerary: 'Times Square, Central Park, Statue of Liberty, Brooklyn',   activities: 'Times Square, Central Park, Statue of Liberty', categoryId: 1 },
  { name: 'Dubai',      country: 'UAE',     description: 'Luxury shopping, modern architecture and desert adventures.', imageUrl: 'assets/images/destination-dubai.jpeg',  price: 820,  durationDays: 5,  itinerary: 'Burj Khalifa, Dubai Mall, Desert Safari, Palm Jumeirah',    activities: 'Burj Khalifa, Desert Safari, Dubai Mall',    categoryId: 1 },
  { name: 'Berlin',     country: 'Germany', description: 'A city reborn — history, street art, and legendary nightlife.', imageUrl: 'assets/images/place-berlin.jpeg',   price: 680,  durationDays: 5,  itinerary: 'Brandenburg Gate, Museum Island, Berlin Wall, Reichstag',   activities: 'Brandenburg Gate, Museum Island, Wall',      categoryId: 1 },
  { name: 'Manarola',   country: 'Italy',   description: 'A jewel of the Cinque Terre — cliffside villages above the sea.', imageUrl: 'assets/images/place-manarola.jpeg', price: 780, durationDays: 4, itinerary: 'Coastal hike, wine tasting, boat tours, Via dell Amore',    activities: 'Coastal hikes, wine tasting, boat tours',    categoryId: 1 },
  { name: 'Cairo',      country: 'Egypt',   description: 'Ancient wonders — the Pyramids, Sphinx, and the Nile.',      imageUrl: 'assets/images/destination-egypt.jpeg',  price: 550,  durationDays: 6,  itinerary: 'Pyramids, Sphinx, Egyptian Museum, Nile cruise, Khan market', activities: 'Pyramids, Sphinx, Egyptian Museum',         categoryId: 1 },
  { name: 'Santorini',  country: 'Greece',  description: 'Iconic blue domes and breathtaking caldera sunsets.',         imageUrl: 'assets/images/fav-santorini.jpeg',      price: 920,  durationDays: 5,  itinerary: 'Oia sunset, volcano hike, wine tour, black sand beach',     activities: 'Oia sunset, volcano hike, wine tour',        categoryId: 1 },
  { name: 'Cappadocia', country: 'Turkey',  description: 'Fairy chimneys and hot-air balloons over a surreal landscape.', imageUrl: 'assets/images/destination-turkey.jpeg', price: 600, durationDays: 4, itinerary: 'Hot-air balloon, cave hotel, Goreme, underground city',      activities: 'Hot-air balloon, cave hotels, valleys',      categoryId: 1 },
];

@Injectable({ providedIn: 'root' })
export class DestinationService {

  private readonly http = inject(HttpClient);

  private fetchAll(page: number, pageSize: number): Observable<ApiDestination[]> {
    return this.http.get<ApiDestination[]>(`/api/destinations?page=${page}&pageSize=${pageSize}`).pipe(
      timeout(12_000),
      map(res => Array.isArray(res) ? res : []),
      catchError(() => of([]))
    );
  }

  getAll(page = 1, pageSize = 50): Observable<ApiDestination[]> {
    return this.fetchAll(page, pageSize).pipe(
      switchMap(destinations => {
        // Seed when the DB has fewer than the target count (handles partial/dummy data)
        if (destinations.length >= SEED_DESTINATIONS.length) return of(destinations);
        return forkJoin(
          SEED_DESTINATIONS.map(d => this.create(d).pipe(catchError(() => of(false))))
        ).pipe(
          switchMap(() => this.fetchAll(page, pageSize))
        );
      })
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
