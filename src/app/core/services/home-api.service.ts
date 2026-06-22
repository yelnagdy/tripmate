import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiDestination, ApiHomeResponse } from '../../models/api.models';

const FALLBACK_RECOMMENDED: ApiDestination[] = [
  { id: 1,  name: 'Paris',     country: 'France',  city: 'Paris',     airportCode: 'CDG', description: 'The City of Light — art, food, and the Eiffel Tower await.',      imageUrl: 'assets/images/place-paris.jpeg',       price: 899,  durationDays: 7,  itinerary: '', activities: 'Eiffel Tower, Louvre, Seine cruise',     rating: 4.8 },
  { id: 2,  name: 'Istanbul',  country: 'Turkey',  city: 'Istanbul',  airportCode: 'IST', description: 'Where East meets West across the Bosphorus strait.',               imageUrl: 'assets/images/place-istanbul.jpeg',    price: 650,  durationDays: 6,  itinerary: '', activities: 'Hagia Sophia, Grand Bazaar, Bosphorus',   rating: 4.7 },
  { id: 3,  name: 'Rome',      country: 'Italy',   city: 'Rome',      airportCode: 'FCO', description: 'The Eternal City — ancient history at every corner.',              imageUrl: 'assets/images/place-rome.jpeg',        price: 750,  durationDays: 5,  itinerary: '', activities: 'Colosseum, Vatican, Trevi Fountain',      rating: 4.6 },
  { id: 4,  name: 'Barcelona', country: 'Spain',   city: 'Barcelona', airportCode: 'BCN', description: 'Gaudí\'s masterpieces and vibrant Mediterranean culture.',         imageUrl: 'assets/images/place-barcelona.jpeg',   price: 700,  durationDays: 5,  itinerary: '', activities: 'Sagrada Família, Park Güell, Las Ramblas', rating: 4.5 },
  { id: 5,  name: 'London',    country: 'UK',      city: 'London',    airportCode: 'LHR', description: 'Royal history, world-class museums, and iconic landmarks.',        imageUrl: 'assets/images/place-london.jpeg',      price: 950,  durationDays: 6,  itinerary: '', activities: 'Big Ben, Tower Bridge, British Museum',   rating: 4.6 },
  { id: 6,  name: 'New York',  country: 'USA',     city: 'New York',  airportCode: 'JFK', description: 'The city that never sleeps — Times Square to Central Park.',      imageUrl: 'assets/images/place-newyork.jpeg',     price: 1100, durationDays: 8,  itinerary: '', activities: 'Times Square, Central Park, Statue of Liberty', rating: 4.7 },
];

const FALLBACK_POPULAR: ApiDestination[] = [
  { id: 7,  name: 'Dubai',     country: 'UAE',     city: 'Dubai',     airportCode: 'DXB', description: 'Luxury shopping, ultra-modern architecture and desert adventures.', imageUrl: 'assets/images/destination-dubai.jpeg',  price: 820,  durationDays: 5,  itinerary: '', activities: 'Burj Khalifa, Desert Safari, Dubai Mall', rating: 4.8 },
  { id: 8,  name: 'Berlin',    country: 'Germany', city: 'Berlin',    airportCode: 'BER', description: 'A city reborn — history, art, and legendary nightlife.',            imageUrl: 'assets/images/place-berlin.jpeg',       price: 680,  durationDays: 5,  itinerary: '', activities: 'Brandenburg Gate, Museum Island, Wall',  rating: 4.5 },
  { id: 9,  name: 'Manarola',  country: 'Italy',   city: 'Manarola',  airportCode: 'GNO', description: 'A jewel of the Cinque Terre — cliffside villages above the sea.',  imageUrl: 'assets/images/place-manarola.jpeg',     price: 780,  durationDays: 4,  itinerary: '', activities: 'Coastal hikes, wine tasting, boat tours',  rating: 4.9 },
  { id: 10, name: 'Cairo',     country: 'Egypt',   city: 'Cairo',     airportCode: 'CAI', description: 'Ancient wonders — the Pyramids, Sphinx, and the Nile await.',      imageUrl: 'assets/images/destination-egypt.jpeg',  price: 550,  durationDays: 6,  itinerary: '', activities: 'Pyramids, Sphinx, Egyptian Museum',      rating: 4.6 },
  { id: 11, name: 'Santorini', country: 'Greece',  city: 'Santorini', airportCode: 'JTR', description: 'Iconic blue domes and breathtaking caldera sunsets.',              imageUrl: 'assets/images/fav-santorini.jpeg',      price: 920,  durationDays: 5,  itinerary: '', activities: 'Oia sunset, volcano hike, wine tour',     rating: 4.9 },
  { id: 12, name: 'Cappadocia',country: 'Turkey',  city: 'Cappadocia',airportCode: 'ASR', description: 'Fairy chimneys and hot-air balloons over a surreal landscape.',    imageUrl: 'assets/images/destination-turkey.jpeg', price: 600,  durationDays: 4,  itinerary: '', activities: 'Hot-air balloon, cave hotels, valleys',   rating: 4.7 },
];

const FALLBACK: ApiHomeResponse = {
  recommended: FALLBACK_RECOMMENDED,
  popular:     FALLBACK_POPULAR,
};

@Injectable({ providedIn: 'root' })
export class HomeApiService {

  private readonly http = inject(HttpClient);

  getData(budget: number, from: string): Observable<ApiHomeResponse> {
    const params = `budget=${budget}&from=${encodeURIComponent(from)}`;
    return this.http.get<ApiHomeResponse>(`/api/Home?${params}`).pipe(
      map(res => {
        // Backend returns empty arrays when no data is seeded — use fallback
        const hasData = res.recommended?.length || res.popular?.length;
        return hasData ? res : FALLBACK;
      }),
      catchError(() => of(FALLBACK))
    );
  }
}
